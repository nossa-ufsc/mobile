import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { Event, EventCategory } from '@/types';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** Ordem de exibição dos chips de filtro. */
export const EVENT_CATEGORY_ORDER: EventCategory[] = [
  'festa',
  'palestra',
  'curso',
  'cultura',
  'academico',
  'esporte',
  'saude',
  'outro',
];

export const EVENT_CATEGORY_META: Record<
  EventCategory,
  { icon: IoniconName; tintClassName: string; color: string }
> = {
  festa: { icon: 'sparkles-outline', tintClassName: 'bg-pink-500/15', color: '#ec4899' },
  palestra: { icon: 'mic-outline', tintClassName: 'bg-sky-500/15', color: '#0ea5e9' },
  curso: { icon: 'easel-outline', tintClassName: 'bg-amber-500/15', color: '#f59e0b' },
  cultura: { icon: 'color-palette-outline', tintClassName: 'bg-purple-500/15', color: '#a855f7' },
  academico: { icon: 'library-outline', tintClassName: 'bg-indigo-500/15', color: '#6366f1' },
  esporte: { icon: 'football-outline', tintClassName: 'bg-green-500/15', color: '#22c55e' },
  saude: { icon: 'heart-outline', tintClassName: 'bg-emerald-500/15', color: '#10b981' },
  outro: { icon: 'pricetag-outline', tintClassName: 'bg-gray-500/15', color: '#6b7280' },
};

const KNOWN_CATEGORIES = new Set<string>(EVENT_CATEGORY_ORDER);

/**
 * Linhas antigas (aluno/Cheers) não têm categoria: são festas. A coluna no banco é texto
 * livre, então valor desconhecido vira "outro" em vez de vazar como chave de i18n.
 */
export const getEventCategory = (event: Pick<Event, 'category' | 'source'>): EventCategory => {
  if (event.category && KNOWN_CATEGORIES.has(event.category)) return event.category;
  return event.source === 'ufsc' ? 'outro' : 'festa';
};

export const isOfficialEvent = (event: Event) => event.source === 'ufsc';
