import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useEnvironmentStore } from './use-environment-store';
import { getDateLocale } from './i18n/get-date-locale';
import { CalendarClassItem, SavedEvent } from '@/types';
import { generateSemesterCalendarFromPlan } from '@/features/calendar/utils/generate-semester-calendar';
import { getSemesterPlan } from '@/features/calendar/hooks/use-semester-plan';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotifications = () => {
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);
  const { notificationDelay, notificationsEnabled, subjects } = useEnvironmentStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (!notificationsEnabled) return;

    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [notificationsEnabled]);

  const scheduleClassNotification = async (
    className: string,
    date: Date,
    notificationsEnabled: boolean,
    classPlace?: string
  ) => {
    if (!notificationsEnabled) return;

    const notificationDate = new Date(date);
    const delayMinutes = notificationDelay || 0;

    const totalMinutes =
      notificationDate.getHours() * 60 + notificationDate.getMinutes() - delayMinutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    notificationDate.setHours(newHours);
    notificationDate.setMinutes(newMinutes);

    if (notificationDate.getTime() <= Date.now()) return;

    const title = t('notifications.classTitle', { minutes: delayMinutes });
    const time = date.toLocaleTimeString(getDateLocale());
    const body = classPlace
      ? t('notifications.classBodyWithPlace', { className, place: classPlace, time })
      : t('notifications.classBodyNoPlace', { className, time });

    console.info('Class Notification scheduled', {
      title,
      body,
      date: notificationDate,
    });

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: {
        date: notificationDate,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      },
    });
  };

  const scheduleCalendarItemNotification = async (
    title: string,
    description: string,
    date: Date
  ) => {
    if (!notificationsEnabled) return;

    const notificationDate = new Date(date);

    if (notificationDate.getTime() <= Date.now()) return;

    const notificationTitle = t('notifications.reminderTitle', { title });

    console.info('Calendar Item Notification scheduled', {
      title: notificationTitle,
      body: description,
      date: notificationDate,
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    });

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationTitle,
        body: description,
      },
      trigger: {
        date: notificationDate,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      },
    });
  };

  /**
   * Lembrete de um evento salvo no calendário do app. Título = nome do evento;
   * corpo = "Começa às 20:00 · Local" (ou "Hoje · Local" em evento de dia inteiro).
   */
  const scheduleSavedEventNotification = async (snapshot: SavedEvent['snapshot'], date: Date) => {
    if (!notificationsEnabled) return;

    const notificationDate = new Date(date);
    if (notificationDate.getTime() <= Date.now()) return;

    const location = snapshot.location?.trim();
    const body = snapshot.is_all_day
      ? location
        ? t('notifications.eventReminderAllDay', { location })
        : t('notifications.eventReminderAllDayNoPlace')
      : (() => {
          const time = new Date(snapshot.start_date).toLocaleTimeString(getDateLocale(), {
            hour: '2-digit',
            minute: '2-digit',
          });
          return location
            ? t('notifications.eventReminderBody', { time, location })
            : t('notifications.eventReminderBodyNoPlace', { time });
        })();

    console.info('Saved Event Notification scheduled', {
      title: snapshot.name,
      body,
      date: notificationDate,
    });

    return await Notifications.scheduleNotificationAsync({
      content: { title: snapshot.name, body },
      trigger: {
        date: notificationDate,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      },
    });
  };

  const cancelNotification = async (notificationId: string) => {
    console.info('Calendar Item Notification cancelled', {
      notificationId,
    });
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  const cancelAllNotifications = async () => {
    console.info('All Notifications cancelled');
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const generateClassesNotifications = async (classes?: CalendarClassItem[]) => {
    // Respect the user's setting; read fresh (not the closure) so callers deferred
    // via setTimeout right after toggling notifications on still see the new value.
    if (!useEnvironmentStore.getState().notificationsEnabled) return;

    let calendarItems = classes;
    if (!classes) {
      if (!subjects) return;

      calendarItems = generateSemesterCalendarFromPlan(subjects, getSemesterPlan());
    }

    if (!calendarItems) return;

    const results = await Promise.allSettled(
      calendarItems.map((item) =>
        scheduleClassNotification(item.subject.name, item.date, true, item.description)
      )
    );

    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length > 0) {
      console.error('Error scheduling class notifications:', failures);
    }
  };

  return {
    notification,
    scheduleClassNotification,
    scheduleCalendarItemNotification,
    scheduleSavedEventNotification,
    cancelNotification,
    cancelAllNotifications,
    generateClassesNotifications,
  };
};

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }
}
