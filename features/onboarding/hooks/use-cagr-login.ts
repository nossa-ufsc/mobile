import * as AuthSession from 'expo-auth-session';
import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { CAGRSystemResponse, Subject, SubjectTime, User } from '../../../types';
import { useEnvironmentStore } from '../../../utils/use-environment-store';

const CLIENT_ID = process.env.EXPO_PUBLIC_CAGR_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_CAGR_CLIENT_SECRET;
const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: CLIENT_ID,
  path: process.env.EXPO_PUBLIC_CAGR_REDIRECT_URI,
});
const STATE = process.env.EXPO_PUBLIC_CAGR_STATE;

const UFSC_CAS = 'https://sistemas.ufsc.br';
const API_URL = 'https://ws.ufsc.br/rest/CAGRUsuarioService/';
const USER_TIME_GRID = 'getGradeHorarioAluno';
const USER_INFO = 'getInformacaoAluno';

const ACCESS_TOKEN_KEY = 'nossa_ufsc_access_token';

const discovery = {
  authorizationEndpoint: `${UFSC_CAS}/oauth2.0/authorize`,
  tokenEndpoint: `${UFSC_CAS}/oauth2.0/accessToken`,
};

WebBrowser.maybeCompleteAuthSession();

export interface UseCAGRLoginResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  handleLogin: () => Promise<void>;
  handleLogout: () => void;
  reloadSubjects: () => Promise<void>;
}

export const useCAGRLogin = (): UseCAGRLoginResult => {
  const { setUser, setSubjects, clearEnvironment, isAuthenticated, setIsAuthenticated } =
    useEnvironmentStore();

  const [isLoading, setIsLoading] = useState(false);

  // Save access token to secure store
  const saveAccessToken = async (token: string | null) => {
    try {
      if (token) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
      } else {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error saving access token:', error);
    }
  };

  const [, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID!,
      redirectUri: REDIRECT_URI,
      clientSecret: CLIENT_SECRET,
      responseType: 'code',
      extraParams: {
        state: STATE!,
      },
    },
    discovery
  );

  const fetchUserInformation = async (token: string): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}${USER_INFO}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user information: ${response.statusText}`);
      }

      const data = await response.json();
      const user: User = {
        id: data.matricula || data.enrollmentNumber,
        name: data.nome || data.name,
        enrollmentNumber: data.matricula || data.enrollmentNumber,
      };

      return user;
    } catch (error) {
      console.error('Error fetching user information:', error);
      throw error;
    }
  };

  const fetchSubjects = async (token: string): Promise<Subject[]> => {
    try {
      const response = await fetch(`${API_URL}${USER_TIME_GRID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subjects: ${response.statusText}`);
      }

      const data: CAGRSystemResponse = await response.json();

      const subjects: Subject[] = [];

      data.disciplinas?.forEach((subject) => {
        const subjectTimes: SubjectTime[] = [];
        const professors: string[] = [];

        data.horarios?.forEach((schedule) => {
          if (schedule.codigoDisciplina === subject.codigoDisciplina) {
            subjectTimes.push({
              weekDay: schedule.diaSemana,
              startTime: schedule.horario,
              center: schedule.localizacaoCentro,
              room: schedule.localizacaoEspacoFisico,
            });
          }
        });

        const professorData = data.professores?.find(
          (p) => p.codigoDisciplina === subject.codigoDisciplina
        );
        if (professorData?.professores) {
          professors.push(...professorData.professores);
        }

        subjects.push({
          id: subject.codigoDisciplina,
          name: subject.nome,
          code: subject.codigoDisciplina,
          classGroup:
            data.horarios?.find((h) => h.codigoDisciplina === subject.codigoDisciplina)
              ?.codigoTurma || '',
          weeklyClassCount: subject.numeroAulas,
          absenceCount: 0,
          professors,
          schedule: subjectTimes,
        });
      });

      return subjects;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  };

  const exchangeCodeForToken = async (code: string): Promise<string> => {
    try {
      const tokenUrl = `${UFSC_CAS}/oauth2.0/accessToken?grant_type=authorization_code&code=${code}&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${CLIENT_SECRET}`;

      const response = await fetch(tokenUrl);

      if (!response.ok) {
        throw new Error(`Failed to exchange code for token: ${response.statusText}`);
      }

      const responseText = await response.text();

      const token = JSON.parse(responseText).access_token;

      if (!token) {
        throw new Error('Failed to parse access token from response');
      }

      return token;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  };

  // Handle the authentication response
  useEffect(() => {
    if (isAuthenticated) return;
    if (response?.type === 'success') {
      const { code } = response.params;

      const handleAuthentication = async () => {
        setIsLoading(true);
        try {
          const token = await exchangeCodeForToken(code);
          await saveAccessToken(token);

          const userInfo = await fetchUserInformation(token);
          setUser(userInfo);

          const userSubjects = await fetchSubjects(token);
          setSubjects(userSubjects);

          setIsAuthenticated(true);
        } catch (error) {
          console.error('Authentication error:', error);
        } finally {
          setIsLoading(false);
        }
      };

      handleAuthentication();
    } else if (response) {
      console.log('Authentication was not successful:', response.type);
      setIsLoading(false);
    }
  }, [response]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error during login:', error);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await saveAccessToken(null);
    clearEnvironment();
  };

  const reloadSubjects = async () => {
    try {
      const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      if (!token) {
        console.error('Cannot reload subjects: No access token available');
        return;
      }

      setIsLoading(true);
      const userSubjects = await fetchSubjects(token);
      setSubjects(userSubjects);
    } catch (error) {
      console.error('Error reloading subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    handleLogin,
    handleLogout,
    reloadSubjects,
  };
};
