import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useEnvironmentStore } from './use-environment-store';
import { CalendarClassItem, Subject } from '@/types';
import { generateSemesterCalendar } from '@/features/calendar/utils/generate-semester-calendar';
import { getSemesterStartDate } from '@/features/calendar/utils/get-semester-start-date';

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
  const { notificationDelay, notificationsEnabled, subjects, semesterDuration, setSubjects } =
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
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [notificationsEnabled]);

  const scheduleClassNotification = async (className: string, date: Date, classPlace?: string) => {
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

    if (subjects && setSubjects) {
      const cleared = subjects.map((s) => ({ ...s, classNotificationMap: {} }));
      setSubjects(cleared);
    }
  };

  const generateClassesNotifications = async (classes?: CalendarClassItem[]) => {
    let calendarItems = classes;
    if ((!calendarItems || calendarItems.length === 0) && subjects) {
      const semesterStartDate = getSemesterStartDate();
      calendarItems = generateSemesterCalendar(subjects, semesterDuration, semesterStartDate);
    }

    if (!calendarItems || calendarItems.length === 0) return;

    const subjectIdToMapUpdates: Record<string, Record<string, string>> = {};

    for (const item of calendarItems) {
      const subjectId = item.subject.id;
      const subjectInStore = subjects?.find((s) => s.id === subjectId);
      const isSubjectEnabled = subjectInStore?.classNotificationsEnabled !== false;
      if (!isSubjectEnabled) continue;

      const id = await scheduleClassNotification(item.subject.name, item.date, item.description);
      if (id) {
        if (!subjectIdToMapUpdates[subjectId]) subjectIdToMapUpdates[subjectId] = {};
        subjectIdToMapUpdates[subjectId][item.id] = id;
      }
    }

    if (subjects && setSubjects && Object.keys(subjectIdToMapUpdates).length > 0) {
      const updated = subjects.map((s) => {
        const updates = subjectIdToMapUpdates[s.id];
        if (!updates) return s;
        return {
          ...s,
          classNotificationMap: { ...(s.classNotificationMap ?? {}), ...updates },
        } as Subject;
      });
      setSubjects(updated);
    }
  };

  const generateClassNotificationsForSubject = async (subjectId: string) => {
    if (!subjects) return;
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    const semesterStartDate = getSemesterStartDate();
    const itemsForSubject = generateSemesterCalendar(
      [subject],
      semesterDuration,
      semesterStartDate
    );

    const updates: Record<string, string> = {};
    for (const item of itemsForSubject) {
      const id = await scheduleClassNotification(item.subject.name, item.date, item.description);
      if (id) {
        updates[item.id] = id;
      }
    }

    if (Object.keys(updates).length > 0) {
      const updated = subjects.map((s) =>
        s.id === subjectId
          ? ({
              ...s,
              classNotificationMap: { ...(s.classNotificationMap ?? {}), ...updates },
            } as Subject)
          : s
      );
      setSubjects(updated);
    }
  };

  const cancelClassNotificationsForSubject = async (subjectId: string) => {
    if (!subjects) return;
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    const map = subject.classNotificationMap ?? {};
    const ids = Object.values(map);
    for (const id of ids) {
      try {
        await cancelNotification(id);
      } catch (e) {
        console.warn('Failed to cancel notification', id, e);
      }
    }

    const updated = subjects.map((s) =>
      s.id === subjectId ? ({ ...s, classNotificationMap: {} } as Subject) : s
    );
    setSubjects(updated);
  };

  return {
    notification,
    scheduleClassNotification,
    scheduleCalendarItemNotification,
    cancelNotification,
    cancelAllNotifications,
    generateClassesNotifications,
    generateClassNotificationsForSubject,
    cancelClassNotificationsForSubject,
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
