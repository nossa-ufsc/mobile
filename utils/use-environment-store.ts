import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Subject, User, Campus, AcademicCalendar } from '@/types';
import { ExtensionStorage } from '@bacons/apple-targets';
import { convertSubjectsToWidgetFormat } from './subjects-to-widget-adapter';
import { i18n, detectDeviceLanguage, SupportedLanguage } from './i18n';

import { MMKV } from 'react-native-mmkv';

const extStorage = new ExtensionStorage('group.nossa-ufsc.data');

const persistedEnvironmentStorage = new MMKV({
  id: 'environment-storage',
});

interface EnvironmentState {
  user: User | null;
  subjects: Subject[] | null;
  isAuthenticated: boolean;
  // Duração manual em semanas — só usada quando não há calendário acadêmico oficial
  // para o semestre × campus (ver features/calendar/utils/academic-calendar.ts).
  semesterDuration: number;
  // CAGR semester identifier (YYYYN, e.g. 20261) from the imported grade; used to
  // anchor the calendar to the correct semester start. Null for guest/dev.
  semester: number | null;
  // Calendário acadêmico oficial (DAE) do semestre × campus do usuário, sincronizado
  // do Supabase (features/calendar/utils/academic-calendar.ts). Null até a primeira
  // sincronização; o fallback empacotado cobre o meio-tempo.
  academicCalendar: AcademicCalendar | null;
  notificationDelay: number;
  notificationsEnabled: boolean;
  campus: Campus | null;
  // Restaurante (RU) escolhido na aba Cardápio — chave da tabela `menus`. Null =
  // padrão do campus (ver features/menu/utils/restaurants.ts). Zerado ao trocar campus.
  menuRestaurant: string | null;
  setUser: (user: User | null) => void;
  setSubjects: (subjects: Subject[] | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setSemesterDuration: (duration: number) => void;
  setSemester: (semester: number | null) => void;
  setAcademicCalendar: (calendar: AcademicCalendar | null) => void;
  setNotificationDelay: (delay: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setCampus: (campus: Campus) => void;
  setMenuRestaurant: (key: string | null) => void;
  clearEnvironment: () => void;
  isGuest: boolean;
  setIsGuest: (isGuest: boolean) => void;
  // Ids of "What's New" items the user has already seen. Deliberately not reset
  // on logout so news isn't re-shown on the same device.
  seenNewsIds: string[];
  markNewsSeen: (id: string) => void;
  // User-selected language override. Null means "follow the device locale".
  language: SupportedLanguage | null;
  setLanguage: (language: SupportedLanguage | null) => void;
}

const systemStorageZustandAdadpter = {
  getItem: (name: string) => {
    const value = persistedEnvironmentStorage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    persistedEnvironmentStorage.set(name, value);
  },
  removeItem: (name: string) => {
    persistedEnvironmentStorage.delete(name);
  },
};

export const useEnvironmentStore = create<EnvironmentState>()(
  persist(
    (set) => ({
      user: null,
      subjects: null,
      isAuthenticated: false,
      semesterDuration: 18,
      semester: null,
      academicCalendar: null,
      notificationDelay: 15,
      notificationsEnabled: true,
      campus: null,
      menuRestaurant: null,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user?.enrollmentNumber,
        });
      },

      setSubjects: (subjects) => {
        set({ subjects });

        const widgetData = convertSubjectsToWidgetFormat(subjects);
        extStorage.set('subjects', JSON.stringify(widgetData));
      },

      setIsAuthenticated: (isAuthenticated) => {
        set({ isAuthenticated });
      },

      setSemesterDuration: (duration) => {
        set({ semesterDuration: duration });
      },

      setSemester: (semester) => {
        set({ semester });
      },

      setAcademicCalendar: (academicCalendar) => {
        set({ academicCalendar });
      },

      setNotificationDelay: (delay) => {
        set({ notificationDelay: delay });
      },

      setNotificationsEnabled: (enabled) => {
        set({ notificationsEnabled: enabled });
      },

      setCampus: (campus) => {
        set({ campus, menuRestaurant: null });
      },

      setMenuRestaurant: (key) => {
        set({ menuRestaurant: key });
      },

      clearEnvironment: () => {
        set({
          user: null,
          subjects: null,
          isAuthenticated: false,
          semesterDuration: 18,
          semester: null,
          academicCalendar: null,
          notificationDelay: 15,
          notificationsEnabled: true,
          campus: Campus.FLORIANOPOLIS,
          menuRestaurant: null,
          isGuest: false,
        });
      },

      isGuest: false,
      setIsGuest: (isGuest) => {
        set({ isGuest });
      },
      seenNewsIds: [],
      markNewsSeen: (id) => {
        set((state) =>
          state.seenNewsIds.includes(id) ? state : { seenNewsIds: [...state.seenNewsIds, id] }
        );
      },

      language: null,
      setLanguage: (language) => {
        set({ language });
        i18n.changeLanguage(language ?? detectDeviceLanguage());
      },
    }),
    {
      name: 'environment-storage',
      storage: createJSONStorage(() => systemStorageZustandAdadpter),
    }
  )
);

// MMKV-backed persistence hydrates synchronously, so the persisted language
// preference (if any) is already available right after store creation.
const persistedLanguage = useEnvironmentStore.getState().language;
if (persistedLanguage) {
  i18n.changeLanguage(persistedLanguage);
}
