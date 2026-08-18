import { MenuCategory } from '@/types';

export interface MenuCategoryMeta {
  /** Emoji nativo em vez de ícone de linha em disco colorido — menos "cara de UI kit". */
  emoji: string;
}

export const MENU_CATEGORY_META: Record<MenuCategory, MenuCategoryMeta> = {
  carne: { emoji: '🥩' },
  vegetariano: { emoji: '🥦' },
  guarnicao: { emoji: '🥘' },
  base: { emoji: '🍚' },
  salada: { emoji: '🥗' },
  molho: { emoji: '🥣' },
  sobremesa: { emoji: '🍮' },
  outro: { emoji: '🍽️' },
};
