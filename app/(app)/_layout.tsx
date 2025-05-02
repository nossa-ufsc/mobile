import { Redirect, Stack } from 'expo-router';
import { ThemeToggle } from '@/ui/theme-toggle';
import { useEnvironmentStore } from '@/utils/use-environment-store';

export default function AppLayout() {
  const { isAuthenticated } = useEnvironmentStore();

  if (!isAuthenticated) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name="(tabs)" options={TABS_OPTIONS} />
      <Stack.Screen name="modal" options={MODAL_OPTIONS} />
    </Stack>
  );
}

const SCREEN_OPTIONS = {
  animation: 'ios_from_right', // for android
} as const;

const TABS_OPTIONS = {
  headerShown: false,
} as const;

const MODAL_OPTIONS = {
  presentation: 'modal',
  animation: 'fade_from_bottom', // for android
  title: 'Configurações',
  headerRight: () => <ThemeToggle />,
} as const;
