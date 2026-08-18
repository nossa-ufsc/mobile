import { useEffect, useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Container } from '@/ui/container';
import { Fab } from '@/ui/fab';
import { useEvents } from '../hooks/use-events';
import { EventCard } from '../components/event-card';
import { EventCategoryFilter } from '../components/event-category-filter';
import { EventsLoadingState } from '../components/events-loading-state';
import { EventsEmptyState } from '../components/events-empty-state';
import {
  filterByCategory,
  presentCategories,
  sortEventsForList,
  type EventCategoryFilter as Filter,
} from '../utils/event-list';

export const EventsHome = () => {
  const { data: events, isLoading, refetch } = useEvents();
  // Filtro não persiste de propósito: começa em "Todos" a cada visita à aba.
  const [category, setCategory] = useState<Filter>('all');

  const now = Date.now();
  const { visible, categories } = useMemo(() => {
    const sorted = sortEventsForList(events ?? [], now);
    return { visible: filterByCategory(sorted, category), categories: presentCategories(sorted) };
    // `now` muda a cada render; o que importa é a lista/filtro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, category]);

  // Se a categoria escolhida sumiu depois de um refetch, volta pra "Todos" de verdade
  // (só derivar o valor deixaria o estado velho reaparecer no próximo refetch).
  useEffect(() => {
    if (category !== 'all' && !categories.includes(category)) setCategory('all');
  }, [categories, category]);

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
          data={visible}
          contentInsetAdjustmentBehavior="automatic"
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <EventCategoryFilter
              categories={categories}
              value={category}
              onChange={setCategory}
              className="-mx-4 pt-1"
            />
          }
          renderItem={({ item }) => (
            <EventCard event={item} now={now} onPress={() => openEvent(item.id)} />
          )}
          contentContainerClassName="gap-3 p-4"
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}

      <Fab onPress={handleAddPress} />
    </Container>
  );
};
