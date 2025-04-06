import { useCAGRLogin } from '@/features/onboarding/hooks/use-cagr-login';
import { Button } from '@/ui/button';
import { Container } from '@/ui/container';
import { Text } from '@/ui/text';
import { WeekDaySelector } from '@/ui/week-day-selector';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useClassesForDay, useScheduleStore } from '../hooks/use-schedule-store';
import { ClassCard } from '../components/class-card';
import { NoClasses } from '../components/no-classes';
import { router } from 'expo-router';

export const SchedulesHome = () => {
  const { handleLogin, isAuthenticated, isLoading } = useCAGRLogin();
  const { selectedDay, setSelectedDay } = useScheduleStore();
  const classesForDay = useClassesForDay();

  // Use Gesture API to handle swipe gestures
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((event) => {
      if (Math.abs(event.velocityX) < 500) return; // Ignore slow swipes

      if (event.velocityX > 0) {
        // Swipe right - go to previous day
        const newDay = selectedDay === 0 ? 6 : selectedDay - 1;
        runOnJS(setSelectedDay)(newDay);
      } else {
        // Swipe left - go to next day
        const newDay = selectedDay === 6 ? 0 : selectedDay + 1;
        runOnJS(setSelectedDay)(newDay);
      }
    });

  return (
    <Container>
      {!isAuthenticated ? (
        <View className="mt-8 flex-1 items-center justify-center px-4">
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
        <GestureDetector gesture={swipeGesture}>
          <View className="flex-1">
            <WeekDaySelector
              className="mt-4"
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />

            <Container scrollable autoPadding={false}>
              <View className="mt-6 px-4">
                {classesForDay.length > 0 ? (
                  classesForDay.map((classInfo, index) => (
                    <ClassCard
                      key={`${classInfo.subject.id}-${index}`}
                      subject={classInfo.subject}
                      time={classInfo.time}
                      onPress={() => {
                        router.push({
                          pathname: '/subject/[id]',
                          params: { id: classInfo.subject.id },
                        });
                      }}
                    />
                  ))
                ) : (
                  <NoClasses />
                )}
              </View>
            </Container>
          </View>
        </GestureDetector>
      )}
    </Container>
  );
};
