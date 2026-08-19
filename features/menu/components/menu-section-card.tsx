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

/** Categorias cujo prato é "o prato do dia" — ganham um pouco mais de peso tipográfico. */
const PROMINENT_CATEGORIES = new Set(['carne', 'vegetariano']);

export const MenuSectionCard = ({ section, showMealBadges = true }: MenuSectionCardProps) => {
  const { t } = useTranslation();
  const meta = MENU_CATEGORY_META[section.category];
  const prominent = PROMINENT_CATEGORIES.has(section.category);

  return (
    <Animated.View
      layout={LinearTransition.duration(220)}
      className="rounded-2xl bg-card px-4 pb-1 pt-3 shadow-sm">
      {/* Categoria como "eyebrow": pequena e terciária. O destaque é o prato. */}
      <View className="mb-0.5 flex-row items-center gap-1.5">
        <Text className="text-[13px] leading-4" accessibilityElementsHidden>
          {meta.emoji}
        </Text>
        <Text
          variant="footnote"
          color="tertiary"
          className="font-medium"
          accessibilityRole="header">
          {t(`menu.categories.${section.category}`)}
        </Text>
      </View>
      {section.dishes.map((dish, index) => (
        <MenuDishRow
          key={`${dish.nome}-${index}`}
          dish={dish}
          category={section.category}
          prominent={prominent}
          showMealBadge={showMealBadges}
          isLast={index === section.dishes.length - 1}
        />
      ))}
    </Animated.View>
  );
};
