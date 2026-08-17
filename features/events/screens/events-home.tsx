import { FlatList } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Container } from '@/ui/container';
import { Fab } from '@/ui/fab';
import { useEvents } from '../hooks/use-events';
import { EventCard } from '../components/event-card';
import { EventsLoadingState } from '../components/events-loading-state';
import { EventsEmptyState } from '../components/events-empty-state';

export const EventsHome = () => {
  const { data: events, isLoading, refetch } = useEvents();

  const handleAddPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/new-event');
  };

  const openEvent = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/event/[id]', params: { id } });
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
          contentInsetAdjustmentBehavior="automatic"
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard event={item} onPress={() => openEvent(item.id)} />}
          contentContainerClassName="p-4"
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}

      <Fab onPress={handleAddPress} />
    </Container>
  );
};
