import { useCAGRLogin } from '@/features/onboarding/hooks/use-cagr-login';
import { Button } from '@/ui/button';
import { Container } from '@/ui/container';
import { Text } from '@/ui/text';
import { WeekDaySelector } from '@/ui/week-day-selector';
import { useState } from 'react';
import { View } from 'react-native';

export const Home = () => {
  const { handleLogin, isAuthenticated, isLoading, handleLogout } = useCAGRLogin();
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  return (
    <Container scrollable>
      {!isAuthenticated ? (
        <View className="mt-8 flex-1 items-center justify-center p-4">
          <Text className="mb-4 text-xl font-bold">Bem-vindo ao Nossa UFSC</Text>
          <Text className="mb-6 text-center text-base">
            Faça login com sua conta UFSC para acessar suas informações acadêmicas
          </Text>
          <Button
            onPress={handleLogin}
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}>
            <Text>{isLoading ? 'Carregando...' : 'Login com UFSC'}</Text>
          </Button>
        </View>
      ) : (
        <View className="flex-1 p-4">
          <WeekDaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} />
          <Button onPress={handleLogout} variant="secondary" size="lg" className="mt-4 w-full">
            <Text>Sair</Text>
          </Button>
        </View>
      )}
    </Container>
  );
};
