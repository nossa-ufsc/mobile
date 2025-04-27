import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/ui/text';
import { useColorScheme } from '@/utils/use-color-scheme';
import { cn } from '@/utils/cn';
import { useCallback, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MONTHS, WEEKDAY_NAMES } from '@/utils/const';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentDate, setCurrentDate] = useState(selectedDay);

  const expandProgress = useSharedValue(0);

  const setIsExpandedJS = useCallback((value: boolean) => {
    setIsExpanded(value);
  }, []);

  const expand = useCallback(() => {
    expandProgress.value = withSpring(1, {
      damping: 20,
      stiffness: 200,
      mass: 0.5,
    });
    runOnJS(setIsExpandedJS)(true);
  }, []);

  const collapse = useCallback(() => {
    expandProgress.value = withSpring(0, {
      damping: 20,
      stiffness: 200,
      mass: 0.5,
    });
    runOnJS(setIsExpandedJS)(false);
  }, []);

  const gesture = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onStart(() => {})
    .onUpdate((event) => {
      if (!isExpanded && event.translationY < -50) {
        runOnJS(expand)();
      } else if (isExpanded && event.translationY > 50) {
        runOnJS(collapse)();
      }
    });

  const containerStyle = useAnimatedStyle(() => {
    const height = interpolate(expandProgress.value, [0, 1], [106, 380]);

    return {
      height,
    };
  });

  const rotateStyle = useAnimatedStyle(() => {
    const rotation = interpolate(expandProgress.value, [0, 1], [0, 180]);

    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const toggleExpanded = useCallback(() => {
    if (isExpanded) {
      collapse();
    } else {
      expand();
    }
  }, [isExpanded, expand, collapse]);

  const days = useMemo(() => {
    const today = new Date();

    const baseDate = selectedDay || today;
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

  const handlePrevMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        className={cn(
          'w-full overflow-hidden border-b border-gray-300 pb-2 dark:border-gray-800',
          className
        )}
        style={[containerStyle]}
        testID={testID}>
        <View className="mb-2 flex-row items-center justify-between px-2 pt-2">
          {isExpanded && (
            <TouchableOpacity
              onPress={handlePrevMonth}
              className="h-8 w-8 items-center justify-center rounded-full">
              <Ionicons name="chevron-back" size={20} color="#666" />
            </TouchableOpacity>
          )}

          {isExpanded && (
            <Text className="text-base font-medium">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
          )}

          {isExpanded && (
            <TouchableOpacity
              onPress={handleNextMonth}
              className="h-8 w-8 items-center justify-center rounded-full">
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <View>
          {!isExpanded ? (
            <View className="w-full flex-row justify-between">
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
            </View>
          ) : (
            <>
              <View className="my-2 w-full flex-row">
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

        <TouchableOpacity
          onPress={toggleExpanded}
          className="absolute bottom-0 left-1/2 h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full">
          <Animated.View style={rotateStyle}>
            <Ionicons name="chevron-down" size={24} color={colors.grey2} />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};
