import { Container } from '@/ui/container';
import { View } from 'react-native';
import { Text } from '@/ui/text';
export const EventsEmptyState = () => {
  return (
    <Container scrollable>
      <View className="mt-48 flex-1 items-center justify-center p-4">
        <Text className="text-lg" color="primary" variant="heading">
          Nenhum evento encontrado
        </Text>
        <Text className="mt-1 text-center" color="tertiary" variant="body">
          Não existem eventos agendados para o seu campus.
        </Text>
      </View>
    </Container>
  );
};
