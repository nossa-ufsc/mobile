import { Subject } from '@/types';
import { useCalendar } from '@/features/calendar/hooks/use-calendar';
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
  const { setClassItems, items, updateItem } = useCalendar();
  const { cancelAllNotifications, generateClassesNotifications } = useNotifications();

  const rebuild = async (subjects: Subject[]) => {
    const semesterStartDate = getSemesterStartDate(semester);
    const classItems = generateSemesterCalendar(subjects, semesterDuration, semesterStartDate);
    setClassItems(classItems);

    await cancelAllNotifications();
    await generateClassesNotifications(classItems);

    // cancelAllNotifications also cleared the tasks/exams notifications; reschedule
    // the ones the user had enabled.
    const itemsToReschedule = items.filter(
      (item) => item.notificationEnabled && item.notificationDate
    );
    for (const item of itemsToReschedule) {
      await updateItem(item.id, {
        notificationEnabled: true,
        notificationDate: item.notificationDate,
      });
    }
  };

  return { rebuild };
};
