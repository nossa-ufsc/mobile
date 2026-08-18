import { View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';
import { MenuSection } from '../utils/menu';
import { MENU_CATEGORY_META } from './menu-category-meta';
import { MenuDishRow } from './menu-dish-row';

interface MenuSectionCardProps {
  section: MenuSection;
  showMealBadges?: boolean;
}

export const MenuSectionCard = ({ section, showMealBadges = true }: MenuSectionCardProps) => {
  const { t } = useTranslation();
  const meta = MENU_CATEGORY_META[section.category];

  return (
    <Animated.View
      layout={LinearTransition.duration(220)}
      className="rounded-2xl bg-card px-4 pb-1.5 pt-3 shadow-sm">
      <View className="mb-1 flex-row items-center gap-2">
        <Text className="text-[17px] leading-[22px]" accessibilityElementsHidden>
          {meta.emoji}
        </Text>
        <Text variant="heading" className="flex-1" accessibilityRole="header">
          {t(`menu.categories.${section.category}`)}
        </Text>
      </View>
      {section.dishes.map((dish, index) => (
        <MenuDishRow
          key={`${dish.nome}-${index}`}
          dish={dish}
          showMealBadge={showMealBadges}
          isLast={index === section.dishes.length - 1}
        />
      ))}
    </Animated.View>
  );
};
