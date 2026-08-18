import { RestaurantButton } from '@/features/menu/components/restaurant-button';
import { useMenuRestaurant } from '@/features/menu/hooks/use-menu-restaurant';
import { getSettingsHeaderItems, HeaderButton } from '@/ui/header-button';
import { getHeaderTitleItems, HeaderTitle } from '@/ui/header-title';
import { useColorScheme } from '@/utils/use-color-scheme';
import { router, Stack } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

export default function MenuLayout() {
  const { colors } = useColorScheme();
  const { t } = useTranslation();
  const { restaurants, selected, selectedKey, select } = useMenuRestaurant();
  const hasRestaurantPicker = restaurants.length > 1 && !!selected;

  return (
    <Stack screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen
        name="menu"
        options={{
          headerRight: () => (
            <View className="flex-row items-center gap-2">
              <RestaurantButton />
              <HeaderButton onPress={() => router.push('/modal')} />
            </View>
          ),
          unstable_headerRightItems: () => [
            // Menu de seleção nativo (pull-down com checkmark) — o mesmo seletor do
            // RestaurantButton, para o header nativo do iOS.
            ...(hasRestaurantPicker
              ? [
                  {
                    type: 'menu' as const,
                    label: selected.shortLabel,
                    changesSelectionAsPrimaryAction: true,
                    sharesBackground: false,
                    menu: {
                      title: t('menu.restaurant'),
                      // UIKit espelha o título do item selecionado no botão → rótulo curto.
                      items: restaurants.map((r) => ({
                        type: 'action' as const,
                        label: r.shortLabel,
                        state: (r.key === selectedKey ? 'on' : 'off') as 'on' | 'off',
                        onPress: () => {
                          select(r.key);
                          Haptics.selectionAsync();
                        },
                      })),
                    },
                  },
                ]
              : []),
            ...getSettingsHeaderItems(() => router.push('/modal')),
          ],
          headerLeft: () => <HeaderTitle title="Cardápio RU" />,
          unstable_headerLeftItems: () => getHeaderTitleItems('Cardápio RU'),
          title: '',
          headerStyle: { backgroundColor: colors.background },
        }}
      />
    </Stack>
  );
}

const SCREEN_OPTIONS = {
  animation: 'default',
  headerShadowVisible: false,
} as const;
