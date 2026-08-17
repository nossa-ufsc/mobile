import { create } from 'zustand';
import { MenuMeal } from '@/types';
import { defaultMeal } from '../utils/menu';

interface MenuState {
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  selectedMeal: MenuMeal;
  setSelectedMeal: (meal: MenuMeal) => void;
}

export const useMenuStore = create<MenuState>()((set) => ({
  selectedDay: new Date().getDay(),
  setSelectedDay: (day: number) => set({ selectedDay: day }),
  selectedMeal: defaultMeal(),
  setSelectedMeal: (meal: MenuMeal) => set({ selectedMeal: meal }),
}));
