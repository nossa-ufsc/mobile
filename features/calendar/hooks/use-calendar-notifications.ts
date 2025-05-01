import { useNotifications } from '@/utils/use-notifications';
import { CalendarItem } from '@/types';

export const useCalendarNotifications = () => {
  const { scheduleCalendarItemNotification, cancelNotification } = useNotifications();

  const scheduleNotification = async (item: CalendarItem) => {
    if (!item.notificationEnabled) return;

    const notificationId = await scheduleCalendarItemNotification(
      item.title,
      item.description || '',
      item.notificationDate || new Date(item.date)
    );

    return notificationId;
  };

  const cancelItemNotification = async (notificationId: string) => {
    await cancelNotification(notificationId);
  };

  return {
    scheduleNotification,
    cancelItemNotification,
  };
};
