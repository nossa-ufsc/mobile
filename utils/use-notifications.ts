import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useEnvironmentStore } from './use-environment-store';
import { CalendarClassItem } from '@/types';
import { generateSemesterCalendar } from '@/features/calendar/utils/generate-semester-calendar';
import { getSemesterStartDate } from '@/features/calendar/utils/get-semester-start-date';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const useNotifications = () => {
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { notificationDelay, notificationsEnabled, subjects, semesterDuration } =
    useEnvironmentStore();

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
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
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

    console.info('Class Notification scheduled', {
      title: `Aula em ${delayMinutes} minutos`,
      body: `${className} ${classPlace ? `em ${classPlace}` : ''} às ${date.toLocaleTimeString()}`,
      date: notificationDate,
    });

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `Aula em ${delayMinutes} minutos`,
        body: `${className} ${classPlace ? `em ${classPlace}` : ''} às ${date.toLocaleTimeString()}`,
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

    console.info('Calendar Item Notification scheduled', {
      title: `Lembrete: ${title}`,
      body: description,
      date: notificationDate,
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    });

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `Lembrete: ${title}`,
        body: description,
      },
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
    let calendarItems = classes;
    if (!classes) {
      if (!subjects) return;

      const semesterStartDate = getSemesterStartDate();
      calendarItems = generateSemesterCalendar(subjects, semesterDuration, semesterStartDate);
    }

    if (!calendarItems) return;

    calendarItems.forEach(async (item) => {
      await scheduleClassNotification(item.subject.name, item.date, true, item.description);
    });
  };

  return {
    notification,
    scheduleClassNotification,
    scheduleCalendarItemNotification,
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
