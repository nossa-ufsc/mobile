import { useNotifications } from '@/utils/use-notifications';
import { CalendarItem, SavedEvent } from '@/types';

export const useCalendarNotifications = () => {
  const { scheduleCalendarItemNotification, scheduleSavedEventNotification, cancelNotification } =
    useNotifications();

  const scheduleNotification = async (item: CalendarItem) => {
    if (!item.notificationEnabled) return;

    const notificationId = await scheduleCalendarItemNotification(
      item.title,
      item.description || '',
      item.notificationDate || new Date(item.date)
    );

    return notificationId;
  };

  /** Lembrete de evento salvo; no-op se o lembrete estiver desligado ou sem data. */
  const scheduleEventNotification = async (saved: SavedEvent) => {
    if (!saved.notificationEnabled || !saved.notificationDate) return;

    return await scheduleSavedEventNotification(saved.snapshot, new Date(saved.notificationDate));
  };

  const cancelItemNotification = async (notificationId: string) => {
    await cancelNotification(notificationId);
  };

  return {
    scheduleNotification,
    scheduleEventNotification,
    cancelItemNotification,
  };
};
