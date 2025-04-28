import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { CalendarClassItem, CalendarItem, Subject } from '@/types';
import { useCalendarNotifications } from './use-calendar-notifications';
import { generateRandomId } from '@/utils/generate-random-id';

const persistedCalendarStorage = new MMKV({
  id: 'calendar-storage',
});

interface CalendarState {
  items: CalendarItem[];
  classItems: CalendarClassItem[];
  addItemWithoutNotification: (item: CalendarItem) => void;
  addClassItem: (item: CalendarClassItem) => void;
  getItemsByDate: (date: Date) => CalendarItem[];
  getClassItemsByDate: (date: Date) => CalendarClassItem[];
  getItemsByDateAndSubject: (date: Date, subject: Subject) => CalendarItem[] | undefined;
  getItemsBySubject: (subject: Subject) => CalendarItem[];
  removeItemWithoutNotification: (id: string) => void;
  updateItemWithoutNotification: (id: string, item: Partial<CalendarItem>) => void;
  clearCalendarWithoutNotification: () => void;
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
      classItems: [],

      addItemWithoutNotification: (newItem) => {
        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

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

      removeItemWithoutNotification: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateItemWithoutNotification: (id, updatedItem) => {
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, ...updatedItem } : item)),
        }));
      },

      clearCalendarWithoutNotification: () => {
        set({ items: [], classItems: [] });
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
    addItemWithoutNotification,
    addClassItem,
    getItemsByDate,
    getClassItemsByDate,
    getItemsByDateAndSubject,
    getItemsBySubject,
    removeItemWithoutNotification,
    updateItemWithoutNotification,
    clearCalendarWithoutNotification,
  } = useCalendarStore();

  const { scheduleNotification, cancelItemNotification } = useCalendarNotifications();

  const addItem = async (newItem: Omit<CalendarItem, 'id'>) => {
    const id = generateRandomId();
    let notificationId: string | undefined;

    if (newItem.notificationEnabled) {
      notificationId = await scheduleNotification({ ...newItem, id } as CalendarItem);
    }

    const itemWithNotification = {
      ...newItem,
      id,
      date: new Date(newItem.date),
      notificationId,
    };

    addItemWithoutNotification(itemWithNotification);
  };

  const removeItem = async (id: string) => {
    const item = items.find((item) => item.id === id);

    if (item?.notificationId) {
      await cancelItemNotification(item.notificationId);
    }

    removeItemWithoutNotification(id);
  };

  const updateItem = async (id: string, updatedItem: Partial<CalendarItem>) => {
    const currentItem = items.find((item) => item.id === id);

    if (currentItem?.notificationId) {
      await cancelItemNotification(currentItem.notificationId);
    }

    let notificationId: string | undefined;
    if (updatedItem.notificationEnabled) {
      const newItem = { ...currentItem, ...updatedItem };
      notificationId = await scheduleNotification(newItem as CalendarItem);
    }

    updateItemWithoutNotification(id, { ...updatedItem, notificationId });
  };

  const clearCalendar = async () => {
    await Promise.all(
      items
        .filter((item) => item.notificationId)
        .map((item) => cancelItemNotification(item.notificationId!))
    );

    clearCalendarWithoutNotification();
  };

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
    clearCalendarWithoutNotification,
    classItems,
    addClassItem,
  };
};
