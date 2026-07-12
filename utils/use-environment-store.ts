import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Subject, User, Campus } from '@/types';
import { ExtensionStorage } from '@bacons/apple-targets';
import { convertSubjectsToWidgetFormat } from './subjects-to-widget-adapter';

import { MMKV } from 'react-native-mmkv';

const extStorage = new ExtensionStorage('group.nossa-ufsc.data');

const persistedEnvironmentStorage = new MMKV({
  id: 'environment-storage',
});

interface EnvironmentState {
  user: User | null;
  subjects: Subject[] | null;
  isAuthenticated: boolean;
  semesterDuration: number;
  // CAGR semester identifier (YYYYN, e.g. 20261) from the imported grade; used to
  // anchor the calendar to the correct semester start. Null for guest/dev.
  semester: number | null;
  notificationDelay: number;
  notificationsEnabled: boolean;
  campus: Campus | null;
  setUser: (user: User | null) => void;
  setSubjects: (subjects: Subject[] | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setSemesterDuration: (duration: number) => void;
  setSemester: (semester: number | null) => void;
  setNotificationDelay: (delay: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setCampus: (campus: Campus) => void;
  clearEnvironment: () => void;
  isGuest: boolean;
  setIsGuest: (isGuest: boolean) => void;
  // Fix for calendar items not being generated correctly
  // Remove this after a few months
  isCalendarFixMigrated: boolean;
  setIsCalendarFixMigrated: (isCalendarFixMigrated: boolean) => void;
  // Ids of "What's New" items the user has already seen. Deliberately not reset
  // on logout so news isn't re-shown on the same device.
  seenNewsIds: string[];
  markNewsSeen: (id: string) => void;
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
      notificationDelay: 15,
      notificationsEnabled: true,
      campus: null,

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

      setNotificationDelay: (delay) => {
        set({ notificationDelay: delay });
      },

      setNotificationsEnabled: (enabled) => {
        set({ notificationsEnabled: enabled });
      },

      setCampus: (campus) => {
        set({ campus });
      },

      clearEnvironment: () => {
        set({
          user: null,
          subjects: null,
          isAuthenticated: false,
          semesterDuration: 18,
          semester: null,
          notificationDelay: 15,
          notificationsEnabled: true,
          campus: Campus.FLORIANOPOLIS,
          isGuest: false,
        });
      },

      isGuest: false,
      setIsGuest: (isGuest) => {
        set({ isGuest });
      },
      isCalendarFixMigrated: false,
      setIsCalendarFixMigrated: (isCalendarFixMigrated) => {
        set({ isCalendarFixMigrated });
      },
      seenNewsIds: [],
      markNewsSeen: (id) => {
        set((state) =>
          state.seenNewsIds.includes(id) ? state : { seenNewsIds: [...state.seenNewsIds, id] }
        );
      },
    }),
    {
      name: 'environment-storage',
      storage: createJSONStorage(() => systemStorageZustandAdadpter),
    }
  )
);
