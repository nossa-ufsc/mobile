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
  setUser: (user: User | null) => void;
  setSubjects: (subjects: Subject[] | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setSemesterDuration: (duration: number) => void;
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
      semesterDuration: 18, // Default to 18 weeks

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

      clearEnvironment: () => {
        set({
          user: null,
          subjects: null,
          isAuthenticated: false,
          semesterDuration: 18, // Reset to default
        });
      },
    }),
    {
      name: 'environment-storage',
      storage: createJSONStorage(() => systemStorageZustandAdadpter),
    }
  )
);
