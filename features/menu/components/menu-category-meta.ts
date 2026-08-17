import { MenuCategory } from '@/types';
import type { ComponentProps } from 'react';
import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type MCIName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface MenuCategoryMeta {
  icon: MCIName;
  tintClassName: string;
  color: string;
}

export const MENU_CATEGORY_META: Record<MenuCategory, MenuCategoryMeta> = {
  carne: { icon: 'food-steak', tintClassName: 'bg-red-500/15', color: '#ef4444' },
  vegetariano: {
    icon: 'leaf',
    tintClassName: 'bg-green-500/15',
    color: '#22c55e',
  },
  guarnicao: {
    icon: 'pot-steam-outline',
    tintClassName: 'bg-amber-500/15',
    color: '#f59e0b',
  },
  base: { icon: 'rice', tintClassName: 'bg-orange-500/15', color: '#f97316' },
  salada: {
    icon: 'bowl-mix-outline',
    tintClassName: 'bg-emerald-500/15',
    color: '#10b981',
  },
  molho: { icon: 'soy-sauce', tintClassName: 'bg-sky-500/15', color: '#0ea5e9' },
  sobremesa: {
    icon: 'fruit-cherries',
    tintClassName: 'bg-pink-500/15',
    color: '#ec4899',
  },
  outro: {
    icon: 'silverware-fork-knife',
    tintClassName: 'bg-gray-500/15',
    color: '#6b7280',
  },
};
