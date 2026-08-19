import { View, TouchableOpacity } from 'react-native';
import { Text } from '../../../ui/text';
import { useColorScheme } from '@/utils/use-color-scheme';
import { cn } from '@/utils/cn';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DayDots, useDayDotColors } from '@/features/calendar/components/day-dots';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { getActiveSubjects } from '@/utils/subjects';

interface WeekDaySelectorProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
  testID?: string;
  className?: string;
  showDots?: boolean;
}

export const WeekDaySelector = ({
  selectedDay,
  onSelectDay,
  testID,
  className,
  showDots = true,
}: WeekDaySelectorProps) => {
  const { colors } = useColorScheme();
  const { t } = useTranslation();
  const weekdayLetters = t('common.weekdayLetters', { returnObjects: true }) as string[];

  const days = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentWeekDay = today.getDay();

    const daysToSubtract = currentWeekDay === 0 ? 6 : currentWeekDay - 1;
    const mondayDate = new Date(today);
    mondayDate.setDate(currentDay - daysToSubtract);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(mondayDate);
      date.setDate(mondayDate.getDate() + index);
      const jsIndex = date.getDay();
      return {
        date,
        number: date.getDate(),
        name: weekdayLetters[index],
        dayIndex: jsIndex,
        isToday: date.toDateString() === today.toDateString(),
      };
    });
  }, [weekdayLetters]);

  const subjects = useEnvironmentStore((state) => state.subjects);
  const classWeekDays = useMemo(
    () =>
      new Set(
        getActiveSubjects(subjects ?? []).flatMap((subject) =>
          (subject.schedule ?? [])
            .filter((time) => time.startTime && time.endTime)
            .map((time) => time.weekDay)
        )
      ),
    [subjects]
  );
  const dates = useMemo(() => days.map((day) => day.date), [days]);
  const hasClass = useCallback((date: Date) => classWeekDays.has(date.getDay()), [classWeekDays]);
  const dotColorsFor = useDayDotColors(dates, { hasClass });

  return (
    <View
      className={cn('w-full border-b border-gray-300 pb-3 dark:border-gray-800', className)}
      testID={testID}>
      <View className="w-full flex-row justify-between gap-0.5">
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelectDay(day.dayIndex)}
            className={cn('h-16 flex-1 items-center justify-center')}
            testID={`${testID}-day-${day.number}`}>
            <Text
              className={cn(
                'mb-1 text-xs uppercase',
                selectedDay === day.dayIndex ? 'text-primary' : colors.foreground
              )}>
              {day.name}
            </Text>
            <View
              style={{
                borderRadius: 20,
                overflow: 'hidden',
              }}
              className={cn(
                'h-10 w-10 items-center justify-center',
                selectedDay === day.dayIndex ? 'bg-primary' : 'bg-transparent'
              )}>
              <Text
                variant="title3"
                className={cn(
                  'text-xl font-semibold',
                  selectedDay === day.dayIndex
                    ? 'text-white'
                    : day.isToday
                      ? 'text-primary'
                      : colors.foreground
                )}>
                {day.number}
              </Text>
              {showDots && (
                <DayDots
                  colors={dotColorsFor(day.date)}
                  isSelected={selectedDay === day.dayIndex}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
