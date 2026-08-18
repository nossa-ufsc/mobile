import type { Event, SavedEvent } from '@/types';

type Snapshot = SavedEvent['snapshot'];

const DAY_MS = 24 * 60 * 60 * 1000;
const REMINDER_HOURS_BEFORE = 3;
const ALL_DAY_REMINDER_HOUR = 9;
const EVENT_TZ = 'America/Sao_Paulo';

/** Campos comparados na reconciliação; normalizados pra não "mudar" por undefined vs null. */
export const toSnapshot = (event: Event): Snapshot => ({
  name: event.name,
  start_date: event.start_date,
  end_date: event.end_date,
  is_all_day: !!event.is_all_day,
  location: event.location,
  category: event.category ?? null,
  image_url: event.image_url,
  source: event.source,
  campus: event.campus,
});

const SNAPSHOT_KEYS: (keyof Snapshot)[] = [
  'name',
  'start_date',
  'end_date',
  'is_all_day',
  'location',
  'category',
  'image_url',
  'source',
  'campus',
];

/** Compara string a string (nunca Date) — o snapshot guarda as datas em ISO. */
export const snapshotChanged = (current: Snapshot, fresh: Snapshot) =>
  SNAPSHOT_KEYS.some((key) => current[key] !== fresh[key]);

export const timesChanged = (current: Snapshot, fresh: Snapshot) =>
  current.start_date !== fresh.start_date || current.end_date !== fresh.end_date;

/** "2026-08-24" no fuso de Brasília. */
const brasiliaParts = (date: Date) =>
  date
    .toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: EVENT_TZ,
    })
    .split('-')
    .map(Number);

/**
 * Lembrete padrão:
 * - evento com hora e ≤ 24h → 3h antes do início;
 * - dia inteiro ou > 24h → 09:00 (hora do aparelho) do primeiro dia.
 * Retorna `null` se o instante já passou — nada é agendado nesse caso.
 */
export const getDefaultReminderDate = (snapshot: Snapshot, now = Date.now()): Date | null => {
  const start = new Date(snapshot.start_date);
  const end = new Date(snapshot.end_date);
  if (isNaN(start.getTime())) return null;

  const isAllDay = !!snapshot.is_all_day;
  const longerThanADay = !isNaN(end.getTime()) && end.getTime() - start.getTime() > DAY_MS;

  let reminder: Date;
  if (isAllDay || longerThanADay) {
    // Dia inteiro é gravado em Brasília; o dia civil vem de lá, a hora é a do aparelho.
    const [year, month, day] = isAllDay
      ? brasiliaParts(start)
      : [start.getFullYear(), start.getMonth() + 1, start.getDate()];
    reminder = new Date(year, month - 1, day, ALL_DAY_REMINDER_HOUR, 0, 0, 0);
  } else {
    reminder = new Date(start.getTime() - REMINDER_HOURS_BEFORE * 60 * 60 * 1000);
  }

  return reminder.getTime() > now ? reminder : null;
};
