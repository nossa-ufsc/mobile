import { HeaderButton } from '@/ui/header-button';
import { HeaderTitle } from '@/ui/header-title';
import { useColorScheme } from '@/utils/use-color-scheme';
import { router, Stack } from 'expo-router';

export default function CalendarLayout() {
  const { colors } = useColorScheme();
  return (
    <Stack screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen
        name="calendar"
        options={{
          headerRight: () => <HeaderButton onPress={() => router.push('/modal')} />,
          headerLeft: () => <HeaderTitle title="Calendário" />,
          title: '',
          headerStyle: { backgroundColor: colors.background },
        }}
      />
    </Stack>
  );
}

const SCREEN_OPTIONS = {
  animation: 'default',
  headerShadowVisible: false,
} as const;
