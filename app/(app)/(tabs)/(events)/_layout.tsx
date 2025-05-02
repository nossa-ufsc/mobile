import { HeaderButton } from '@/ui/header-button';
import { router, Stack } from 'expo-router';

export default function EventsLayout() {
  return (
    <Stack screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name="events" options={{ ...INDEX_OPTIONS, title: 'Eventos' }} />
    </Stack>
  );
}

const SCREEN_OPTIONS = {
  animation: 'default',
} as const;

const INDEX_OPTIONS = {
  headerLargeTitle: true,
  headerRight: () => <HeaderButton onPress={() => router.push('/modal')} />,
} as const;
