import { CalendarClassItem, Subject } from '@/types';
import { generateRandomId } from '@/utils/generate-random-id';
import { timeToMinutes, areClassesConsecutive } from '@/utils/time-mapping';
import { getActiveSubjects } from '@/utils/subjects';
import { SemesterPlan, toLocalIsoDate } from './academic-calendar';

export interface GenerateSemesterCalendarOptions {
  /**
   * Não gerar aulas antes de `startDate` (dias da primeira semana anteriores ao
   * início oficial). No modo manual a data de início é um chute alinhado à semana e
   * a semana inteira conta, como sempre foi.
   */
  strictStart?: boolean;
  /** Último dia letivo (inclusivo). Aulas depois dele não são geradas. */
  endDate?: Date | null;
  /** Datas "YYYY-MM-DD" sem aula (feriados/dias não letivos do calendário oficial). */
  skipDates?: Set<string>;
}

/** Atalho: gera as aulas do semestre a partir de um SemesterPlan resolvido. */
export const generateSemesterCalendarFromPlan = (
  subjects: Subject[],
  plan: SemesterPlan
): CalendarClassItem[] =>
  generateSemesterCalendar(subjects, plan.weeks, plan.startDate, {
    strictStart: plan.source === 'official',
    endDate: plan.endDate,
    skipDates: plan.skipDates,
  });

export const generateSemesterCalendar = (
  subjects: Subject[],
  semesterDuration: number,
  startDate: Date,
  options: GenerateSemesterCalendarOptions = {}
): CalendarClassItem[] => {
  const calendarClassItems: CalendarClassItem[] = [];
  const activeSubjects = getActiveSubjects(subjects);
  const semesterStartDate = new Date(startDate);

  semesterStartDate.setHours(0, 0, 0, 0);
  const startOfFirstWeek = new Date(semesterStartDate);
  startOfFirstWeek.setDate(startOfFirstWeek.getDate() - startOfFirstWeek.getDay());

  const endOfSemester = options.endDate ? new Date(options.endDate) : null;
  endOfSemester?.setHours(23, 59, 59, 999);
  const skipDates = options.skipDates ?? new Set<string>();
  const isClassDay = (date: Date) =>
    (!options.strictStart || date >= semesterStartDate) &&
    (!endOfSemester || date <= endOfSemester) &&
    !skipDates.has(toLocalIsoDate(date));

  for (let week = 0; week < semesterDuration; week++) {
    const classesByDay = new Map<
      number,
      { subject: Subject; date: Date; schedule: Subject['schedule'][0] }[]
    >();

    const weekStart = new Date(startOfFirstWeek);
    weekStart.setDate(weekStart.getDate() + week * 7);

    activeSubjects.forEach((subject) => {
      subject.schedule.forEach((schedule) => {
        const classDate = new Date(weekStart);
        classDate.setDate(classDate.getDate() + schedule.weekDay);

        const [hours, minutes] = schedule.startTime.split(':').map(Number);
        classDate.setHours(hours, minutes, 0, 0);

        // Fora do período letivo (antes do início, depois do término) ou em
        // feriado/dia não letivo do calendário oficial: sem aula.
        if (!isClassDay(classDate)) return;

        const jsWeekDay = schedule.weekDay;
        const dayClasses = classesByDay.get(jsWeekDay) || [];
        dayClasses.push({ subject, date: classDate, schedule });
        classesByDay.set(jsWeekDay, dayClasses);
      });
    });

    classesByDay.forEach((dayClasses) => {
      const sortedClasses = dayClasses.sort(
        (a, b) => timeToMinutes(a.schedule.startTime) - timeToMinutes(b.schedule.startTime)
      );

      sortedClasses.forEach((currentClass, index) => {
        let consecutiveClasses = (currentClass.schedule.classCount ?? 1) - 1;
        let mergedSlots = 0;

        if (index > 0) {
          const previousClass = sortedClasses[index - 1];
          const isSameSubject = previousClass.subject.id === currentClass.subject.id;
          const isConsecutive = areClassesConsecutive(
            previousClass.schedule.endTime,
            currentClass.schedule.startTime
          );

          if (isSameSubject && isConsecutive) {
            return;
          }
        }

        for (let j = index + 1; j < sortedClasses.length; j++) {
          const nextClass = sortedClasses[j];
          const isSameSubject = currentClass.subject.id === nextClass.subject.id;
          const isConsecutive = areClassesConsecutive(
            sortedClasses[j - 1].schedule.endTime,
            nextClass.schedule.startTime
          );

          if (isSameSubject && isConsecutive) {
            consecutiveClasses += nextClass.schedule.classCount ?? 1;
            mergedSlots++;
          } else {
            break;
          }
        }

        // The block's true end is the end time of the last slot in the run.
        const lastMergedClass = sortedClasses[index + mergedSlots];
        const [endHours, endMinutes] = lastMergedClass.schedule.endTime.split(':').map(Number);
        const endDate = new Date(currentClass.date);
        endDate.setHours(endHours, endMinutes, 0, 0);

        calendarClassItems.push({
          title: currentClass.subject.name,
          description: [currentClass.schedule.room, currentClass.schedule.center]
            .filter(Boolean)
            .join(' - '),
          date: currentClass.date,
          endDate,
          subject: currentClass.subject,
          id: generateRandomId(),
          consecutiveClasses,
        });
      });
    });
  }

  return calendarClassItems;
};
