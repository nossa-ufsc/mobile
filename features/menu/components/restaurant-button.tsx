import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DropdownMenu from 'zeego/dropdown-menu';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useMenuRestaurant } from '../hooks/use-menu-restaurant';

export const RestaurantButton = () => {
  const { colors } = useColorScheme();
  const { t } = useTranslation();
  const { restaurants, selected, selectedKey, select } = useMenuRestaurant();

  if (restaurants.length < 2 || !selected) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Pressable
          onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('menu.restaurant')}
          accessibilityValue={{ text: selected.label }}
          className="active:opacity-50">
          <View className="flex-row items-center gap-1 px-2">
            <Text variant="title3">{selected.shortLabel}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.grey2} />
          </View>
        </Pressable>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>{t('menu.restaurant')}</DropdownMenu.Label>
        {restaurants.map((r) => (
          <DropdownMenu.CheckboxItem
            key={r.key}
            value={r.key === selectedKey}
            onValueChange={(state) => {
              if (state === 'on') select(r.key);
            }}>
            <DropdownMenu.ItemIndicator />
            <DropdownMenu.ItemTitle>{r.label}</DropdownMenu.ItemTitle>
          </DropdownMenu.CheckboxItem>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
