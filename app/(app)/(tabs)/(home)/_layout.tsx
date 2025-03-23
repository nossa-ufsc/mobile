import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name="index" options={{ ...INDEX_OPTIONS, title: 'Horários' }} />
    </Stack>
  );
}

const SCREEN_OPTIONS = {
  animation: 'default',
} as const;

const INDEX_OPTIONS = {
  headerLargeTitle: true,
} as const;
