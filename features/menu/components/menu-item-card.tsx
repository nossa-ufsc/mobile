import { View } from 'react-native';
import { Text } from '@/ui/text';
import { formatMenuItem } from '../utils/menu';

interface MenuItemCardProps {
  item: string;
}

export const MenuItemCard = ({ item }: MenuItemCardProps) => {
  return (
    <View className={`rounded-xl p-4 ${'bg-white dark:bg-gray-800'}`}>
      <Text className="text-gray-700 dark:text-gray-200">{formatMenuItem(item)}</Text>
    </View>
  );
};
