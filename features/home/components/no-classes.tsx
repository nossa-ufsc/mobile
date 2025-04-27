import { Text } from '@/ui/text';
import { View } from 'react-native';

export const NoClasses = () => {
  return (
    <View className="flex-1 items-center justify-center pt-36">
      <Text className="text-lg font-medium">Nenhuma aula hoje</Text>
      <Text className="mt-2 text-center text-muted-foreground">
        Aproveite seu tempo livre para estudar ou descansar
      </Text>
    </View>
  );
};
