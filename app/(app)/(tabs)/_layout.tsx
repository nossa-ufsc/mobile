import { Tabs, useFocusEffect } from 'expo-router';
import { TabBarIcon } from '@/ui/tab-bar-icon';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useCalendarState } from '@/features/calendar/hooks/use-calendar-state';
import { useCallback } from 'react';
import { useMigrateCalendarItems } from '@/utils/use-migrate-calendar-items';

export default function TabLayout() {
  const { colors } = useColorScheme();
  const { setCurrentDate } = useCalendarState();

  useFocusEffect(
    useCallback(() => {
      setCurrentDate(new Date());
    }, [setCurrentDate])
  );

  useMigrateCalendarItems();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
      }}>
      <Tabs.Screen
        name="(home)"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="home" color={focused ? colors.grey : colors.grey4} />
          ),
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="(calendar)"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="calendar" color={focused ? colors.grey : colors.grey4} />
          ),
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="(menu)"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="restaurant" color={focused ? colors.grey : colors.grey4} size={24} />
          ),
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="(events)"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="location" color={focused ? colors.grey : colors.grey4} size={24} />
          ),
          tabBarShowLabel: false,
        }}
      />
    </Tabs>
  );
}
