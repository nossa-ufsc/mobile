import { Container } from '@/ui/container';
import { WeekDaySelector } from '@/features/home/components/week-day-selector';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useMenuStore } from '../hooks/use-menu-store';
import { useMenu } from '../hooks/use-menu';
import { MenuDisplay } from '../components/menu-display';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export const MenuHome = () => {
  const { selectedDay, setSelectedDay } = useMenuStore();
  const { data: menu, isLoading, error, refetch } = useMenu();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((event) => {
      if (Math.abs(event.velocityX) < 500) return;

      if (event.velocityX > 0) {
        const newDay = selectedDay === 0 ? 6 : selectedDay - 1;
        runOnJS(setSelectedDay)(newDay);
      } else {
        const newDay = selectedDay === 6 ? 0 : selectedDay + 1;
        runOnJS(setSelectedDay)(newDay);
      }
    });

  return (
    <Container>
      <GestureDetector gesture={swipeGesture}>
        <View className="flex-1">
          <WeekDaySelector
            className="mt-4"
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />

          <MenuDisplay menu={menu} isLoading={isLoading} error={error} />
        </View>
      </GestureDetector>
    </Container>
  );
};
