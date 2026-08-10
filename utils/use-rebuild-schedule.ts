import { Subject } from '@/types';
import {
  getCalendarItems,
  removeCalendarItemsWithoutNotification,
  useCalendar,
} from '@/features/calendar/hooks/use-calendar';
import { useEnvironmentStore } from './use-environment-store';
import { useNotifications } from './use-notifications';
import { getSemesterStartDate } from '@/features/calendar/utils/get-semester-start-date';
import { generateSemesterCalendar } from '@/features/calendar/utils/generate-semester-calendar';

/**
 * Regenerates the class schedule (calendar class-items + their notifications)
 * from the given subjects, and reschedules the user's existing calendar items
 * (tasks/exams), which are preserved. Call after any change to `subjects` (manual
 * edits, ignored toggles) so calendar, notifications and widgets stay in sync.
 */
export const useRebuildSchedule = () => {
  const semesterDuration = useEnvironmentStore((state) => state.semesterDuration);
  const semester = useEnvironmentStore((state) => state.semester);
  const { setClassItems, updateItem } = useCalendar();
  const { cancelAllNotifications, generateClassesNotifications } = useNotifications();

  const rebuild = async (subjects: Subject[]) => {
    const subjectIds = new Set(subjects.map((subject) => subject.id));
    const orphanedItemIds = getCalendarItems()
      .filter((item) => !subjectIds.has(item.subject.id))
      .map((item) => item.id);
    if (orphanedItemIds.length > 0) {
      removeCalendarItemsWithoutNotification(orphanedItemIds);
    }

    const semesterStartDate = getSemesterStartDate(semester);
    const classItems = generateSemesterCalendar(subjects, semesterDuration, semesterStartDate);
    setClassItems(classItems);

    try {
      await cancelAllNotifications();
      await generateClassesNotifications(classItems);
    } catch (error) {
      console.error('Error rebuilding class notifications:', error);
    }

    // cancelAllNotifications also cleared the tasks/exams notifications; reschedule
    // the ones the user had enabled.
    const itemsToReschedule = getCalendarItems().filter(
      (item) => item.notificationEnabled && item.notificationDate
    );
    for (const item of itemsToReschedule) {
      try {
        await updateItem(item.id, {
          notificationEnabled: true,
          notificationDate: item.notificationDate,
        });
      } catch (error) {
        console.error('Error rebuilding calendar item notification:', error);
      }
    }
  };

  return { rebuild };
};
