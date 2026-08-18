import { getDateLocale } from '@/utils/i18n/get-date-locale';

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString(getDateLocale(), {
    day: '2-digit',
    month: '2-digit',
  });
  const formattedTime = date.toLocaleTimeString(getDateLocale(), {
    hour: '2-digit',
    minute: '2-digit',
  });
  return { formattedDate, formattedTime };
};

/**
 * Eventos de dia inteiro são gravados como 00:00 → 23:59:59 de Brasília (contrato do
 * pipeline). Datas/dias deles são sempre calculados nesse fuso — no fuso do aparelho,
 * um evento de um dia viraria "24/08 – 25/08" fora do UTC-3.
 */
const EVENT_TZ = 'America/Sao_Paulo';
const tzOf = (allDay?: boolean) => (allDay ? EVENT_TZ : undefined);

/** "sáb, 12 set" — sem os pontos/"de" que o toLocaleDateString põe em pt-BR. */
const formatShortDate = (date: Date, timeZone?: string) =>
  date
    .toLocaleDateString(getDateLocale(), {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      timeZone,
    })
    .replace(/\./g, '')
    .replace(/ de /g, ' ');

/** "2026-08-24" no fuso pedido (ou no do aparelho). */
const dayKey = (d: Date, timeZone?: string) =>
  d.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone });

export const isSameLocalDay = (a: Date, b: Date, timeZone?: string) =>
  dayKey(a, timeZone) === dayKey(b, timeZone);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Pra tela de detalhes: tile + linhas.
 * - Com hora:      { day: "15", month: "MAR", weekdayDate: "Domingo, 15 de março", time: "10:00 – 19:00" }
 *                  ou, em vários dias, time: "10:00 → qui, 19 mar · 19:00"
 * - Dia inteiro:   time: null (a tela mostra "Dia inteiro"); em vários dias
 *                  weekdayDate vira "seg, 24 ago → sex, 28 ago".
 * `end_date` de dia inteiro é o fim INCLUSIVO do último dia (contrato do pipeline).
 */
export const formatEventDetailsDate = (
  startString: string,
  endString: string,
  { allDay = false }: { allDay?: boolean } = {}
) => {
  const start = new Date(startString);
  const end = new Date(endString);
  const locale = getDateLocale();
  const timeZone = tzOf(allDay);
  const sameDay = isSameLocalDay(start, end, timeZone);
  const longDate = capitalize(
    start.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone })
  );
  const tile = {
    day: start.toLocaleDateString(locale, { day: '2-digit', timeZone }),
    month: start
      .toLocaleDateString(locale, { month: 'short', timeZone })
      .replace('.', '')
      .toUpperCase(),
  };

  if (allDay) {
    return {
      ...tile,
      weekdayDate: sameDay
        ? longDate
        : `${formatShortDate(start, timeZone)} → ${formatShortDate(end, timeZone)}`,
      time: null,
    };
  }

  const startTime = formatDateTime(startString).formattedTime;
  const endTime = formatDateTime(endString).formattedTime;
  return {
    ...tile,
    weekdayDate: longDate,
    time: sameDay
      ? `${startTime} – ${endTime}`
      : `${startTime} → ${formatShortDate(end)} · ${endTime}`,
  };
};

const isTomorrowOf = (date: Date, now: Date, timeZone?: string) => {
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return isSameLocalDay(date, tomorrow, timeZone);
};

export type EventCardWhen =
  /** Já começou e não acabou. `until` é hora ("21:00") se acaba hoje, senão "Dom, 06 set". */
  | { kind: 'ongoing'; until: string }
  /**
   * Ainda vai começar. `relative` troca a data por "Hoje"/"Amanhã" (a tela traduz);
   * `time` null = dia inteiro; `endDate` só em dia inteiro de vários dias ("Sex, 28 ago").
   */
  | {
      kind: 'upcoming';
      relative: 'today' | 'tomorrow' | null;
      date: string;
      time: string | null;
      endDate: string | null;
    };

/**
 * Pro card da lista: uma linha "quando" pra ser lida de relance, montada pela tela.
 * Ex.: "Hoje · 20:00", "Qui, 20 ago · Dia inteiro", "Seg, 24 ago · até Sex, 28 ago",
 * "Em andamento · até Dom, 06 set".
 */
export const formatEventCardWhen = (
  event: { start_date: string; end_date: string; is_all_day?: boolean },
  now: number
): EventCardWhen => {
  const start = new Date(event.start_date);
  const end = new Date(event.end_date);
  const today = new Date(now);
  const timeZone = tzOf(event.is_all_day);
  const shortStart = capitalize(formatShortDate(start, timeZone));
  const shortEnd = capitalize(formatShortDate(end, timeZone));

  if (start.getTime() <= now && end.getTime() >= now) {
    const endsToday = isSameLocalDay(end, today, timeZone);
    return {
      kind: 'ongoing',
      until:
        endsToday && !event.is_all_day ? formatDateTime(event.end_date).formattedTime : shortEnd,
    };
  }

  const relative = isSameLocalDay(start, today, timeZone)
    ? 'today'
    : isTomorrowOf(start, today, timeZone)
      ? 'tomorrow'
      : null;
  if (!event.is_all_day) {
    return {
      kind: 'upcoming',
      relative,
      date: shortStart,
      time: formatDateTime(event.start_date).formattedTime,
      endDate: null,
    };
  }
  return {
    kind: 'upcoming',
    relative,
    date: shortStart,
    time: null,
    endDate: isSameLocalDay(start, end, timeZone) ? null : shortEnd,
  };
};

/** Aceita "cheers.com.br/evento/x" e normaliza pra https; rejeita o resto. */
export const normalizeUrl = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (!/^https?:$/.test(url.protocol) || !url.hostname.includes('.')) return null;
    return url.toString();
  } catch {
    return null;
  }
};
