import { useMemo } from 'react';
import type { CalendarColor, CalendarColorKind, CalendarItem, SavedEvent } from '@/types';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import {
  resolveClassColor,
  resolveItemColor,
  resolveKindColor,
  resolveSavedEventColor,
  type CalendarColorContext,
} from '../utils/calendar-colors';

export const useCalendarColorPrefs = () => useEnvironmentStore((state) => state.calendarTypeColors);

export const useCalendarColors = () => {
  const prefs = useCalendarColorPrefs();
  const { colors, isDarkColorScheme } = useColorScheme();
  const primary = colors.primary;

  return useMemo(() => {
    const ctx: CalendarColorContext = { primary, isDark: isDarkColorScheme, prefs };
    return {
      ctx,
      item: (item: Pick<CalendarItem, 'type' | 'color'>) => resolveItemColor(item, ctx),
      cls: () => resolveClassColor(ctx),
      savedEvent: (saved: Pick<SavedEvent, 'snapshot' | 'color'>) =>
        resolveSavedEventColor(saved, ctx),
      kind: (kind: CalendarColorKind, override?: CalendarColor) =>
        resolveKindColor(kind, override, ctx),
    };
  }, [prefs, primary, isDarkColorScheme]);
};

export type CalendarPalette = ReturnType<typeof useCalendarColors>;
