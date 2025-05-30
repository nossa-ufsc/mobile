import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Text } from '@/ui/text';
import { cn } from '@/utils/cn';
import { useMemo, useRef, useEffect, useState } from 'react';
import { CalendarClassItem, CalendarItem } from '@/types';
import { useSubjectAbsence } from '@/features/home/hooks/use-subject-absence';
import { useFocusEffect } from '@react-navigation/native';

interface CalendarDayViewProps {
  className?: string;
  items?: CalendarItem[];
  classItems?: CalendarClassItem[];
  onPressItem: (item: CalendarItem) => void;
  onPressClass: (item: CalendarClassItem) => void;
}

export const getItemColor = (type: CalendarItem['type']) => {
  switch (type) {
    case 'exam':
      return 'bg-red-100 dark:bg-red-900';
    case 'assignment':
      return 'bg-pink-100 dark:bg-pink-900';
    case 'task':
      return 'bg-green-100 dark:bg-green-900';
    default:
      return 'bg-gray-100 dark:bg-gray-900';
  }
};

export const getNestedItemColor = (type: CalendarItem['type'] | 'class') => {
  switch (type) {
    case 'exam':
      return 'bg-red-200 dark:bg-red-800';
    case 'assignment':
      return 'bg-pink-200 dark:bg-pink-800';
    case 'task':
      return 'bg-green-200 dark:bg-green-800';
    case 'class':
      return 'bg-primary/20 dark:bg-primary/30';
    default:
      return 'bg-gray-200 dark:bg-gray-700';
  }
};

const HOUR_HEIGHT = 72;
const TIME_LABEL_WIDTH = 64;
const SIDE_PADDING = 8;
const CLASS_DURATION = 50;

const OTHER_ITEM_FIXED_HEIGHT = 40;
const NESTED_ITEM_FIXED_HEIGHT = 30;
const VERTICAL_GAP = 4;
const NESTED_ITEM_VERTICAL_GAP = 2;

interface PositionedItem extends CalendarItem {
  endTime: Date;
  consecutiveClasses?: number;
}

interface PositionedClassItem extends CalendarClassItem {
  endTime: Date;
  type: 'class';
}

interface LayoutedClass extends PositionedClassItem {
  top: number;
  height: number;
  nestedItems: PositionedItem[];
}

interface LayoutedOther extends PositionedItem {
  top: number;
  height: number;
}

const ClassItem = ({
  item,
  onPressClass,
  onPressItem,
}: {
  item: LayoutedClass;
  onPressClass: (item: CalendarClassItem) => void;
  onPressItem: (item: CalendarItem) => void;
}) => {
  const { absences } = useSubjectAbsence(item.subject.id);
  const existingAbsence = absences.find((entry) => entry.date === item.date.toDateString());

  return (
    <TouchableOpacity
      hitSlop={4}
      className={cn(
        'absolute left-0 right-0 overflow-hidden rounded-lg px-3 py-1',
        'border border-gray-300 dark:border-gray-700',
        'bg-primary/10 dark:bg-primary/20'
      )}
      onPressOut={() => onPressClass(item)}
      style={{ top: item.top, height: item.height, minHeight: 48 }}>
      <View className="flex-row items-center justify-between">
        <Text variant="subhead" className="mr-2 flex-shrink font-semibold">
          {item.title}
        </Text>
        <Text variant="caption2" className="flex-1" numberOfLines={1}>
          {item.subject.code}
        </Text>
      </View>

      {existingAbsence && (
        <View className="bg-destructive/10 mt-2 rounded-lg px-2 py-1">
          <Text className="text-sm text-destructive">
            Falta registrada ({existingAbsence.count} aula{existingAbsence.count > 1 ? 's' : ''})
          </Text>
        </View>
      )}

      <View className="mt-1">
        {item.nestedItems.map((nestedItem, index) => {
          const nestedTop = index * (NESTED_ITEM_FIXED_HEIGHT + NESTED_ITEM_VERTICAL_GAP);
          return (
            <TouchableOpacity
              key={nestedItem.id}
              onPress={() => onPressItem(nestedItem)}
              hitSlop={4}
              style={{
                top: nestedTop,
                height: NESTED_ITEM_FIXED_HEIGHT,
                position: 'absolute',
                left: 0,
                right: 0,
                minHeight: 32,
              }}
              className={cn(
                'flex-row items-center justify-between rounded px-2 py-0.5',
                getNestedItemColor(nestedItem.type)
              )}>
              <Text variant="caption1" className="flex-1 font-medium" numberOfLines={1}>
                {nestedItem.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

export const CalendarDayView = ({
  className,
  items = [],
  classItems = [],
  onPressItem,
  onPressClass,
}: CalendarDayViewProps) => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  useFocusEffect(() => {
    setCurrentHour(new Date().getHours());
  });

  const layout = useMemo(() => {
    const groupedClasses: { [key: string]: PositionedClassItem[] } = {};

    const sortedClasses = classItems.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    sortedClasses.forEach((item) => {
      const subjectId = item.subject.id;
      if (!groupedClasses[subjectId]) {
        groupedClasses[subjectId] = [];
      }
      const classItem: PositionedClassItem = {
        ...item,
        date: new Date(item.date),
        endTime: new Date(new Date(item.date).getTime() + CLASS_DURATION * 60 * 1000),
        type: 'class',
      };
      groupedClasses[subjectId].push(classItem);
    });

    const mergedClasses: PositionedClassItem[] = [];
    Object.values(groupedClasses).forEach((subjectClasses) => {
      let currentGroup: PositionedClassItem | null = null;

      subjectClasses.forEach((classItem) => {
        if (!currentGroup) {
          currentGroup = classItem;
          currentGroup.endTime = new Date(
            currentGroup.date.getTime() +
              (currentGroup.consecutiveClasses + 1) * CLASS_DURATION * 60 * 1000
          );
          mergedClasses.push(currentGroup);
          return;
        }

        const prevBlockEndTime = new Date(
          currentGroup.date.getTime() + currentGroup.consecutiveClasses * CLASS_DURATION * 60 * 1000
        );
        if (classItem.date.getTime() <= prevBlockEndTime.getTime() + 10 * 60 * 1000) {
          currentGroup.consecutiveClasses = currentGroup.consecutiveClasses + 1;
          const potentialEndTime = new Date(classItem.date.getTime() + CLASS_DURATION * 60 * 1000);
          currentGroup.endTime = new Date(
            Math.max(currentGroup.endTime.getTime(), potentialEndTime.getTime())
          );
        } else {
          currentGroup = classItem;
          currentGroup.endTime = new Date(currentGroup.date.getTime() + CLASS_DURATION * 60 * 1000);
          mergedClasses.push(currentGroup);
        }
      });
    });

    mergedClasses.sort((a, b) => a.date.getTime() - b.date.getTime());

    const layoutedClasses: LayoutedClass[] = [];
    const otherItems = items
      .map((item) => ({
        ...item,
        date: new Date(item.date),
        endTime: new Date(new Date(item.date).getTime() + 60 * 60 * 1000),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const processedOtherIds = new Set<string>();

    mergedClasses.forEach((classItem) => {
      const start = classItem.date;
      const top = start.getHours() * HOUR_HEIGHT + (start.getMinutes() / 60) * HOUR_HEIGHT;
      const durH = (classItem.endTime.getTime() - start.getTime()) / (1000 * 60 * 60);
      const height = Math.max(durH * HOUR_HEIGHT, NESTED_ITEM_FIXED_HEIGHT + VERTICAL_GAP);

      const nestedItems: PositionedItem[] = [];
      otherItems.forEach((otherItem) => {
        if (processedOtherIds.has(otherItem.id)) return;

        if (otherItem.date >= classItem.date && otherItem.date < classItem.endTime) {
          nestedItems.push(otherItem);
          processedOtherIds.add(otherItem.id);
        }
      });

      nestedItems.sort((a, b) => a.date.getTime() - b.date.getTime());

      layoutedClasses.push({ ...classItem, top, height, nestedItems });
    });

    const layoutedOthers: LayoutedOther[] = [];
    const occupiedUntil: { bottom: number }[] = [];

    otherItems.forEach((item) => {
      if (processedOtherIds.has(item.id)) return;

      const start = item.date;
      const currentTop = start.getHours() * HOUR_HEIGHT + (start.getMinutes() / 60) * HOUR_HEIGHT;
      const currentHeight = OTHER_ITEM_FIXED_HEIGHT;
      let currentBottom = currentTop + currentHeight;

      let adjustedTop = currentTop;

      occupiedUntil.forEach((slot) => {
        if (adjustedTop < slot.bottom) {
          adjustedTop = slot.bottom + VERTICAL_GAP;
        }
      });

      let collision = true;
      while (collision) {
        collision = false;
        currentBottom = adjustedTop + currentHeight;
        for (const placed of layoutedOthers) {
          if (adjustedTop < placed.top + placed.height && currentBottom > placed.top) {
            adjustedTop = placed.top + placed.height + VERTICAL_GAP;
            collision = true;
            break;
          }
        }
        for (const classBlock of layoutedClasses) {
          if (adjustedTop < classBlock.top + classBlock.height && currentBottom > classBlock.top) {
            adjustedTop = classBlock.top + classBlock.height + VERTICAL_GAP;
            collision = true;
            break;
          }
        }
      }

      layoutedOthers.push({
        ...item,
        top: adjustedTop,
        height: currentHeight,
      });
    });

    return { layoutedClasses, layoutedOthers };
  }, [items, classItems]);

  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({ hour: i, isNow: i === currentHour }));
  }, [currentHour]);

  useEffect(() => {
    const targetScroll = Math.max(0, currentHour * HOUR_HEIGHT - HOUR_HEIGHT);
    setTimeout(() => scrollRef.current?.scrollTo({ y: targetScroll, animated: true }), 100);
  }, [currentHour]);

  return (
    <ScrollView
      ref={scrollRef}
      className={cn('flex-1', className)}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="relative pb-24">
      {hours.map(({ hour, isNow }) => (
        <View
          key={`hour-${hour}`}
          className={cn(
            'h-[72px] flex-row border-b border-gray-200 dark:border-gray-800',
            isNow && 'bg-primary/5 dark:bg-primary/10'
          )}>
          <View className="w-16 items-end justify-start py-3 pr-2">
            <Text
              className={cn(
                'text-xs',
                isNow ? 'font-medium text-primary' : 'text-gray-500 dark:text-gray-400'
              )}>
              {hour.toString().padStart(2, '0')}:00
            </Text>
          </View>
          <View className="flex-1 border-l border-gray-200 dark:border-gray-800" />
        </View>
      ))}

      <View
        style={{
          position: 'absolute',
          top: 0,
          left: TIME_LABEL_WIDTH,
          right: SIDE_PADDING,
          bottom: 0,
        }}>
        {layout.layoutedClasses.map((classItem) => (
          <ClassItem
            key={classItem.id}
            item={classItem}
            onPressClass={onPressClass}
            onPressItem={onPressItem}
          />
        ))}

        {layout.layoutedOthers.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onPressItem(item)}
            className={cn(
              'absolute left-0 right-0 rounded-lg px-3 py-1',
              'border border-gray-300 dark:border-gray-700',
              getNestedItemColor(item.type)
            )}
            style={{ top: item.top }}>
            <View className="flex-col">
              <Text variant="caption2" numberOfLines={1}>
                {item.subject.name}
              </Text>
              <Text variant="subhead" className="flex-1" numberOfLines={1}>
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};
