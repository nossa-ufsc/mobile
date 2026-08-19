import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import {
  CalendarClassItem,
  CalendarColor,
  CalendarItem,
  Event,
  SavedEvent,
  Subject,
} from '@/types';
import { useCalendarNotifications } from './use-calendar-notifications';
import { generateRandomId } from '@/utils/generate-random-id';
import { expandSavedEvent } from '../utils/expand-saved-event';
import {
  getDefaultReminderDate,
  snapshotChanged,
  timesChanged,
  toSnapshot,
} from '../utils/saved-event';

const persistedCalendarStorage = new MMKV({
  id: 'calendar-storage',
});

interface CalendarState {
  items: CalendarItem[];
  classItems: CalendarClassItem[];
  savedEvents: SavedEvent[];
  addItemWithoutNotification: (item: CalendarItem) => void;
  addClassItem: (item: CalendarClassItem) => void;
  setClassItems: (items: CalendarClassItem[]) => void;
  getItemsByDate: (date: Date) => CalendarItem[];
  getClassItemsByDate: (date: Date) => CalendarClassItem[];
  getItemsByDateAndSubject: (date: Date, subject: Subject) => CalendarItem[] | undefined;
  getItemsBySubject: (subject: Subject) => CalendarItem[];
  removeItemWithoutNotification: (id: string) => void;
  removeItemsWithoutNotification: (ids: string[]) => void;
  updateItemWithoutNotification: (id: string, item: Partial<CalendarItem>) => void;
  clearCalendarWithoutNotification: () => void;
  saveEventWithoutNotification: (saved: SavedEvent) => void;
  removeSavedEventWithoutNotification: (eventId: string) => void;
  updateSavedEventWithoutNotification: (eventId: string, saved: Partial<SavedEvent>) => void;
  getSavedEvent: (eventId: string) => SavedEvent | undefined;
  getSavedEventsByDate: (day: Date) => SavedEvent[];
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
      savedEvents: [],

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

      setClassItems: (newItems) => {
        set(() => ({
          classItems: newItems,
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

      removeItemsWithoutNotification: (ids) => {
        set((state) => ({
          items: state.items.filter((item) => !ids.includes(item.id)),
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

      saveEventWithoutNotification: (saved) => {
        set((state) => ({
          savedEvents: [...state.savedEvents.filter((e) => e.eventId !== saved.eventId), saved],
        }));
      },

      removeSavedEventWithoutNotification: (eventId) => {
        set((state) => ({
          savedEvents: state.savedEvents.filter((saved) => saved.eventId !== eventId),
        }));
      },

      updateSavedEventWithoutNotification: (eventId, updated) => {
        set((state) => ({
          savedEvents: state.savedEvents.map((saved) =>
            saved.eventId === eventId ? { ...saved, ...updated } : saved
          ),
        }));
      },

      getSavedEvent: (eventId) => get().savedEvents.find((saved) => saved.eventId === eventId),

      // Consulta por faixa (não por igualdade de dia): eventos podem durar vários dias
      // ou atravessar a meia-noite.
      getSavedEventsByDate: (day) => {
        const now = Date.now();
        return get().savedEvents.filter((saved) => expandSavedEvent(saved, day, now) !== null);
      },
    }),
    {
      name: 'calendar-storage-v2',
      version: 1,
      // v0 não tinha `savedEvents`; o resto do estado é preservado como está.
      migrate: (persisted, version) => {
        const state = persisted as Partial<CalendarState>;
        if (version < 1) {
          return { ...state, savedEvents: state?.savedEvents ?? [] } as CalendarState;
        }
        return state as CalendarState;
      },
      storage: createJSONStorage(() => systemStorageZustandAdapter),
    }
  )
);

export const getCalendarItems = (): CalendarItem[] => useCalendarStore.getState().items;

export const removeCalendarItemsWithoutNotification = (ids: string[]) =>
  useCalendarStore.getState().removeItemsWithoutNotification(ids);

export const getSavedEvents = (): SavedEvent[] => useCalendarStore.getState().savedEvents;

/** Assinaturas enxutas pros marcadores do seletor de mês (sem montar o `useCalendar`). */
export const useSavedEventsList = () => useCalendarStore((state) => state.savedEvents);
export const useCalendarItemsList = () => useCalendarStore((state) => state.items);

export const useCalendar = () => {
  const {
    items,
    classItems,
    savedEvents,
    saveEventWithoutNotification,
    removeSavedEventWithoutNotification,
    updateSavedEventWithoutNotification,
    getSavedEvent,
    getSavedEventsByDate,
    addItemWithoutNotification,
    addClassItem,
    setClassItems,
    getItemsByDate,
    getClassItemsByDate,
    getItemsByDateAndSubject,
    getItemsBySubject,
    removeItemWithoutNotification,
    updateItemWithoutNotification,
    clearCalendarWithoutNotification,
  } = useCalendarStore();

  const { scheduleNotification, scheduleEventNotification, cancelItemNotification } =
    useCalendarNotifications();

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

  /** Salva o evento no calendário do app e agenda o lembrete padrão. Idempotente. */
  const saveEvent = async (event: Event) => {
    if (getSavedEvent(event.id)) return;

    const snapshot = toSnapshot(event);
    const reminderDate = getDefaultReminderDate(snapshot);
    const saved: SavedEvent = {
      eventId: event.id,
      savedAt: new Date().toISOString(),
      snapshot,
      notificationEnabled: true,
      notificationDate: reminderDate?.toISOString(),
    };

    saved.notificationId = await scheduleEventNotification(saved);
    saveEventWithoutNotification(saved);
  };

  const unsaveEvent = async (eventId: string) => {
    const saved = getSavedEvent(eventId);

    if (saved?.notificationId) {
      await cancelItemNotification(saved.notificationId);
    }

    removeSavedEventWithoutNotification(eventId);
  };

  const isEventSaved = (eventId: string) => savedEvents.some((saved) => saved.eventId === eventId);

  const setSavedEventColor = (eventId: string, color: CalendarColor | undefined) =>
    updateSavedEventWithoutNotification(eventId, { color });

  /**
   * Reconcilia os snapshots com a lista fresca do servidor. Eventos ausentes da lista
   * são mantidos (a query só traz futuros do campus atual) — nunca apaga sozinho.
   */
  const refreshSavedEvents = async (events: Event[]) => {
    const freshById = new Map(events.map((event) => [event.id, event]));

    for (const saved of getSavedEvents()) {
      const fresh = freshById.get(saved.eventId);
      if (!fresh) continue;

      const snapshot = toSnapshot(fresh);
      if (!snapshotChanged(saved.snapshot, snapshot)) continue;

      if (!timesChanged(saved.snapshot, snapshot)) {
        updateSavedEventWithoutNotification(saved.eventId, { snapshot });
        continue;
      }

      // Mudou início/fim: reagenda o lembrete a partir das novas datas.
      if (saved.notificationId) {
        await cancelItemNotification(saved.notificationId);
      }
      const reminderDate = saved.notificationEnabled ? getDefaultReminderDate(snapshot) : null;
      const next: SavedEvent = {
        ...saved,
        snapshot,
        notificationDate: reminderDate?.toISOString(),
        notificationId: undefined,
      };
      next.notificationId = await scheduleEventNotification(next);
      updateSavedEventWithoutNotification(saved.eventId, next);
    }
  };

  /** Usado depois de `cancelAllNotifications()` no rebuild do semestre. */
  const rescheduleSavedEventNotifications = async () => {
    for (const saved of getSavedEvents()) {
      if (!saved.notificationEnabled || !saved.notificationDate) continue;
      try {
        const notificationId = await scheduleEventNotification(saved);
        updateSavedEventWithoutNotification(saved.eventId, { notificationId });
      } catch (error) {
        console.error('Error rescheduling saved event notification:', error);
      }
    }
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
    setClassItems,
    savedEvents,
    saveEvent,
    unsaveEvent,
    isEventSaved,
    setSavedEventColor,
    getSavedEvent,
    getSavedEventsByDate,
    refreshSavedEvents,
    rescheduleSavedEventNotifications,
  };
};
