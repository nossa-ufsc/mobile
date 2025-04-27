import { create } from 'zustand';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { numericTimeOrder } from '@/utils/time-mapping';

interface ScheduleState {
  selectedDay: number;
  setSelectedDay: (day: number) => void;
}

export const useScheduleStore = create<ScheduleState>()((set) => ({
  selectedDay: new Date().getDay(),
  setSelectedDay: (day: number) => set({ selectedDay: day }),
}));

export const useClassesForDay = () => {
  const selectedDay = useScheduleStore((state) => state.selectedDay);
  const subjects = useEnvironmentStore((state) => state.subjects);

  if (!subjects) return [];

  const allClasses = subjects
    .flatMap((subject) =>
      (subject.schedule || [])
        .filter((schedule) => schedule?.weekDay === selectedDay)
        .map((schedule) => ({
          subject,
          time: {
            startTime: schedule.startTime || '',
            endTime: schedule.endTime || '',
            room: schedule.room || '',
            center: schedule.center || '',
          },
        }))
    )
    .filter(
      (classInfo) =>
        classInfo.time.startTime &&
        classInfo.time.endTime &&
        classInfo.time.room &&
        classInfo.time.center
    );

  const sortedClasses = allClasses.sort((a, b) => {
    return numericTimeOrder[a.time.startTime] - numericTimeOrder[b.time.startTime];
  });

  const groupedClasses = sortedClasses.reduce<
    ((typeof sortedClasses)[0] & { consecutiveClasses: number })[]
  >((acc, currentClass, index) => {
    if (index === 0) {
      return [{ ...currentClass, consecutiveClasses: 0 }];
    }

    const previousClass = acc[acc.length - 1];
    const isSameSubject = previousClass.subject.id === currentClass.subject.id;
    const isConsecutive = previousClass.time.endTime === currentClass.time.startTime;

    if (isSameSubject && isConsecutive) {
      acc[acc.length - 1] = {
        ...previousClass,
        consecutiveClasses: previousClass.consecutiveClasses + 1,
        time: {
          ...previousClass.time,
          endTime: currentClass.time.endTime,
        },
      };
    } else {
      acc.push({ ...currentClass, consecutiveClasses: 0 });
    }

    return acc;
  }, []);

  return groupedClasses;
};
