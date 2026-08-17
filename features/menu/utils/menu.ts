import { Menu, MenuCategory, MenuDish, MenuItem, MenuMeal } from '@/types';

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

  const menuDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;

  return menu.cardapio[menuDayIndex] || null;
};

export const hasImageMenu = (menu: Menu): boolean => {
  return !!(menu && 'cardapio' in menu && 'url_imagem' in menu.cardapio);
};

export const formatMenuItem = (item: string): string => {
  if (!item) return '';

  let formatted = item
    .replace(/^COMPLEMENTO ALMOÇO:\s*/i, '')
    .replace(/^COMPLEMENTO:\s*/i, '')
    .replace(/^CARNE JANTA:\s*/i, '')
    .replace(/^CARNE ALMOÇO:\s*/i, '')
    .replace(/^CARNE:\s*/i, '');

  formatted = formatted.replace(/\//g, ',');

  formatted = formatted
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');

  return formatted;
};

export const MENU_CATEGORY_ORDER: MenuCategory[] = [
  'carne',
  'vegetariano',
  'guarnicao',
  'base',
  'salada',
  'molho',
  'sobremesa',
  'outro',
];

const ACRONYMS = new Set(['pts', 'ptn', 'ru']);

export const formatDishName = (name: string): string => {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  const withAcronyms = lower
    .split(' ')
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w))
    .join(' ');
  return withAcronyms.charAt(0).toUpperCase() + withAcronyms.slice(1);
};

export const dayHasMealSplit = (dishes: MenuDish[]): boolean =>
  dishes.some((d) => d.refeicao !== undefined);

export const defaultMeal = (now: Date = new Date()): MenuMeal =>
  now.getHours() < 14 || (now.getHours() === 14 && now.getMinutes() < 30) ? 'almoco' : 'jantar';

export const filterDishesByMeal = (dishes: MenuDish[], meal: MenuMeal | null): MenuDish[] =>
  meal ? dishes.filter((d) => !d.refeicao || d.refeicao === meal) : dishes;

export interface MenuSection {
  category: MenuCategory;
  dishes: MenuDish[];
}

export const groupDishesByCategory = (dishes: MenuDish[]): MenuSection[] =>
  MENU_CATEGORY_ORDER.map((category) => ({
    category,
    dishes: dishes.filter((d) => d.categoria === category),
  })).filter((s) => s.dishes.length > 0);
