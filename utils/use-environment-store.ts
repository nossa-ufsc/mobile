import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Subject, User } from '../types';

import { MMKV } from 'react-native-mmkv';

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
  setUser: (user: User | null) => void;
  setSubjects: (subjects: Subject[] | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setSemesterDuration: (duration: number) => void;
  setNotificationDelay: (delay: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
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

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user?.enrollmentNumber,
        });
      },

      setSubjects: (subjects) => {
        set({ subjects });
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

      clearEnvironment: () => {
        set({
          user: null,
          subjects: null,
          isAuthenticated: false,
          semesterDuration: 18,
          notificationDelay: 15,
          notificationsEnabled: true,
        });
      },
    }),
    {
      name: 'environment-storage',
      storage: createJSONStorage(() => systemStorageZustandAdadpter),
    }
  )
);
