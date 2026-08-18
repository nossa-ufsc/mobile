import { Campus } from '@/types';

/**
 * Restaurantes universitários por campus. `key` é o valor da coluna `campus` da
 * tabela `menus` no Supabase (uma linha por restaurante) — Florianópolis tem dois
 * (Trindade, salvo como `florianopolis`, e CCA), os demais campi têm um só.
 * Nomes são substantivos próprios e não são traduzidos.
 */
export interface MenuRestaurant {
  key: string;
  campus: Campus;
  label: string;
  shortLabel: string;
}

export const MENU_RESTAURANTS: MenuRestaurant[] = [
  {
    key: 'florianopolis',
    campus: Campus.FLORIANOPOLIS,
    label: 'RU Trindade',
    shortLabel: 'Trindade',
  },
  { key: 'cca', campus: Campus.FLORIANOPOLIS, label: 'RU CCA', shortLabel: 'CCA' },
  { key: 'joinville', campus: Campus.JOINVILLE, label: 'RU Joinville', shortLabel: 'Joinville' },
  { key: 'ararangua', campus: Campus.ARARANGUA, label: 'RU Araranguá', shortLabel: 'Araranguá' },
  {
    key: 'curitibanos',
    campus: Campus.CURITIBANOS,
    label: 'RU Curitibanos',
    shortLabel: 'Curitibanos',
  },
  { key: 'blumenau', campus: Campus.BLUMENAU, label: 'RU Blumenau', shortLabel: 'Blumenau' },
];

export const getRestaurantsForCampus = (campus: Campus | null): MenuRestaurant[] =>
  MENU_RESTAURANTS.filter((r) => r.campus === campus);

/**
 * Chave do restaurante a consultar: a escolha guardada, se pertencer ao campus
 * atual; senão o primeiro RU do campus; senão o próprio campus (compatibilidade).
 */
export const resolveRestaurantKey = (
  campus: Campus | null,
  stored: string | null | undefined
): string | null => {
  const restaurants = getRestaurantsForCampus(campus);
  if (stored && restaurants.some((r) => r.key === stored)) return stored;
  return restaurants[0]?.key ?? campus;
};
