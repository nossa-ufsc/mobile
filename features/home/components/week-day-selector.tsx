import { View, TouchableOpacity } from 'react-native';
import { Text } from '../../../ui/text';
import { useColorScheme } from '@/utils/use-color-scheme';
import { cn } from '@/utils/cn';
import { useMemo } from 'react';
import { WEEKDAY_NAMES } from '@/utils/const';

interface WeekDaySelectorProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
  testID?: string;
  className?: string;
}

export const WeekDaySelector = ({
  selectedDay,
  onSelectDay,
  testID,
  className,
}: WeekDaySelectorProps) => {
  const { colors } = useColorScheme();

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
        number: date.getDate(),
        name: WEEKDAY_NAMES[index],
        dayIndex: jsIndex,
        isToday: date.toDateString() === today.toDateString(),
      };
    });
  }, []);

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
              className={cn(
                'h-10 w-10 items-center justify-center rounded-full',
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
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
