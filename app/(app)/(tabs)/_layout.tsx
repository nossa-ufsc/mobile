import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
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
    <NativeTabs iconColor={{ default: colors.grey4, selected: colors.grey }}>
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Horários</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="home" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(calendar)">
        <NativeTabs.Trigger.Label>Calendário</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="calendar"
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="calendar" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(menu)">
        <NativeTabs.Trigger.Label>Cardápio</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="fork.knife"
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="restaurant" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(events)">
        <NativeTabs.Trigger.Label>Eventos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="mappin.and.ellipse"
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="location" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
