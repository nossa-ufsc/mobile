import { View, Image, ActivityIndicator } from 'react-native';
import { Text } from '@/ui/text';
import { Menu } from '@/types';
import { getMenuForDay, hasImageMenu, isMenuOutdated } from '../utils/menu';
import { Container } from '@/ui/container';
import { useMenuStore } from '../hooks/use-menu-store';
import { MenuItemCard } from './menu-item-card';

interface MenuDisplayProps {
  menu: Menu | undefined;
  isLoading: boolean;
  error: Error | null;
}

const EmptyState = ({ message }: { message: string }) => (
  <View className="flex-1 items-center justify-center p-4">
    <View className="items-center space-y-2 rounded-2xl bg-gray-50 p-6 dark:bg-gray-900">
      <Text className="text-xl font-medium text-gray-900 dark:text-gray-100">Nenhum cardápio</Text>
      <Text className="text-center text-gray-500 dark:text-gray-400">{message}</Text>
    </View>
  </View>
);

export const MenuDisplay = ({ menu, isLoading, error }: MenuDisplayProps) => {
  const selectedDay = useMenuStore((state) => state.selectedDay);

  if (isLoading) {
    return <ActivityIndicator className="mt-8" size="large" />;
  }

  if (error || !menu) {
    return <EmptyState message="Não foi possível carregar o cardápio" />;
  }

  if (hasImageMenu(menu)) {
    return (
      <View className="flex-1">
        <Image
          source={{ uri: (menu.cardapio as { url_imagem: string }).url_imagem }}
          className="flex-1"
          resizeMode="contain"
        />
      </View>
    );
  }

  const dayMenu = getMenuForDay(menu, selectedDay);

  if (!dayMenu) {
    return <EmptyState message="Nenhum cardápio disponível para este dia" />;
  }

  return (
    <Container scrollable>
      {isMenuOutdated(menu) && (
        <View className="mb-2 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-950">
          <Text className="text-yellow-800 dark:text-yellow-200">
            Este cardápio pode estar desatualizado
          </Text>
        </View>
      )}

      <View className="gap-2">
        {dayMenu.itens.map((item, index) => (
          <MenuItemCard key={index} item={item} />
        ))}
      </View>
    </Container>
  );
};
