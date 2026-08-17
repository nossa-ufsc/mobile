import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MenuMeal } from '@/types';
import { MenuBadge } from './menu-badge';
import { MenuMealToggle } from './menu-meal-toggle';

interface MenuDayHeaderProps {
  meals?: MenuMeal[];
  mealToggle?: { value: MenuMeal; onChange: (meal: MenuMeal) => void };
}

export const MenuDayHeader = ({ meals, mealToggle }: MenuDayHeaderProps) => {
  const { t } = useTranslation();

  if (mealToggle) {
    return (
      <View className="mb-1 px-1">
        <MenuMealToggle value={mealToggle.value} onChange={mealToggle.onChange} />
      </View>
    );
  }

  if (!meals?.length) return null;

  return (
    <View className="mb-1 flex-row px-1">
      <MenuBadge
        tone="info"
        icon="silverware-fork-knife"
        label={meals.map((m) => t(`menu.meals.${m}`)).join(' · ')}
      />
    </View>
  );
};
