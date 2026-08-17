import { View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';
import { cn } from '@/utils/cn';
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
      <View className="mb-1 flex-row items-center gap-2.5">
        <View
          className={cn('h-8 w-8 items-center justify-center rounded-full', meta.tintClassName)}>
          <MaterialCommunityIcons name={meta.icon} size={18} color={meta.color} />
        </View>
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
