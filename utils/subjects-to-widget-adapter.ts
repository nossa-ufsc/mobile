import { Subject } from '@/types';
import { timeToMinutes, areClassesConsecutive } from '@/utils/time-mapping';
import { getActiveSubjects } from '@/utils/subjects';

interface WidgetCalendarEvent {
  name: string;
  classroom: string;
  time: string;
  finishTime: string;
}

interface WidgetData {
  data: Record<number, WidgetCalendarEvent[]>;
}

export const convertSubjectsToWidgetFormat = (subjects: Subject[] | null): WidgetData => {
  if (!subjects) {
    return { data: {} };
  }

  const eventsByDay: Record<number, (WidgetCalendarEvent & { subjectId: string })[]> = {};

  getActiveSubjects(subjects).forEach((subject) => {
    subject.schedule?.forEach((schedule) => {
      if (!schedule?.weekDay && schedule.weekDay !== 0) return;

      if (!eventsByDay[schedule.weekDay]) {
        eventsByDay[schedule.weekDay] = [];
      }

      if (schedule.startTime && schedule.endTime) {
        eventsByDay[schedule.weekDay].push({
          subjectId: subject.id,
          name: subject.name,
          classroom: schedule.room || '',
          time: schedule.startTime,
          finishTime: schedule.endTime,
        });
      }
    });
  });

  const widgetData: WidgetData = { data: {} };

  Object.keys(eventsByDay).forEach((day) => {
    const sortedClasses = eventsByDay[Number(day)].sort((a, b) => {
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });

    const mergedClasses = sortedClasses.reduce<typeof sortedClasses>((acc, currentClass) => {
      if (acc.length === 0) {
        return [currentClass];
      }

      const previousClass = acc[acc.length - 1];
      const isSameSubject = previousClass.subjectId === currentClass.subjectId;
      const isConsecutive = areClassesConsecutive(previousClass.finishTime, currentClass.time);

      if (isSameSubject && isConsecutive) {
        acc[acc.length - 1] = {
          ...previousClass,
          finishTime: currentClass.finishTime,
        };
      } else {
        acc.push(currentClass);
      }

      return acc;
    }, []);

    widgetData.data[Number(day)] = mergedClasses.map(
      ({ subjectId: _subjectId, ...event }) => event
    );
  });

  return widgetData;
};
