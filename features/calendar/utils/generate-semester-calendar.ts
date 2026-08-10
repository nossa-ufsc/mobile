import { CalendarClassItem, Subject } from '@/types';
import { generateRandomId } from '@/utils/generate-random-id';
import { timeToMinutes, areClassesConsecutive } from '@/utils/time-mapping';
import { getActiveSubjects } from '@/utils/subjects';

export const generateSemesterCalendar = (
  subjects: Subject[],
  semesterDuration: number,
  startDate: Date
): CalendarClassItem[] => {
  const calendarClassItems: CalendarClassItem[] = [];
  const activeSubjects = getActiveSubjects(subjects);
  const semesterStartDate = new Date(startDate);

  semesterStartDate.setHours(0, 0, 0, 0);
  const startOfFirstWeek = new Date(semesterStartDate);
  startOfFirstWeek.setDate(startOfFirstWeek.getDate() - startOfFirstWeek.getDay());

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
        let consecutiveClasses = 0;

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
            consecutiveClasses++;
          } else {
            break;
          }
        }

        // The block's true end is the end time of the last slot in the run.
        const lastMergedClass = sortedClasses[index + consecutiveClasses];
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
