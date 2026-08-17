import React, { useState } from 'react';
import {
  View,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';
import { Container } from '@/ui/container';
import { DatePicker } from '@/ui/date-picker';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { supabase } from '@/utils/supabase';
import { cn } from '@/utils/cn';
import { getDateLocale } from '@/utils/i18n/get-date-locale';
import { Event } from '@/types';
import { EventCard } from '../components/event-card';
import { uploadEventImage } from '../utils/upload-image';
import { normalizeUrl } from '../utils/format-date-time';

const HeaderTextButton = ({
  label,
  onPress,
  disabled,
  destructive,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) => (
  <Pressable onPress={onPress} disabled={disabled} hitSlop={8}>
    <Text
      className={cn(
        'text-[17px]',
        destructive ? 'text-[#FF3B30]' : 'font-semibold text-primary',
        disabled && 'opacity-40'
      )}>
      {label}
    </Text>
  </Pressable>
);

/** Item pro header nativo (iOS 26) sem a "bolha" de vidro. */
const plainHeaderItem = (element: React.ReactElement) => [
  { type: 'custom' as const, element, hidesSharedBackground: true },
];

export const NewEvent = () => {
  const { t } = useTranslation();
  const { colors } = useColorScheme();
  const { user, campus, isGuest } = useEnvironmentStore();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [ticketLink, setTicketLink] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [image, setImage] = useState<{ uri: string; base64: string } | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const canPreview = !!name && !!location && !!image;

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      aspect: [16, 9],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImage({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64!,
      });
    }
  };

  const handlePreview = () => {
    if (!canPreview) {
      Alert.alert(t('common.error'), t('events.fillRequiredFields'));
      return;
    }

    if (endDate < startDate) {
      Alert.alert(t('common.error'), t('events.endDateAfterStart'));
      return;
    }

    if (ticketLink.trim() && !normalizeUrl(ticketLink)) {
      Alert.alert(t('common.error'), t('events.invalidUrl'));
      return;
    }

    setIsPreviewMode(true);
  };

  const buildEvent = (imageUrl: string): Omit<Event, 'id' | 'created_at'> => ({
    name: name.trim(),
    location: location.trim(),
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    image_url: imageUrl,
    campus: campus!,
    created_by: {
      name: user!.name,
      enrollmentNumber: user!.enrollmentNumber,
    },
    ticket_url: normalizeUrl(ticketLink),
  });

  const handleSubmit = async () => {
    if (__DEV__) {
      Alert.alert(t('events.devPublishBlocked'));
      return;
    }

    try {
      setIsPublishing(true);
      const imageUrl = await uploadEventImage(image!.base64);
      // Entra como `pending` (default no banco + RLS); só aparece no app depois de aprovado.
      const { error } = await supabase.from('events').insert(buildEvent(imageUrl));
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['events'] });
      Alert.alert(
        t('events.submittedTitle'),
        t('events.submittedMessage'),
        [{ text: 'OK', onPress: () => router.back() }],
        { cancelable: false, onDismiss: () => router.back() }
      );
    } catch (error) {
      console.error('Error publishing event:', error);
      Alert.alert(t('common.error'), t('events.createEventFailed'));
    } finally {
      setIsPublishing(false);
    }
  };

  const inputStyle = { backgroundColor: colors.card, color: colors.foreground };

  const backButton = (
    <HeaderTextButton
      label={t('events.back')}
      onPress={() => setIsPreviewMode(false)}
      disabled={isPublishing}
    />
  );
  const submitButton = isPublishing ? (
    <ActivityIndicator size="small" color={colors.primary} />
  ) : (
    <HeaderTextButton label={t('events.submit')} onPress={handleSubmit} disabled={isGuest} />
  );
  const cancelButton = (
    <HeaderTextButton label={t('common.cancel')} onPress={() => router.back()} destructive />
  );
  const previewButton = (
    <HeaderTextButton label={t('events.preview')} onPress={handlePreview} disabled={!canPreview} />
  );

  if (isPreviewMode) {
    const previewData: Event = {
      id: 'preview',
      created_at: new Date().toISOString(),
      ...buildEvent(image!.uri),
    };

    return (
      <>
        <Stack.Screen
          options={{
            title: t('events.previewTitle'),
            headerLeft: () => backButton,
            headerRight: () => submitButton,
            unstable_headerLeftItems: () => plainHeaderItem(backButton),
            unstable_headerRightItems: () => plainHeaderItem(submitButton),
          }}
        />
        <Container scrollable className="px-4" contentClassName="pb-10">
          <Text variant="subhead" color="tertiary" className="mb-4 mt-2">
            {t('events.previewDisclaimer')}
          </Text>
          <EventCard event={previewData} />
          <Text
            variant="subhead"
            color="primary"
            className="bg-destructive/20 mt-2 rounded-lg px-4 py-2">
            {t('events.publishDisclaimer', {
              name: user!.name,
              enrollment: user!.enrollmentNumber,
            })}
          </Text>
        </Container>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t('events.newEvent'),
          headerLeft: () => cancelButton,
          headerRight: () => previewButton,
          unstable_headerLeftItems: () => plainHeaderItem(cancelButton),
          unstable_headerRightItems: () => plainHeaderItem(previewButton),
        }}
      />
      <Container>
        <ScrollView
          className="flex-1 px-4"
          contentContainerClassName="py-4 pb-10"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          <View className="mb-4">
            <TextInput
              placeholder={t('events.namePlaceholder')}
              value={name}
              onChangeText={setName}
              className="rounded-xl px-4 py-3 text-[17px]"
              style={inputStyle}
              placeholderTextColor={colors.grey3}
              returnKeyType="next"
            />
          </View>

          <View className="mb-4">
            <TextInput
              placeholder={t('events.locationPlaceholder')}
              value={location}
              onChangeText={setLocation}
              className="rounded-xl px-4 py-3 text-[17px]"
              style={inputStyle}
              placeholderTextColor={colors.grey3}
              returnKeyType="next"
            />
          </View>

          <View className="mb-4">
            <View
              style={{ backgroundColor: colors.card }}
              className="flex-row items-center justify-between rounded-xl px-4 py-3">
              <Text className="text-[17px] text-foreground">{t('events.start')}</Text>
              <DatePicker
                locale={getDateLocale()}
                mode="datetime"
                onChange={(_, date) => date && setStartDate(date)}
                value={startDate}
                minimumDate={new Date()}
                minuteInterval={5}
              />
            </View>
          </View>

          <View className="mb-4">
            <View
              style={{ backgroundColor: colors.card }}
              className="flex-row items-center justify-between rounded-xl px-4 py-3">
              <Text className="text-[17px] text-foreground">{t('events.end')}</Text>
              <DatePicker
                locale={getDateLocale()}
                mode="datetime"
                onChange={(_, date) => date && setEndDate(date)}
                value={endDate}
                minimumDate={startDate}
                minuteInterval={5}
              />
            </View>
          </View>

          <View className="mb-1">
            <TextInput
              placeholder={t('events.ticketLinkPlaceholder')}
              value={ticketLink}
              onChangeText={setTicketLink}
              className="rounded-xl px-4 py-3 text-[17px]"
              style={inputStyle}
              placeholderTextColor={colors.grey3}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
          </View>
          <Text variant="footnote" color="tertiary" className="mb-4 ml-1">
            {t('events.ticketLinkHint')}
          </Text>

          <Pressable
            onPress={handleImagePick}
            className="mb-4 overflow-hidden rounded-xl"
            style={{ backgroundColor: colors.card }}>
            {image ? (
              <View>
                <Image source={{ uri: image.uri }} className="aspect-video w-full" />
                <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-2">
                  <Text className="text-center text-[15px] text-white">
                    {t('events.tapToChangeImage')}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="h-48 items-center justify-center px-4 py-3">
                <Ionicons name="image-outline" size={48} color={colors.grey3} />
                <Text className="mt-2 text-[15px] text-foreground">
                  {t('events.tapToSelectImage')}
                </Text>
              </View>
            )}
          </Pressable>
          {Platform.OS === 'ios' && <View className="h-4" />}
        </ScrollView>
      </Container>
    </>
  );
};
