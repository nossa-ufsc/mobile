import { CalendarClassItem, Subject } from '@/types';
import { generateRandomId } from '@/utils/generate-random-id';
import { numericTimeOrder } from '@/utils/time-mapping';

export const generateSemesterCalendar = (
  subjects: Subject[],
  semesterDuration: number,
  startDate: Date
): CalendarClassItem[] => {
  const calendarClassItems: CalendarClassItem[] = [];
  const semesterStartDate = new Date(startDate);

  semesterStartDate.setHours(0, 0, 0, 0);

  for (let week = 0; week < semesterDuration; week++) {
    const classesByDay = new Map<
      number,
      { subject: Subject; date: Date; schedule: Subject['schedule'][0] }[]
    >();

    subjects.forEach((subject) => {
      subject.schedule.forEach((schedule) => {
        const classDate = new Date(semesterStartDate);
        const jsWeekDay = schedule.weekDay === 6 ? 0 : schedule.weekDay + 1;
        classDate.setDate(classDate.getDate() + week * 7 + jsWeekDay);

        const [hours, minutes] = schedule.startTime.split(':').map(Number);
        classDate.setHours(hours, minutes, 0, 0);

        const dayClasses = classesByDay.get(jsWeekDay) || [];
        dayClasses.push({ subject, date: classDate, schedule });
        classesByDay.set(jsWeekDay, dayClasses);
      });
    });

    classesByDay.forEach((dayClasses) => {
      const sortedClasses = dayClasses.sort(
        (a, b) => numericTimeOrder[a.schedule.startTime] - numericTimeOrder[b.schedule.startTime]
      );

      sortedClasses.forEach((currentClass, index) => {
        let consecutiveClasses = 0;

        if (index > 0) {
          const previousClass = sortedClasses[index - 1];
          const isSameSubject = previousClass.subject.id === currentClass.subject.id;
          const isConsecutive = previousClass.schedule.endTime === currentClass.schedule.startTime;

          if (isSameSubject && isConsecutive) {
            return;
          }
        }

        for (let j = index + 1; j < sortedClasses.length; j++) {
          const nextClass = sortedClasses[j];
          const isSameSubject = currentClass.subject.id === nextClass.subject.id;
          const isConsecutive =
            sortedClasses[j - 1].schedule.endTime === nextClass.schedule.startTime;

          if (isSameSubject && isConsecutive) {
            consecutiveClasses++;
          } else {
            break;
          }
        }

        calendarClassItems.push({
          title: currentClass.subject.name,
          description: `${currentClass.schedule.room} - ${currentClass.schedule.center}`,
          date: currentClass.date,
          subject: currentClass.subject,
          id: generateRandomId(),
          consecutiveClasses,
        });
      });
    });
  }

  return calendarClassItems;
};
