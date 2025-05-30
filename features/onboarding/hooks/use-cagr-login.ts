import * as AuthSession from 'expo-auth-session';
import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { CAGRSystemResponse, Subject, User } from '@/types';
import { useEnvironmentStore } from '../../../utils/use-environment-store';
import { getEndTime, formatNumericTime, cagrDayIndexToJsIndex } from '../../../utils/time-mapping';
import { generateSemesterCalendar } from '../../../features/calendar/utils/generate-semester-calendar';
import { getSemesterStartDate } from '../../../features/calendar/utils/get-semester-start-date';
import { useCalendar } from '../../../features/calendar/hooks/use-calendar';
import { useNotifications } from '@/utils/use-notifications';
import { supabase } from '@/utils/supabase';
import { mockFetchSubjects, mockFetchUserInformation } from '../mocks/cagr-api';
import { usePostHog } from 'posthog-react-native';
import { useRouter } from 'expo-router';

const isDev = __DEV__;

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
  handleLogin: (options: { onSuccess: () => void }) => Promise<void>;
  handleLogout: () => void;
  reloadSubjects: () => Promise<void>;
  handleForcedAuthentication: (code: string) => Promise<void>;
}

export const useCAGRLogin = (): UseCAGRLoginResult => {
  const {
    setUser,
    setSubjects,
    clearEnvironment,
    isAuthenticated,
    setIsAuthenticated,
    semesterDuration,
  } = useEnvironmentStore();
  const { clearCalendar, addClassItem, clearCalendarWithoutNotification } = useCalendar();
  const { cancelAllNotifications, generateClassesNotifications } = useNotifications();
  const posthog = usePostHog();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

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
        const subjectTimes =
          data.horarios
            ?.filter((schedule) => schedule.codigoDisciplina === subject.codigoDisciplina)
            .map((schedule) => {
              const numericTime = parseInt(schedule.horario, 10);
              const formattedStartTime = formatNumericTime(numericTime);
              return {
                weekDay: cagrDayIndexToJsIndex(schedule.diaSemana),
                startTime: formattedStartTime,
                endTime: getEndTime(formattedStartTime),
                center: schedule.localizacaoCentro,
                room: schedule.localizacaoEspacoFisico,
              };
            }) ?? [];

        const professorData = data.professores?.find(
          (p) => p.codigoDisciplina === subject.codigoDisciplina
        );
        const professors = professorData?.professores.map((p) => p.nomeProfessor) ?? [];

        const classGroup =
          data.horarios
            ?.find((h) => h.codigoDisciplina === subject.codigoDisciplina)
            ?.codigoTurma.trim() ?? '';

        subjects.push({
          id: subject.codigoDisciplina,
          name: subject.nome,
          code: subject.codigoDisciplina,
          classGroup,
          weeklyClassCount: subject.numeroAulas,
          absences: [],
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

  useEffect(() => {
    if (isAuthenticated) return;
    if (response?.type === 'success') {
      const { code } = response.params;

      handleAuthentication(code);
    } else if (response) {
      console.log('Authentication was not successful:', response.type);
      setIsLoading(false);
    }
  }, [response]);

  const handleDevLogin = async () => {
    setIsLoading(true);
    const userInfo = await mockFetchUserInformation();
    setUser(userInfo);

    const userSubjects = await mockFetchSubjects();
    setSubjects(userSubjects);

    const semesterStartDate = getSemesterStartDate();
    const calendarItems = generateSemesterCalendar(
      userSubjects,
      semesterDuration,
      semesterStartDate
    );
    calendarItems.forEach((item) => addClassItem(item));
    // Uncomment this to test notifications
    // generateClassesNotifications(calendarItems);

    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error('Error signing in anonymously:', error);
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const handleLogin = async ({ onSuccess }: { onSuccess: () => void }) => {
    setIsLoading(true);
    try {
      if (isDev) {
        await handleDevLogin();
        onSuccess();
      } else {
        const result = await promptAsync();
        if (!result) {
          throw new Error('No response from authentication');
        }
        if (result.type !== 'success') {
          throw new Error(`Authentication failed: ${result.type}`);
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const handleAuthentication = async (code: string) => {
    setIsLoading(true);
    try {
      const token = await exchangeCodeForToken(code);
      await saveAccessToken(token);

      const userInfo = await fetchUserInformation(token);
      setUser(userInfo);

      const userSubjects = await fetchSubjects(token);
      setSubjects(userSubjects);

      const semesterStartDate = getSemesterStartDate();
      const calendarItems = generateSemesterCalendar(
        userSubjects,
        semesterDuration,
        semesterStartDate
      );
      calendarItems.forEach((item) => addClassItem(item));
      generateClassesNotifications(calendarItems);

      const { error } = await supabase.auth.signInAnonymously();

      if (error) {
        console.error('Error signing in anonymously:', error);
        posthog.capture('error_signing_in_anonymously', { error });
      }

      // small delay to fetch user information nicely
      setTimeout(() => {
        setIsAuthenticated(true);
        router.push('/(app)/(tabs)/(home)');
      }, 1000);
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  };

  const handleLogout = async () => {
    await saveAccessToken(null);
    await cancelAllNotifications();
    clearEnvironment();
    clearCalendar();
    await supabase.auth.signOut();
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

      clearCalendarWithoutNotification();

      await cancelAllNotifications();

      const semesterStartDate = getSemesterStartDate();
      const calendarItems = generateSemesterCalendar(
        userSubjects,
        semesterDuration,
        semesterStartDate
      );
      calendarItems.forEach((item) => addClassItem(item));
      generateClassesNotifications(calendarItems);
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
    // This is necessary due to the OAuth client not being ours for now,
    // resulting in a different redirectUrl and consequently not enabling redirection.
    // This is a temporary solution to allow the Android app to work with the OAuth client.
    // We need to expose this function to the app so we can handle the OAuth callback.
    handleForcedAuthentication: handleAuthentication,
  };
};
