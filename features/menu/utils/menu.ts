import { Menu, MenuItem } from '@/types';

const parseBrazilianDate = (date: string | null): Date | null => {
  if (!date) return null;

  const [day, month, year] = date.split('/').map(Number);
  return new Date(year ?? new Date().getFullYear(), month - 1, day);
};

export const isMenuOutdated = (menu: Menu): boolean => {
  if (!menu || !('cardapio' in menu) || !Array.isArray(menu.cardapio)) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = parseBrazilianDate(menu.diaFinal);
  if (!endDate) return false;

  return today > endDate;
};

export const getMenuForDay = (menu: Menu, dayIndex: number): MenuItem | null => {
  if (!menu || !('cardapio' in menu) || !Array.isArray(menu.cardapio)) {
    return null;
  }

  if (isMenuOutdated(menu)) {
    return null;
  }

  return menu.cardapio[dayIndex] || null;
};

export const hasImageMenu = (menu: Menu): boolean => {
  return !!(menu && 'cardapio' in menu && 'url_imagem' in menu.cardapio);
};
