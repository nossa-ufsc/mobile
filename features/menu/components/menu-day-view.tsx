import { useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';
import { Menu, MenuDish } from '@/types';
import { useMenuStore } from '../hooks/use-menu-store';
import { dayHasMealSplit, filterDishesByMeal, groupDishesByCategory } from '../utils/menu';
import { MenuDayHeader } from './menu-day-header';
import { MenuSectionCard } from './menu-section-card';
import { MenuSourceFooter } from './menu-source-footer';

interface MenuDayViewProps {
  menu: Menu;
  dishes: MenuDish[];
}

export const MenuDayView = ({ menu, dishes }: MenuDayViewProps) => {
  const { t } = useTranslation();
  const selectedMeal = useMenuStore((s) => s.selectedMeal);
  const setSelectedMeal = useMenuStore((s) => s.setSelectedMeal);

  const hasMealSplit = dayHasMealSplit(dishes);
  const visible = useMemo(
    () => filterDishesByMeal(dishes, hasMealSplit ? selectedMeal : null),
    [dishes, hasMealSplit, selectedMeal]
  );
  const sections = useMemo(() => groupDishesByCategory(visible), [visible]);

  return (
    <View className="gap-3">
      {hasMealSplit ? (
        <MenuDayHeader mealToggle={{ value: selectedMeal, onChange: setSelectedMeal }} />
      ) : (
        <MenuDayHeader meals={menu.refeicoes} />
      )}

      {sections.length === 0 ? (
        <View className="items-center rounded-2xl bg-card p-6">
          <Text color="tertiary">{t('menu.noMenuForMeal')}</Text>
        </View>
      ) : (
        sections.map((section) => (
          <MenuSectionCard
            key={section.category}
            section={section}
            showMealBadges={!hasMealSplit}
          />
        ))
      )}

      <MenuSourceFooter sourceUrl={menu.fonteUrl} updatedAt={menu.atualizadoEm} />
    </View>
  );
};
