import { Subject } from '@/types';
import { isLunchBreak } from '@/utils/time-mapping';

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

  const widgetData: WidgetData = {
    data: {} as Record<number, WidgetCalendarEvent[]>,
  };

  subjects.forEach((subject) => {
    subject.schedule?.forEach((schedule) => {
      if (!schedule?.weekDay && schedule.weekDay !== 0) return;

      if (!widgetData.data[schedule.weekDay]) {
        widgetData.data[schedule.weekDay] = [];
      }

      if (schedule.startTime && schedule.endTime && schedule.room) {
        widgetData.data[schedule.weekDay].push({
          name: subject.name,
          classroom: schedule.room,
          time: schedule.startTime,
          finishTime: schedule.endTime,
        });
      }
    });
  });

  Object.keys(widgetData.data).forEach((day) => {
    const sortedClasses = widgetData.data[Number(day)].sort((a, b) => {
      return a.time.localeCompare(b.time);
    });

    const mergedClasses = sortedClasses.reduce<WidgetCalendarEvent[]>((acc, currentClass) => {
      if (acc.length === 0) {
        return [currentClass];
      }

      const previousClass = acc[acc.length - 1];
      const isSameSubject = previousClass.name === currentClass.name;
      const isConsecutive =
        previousClass.finishTime === currentClass.time ||
        isLunchBreak(previousClass.finishTime, currentClass.time);

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

    widgetData.data[Number(day)] = mergedClasses;
  });

  return widgetData;
};
