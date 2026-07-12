import { MonthButton } from '@/features/calendar/components/month-buton';
import { useCalendarState } from '@/features/calendar/hooks/use-calendar-state';
import { getSettingsHeaderItems, HeaderButton } from '@/ui/header-button';
import { getHeaderTitleItems, HeaderTitle } from '@/ui/header-title';
import { MONTHS } from '@/utils/const';
import { useColorScheme } from '@/utils/use-color-scheme';
import { router, Stack } from 'expo-router';
import { View } from 'react-native';

export default function CalendarLayout() {
  const { colors } = useColorScheme();
  const { currentDate, isExpanded, setIsExpanded } = useCalendarState();
  return (
    <Stack screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen
        name="calendar"
        options={{
          headerRight: () => (
            <View className="flex-row items-center gap-2">
              <MonthButton />
              <HeaderButton onPress={() => router.push('/modal')} />
            </View>
          ),
          unstable_headerRightItems: () => [
            {
              type: 'button',
              label: MONTHS[currentDate.getMonth()],
              onPress: () => setIsExpanded(!isExpanded),
              sharesBackground: false,
            },
            ...getSettingsHeaderItems(() => router.push('/modal')),
          ],
          headerLeft: () => <HeaderTitle title="Calendário" />,
          unstable_headerLeftItems: () => getHeaderTitleItems('Calendário'),
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
