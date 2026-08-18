import type { SavedEvent } from '@/types';

/**
 * Eventos de dia inteiro são gravados como 00:00 → 23:59:59 de Brasília (contrato do
 * pipeline), igual a features/events/utils/format-date-time.ts. Os dias deles são
 * sempre calculados nesse fuso; fora do UTC-3 um evento de um dia viraria dois.
 */
const EVENT_TZ = 'America/Sao_Paulo';
const DAY_MS = 24 * 60 * 60 * 1000;

/** Nº de dias desde a época pro dia civil de `date` no fuso pedido (ou no do aparelho). */
const dayNumber = (date: Date, timeZone?: string) => {
  const [year, month, day] = date
    .toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone,
    })
    .split('-')
    .map(Number);
  return Math.round(Date.UTC(year, month - 1, day) / DAY_MS);
};

const startOfLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const startOfNextLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

export type EventOccurrence =
  /**
   * Faixa de dia inteiro (sem hora). `dayIndex` é 1-based ("dia 3 de 31") e `dayCount`
   * conta os dias civis de [início, fim] inclusive.
   */
  | { kind: 'allDay'; dayIndex: number; dayCount: number; ongoing: boolean }
  /**
   * Bloco com hora dentro da grade do dia. `start`/`end` já vêm cortados nos limites do
   * dia; `continuesFromPrev`/`continuesToNext` marcam que o evento atravessa a meia-noite.
   */
  | {
      kind: 'timed';
      start: Date;
      end: Date;
      continuesFromPrev: boolean;
      continuesToNext: boolean;
      ongoing: boolean;
    };

/**
 * Como o evento salvo aparece em `day`, ou `null` se não cai nesse dia.
 *
 * Regras:
 * - `is_all_day` OU duração > 24h → faixa `allDay` em todo dia de [início, fim]
 *   (dias em Brasília quando `is_all_day`; no fuso do aparelho quando é só longo).
 * - Com hora e ≤ 24h → bloco `timed` no dia do início (fim cortado na meia-noite) e,
 *   se atravessa a meia-noite, mais um bloco no dia seguinte (00:00 → fim).
 * - `ongoing` usa o intervalo real do evento, não o cortado.
 */
export const expandSavedEvent = (
  saved: SavedEvent,
  day: Date,
  now: number
): EventOccurrence | null => {
  const start = new Date(saved.snapshot.start_date);
  const end = new Date(saved.snapshot.end_date);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end.getTime() < start.getTime())
    return null;

  const ongoing = start.getTime() <= now && now <= end.getTime();
  const isAllDay = !!saved.snapshot.is_all_day;
  const longerThanADay = end.getTime() - start.getTime() > DAY_MS;

  if (isAllDay || longerThanADay) {
    const timeZone = isAllDay ? EVENT_TZ : undefined;
    const firstDay = dayNumber(start, timeZone);
    const lastDay = dayNumber(end, timeZone);
    const currentDay = dayNumber(day, timeZone);
    if (currentDay < firstDay || currentDay > lastDay) return null;
    return {
      kind: 'allDay',
      dayIndex: currentDay - firstDay + 1,
      dayCount: lastDay - firstDay + 1,
      ongoing,
    };
  }

  const dayStart = startOfLocalDay(day);
  const dayEnd = startOfNextLocalDay(day);
  if (end.getTime() <= dayStart.getTime() || start.getTime() >= dayEnd.getTime()) return null;

  const continuesFromPrev = start.getTime() < dayStart.getTime();
  const continuesToNext = end.getTime() > dayEnd.getTime();
  return {
    kind: 'timed',
    start: continuesFromPrev ? dayStart : start,
    end: continuesToNext ? dayEnd : end,
    continuesFromPrev,
    continuesToNext,
    ongoing,
  };
};

/** Atalho pros marcadores do seletor de mês. */
export const hasOccurrenceOnDay = (saved: SavedEvent, day: Date, now: number) =>
  expandSavedEvent(saved, day, now) !== null;
