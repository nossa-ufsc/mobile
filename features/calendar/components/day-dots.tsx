import { useMemo } from 'react';
import { View } from 'react-native';
import { hasOccurrenceOnDay } from '../utils/expand-saved-event';
import { useCalendarColors } from '../hooks/use-calendar-colors';
import { useCalendarItemsList, useSavedEventsList } from '../hooks/use-calendar';

const MAX_DAY_DOTS = 3;
const SELECTED_DOT_COLOR = 'rgba(255, 255, 255, 0.92)';
const EMPTY: string[] = [];

export const DayDots = ({ colors, isSelected }: { colors: string[]; isSelected: boolean }) => {
  if (!colors.length) return null;
  return (
    <View className="absolute bottom-1 flex-row gap-0.5" pointerEvents="none">
      {colors.map((color, index) => (
        <View
          key={`${color}-${index}`}
          className="h-1 w-1 rounded-full"
          style={{ backgroundColor: isSelected ? SELECTED_DOT_COLOR : color }}
        />
      ))}
    </View>
  );
};

interface DayDotOptions {
  hasClass?: (date: Date) => boolean;
}

export const useDayDotColors = (dates: Date[], { hasClass }: DayDotOptions = {}) => {
  const savedEvents = useSavedEventsList();
  const calendarItems = useCalendarItemsList();
  const palette = useCalendarColors();

  const itemsByDay = useMemo(() => {
    const map = new Map<string, typeof calendarItems>();
    [...calendarItems]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((item) => {
        const key = new Date(item.date).toDateString();
        const list = map.get(key);
        if (list) list.push(item);
        else map.set(key, [item]);
      });
    return map;
  }, [calendarItems]);

  const dotColorsByDay = useMemo(() => {
    const now = Date.now();
    const map = new Map<string, string[]>();
    dates.forEach((date) => {
      const key = date.toDateString();
      if (map.has(key)) return;
      const accents: string[] = [];
      const push = (accent: string) => {
        if (accents.length < MAX_DAY_DOTS && !accents.includes(accent)) accents.push(accent);
      };
      if (hasClass?.(date)) push(palette.cls().accent);
      savedEvents.forEach((saved) => {
        if (hasOccurrenceOnDay(saved, date, now)) push(palette.savedEvent(saved).accent);
      });
      itemsByDay.get(key)?.forEach((item) => push(palette.item(item).accent));
      if (accents.length) map.set(key, accents);
    });
    return map;
  }, [dates, hasClass, savedEvents, itemsByDay, palette]);

  return (date: Date) => dotColorsByDay.get(date.toDateString()) ?? EMPTY;
};
