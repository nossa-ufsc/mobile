import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { AndroidScheduleWidget } from './views/android-schedule-widget';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { numericTimeOrder, isLunchBreak } from '@/utils/time-mapping';

const nameToWidget = {
  nossa_ufsc_schedule: AndroidScheduleWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget = nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

  if (!Widget) {
    console.error('Widget not found:', widgetInfo.widgetName);
    return;
  }

  try {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const subjects = useEnvironmentStore.getState().subjects || [];

    const allClasses = subjects
      .flatMap((subject) =>
        (subject.schedule || [])
          .filter((schedule) => schedule?.weekDay === currentDay)
          .map((schedule) => ({
            name: subject.name,
            id: subject.id,
            startTime: schedule.startTime || '',
            endTime: schedule.endTime || '',
            classroom: schedule.room || '',
          }))
      )
      .filter((classInfo) => classInfo.startTime && classInfo.endTime && classInfo.classroom);

    const sortedClasses = allClasses.sort((a, b) => {
      return numericTimeOrder[a.startTime] - numericTimeOrder[b.startTime];
    });

    const groupedClasses = sortedClasses.reduce<
      {
        name: string;
        id: string;
        startTime: string;
        endTime: string;
        classroom: string;
      }[]
    >((acc, currentClass, index) => {
      if (index === 0) {
        return [{ ...currentClass }];
      }

      const previousClass = acc[acc.length - 1];
      const isSameSubject = previousClass.id === currentClass.id;
      const isConsecutive =
        previousClass.endTime === currentClass.startTime ||
        isLunchBreak(previousClass.endTime, currentClass.startTime);

      if (isSameSubject && isConsecutive) {
        acc[acc.length - 1] = {
          ...previousClass,
          endTime: currentClass.endTime,
        };
      } else {
        acc.push({ ...currentClass });
      }

      return acc;
    }, []);

    const currentHour = currentDate.getHours();
    const events = groupedClasses
      .filter((event) => {
        const eventHour = parseInt(event.endTime.split(':')[0], 10);
        return eventHour >= currentHour;
      })
      .slice(0, 3);

    props.renderWidget(<Widget classes={events} currentDate={currentDate} />);
  } catch (error) {
    console.error('Error updating widget:', error);
    props.renderWidget(<Widget classes={[]} currentDate={new Date()} />);
  }
}
