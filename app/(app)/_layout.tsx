import { Redirect, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/ui/theme-toggle';
import { useEnvironmentStore } from '@/utils/use-environment-store';

export default function AppLayout() {
  const { isAuthenticated } = useEnvironmentStore();
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name="(tabs)" options={TABS_OPTIONS} />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          animation: 'fade_from_bottom', // for android
          title: t('settings.title'),
          headerRight: () => <ThemeToggle />,
        }}
      />
      <Stack.Screen
        name="manage-subjects"
        options={{
          title: t('subjects.editSubjects'),
        }}
      />
      <Stack.Screen
        name="event/[id]"
        options={{
          presentation: 'modal',
          animation: 'fade_from_bottom',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="new-event"
        options={{
          presentation: 'modal',
          animation: 'fade_from_bottom',
          gestureEnabled: false,
          title: t('events.newEvent'),
        }}
      />
    </Stack>
  );
}

const SCREEN_OPTIONS = {
  animation: 'ios_from_right', // for android
} as const;

const TABS_OPTIONS = {
  headerShown: false,
} as const;
