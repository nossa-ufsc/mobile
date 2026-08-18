import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '@/ui/segmented-control';
import { MenuMeal } from '@/types';

interface MenuMealToggleProps {
  value: MenuMeal;
  onChange: (meal: MenuMeal) => void;
}

const OPTIONS: MenuMeal[] = ['almoco', 'jantar'];

export const MenuMealToggle = ({ value, onChange }: MenuMealToggleProps) => {
  const { t } = useTranslation();

  return (
    <SegmentedControl
      options={OPTIONS.map((meal) => ({ value: meal, label: t(`menu.meals.${meal}`) }))}
      value={value}
      onChange={onChange}
    />
  );
};
