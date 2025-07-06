import { FlatList, Pressable } from 'react-native';
import { Container } from '@/ui/container';
import { useEvents } from '../hooks/use-events';
import { EventCard } from '../components/event-card';
import { EventsLoadingState } from '../components/events-loading-state';
import { EventsEmptyState } from '../components/events-empty-state';
import { useRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Sheet } from '@/ui/bottom-sheet';
import { NewEventSheet } from '../components/new-event-sheet';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export const EventsHome = () => {
  const { data: events, isLoading, refetch } = useEvents();
  const eventSheetRef = useRef<BottomSheetModal>(null);

  const handleAddPress = () => {
    eventSheetRef.current?.present();
  };

  const handleClose = () => {
    eventSheetRef.current?.dismiss();
  };

  if (isLoading) {
    return <EventsLoadingState />;
  }

  return (
    <Container>
      {!events?.length ? (
        <EventsEmptyState />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerClassName="p-4"
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}

      <Pressable
        onPress={handleAddPress}
        className="shadow-primary/20 absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg">
        <Ionicons name="add" size={24} color="white" />
      </Pressable>

      <Sheet
        onAnimate={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        enableDynamicSizing
        ref={eventSheetRef}>
        <NewEventSheet onClose={handleClose} onSuccess={refetch} />
      </Sheet>
    </Container>
  );
};
