import type { Event, EventCategory } from '@/types';
import { EVENT_CATEGORY_ORDER, getEventCategory } from './event-category-meta';

export type EventCategoryFilter = EventCategory | 'all';

/** Já começou e ainda não terminou (exposições, semanas acadêmicas…). */
export const isOngoing = (event: Event, now: number) =>
  new Date(event.start_date).getTime() <= now && new Date(event.end_date).getTime() >= now;

/**
 * Ordena pra lista: o que está rolando aparece junto de "hoje" (chave = max(início, agora))
 * em vez de ficar preso no topo por ter começado semanas atrás; empate por início e nome.
 */
export const sortEventsForList = (events: Event[], now: number) =>
  [...events].sort((a, b) => {
    const aStart = new Date(a.start_date).getTime();
    const bStart = new Date(b.start_date).getTime();
    const diff = Math.max(aStart, now) - Math.max(bStart, now);
    if (diff !== 0) return diff;
    if (aStart !== bStart) return aStart - bStart;
    return a.name.localeCompare(b.name);
  });

export const filterByCategory = (events: Event[], selected: EventCategoryFilter) =>
  selected === 'all' ? events : events.filter((e) => getEventCategory(e) === selected);

/** Categorias presentes na lista, na ordem canônica. */
export const presentCategories = (events: Event[]): EventCategory[] => {
  const present = new Set(events.map(getEventCategory));
  return EVENT_CATEGORY_ORDER.filter((c) => present.has(c));
};
