import { Container } from '@/ui/container';
import { WeekDaySelector } from '@/features/home/components/week-day-selector';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useClassesForDay, useScheduleStore } from '../hooks/use-schedule-store';
import { ClassCard } from '../components/class-card';
import { NoClasses } from '../components/no-classes';
import { router } from 'expo-router';
import { getDateFromDayIndex } from '@/features/calendar/utils/get-date-from-day-index';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { Text } from '@/ui/text';
import * as Haptics from 'expo-haptics';

export const SchedulesHome = () => {
  const { selectedDay, setSelectedDay } = useScheduleStore();
  const classesForDay = useClassesForDay();
  const subjects = useEnvironmentStore((state) => state.subjects);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((event) => {
      if (Math.abs(event.velocityX) < 500) return;

      if (event.velocityX > 0) {
        const newDay = selectedDay === 0 ? 6 : selectedDay - 1;
        runOnJS(setSelectedDay)(newDay);
        runOnJS(Haptics.selectionAsync)();
      } else {
        const newDay = selectedDay === 6 ? 0 : selectedDay + 1;
        runOnJS(setSelectedDay)(newDay);
        runOnJS(Haptics.selectionAsync)();
      }
    });

  if (!subjects?.length) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center pt-36">
          <Text className="text-lg font-medium">Nenhuma disciplina cadastrada</Text>
          <Text className="mt-2 text-center text-muted-foreground">
            Cadastre suas disciplinas para ver seu horário
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <GestureDetector gesture={swipeGesture}>
        <View className="flex-1">
          <WeekDaySelector
            className="mt-4"
            selectedDay={selectedDay}
            onSelectDay={(day) => {
              Haptics.selectionAsync();
              setSelectedDay(day);
            }}
          />

          <Container scrollable autoPadding={false}>
            <View className="mt-6 px-4">
              {classesForDay.length > 0 ? (
                classesForDay.map((classInfo, index) => (
                  <ClassCard
                    key={`${classInfo.subject.id}-${index}`}
                    subject={classInfo.subject}
                    time={classInfo.time}
                    consecutiveClasses={classInfo.consecutiveClasses}
                    onPress={() => {
                      router.push({
                        pathname: '/subject/[id]',
                        params: { id: classInfo.subject.id },
                      });
                    }}
                    currentDate={getDateFromDayIndex(selectedDay)}
                  />
                ))
              ) : (
                <NoClasses />
              )}
            </View>
          </Container>
        </View>
      </GestureDetector>
    </Container>
  );
};
