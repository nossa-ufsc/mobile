import { useState, type ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';
import { cn } from '@/utils/cn';
import { useColorScheme } from 'nativewind';
import { COLORS } from '@/theme/colors';
import { MenuDish } from '@/types';
import { formatDishName } from '../utils/menu';
import { MenuBadge, MenuBadgeTone } from './menu-badge';

interface MenuDishRowProps {
  dish: MenuDish;
  showMealBadge?: boolean;
  isLast?: boolean;
}

interface BadgeSpec {
  key: string;
  label: string;
  tone: MenuBadgeTone;
  icon?: ComponentProps<typeof MenuBadge>['icon'];
}

export const MenuDishRow = ({ dish, showMealBadge = true, isLast = false }: MenuDishRowProps) => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const grey = COLORS[colorScheme === 'dark' ? 'dark' : 'light'].grey;
  const [expanded, setExpanded] = useState(false);
  const hasIngredients = !!dish.ingredientes;

  const badges: BadgeSpec[] = [];
  if (showMealBadge && dish.refeicao) {
    badges.push({
      key: 'meal',
      label: t(`menu.meals.${dish.refeicao}`),
      tone: 'info',
    });
  }
  const a = dish.alergenos;
  if (a?.gluten === true)
    badges.push({
      key: 'gluten',
      label: t('menu.allergens.gluten'),
      tone: 'warning',
      icon: 'barley',
    });
  if (a?.gluten === false)
    badges.push({
      key: 'gluten',
      label: t('menu.allergens.glutenFree'),
      tone: 'positive',
      icon: 'barley-off',
    });
  if (a?.lacteos === true)
    badges.push({
      key: 'lacteos',
      label: t('menu.allergens.dairy'),
      tone: 'warning',
      icon: 'cheese',
    });
  if (a?.lacteos === false)
    badges.push({
      key: 'lacteos',
      label: t('menu.allergens.dairyFree'),
      tone: 'positive',
      icon: 'cheese-off',
    });
  if (a?.origemAnimal === true)
    badges.push({
      key: 'animal',
      label: t('menu.allergens.animalOrigin'),
      tone: 'neutral',
      icon: 'cow',
    });
  if (a?.origemAnimal === false)
    badges.push({
      key: 'animal',
      label: t('menu.allergens.noAnimalOrigin'),
      tone: 'positive',
      icon: 'sprout',
    });

  const toggle = () => {
    if (!hasIngredients) return;
    Haptics.selectionAsync();
    setExpanded((v) => !v);
  };

  return (
    <Animated.View layout={LinearTransition.duration(220)}>
      <Pressable
        onPress={toggle}
        disabled={!hasIngredients}
        accessibilityRole={hasIngredients ? 'button' : undefined}
        accessibilityState={hasIngredients ? { expanded } : undefined}
        accessibilityHint={hasIngredients ? t('menu.ingredientsHint') : undefined}
        className={cn('py-2.5 active:opacity-70', !isLast && 'border-border/60 border-b')}>
        <View className="flex-row items-start gap-2">
          <View className="flex-1 gap-1.5">
            <Text variant="body" className="leading-[22px]">
              {formatDishName(dish.nome)}
            </Text>
            {badges.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5">
                {badges.map((b) => (
                  <MenuBadge key={b.key} label={b.label} tone={b.tone} icon={b.icon} />
                ))}
              </View>
            )}
          </View>
          {hasIngredients && (
            <View className="mt-1 h-6 w-6 items-center justify-center rounded-full bg-gray-500/10">
              <Ionicons name={expanded ? 'chevron-up' : 'information'} size={14} color={grey} />
            </View>
          )}
        </View>
        {expanded && hasIngredients && (
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(120)}
            className="mt-2 rounded-xl bg-gray-500/10 px-3 py-2">
            <Text variant="caption1" color="tertiary" className="mb-0.5 font-semibold">
              {t('menu.ingredients')}
            </Text>
            <Text variant="footnote" className="text-foreground/80 leading-[18px]">
              {formatDishName(dish.ingredientes!)}
            </Text>
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};
