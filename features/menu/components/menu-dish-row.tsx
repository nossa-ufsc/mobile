import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';
import { cn } from '@/utils/cn';
import { useColorScheme } from 'nativewind';
import { COLORS } from '@/theme/colors';
import { MenuCategory, MenuDish } from '@/types';
import { formatDishName } from '../utils/menu';
import { Badge } from '@/ui/badge';
import { MenuDishTraitIcons, MenuDishTraits, useDishTraits } from './menu-dish-traits';

interface MenuDishRowProps {
  dish: MenuDish;
  category: MenuCategory;
  /** Pratos principais (carne/vegetariano) ganham um pouco mais de peso. */
  prominent?: boolean;
  showMealBadge?: boolean;
  isLast?: boolean;
}

export const MenuDishRow = ({
  dish,
  category,
  prominent = false,
  showMealBadge = true,
  isLast = false,
}: MenuDishRowProps) => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const grey = COLORS[colorScheme === 'dark' ? 'dark' : 'light'].grey;
  const [expanded, setExpanded] = useState(false);
  const traits = useDishTraits(dish, category);
  const hasIngredients = !!dish.ingredientes;
  const hasDetails = hasIngredients || traits.length > 0;
  const mealLabel = showMealBadge && dish.refeicao ? t(`menu.meals.${dish.refeicao}`) : null;

  const toggle = () => {
    if (!hasDetails) return;
    Haptics.selectionAsync();
    setExpanded((v) => !v);
  };

  return (
    <Animated.View layout={LinearTransition.duration(220)}>
      <Pressable
        onPress={toggle}
        disabled={!hasDetails}
        accessibilityRole={hasDetails ? 'button' : undefined}
        accessibilityState={hasDetails ? { expanded } : undefined}
        accessibilityHint={hasDetails ? t('menu.ingredientsHint') : undefined}
        className={cn('py-3 active:opacity-70', !isLast && 'border-border/60 border-b')}>
        <View className="flex-row items-center gap-3">
          <View className="flex-1 flex-row flex-wrap items-center gap-x-2 gap-y-1">
            <Text
              className={cn(
                'font-semibold',
                prominent ? 'text-[19px] leading-6' : 'text-[17px] leading-[22px]'
              )}>
              {formatDishName(dish.nome)}
            </Text>
            {mealLabel && <Badge label={mealLabel} tone="info" />}
          </View>
          {hasDetails && (
            <View className="flex-row items-center gap-2.5">
              {!expanded && <MenuDishTraitIcons traits={traits} />}
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={grey}
                style={{ opacity: 0.8 }}
              />
            </View>
          )}
        </View>
        {expanded && hasDetails && (
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(120)}
            className="mt-2.5 gap-3 rounded-xl bg-gray-500/10 px-3 py-2.5">
            {traits.length > 0 && (
              <View className="gap-1.5">
                <Text variant="caption1" color="tertiary" className="font-semibold">
                  {t('menu.allergensTitle')}
                </Text>
                <MenuDishTraits traits={traits} />
              </View>
            )}
            {hasIngredients && (
              <View className="gap-0.5">
                <Text variant="caption1" color="tertiary" className="font-semibold">
                  {t('menu.ingredients')}
                </Text>
                <Text variant="footnote" className="text-foreground/80 leading-[18px]">
                  {formatDishName(dish.ingredientes!)}
                </Text>
              </View>
            )}
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};
