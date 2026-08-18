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
import { useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Text } from '@/ui/text';
import { ImageViewer } from '@/ui/image-viewer';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { useColorScheme } from '@/utils/use-color-scheme';
import { getDateLocale } from '@/utils/i18n/get-date-locale';
import { useEvent } from '../hooks/use-event';
import { formatEventDetailsDate } from '../utils/format-date-time';
import { getEventCategory, isOfficialEvent } from '../utils/event-category-meta';
import { isOngoing } from '../utils/event-list';
import { EventDescription } from '../components/event-description';
import { CAMPUS_LABELS } from '@/features/settings/utils/const';

const CTA_BAR_HEIGHT = 56;
const MAX_TAGS = 10;

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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const hostnameOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

export const EventDetails = () => {
  const { t } = useTranslation();
  const { colors } = useColorScheme();
  const { bottom } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isLoading } = useEvent(id);
  const [imageOpen, setImageOpen] = useState(false);

  const openExternal = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Linking.openURL(url);
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

  const official = isOfficialEvent(event);
  const category = getEventCategory(event);
  const categoryLabel = t(`events.categories.${category}`);
  const ongoing = isOngoing(event, Date.now());
  const date = formatEventDetailsDate(event.start_date, event.end_date, {
    allDay: !!event.is_all_day,
  });
  const hasTickets = !!event.ticket_url;
  const bottomBarHeight = hasTickets
    ? CTA_BAR_HEIGHT + 24 + Math.max(bottom, 12)
    : Math.max(bottom, 16);
  const description = event.description?.trim();
  // Tags vêm em pt-BR cru da fonte; compara com o id da categoria e com o rótulo pt-BR
  // (não com o rótulo traduzido, senão em en/es o badge "Talk" vem junto do chip "palestra").
  const categoryAliases = new Set(
    [category, t(`events.categories.${category}`, { lng: 'pt-BR' }), categoryLabel].map((s) =>
      s.toLowerCase()
    )
  );
  const tags = (event.tags ?? [])
    .filter((tag, i, all) => all.indexOf(tag) === i && !categoryAliases.has(tag.toLowerCase()))
    .slice(0, MAX_TAGS);
  const updatedAt = official && event.updated_at ? new Date(event.updated_at) : null;
  const updatedLabel =
    updatedAt && !isNaN(updatedAt.getTime())
      ? updatedAt.toLocaleString(getDateLocale(), {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={screenOptions} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomBarHeight + 32 }}
        showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => setImageOpen(true)}
          accessibilityRole="imagebutton"
          accessibilityLabel={event.name}
          className="active:opacity-90">
          <Image
            source={{ uri: event.image_url }}
            className="w-full bg-muted"
            style={{ aspectRatio: 16 / 10 }}
            resizeMode="cover"
          />
          {/* Dica de que a imagem abre em tela cheia. */}
          <View
            pointerEvents="none"
            className="absolute bottom-3 right-3 h-8 w-8 items-center justify-center rounded-full bg-black/45">
            <Ionicons name="expand-outline" size={16} color="white" />
          </View>
        </Pressable>
        <ImageViewer
          uri={event.image_url}
          visible={imageOpen}
          onClose={() => setImageOpen(false)}
          accessibilityLabel={event.name}
        />

        <View className="px-5 pt-5">
          <Text variant="title1">{event.name}</Text>
          {event.source === 'user' && !!event.created_by?.name && (
            <Text variant="subhead" color="tertiary" className="mt-1">
              {t('events.sentBy', { name: event.created_by.name })}
            </Text>
          )}

          <View className="mt-3 flex-row flex-wrap gap-1.5">
            <Badge tone="info" label={categoryLabel} />
            {ongoing && <Badge tone="warning" label={t('events.ongoing')} />}
            {event.is_free === true && <Badge tone="positive" label={t('events.free')} />}
            {event.is_free === false && <Badge tone="neutral" label={t('events.paid')} />}
          </View>

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
                  {date.time ?? t('events.allDay')}
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
            {!!event.info_url && (
              <>
                <View className="h-px bg-border" />
                <Pressable
                  accessibilityRole="link"
                  onPress={() => openExternal(event.info_url!)}
                  className="flex-row items-center py-4 active:opacity-70">
                  <View className="bg-primary/10 mr-3 h-12 w-12 items-center justify-center rounded-xl">
                    <Ionicons name="globe-outline" size={22} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text variant="heading" numberOfLines={1}>
                      {t('events.viewOnUfscSite')}
                    </Text>
                    <Text variant="subhead" color="tertiary" numberOfLines={1}>
                      {hostnameOf(event.info_url)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.grey} />
                </Pressable>
              </>
            )}
          </View>
          {updatedLabel && (
            <Text variant="caption2" color="quarternary" className="mt-2 text-center">
              {t('events.updatedAt', { date: updatedLabel })}
            </Text>
          )}

          {!!description && (
            <View className="mt-6">
              <Text variant="heading" className="mb-2">
                {t('events.about')}
              </Text>
              <EventDescription text={description} />
            </View>
          )}

          {tags.length > 0 && (
            <View className="mt-5 flex-row flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} tone="neutral" label={capitalize(tag)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <CloseButton />

      {hasTickets && (
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-5 pt-3"
          style={{ paddingBottom: Math.max(bottom, 12) }}>
          <Button
            size="lg"
            onPress={() => openExternal(event.ticket_url!)}
            style={{ height: CTA_BAR_HEIGHT, borderRadius: 16, borderCurve: 'continuous' }}>
            <Ionicons
              name={official ? 'clipboard-outline' : 'ticket-outline'}
              size={22}
              color="white"
            />
            <Text className="text-[18px] font-semibold">
              {official ? t('events.registration') : t('events.tickets')}
            </Text>
          </Button>
        </View>
      )}
    </View>
  );
};
