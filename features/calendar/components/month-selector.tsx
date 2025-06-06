import { useCallback, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Text } from '@/ui/text';
import { useColorScheme } from '@/utils/use-color-scheme';
import { cn } from '@/utils/cn';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
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
  const { isExpanded, setIsExpanded, currentDate, setCurrentDate, setSelectedDay } =
    useCalendarState();

  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const SLIDE_WIDTH = SCREEN_WIDTH;

  const expandProgress = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    expandProgress.value = withTiming(isExpanded ? 1 : 0, { duration: 250 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isExpanded, expandProgress]);

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

  const bumpWeek = useCallback(
    (direction: 'next' | 'prev') => {
      const newDate = new Date(currentDate);
      newDate.setDate(direction === 'next' ? newDate.getDate() + 7 : newDate.getDate() - 7);
      setCurrentDate(newDate);
      setSelectedDay(newDate);
      Haptics.selectionAsync();
    },
    [currentDate, setCurrentDate, setSelectedDay]
  );

  const bumpMonth = useCallback(
    (direction: 'next' | 'prev') => {
      const newDate = new Date(currentDate);
      newDate.setMonth(direction === 'next' ? newDate.getMonth() + 1 : newDate.getMonth() - 1);
      setCurrentDate(newDate);
      setSelectedDay(newDate);
      Haptics.selectionAsync();
    },
    [currentDate, setCurrentDate, setSelectedDay]
  );

  const animateSlide = useCallback(
    (direction: 'next' | 'prev', bumpFn: (dir: 'next' | 'prev') => void) => {
      const exitFactor = direction === 'next' ? -1 : +1;
      const entryStart = -exitFactor;

      translateX.value = withTiming(exitFactor * SLIDE_WIDTH, { duration: 50 }, (finished) => {
        if (finished) {
          runOnJS(bumpFn)(direction);

          translateX.value = entryStart * SLIDE_WIDTH;

          translateX.value = withTiming(0, { duration: 50 });
        }
      });
    },
    [SLIDE_WIDTH, translateX]
  );

  const handleNextWeek = useCallback(() => {
    animateSlide('next', bumpWeek);
  }, [animateSlide, bumpWeek]);

  const handlePrevWeek = useCallback(() => {
    animateSlide('prev', bumpWeek);
  }, [animateSlide, bumpWeek]);

  const handleNextMonth = useCallback(() => {
    animateSlide('next', bumpMonth);
  }, [animateSlide, bumpMonth]);

  const handlePrevMonth = useCallback(() => {
    animateSlide('prev', bumpMonth);
  }, [animateSlide, bumpMonth]);

  // Pan gesture: vertical for expand/collapse, horizontal for week/month navigation
  const gesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .activeOffsetY([-15, 15])
    .minDistance(15)
    .onUpdate((event) => {
      // Vertical swipe to expand/collapse
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
      // Horizontal swipe to navigate
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
    return { height };
  });

  const slideStyle = useAnimatedStyle(() => {
    return { transform: [{ translateX: translateX.value }] };
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
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + index);
      return {
        date: new Date(d),
        number: d.getDate(),
        name: WEEKDAY_NAMES[index],
        isToday: d.toDateString() === today.toDateString(),
        isSelected: d.toDateString() === selectedDay.toDateString(),
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

    const arr: (null | {
      date: Date;
      number: number;
      isToday: boolean;
      isSelected: boolean;
    })[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      arr.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      arr.push({
        date: new Date(d),
        number: i,
        isToday: d.toDateString() === new Date().toDateString(),
        isSelected: d.toDateString() === selectedDay.toDateString(),
      });
    }
    return arr;
  }, [currentDate, selectedDay, isExpanded]);

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
            // ─── WEEK VIEW ───────────────────────────────────────────────────
            <Animated.View
              className="w-full flex-row justify-between gap-0.5 pt-4"
              style={slideStyle} // slideStyle handles both exit/enter
            >
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
                      'h-10 w-10 items-center justify-center overflow-hidden rounded-full',
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
            // ─── MONTH VIEW (EXPANDED) ────────────────────────────────────────
            <>
              {/* Static weekday labels on top */}
              <View className="my-2 w-full flex-row gap-0.5 pt-[10px]">
                {WEEKDAY_NAMES.map((name, index) => (
                  <View key={index} className="flex-1 items-center">
                    <Text className="text-xs uppercase">{name}</Text>
                  </View>
                ))}
              </View>

              {/* Month grid itself, wrapped in Animated.View so slideStyle applies */}
              <Animated.View style={slideStyle}>
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
                                'h-10 w-10 items-center justify-center overflow-hidden rounded-full',
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
              </Animated.View>
            </>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};
