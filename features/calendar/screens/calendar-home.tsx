import { Container } from '@/ui/container';
import { useRef, useState } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CalendarItemSheet } from '../components/calendar-item-sheet';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { Sheet } from '@/ui/bottom-sheet';
import { CalendarDayView } from '../components/calendar-day-view';
import { MonthSelector } from '../components/month-selector';
import { useCalendar } from '../hooks/use-calendar';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarClassItem, CalendarItem } from '@/types';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { ClassItemSheet } from '../components/class-item-sheet';
import { Text } from '@/ui/text';
import { useCalendarState } from '../hooks/use-calendar-state';
import * as Haptics from 'expo-haptics';

export const CalendarHome = () => {
  const calendarSheetRef = useRef<BottomSheetModal>(null);
  const classSheetRef = useRef<BottomSheetModal>(null);

  const { subjects } = useEnvironmentStore();
  const { selectedDay, setSelectedDay } = useCalendarState();
  const { isExpanded, setIsExpanded } = useCalendarState();
  const { getItemsByDate, getClassItemsByDate } = useCalendar();
  const [selectedItem, setSelectedItem] = useState<CalendarItem | undefined>(undefined);
  const [selectedClassItem, setSelectedClassItem] = useState<CalendarClassItem | undefined>(
    undefined
  );

  const items = getItemsByDate(selectedDay);
  const classItems = getClassItemsByDate(selectedDay);

  const handleAddPress = () => {
    setSelectedItem(undefined);
    calendarSheetRef.current?.present();
  };

  const handleClose = () => {
    calendarSheetRef.current?.dismiss();
    setSelectedItem(undefined);
    setSelectedClassItem(undefined);
  };

  const handlePressItem = (item: CalendarItem) => {
    setSelectedItem(item);
    calendarSheetRef.current?.present();
  };

  const handlePressClass = (item: CalendarClassItem) => {
    setSelectedClassItem(item);
    classSheetRef.current?.present();
  };

  const handleDayViewPress = () => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  const changeDate = (direction: 'next' | 'prev') => {
    const newDate = new Date(selectedDay);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDay(newDate);
  };

  const combinedGesture = Gesture.Race(
    Gesture.Pan()
      .activeOffsetX([-25, 25])
      .minDistance(25)
      .enabled(!isExpanded)
      .onEnd((event) => {
        if (Math.abs(event.velocityX) < 400) return;
        if (Math.abs(event.translationX) < Math.abs(event.translationY)) return;
        if (Math.abs(event.translationX) < 40) return;

        if (event.velocityX > 0) {
          runOnJS(changeDate)('prev');
          runOnJS(Haptics.selectionAsync)();
        } else {
          runOnJS(changeDate)('next');
          runOnJS(Haptics.selectionAsync)();
        }
      }),
    Gesture.Tap()
      .enabled(isExpanded)
      .onEnd(() => {
        runOnJS(handleDayViewPress)();
      })
  );

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
      <MonthSelector
        selectedDay={selectedDay}
        onSelectDay={(day) => {
          Haptics.selectionAsync();
          setSelectedDay(day);
        }}
      />
      <GestureDetector gesture={combinedGesture}>
        <CalendarDayView
          onPressClass={handlePressClass}
          onPressItem={handlePressItem}
          items={items}
          classItems={classItems}
        />
      </GestureDetector>

      <Pressable
        onPress={handleAddPress}
        className="shadow-primary/20 absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg">
        <Ionicons name="add" size={24} color="white" />
      </Pressable>

      <Sheet
        onAnimate={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        ref={calendarSheetRef}
        enableDynamicSizing>
        <CalendarItemSheet
          subjects={subjects}
          onClose={handleClose}
          initialItem={selectedItem}
          initialDate={selectedDay}
        />
      </Sheet>

      <Sheet
        onAnimate={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        ref={classSheetRef}
        enableDynamicSizing>
        {selectedClassItem && <ClassItemSheet item={selectedClassItem} />}
      </Sheet>
    </Container>
  );
};
