import { HeaderButton } from '@/ui/header-button';
import { HeaderTitle } from '@/ui/header-title';
import { useColorScheme } from '@/utils/use-color-scheme';
import { router, Stack } from 'expo-router';

export default function HomeLayout() {
  const { colors } = useColorScheme();
  return (
    <Stack screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen
        name="index"
        options={{
          headerRight: () => <HeaderButton onPress={() => router.push('/modal')} />,
          headerLeft: () => <HeaderTitle title="Horários" />,
          title: '',
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      <Stack.Screen
        name="subject/[id]"
        options={{
          headerStyle: { backgroundColor: colors.background },
          title: '',
        }}
      />
    </Stack>
  );
}

const SCREEN_OPTIONS = {
  animation: 'default',
  headerShadowVisible: false,
} as const;
