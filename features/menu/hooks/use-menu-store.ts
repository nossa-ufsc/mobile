import { create } from 'zustand';

interface MenuState {
  selectedDay: number;
  setSelectedDay: (day: number) => void;
}

export const useMenuStore = create<MenuState>()((set) => ({
  selectedDay: new Date().getDay(),
  setSelectedDay: (day: number) => set({ selectedDay: day }),
}));

export const useMenuForDay = () => {
  return null;
};
