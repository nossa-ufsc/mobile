import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/ui/text';
import { useColorScheme } from '@/utils/use-color-scheme';
import { cn } from '@/utils/cn';
import { useCallback, useMemo, useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { WEEKDAY_NAMES } from '@/utils/const';
import { useCalendarState } from '@/features/calendar/hooks/use-calendar-state';

interface MonthSelectorProps {
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
  testID?: string;
  className?: string;
}

export const MonthSelector = ({
  selectedDay,
  onSelectDay,
  testID,
  className,
}: MonthSelectorProps) => {
  const { colors } = useColorScheme();
  const { isExpanded, setIsExpanded, currentDate, setCurrentDate } = useCalendarState();

  const expandProgress = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    expandProgress.value = withSpring(isExpanded ? 1 : 0, {
      damping: 20,
      stiffness: 200,
      mass: 0.5,
    });
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) {
      setCurrentDate(new Date(selectedDay));
    }
  }, [selectedDay, isExpanded, setCurrentDate]);

  const expand = useCallback(() => {
    setIsExpanded(true);
  }, [setIsExpanded]);

  const collapse = useCallback(() => {
    setIsExpanded(false);
  }, [setIsExpanded]);

  const handlePrevMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  }, [currentDate, setCurrentDate]);

  const handleNextMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  }, [currentDate, setCurrentDate]);

  const handlePrevWeek = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  }, [currentDate, setCurrentDate]);

  const handleNextWeek = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  }, [currentDate, setCurrentDate]);

  // Pan gesture for calendar interactions:
  // - Vertical swipes: expand/collapse calendar
  // - Horizontal swipes: navigate weeks (collapsed) or months (expanded)
  const gesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .activeOffsetY([-15, 15])
    .minDistance(15)
    .onStart(() => {})
    .onUpdate((event) => {
      if (
        Math.abs(event.translationY) > Math.abs(event.translationX) &&
        Math.abs(event.translationY) > 30
      ) {
        if (!isExpanded && event.translationY < -50) {
          runOnJS(expand)();
        } else if (isExpanded && event.translationY > 50) {
          runOnJS(collapse)();
        }
      }
    })
    .onEnd((event) => {
      if (
        Math.abs(event.translationX) > Math.abs(event.translationY) &&
        Math.abs(event.translationX) > 60
      ) {
        if (!isExpanded) {
          if (event.translationX > 60) {
            runOnJS(handlePrevWeek)();
          } else if (event.translationX < -60) {
            runOnJS(handleNextWeek)();
          }
        } else {
          if (event.translationX > 60) {
            runOnJS(handlePrevMonth)();
          } else if (event.translationX < -60) {
            runOnJS(handleNextMonth)();
          }
        }
      }
    });

  const containerStyle = useAnimatedStyle(() => {
    const height = interpolate(expandProgress.value, [0, 1], [92, 340]);

    return {
      height,
    };
  });

  const days = useMemo(() => {
    const today = new Date();

    const baseDate = currentDate || today;
    const currentDay = baseDate.getDate();
    const currentWeekDay = baseDate.getDay();

    const daysToSubtract = currentWeekDay === 0 ? 6 : currentWeekDay - 1;
    const weekStart = new Date(baseDate);
    weekStart.setDate(currentDay - daysToSubtract);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return {
        date: new Date(date),
        number: date.getDate(),
        name: WEEKDAY_NAMES[index],
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDay.toDateString(),
      };
    });
  }, [currentDate, selectedDay]);

  const monthDays = useMemo(() => {
    if (!isExpanded) return [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const totalDays = lastDay.getDate();
    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push({
        date: new Date(date),
        number: i,
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: date.toDateString() === selectedDay.toDateString(),
      });
    }

    return days;
  }, [currentDate, selectedDay, isExpanded]);

  const weekViewStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        className={cn(
          'w-full overflow-hidden border-b border-gray-300 dark:border-gray-800',
          className
        )}
        style={[containerStyle]}
        testID={testID}>
        <View>
          {!isExpanded ? (
            <Animated.View
              className="w-full flex-row justify-between gap-0.5 pt-4"
              style={weekViewStyle}>
              {days.map((day) => (
                <TouchableOpacity
                  key={day.date.toISOString()}
                  onPress={() => {
                    const now = new Date();
                    const newDate = new Date(day.date);
                    newDate.setHours(now.getHours());
                    onSelectDay(newDate);
                  }}
                  className={cn('h-16 flex-1 items-center justify-center')}
                  testID={`${testID}-day-${day.number}`}>
                  <Text
                    className={cn(
                      'mb-1 text-xs uppercase',
                      day.isSelected ? 'text-primary' : colors.foreground
                    )}>
                    {day.name}
                  </Text>
                  <View
                    className={cn(
                      'h-10 w-10 items-center justify-center rounded-full',
                      day.isSelected ? 'bg-primary' : 'bg-transparent'
                    )}>
                    <Text
                      variant="title3"
                      className={cn(
                        'text-xl font-semibold',
                        day.isSelected
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
            </Animated.View>
          ) : (
            <>
              <View className="my-2 w-full flex-row pt-[10px]">
                {WEEKDAY_NAMES.map((name, index) => (
                  <View key={index} className="flex-1 items-center">
                    <Text className="text-xs uppercase">{name}</Text>
                  </View>
                ))}
              </View>
              <View className="w-full">
                <View className="flex-row flex-wrap">
                  {monthDays.map((day, index) => (
                    <View key={index} className="h-14 w-[14.28%] items-center justify-center">
                      {day && (
                        <TouchableOpacity
                          onPress={() => {
                            const now = new Date();
                            const newDate = new Date(day.date);
                            newDate.setHours(
                              now.getHours(),
                              now.getMinutes(),
                              now.getSeconds(),
                              now.getMilliseconds()
                            );
                            onSelectDay(newDate);
                          }}
                          className="h-10 w-10 items-center justify-center"
                          testID={`${testID}-day-${day.number}`}>
                          <View
                            className={cn(
                              'h-10 w-10 items-center justify-center rounded-full',
                              day.isSelected ? 'bg-primary' : 'bg-transparent'
                            )}>
                            <Text
                              className={cn(
                                'text-xl font-semibold',
                                day.isSelected
                                  ? 'text-white'
                                  : day.isToday
                                    ? 'text-primary'
                                    : colors.foreground
                              )}>
                              {day.number}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};
