import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { AndroidScheduleWidget } from './views/android-schedule-widget';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { numericTimeOrder } from '@/utils/time-mapping';

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
            time: schedule.startTime || '',
            finishTime: schedule.endTime || '',
            classroom: schedule.room || '',
          }))
      )
      .filter((classInfo) => classInfo.time && classInfo.finishTime && classInfo.classroom);

    const sortedClasses = allClasses.sort((a, b) => {
      return numericTimeOrder[a.time] - numericTimeOrder[b.time];
    });

    const groupedClasses = sortedClasses.reduce<any[]>((acc, currentClass, index) => {
      if (index === 0) {
        return [{ ...currentClass }];
      }

      const previousClass = acc[acc.length - 1];
      const isSameSubject = previousClass.id === currentClass.id;
      const isConsecutive = previousClass.finishTime === currentClass.time;

      if (isSameSubject && isConsecutive) {
        acc[acc.length - 1] = {
          ...previousClass,
          finishTime: currentClass.finishTime,
        };
      } else {
        acc.push({ ...currentClass });
      }

      return acc;
    }, []);

    const currentHour = currentDate.getHours();
    const events = groupedClasses
      .filter((event) => {
        const eventHour = parseInt(event.finishTime.split(':')[0], 10);
        return eventHour >= currentHour;
      })
      .slice(0, 3);

    props.renderWidget(<Widget classes={events} currentDate={currentDate} />);
  } catch (error) {
    console.error('Error updating widget:', error);
    props.renderWidget(<Widget classes={[]} currentDate={new Date()} />);
  }
}
