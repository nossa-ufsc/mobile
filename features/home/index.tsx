import { useCAGRLogin } from '@/features/onboarding/hooks/use-cagr-login';
import { Button } from '@/ui/button';
import { Container } from '@/ui/container';
import { Text } from '@/ui/text';
import { WeekDaySelector } from '@/ui/week-day-selector';
import { View } from 'react-native';
import { ClassCard } from './components/class-card';
import { NoClasses } from './components/no-classes';
import { useScheduleStore, useClassesForDay } from './hooks/use-schedule-store';

export const Home = () => {
  const { handleLogin, isAuthenticated, isLoading } = useCAGRLogin();
  const { selectedDay, setSelectedDay } = useScheduleStore();
  const classesForDay = useClassesForDay();

  return (
    <Container scrollable className="px-4">
      {!isAuthenticated ? (
        <View className="mt-8 flex-1 items-center justify-center">
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
        <View className="flex-1">
          <WeekDaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} />

          <View className="mt-6 flex-1">
            {classesForDay.length > 0 ? (
              classesForDay.map((classInfo, index) => (
                <ClassCard
                  key={`${classInfo.subject.id}-${index}`}
                  subject={classInfo.subject}
                  time={classInfo.time}
                />
              ))
            ) : (
              <NoClasses />
            )}
          </View>
        </View>
      )}
    </Container>
  );
};
