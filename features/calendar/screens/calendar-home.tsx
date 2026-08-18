import { Container } from '@/ui/container';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { Sheet } from '@/ui/bottom-sheet';
import { CalendarDayView } from '../components/calendar-day-view';
import { MonthSelector } from '../components/month-selector';
import { useCalendar } from '../hooks/use-calendar';
import { CalendarClassItem, CalendarItem } from '@/types';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { ClassItemSheet } from '../components/class-item-sheet';
import { useCalendarState } from '../hooks/use-calendar-state';
import * as Haptics from 'expo-haptics';
import { Fab } from '@/ui/fab';
import { NoSubjectsCta } from '@/features/subjects/components/no-subjects-cta';

export const CalendarHome = () => {
  const classSheetRef = useRef<BottomSheetModal>(null);

  const { subjects } = useEnvironmentStore();
  const { selectedDay, setSelectedDay } = useCalendarState();
  const { isExpanded, setIsExpanded } = useCalendarState();
  const { getItemsByDate, getClassItemsByDate, getSavedEventsByDate } = useCalendar();
  const [selectedClassItem, setSelectedClassItem] = useState<CalendarClassItem | undefined>(
    undefined
  );

  const items = getItemsByDate(selectedDay);
  const classItems = getClassItemsByDate(selectedDay);
  const savedEvents = getSavedEventsByDate(selectedDay);

  const handleAddPress = () => {
    router.push({ pathname: '/calendar-item', params: { date: selectedDay.toISOString() } });
  };

  const handlePressItem = (item: CalendarItem) => {
    router.push({ pathname: '/calendar-item', params: { itemId: item.id } });
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

  // Sem disciplinas o calendário fica vazio — a não ser que já haja eventos salvos.
  if (!subjects?.length && !savedEvents.length) {
    return (
      <Container>
        <NoSubjectsCta />
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
          savedEvents={savedEvents}
          day={selectedDay}
        />
      </GestureDetector>

      <Fab onPress={handleAddPress} />

      <Sheet
        onAnimate={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        ref={classSheetRef}
        enableDynamicSizing>
        {selectedClassItem && (
          <ClassItemSheet
            onClose={() => {
              classSheetRef.current?.dismiss();
              setSelectedClassItem(undefined);
            }}
            item={selectedClassItem}
          />
        )}
      </Sheet>
    </Container>
  );
};
