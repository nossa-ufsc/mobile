import type {
  CalendarColor,
  CalendarColorKind,
  CalendarItem,
  CalendarPaletteKey,
  CalendarTypeColorPrefs,
  SavedEvent,
} from '@/types';
import { EVENT_CATEGORY_META, getEventCategory } from '@/features/events/utils/event-category-meta';

export const CALENDAR_PALETTE: readonly { key: CalendarPaletteKey; hex: string }[] = [
  { key: 'red', hex: '#ef4444' },
  { key: 'orange', hex: '#f97316' },
  { key: 'amber', hex: '#f59e0b' },
  { key: 'yellow', hex: '#eab308' },
  { key: 'lime', hex: '#84cc16' },
  { key: 'green', hex: '#22c55e' },
  { key: 'emerald', hex: '#10b981' },
  { key: 'teal', hex: '#14b8a6' },
  { key: 'sky', hex: '#0ea5e9' },
  { key: 'blue', hex: '#3b82f6' },
  { key: 'indigo', hex: '#6366f1' },
  { key: 'purple', hex: '#a855f7' },
  { key: 'pink', hex: '#ec4899' },
  { key: 'gray', hex: '#6b7280' },
];

const PALETTE_HEX = Object.fromEntries(CALENDAR_PALETTE.map((c) => [c.key, c.hex])) as Record<
  CalendarPaletteKey,
  string
>;

export const DEFAULT_TYPE_COLORS: Record<CalendarColorKind, CalendarColor> = {
  exam: 'red',
  assignment: 'pink',
  task: 'green',
  class: 'primary',
};

export const CALENDAR_COLOR_KINDS: CalendarColorKind[] = ['exam', 'assignment', 'task', 'class'];

export const TINT_ALPHA = { light: 0.15, dark: 0.25 } as const;

export interface CalendarColorContext {
  primary: string;
  isDark: boolean;
  prefs: CalendarTypeColorPrefs;
}

export interface ResolvedCalendarColor {
  accent: string;
  tint: string;
}

const parseRgb = (color: string): [number, number, number] | null => {
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const rgb = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
};

export const withAlpha = (color: string, alpha: number): string => {
  const rgb = parseRgb(color);
  if (!rgb) return color;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
};

export const toAccent = (
  color: CalendarColor | undefined,
  ctx: Pick<CalendarColorContext, 'primary'>
): string | undefined => {
  if (!color) return undefined;
  if (color === 'primary') return ctx.primary;
  if (color.startsWith('#')) return color;
  return PALETTE_HEX[color as CalendarPaletteKey];
};

export const resolveCalendarColor = (
  color: CalendarColor,
  ctx: CalendarColorContext
): ResolvedCalendarColor => {
  const accent = toAccent(color, ctx) ?? ctx.primary;
  return { accent, tint: withAlpha(accent, ctx.isDark ? TINT_ALPHA.dark : TINT_ALPHA.light) };
};

export const getKindDefaultColor = (
  kind: CalendarColorKind,
  prefs: CalendarTypeColorPrefs
): CalendarColor => prefs[kind] ?? DEFAULT_TYPE_COLORS[kind];

export const resolveKindColor = (
  kind: CalendarColorKind,
  override: CalendarColor | undefined,
  ctx: CalendarColorContext
): ResolvedCalendarColor => {
  const candidates = [override, ctx.prefs[kind], DEFAULT_TYPE_COLORS[kind]];
  const color = candidates.find((c) => toAccent(c, ctx) !== undefined) ?? DEFAULT_TYPE_COLORS[kind];
  return resolveCalendarColor(color, ctx);
};

export const resolveItemColor = (
  item: Pick<CalendarItem, 'type' | 'color'>,
  ctx: CalendarColorContext
): ResolvedCalendarColor => resolveKindColor(item.type, item.color, ctx);

export const resolveClassColor = (ctx: CalendarColorContext): ResolvedCalendarColor =>
  resolveKindColor('class', undefined, ctx);

export const getSavedEventDefaultColor = (saved: Pick<SavedEvent, 'snapshot'>): CalendarColor =>
  EVENT_CATEGORY_META[getEventCategory(saved.snapshot)].color as CalendarColor;

export const resolveSavedEventColor = (
  saved: Pick<SavedEvent, 'snapshot' | 'color'>,
  ctx: CalendarColorContext
): ResolvedCalendarColor => {
  const color =
    saved.color && toAccent(saved.color, ctx) ? saved.color : getSavedEventDefaultColor(saved);
  return resolveCalendarColor(color, ctx);
};
