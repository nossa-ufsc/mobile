import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';
import { cn } from '@/utils/cn';
import { MenuMeal } from '@/types';

interface MenuMealToggleProps {
  value: MenuMeal;
  onChange: (meal: MenuMeal) => void;
}

const OPTIONS: MenuMeal[] = ['almoco', 'jantar'];

export const MenuMealToggle = ({ value, onChange }: MenuMealToggleProps) => {
  const { t } = useTranslation();

  return (
    <View className="flex-row rounded-full bg-gray-500/10 p-1" accessibilityRole="tablist">
      {OPTIONS.map((meal) => {
        const selected = meal === value;
        return (
          <Pressable
            key={meal}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              Haptics.selectionAsync();
              onChange(meal);
            }}
            className={cn(
              'flex-1 items-center justify-center rounded-full px-3 py-1.5',
              selected && 'bg-card dark:bg-gray-500/25'
            )}>
            <Text
              variant="subhead"
              className={cn('font-medium', selected ? 'text-foreground' : 'text-muted-foreground')}>
              {t(`menu.meals.${meal}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
