import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { CalendarClassItem, CalendarItem, Subject } from '@/types';

const persistedCalendarStorage = new MMKV({
  id: 'calendar-storage',
});

interface CalendarState {
  items: CalendarItem[];
  classItems: CalendarClassItem[];
  addItem: (item: Omit<CalendarItem, 'id'>) => void;
  addClassItem: (item: CalendarClassItem) => void;
  getItemsByDate: (date: Date) => CalendarItem[];
  getClassItemsByDate: (date: Date) => CalendarClassItem[];
  getItemsByDateAndSubject: (date: Date, subject: Subject) => CalendarItem[] | undefined;
  getItemsBySubject: (subject: Subject) => CalendarItem[];
  removeItem: (id: string) => void;
  updateItem: (id: string, item: Partial<CalendarItem>) => void;
  clearCalendar: () => void;
}

const systemStorageZustandAdapter = {
  getItem: (name: string) => {
    const value = persistedCalendarStorage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    persistedCalendarStorage.set(name, value);
  },
  removeItem: (name: string) => {
    persistedCalendarStorage.delete(name);
  },
};

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => ({
          items: [
            ...state.items,
            {
              ...newItem,
              id: Math.random().toString(36).substring(7),
              date: new Date(newItem.date),
            },
          ],
        }));
      },

      classItems: [],

      addClassItem: (newItem) => {
        set((state) => ({
          classItems: [...state.classItems, newItem],
        }));
      },

      getItemsByDate: (date) => {
        return get().items.filter((item) => isSameDay(new Date(item.date), date));
      },

      getClassItemsByDate: (date) => {
        return get().classItems.filter((item) => isSameDay(new Date(item.date), date));
      },

      getItemsByDateAndSubject: (date: Date, subject: Subject) => {
        return get().items.filter(
          (item) => isSameDay(new Date(item.date), date) && item.subject.id === subject.id
        );
      },

      getItemsBySubject: (subject: Subject) => {
        return get().items.filter((item) => item.subject.id === subject.id);
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateItem: (id, updatedItem) => {
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, ...updatedItem } : item)),
        }));
      },

      clearCalendar: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'calendar-storage-v2',
      storage: createJSONStorage(() => systemStorageZustandAdapter),
    }
  )
);

export const useCalendar = () => {
  const {
    items,
    classItems,
    addItem,
    addClassItem,
    getItemsByDate,
    getClassItemsByDate,
    getItemsByDateAndSubject,
    getItemsBySubject,
    removeItem,
    updateItem,
    clearCalendar,
  } = useCalendarStore();

  return {
    items,
    addItem,
    getItemsByDate,
    getClassItemsByDate,
    getItemsByDateAndSubject,
    getItemsBySubject,
    removeItem,
    updateItem,
    clearCalendar,
    classItems,
    addClassItem,
  };
};
