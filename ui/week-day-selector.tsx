import { View, TouchableOpacity } from 'react-native';
import { Text } from './text';
import { useColorScheme } from '@/utils/use-color-scheme';
import { cn } from '@/utils/cn';
import { useMemo } from 'react';

interface WeekDaySelectorProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
  testID?: string;
}

const WEEKDAY_NAMES = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

export const WeekDaySelector = ({ selectedDay, onSelectDay, testID }: WeekDaySelectorProps) => {
  const { colors } = useColorScheme();

  const days = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentWeekDay = today.getDay(); // 0-6, 0 is Sunday

    // Calculate the date of Monday (start of week)
    // If today is Sunday (0), we need to go back 6 days to get to Monday
    // For other days, we go back (currentWeekDay - 1) days
    const daysToSubtract = currentWeekDay === 0 ? 6 : currentWeekDay - 1;
    const mondayDate = new Date(today);
    mondayDate.setDate(currentDay - daysToSubtract);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(mondayDate);
      date.setDate(mondayDate.getDate() + index);
      return {
        number: date.getDate(),
        name: WEEKDAY_NAMES[index],
      };
    });
  }, []);

  return (
    <View className="w-full border-b border-gray-100 pb-3 dark:border-gray-800" testID={testID}>
      <View className="w-full flex-row justify-between">
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelectDay(index)}
            className={cn('mx-0.5 h-16 flex-1 items-center justify-center')}
            testID={`${testID}-day-${day.number}`}>
            <Text
              className={cn(
                'mb-1 text-xs uppercase',
                selectedDay === index ? 'text-primary' : colors.foreground
              )}>
              {day.name}
            </Text>
            <View
              className={cn(
                'h-10 w-10 items-center justify-center rounded-full',
                selectedDay === index ? 'bg-primary' : 'bg-transparent'
              )}>
              <Text
                className={cn(
                  'text-xl font-semibold',
                  selectedDay === index ? 'text-white' : colors.foreground
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
