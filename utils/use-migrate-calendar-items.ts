import { useCalendar } from '@/features/calendar/hooks/use-calendar';
import { useEnvironmentStore } from './use-environment-store';
import { useNotifications } from './use-notifications';
import { useEffect } from 'react';
import { getSemesterStartDate } from '@/features/calendar/utils/get-semester-start-date';
import { generateSemesterCalendar } from '@/features/calendar/utils/generate-semester-calendar';

export const useMigrateCalendarItems = () => {
  const {
    isAuthenticated,
    subjects,
    semesterDuration,
    isCalendarFixMigrated,
    setIsCalendarFixMigrated,
  } = useEnvironmentStore();
  const { setClassItems, items, updateItem } = useCalendar();
  const { cancelAllNotifications, generateClassesNotifications } = useNotifications();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!subjects || subjects.length === 0) return;
    if (isCalendarFixMigrated) return;

    const semesterStartDate = getSemesterStartDate();
    const classItems = generateSemesterCalendar(subjects, semesterDuration, semesterStartDate);
    setClassItems(classItems);
    setIsCalendarFixMigrated(true);

    (async () => {
      try {
        await cancelAllNotifications();
        await generateClassesNotifications(classItems);
        const itemsToReschedule = items.filter((it) => it.notificationEnabled);
        for (const it of itemsToReschedule) {
          if (!it.notificationDate) continue;
          await updateItem(it.id, {
            notificationEnabled: true,
            notificationDate: it.notificationDate,
          });
        }
      } catch (error) {
        console.error('Calendar migration scheduling error:', error);
      }
    })();
  }, [isAuthenticated, subjects, semesterDuration]);
};
