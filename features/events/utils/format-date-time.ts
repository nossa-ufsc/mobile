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

/** "sáb, 12 set" — sem os pontos/"de" que o toLocaleDateString põe em pt-BR. */
const formatShortDate = (date: Date) =>
  date
    .toLocaleDateString(getDateLocale(), { weekday: 'short', day: '2-digit', month: 'short' })
    .replace(/\./g, '')
    .replace(/ de /g, ' ');

/** Pra tela de detalhes: tile + linhas. Ex.: { day: "15", month: "MAR", weekdayDate: "Domingo, 15 de março", time: "10:00 → qui, 19 mar · 19:00" } */
export const formatEventDetailsDate = (startString: string, endString: string) => {
  const start = new Date(startString);
  const end = new Date(endString);
  const locale = getDateLocale();
  const startTime = formatDateTime(startString).formattedTime;
  const endTime = formatDateTime(endString).formattedTime;
  const sameDay = start.toDateString() === end.toDateString();
  const weekdayDate = start.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return {
    day: start.toLocaleDateString(locale, { day: '2-digit' }),
    month: start.toLocaleDateString(locale, { month: 'short' }).replace('.', '').toUpperCase(),
    weekdayDate: weekdayDate.charAt(0).toUpperCase() + weekdayDate.slice(1),
    time: sameDay
      ? `${startTime} – ${endTime}`
      : `${startTime} → ${formatShortDate(end)} · ${endTime}`,
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
