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
  notificationDelay: number;
  notificationsEnabled: boolean;
  campus: Campus;
  setUser: (user: User | null) => void;
  setSubjects: (subjects: Subject[] | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setSemesterDuration: (duration: number) => void;
  setNotificationDelay: (delay: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setCampus: (campus: Campus) => void;
  clearEnvironment: () => void;
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
      notificationDelay: 15,
      notificationsEnabled: true,
      campus: Campus.FLORIANOPOLIS,

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
          notificationDelay: 15,
          notificationsEnabled: true,
          campus: Campus.FLORIANOPOLIS,
        });
      },
    }),
    {
      name: 'environment-storage',
      storage: createJSONStorage(() => systemStorageZustandAdadpter),
    }
  )
);
