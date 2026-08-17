import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Text } from '@/ui/text';
import { Button } from '@/ui/button';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useEvent } from '../hooks/use-event';
import { formatEventDetailsDate } from '../utils/format-date-time';
import { CAMPUS_LABELS } from '@/features/settings/utils/const';

const CTA_BAR_HEIGHT = 56;

const CloseButton = () => {
  const { top } = useSafeAreaInsets();
  // No page sheet do iOS o modal já começa abaixo da status bar; no Android não.
  const offset = Platform.OS === 'ios' ? 12 : top + 12;
  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={10}
      accessibilityRole="button"
      className="absolute left-4 h-9 w-9 items-center justify-center rounded-full bg-black/45 active:opacity-70"
      style={{ top: offset }}>
      <Ionicons name="close" size={22} color="white" />
    </Pressable>
  );
};

export const EventDetails = () => {
  const { t } = useTranslation();
  const { colors } = useColorScheme();
  const { bottom } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(id);

  const openTickets = async () => {
    if (!event?.ticket_url) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Linking.openURL(event.ticket_url);
    } catch {
      Alert.alert(t('common.error'), t('events.openLinkFailed'));
    }
  };

  const screenOptions = { headerShown: false } as const;

  if (isLoading && !event) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={screenOptions} />
        <ActivityIndicator color={colors.primary} />
        <CloseButton />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Stack.Screen options={screenOptions} />
        <Text variant="title3" className="text-center">
          {t('events.notFound')}
        </Text>
        <CloseButton />
      </View>
    );
  }

  const date = formatEventDetailsDate(event.start_date, event.end_date);
  const hasTickets = !!event.ticket_url;
  const bottomBarHeight = hasTickets ? CTA_BAR_HEIGHT + 24 + Math.max(bottom, 12) : 0;

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={screenOptions} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomBarHeight + 16 }}
        showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: event.image_url }}
          className="w-full bg-muted"
          style={{ aspectRatio: 16 / 10 }}
          resizeMode="cover"
        />

        <View className="px-5 pt-5">
          <Text variant="title1">{event.name}</Text>
          {event.source !== 'cheers' && !!event.created_by?.name && (
            <Text variant="subhead" color="tertiary" className="mt-1">
              {t('events.sentBy', { name: event.created_by.name })}
            </Text>
          )}

          <View className="mt-5 rounded-2xl bg-card px-4" style={{ borderCurve: 'continuous' }}>
            <View className="flex-row items-center py-4">
              <View className="bg-primary/10 mr-3 h-12 w-12 items-center justify-center rounded-xl">
                <Text variant="title3" className="leading-6 text-primary">
                  {date.day}
                </Text>
                <Text variant="caption2" className="font-semibold text-primary">
                  {date.month}
                </Text>
              </View>
              <View className="flex-1">
                <Text variant="heading" numberOfLines={1}>
                  {date.weekdayDate}
                </Text>
                <Text variant="subhead" color="tertiary" numberOfLines={1}>
                  {date.time}
                </Text>
              </View>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row items-center py-4">
              <View className="bg-primary/10 mr-3 h-12 w-12 items-center justify-center rounded-xl">
                <Ionicons name="location" size={22} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text variant="heading" numberOfLines={2}>
                  {event.location}
                </Text>
                <Text variant="subhead" color="tertiary">
                  {CAMPUS_LABELS[event.campus]}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <CloseButton />

      {hasTickets && (
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-5 pt-3"
          style={{ paddingBottom: Math.max(bottom, 12) }}>
          <Button
            size="lg"
            onPress={openTickets}
            style={{ height: CTA_BAR_HEIGHT, borderRadius: 16, borderCurve: 'continuous' }}>
            <Ionicons name="ticket-outline" size={22} color="white" />
            <Text className="text-[18px] font-semibold">{t('events.tickets')}</Text>
          </Button>
        </View>
      )}
    </View>
  );
};
