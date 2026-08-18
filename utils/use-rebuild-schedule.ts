import { Subject } from '@/types';
import {
  getCalendarItems,
  removeCalendarItemsWithoutNotification,
  useCalendar,
} from '@/features/calendar/hooks/use-calendar';
import { useNotifications } from './use-notifications';
import { generateSemesterCalendarFromPlan } from '@/features/calendar/utils/generate-semester-calendar';
import { getSemesterPlan } from '@/features/calendar/hooks/use-semester-plan';

// Regenerações e recargas da grade mexem no mesmo estado (itens de aula + todas as
// notificações). Serializa para que uma sincronização do calendário acadêmico que
// chegue no meio de um "Recarregar grade" (ou vice-versa) não deixe aulas duplicadas.
let scheduleLock: Promise<unknown> = Promise.resolve();
export const withScheduleLock = <T>(fn: () => Promise<T>): Promise<T> => {
  const run = scheduleLock.then(fn, fn);
  scheduleLock = run.catch(() => undefined);
  return run;
};

/**
 * Regenerates the class schedule (calendar class-items + their notifications)
 * from the given subjects, and reschedules the user's existing calendar items
 * (tasks/exams), which are preserved. Call after any change to `subjects` (manual
 * edits, ignored toggles) so calendar, notifications and widgets stay in sync.
 */
export const useRebuildSchedule = () => {
  const { setClassItems, updateItem, rescheduleSavedEventNotifications } = useCalendar();
  const { cancelAllNotifications, generateClassesNotifications } = useNotifications();

  const rebuild = (subjects: Subject[]) => withScheduleLock(() => rebuildUnlocked(subjects));

  const rebuildUnlocked = async (subjects: Subject[]) => {
    const subjectIds = new Set(subjects.map((subject) => subject.id));
    const orphanedItemIds = getCalendarItems()
      .filter((item) => !subjectIds.has(item.subject.id))
      .map((item) => item.id);
    if (orphanedItemIds.length > 0) {
      removeCalendarItemsWithoutNotification(orphanedItemIds);
    }

    // Lê o plano na hora (não do closure): quem chama pode ter acabado de trocar
    // o calendário acadêmico/duração no store.
    const classItems = generateSemesterCalendarFromPlan(subjects, getSemesterPlan());
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

    await rescheduleSavedEventNotifications();
  };

  return { rebuild };
};
