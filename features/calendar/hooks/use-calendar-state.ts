import { create } from 'zustand';

interface CalendarState {
  isExpanded: boolean;
  selectedDay: Date;
  currentDate: Date;
  setIsExpanded: (isExpanded: boolean) => void;
  setSelectedDay: (day: Date) => void;
  setCurrentDate: (date: Date) => void;
}

export const useCalendarState = create<CalendarState>((set) => ({
  isExpanded: false,
  selectedDay: new Date(),
  currentDate: new Date(),
  setIsExpanded: (isExpanded) => set({ isExpanded }),
  setSelectedDay: (selectedDay) => set({ selectedDay }),
  setCurrentDate: (currentDate) => set({ currentDate }),
}));
