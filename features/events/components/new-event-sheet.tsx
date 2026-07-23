import { useState } from 'react';
import { View, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/ui/text';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { EventCard } from './event-card';
import { Event } from '@/types';
import { uploadEventImage } from '../utils/upload-image';
import { supabase } from '@/utils/supabase';
import { cn } from '@/utils/cn';
import { DatePicker } from '@/ui/date-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { getDateLocale } from '@/utils/i18n/get-date-locale';
interface NewEventSheetProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const NewEventSheet = ({ onClose, onSuccess }: NewEventSheetProps) => {
  const { t } = useTranslation();
  const { colors } = useColorScheme();
  const { user, campus, isGuest } = useEnvironmentStore();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [image, setImage] = useState<{ uri: string; base64: string } | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { bottom } = useSafeAreaInsets();

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
    if (!name || !location || !image) {
      Alert.alert(t('common.error'), t('events.fillRequiredFields'));
      return;
    }

    if (endDate < startDate) {
      Alert.alert(t('common.error'), t('events.endDateAfterStart'));
      return;
    }

    setIsPreviewMode(true);
  };

  const onSubmit = async () => {
    const imageUrl = await uploadEventImage(image!.base64);

    const eventData: Omit<Event, 'id' | 'created_at'> = {
      name,
      location,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      image_url: imageUrl,
      campus: campus!,
      created_by: {
        name: user!.name,
        enrollmentNumber: user!.enrollmentNumber,
      },
    };

    const { error } = await supabase.from('events').insert(eventData);

    if (error) throw error;

    onSuccess?.();
    onClose?.();
  };

  const handleSubmit = async () => {
    if (__DEV__) {
      Alert.alert(t('events.devPublishBlocked'));
      return;
    }

    try {
      setIsPublishing(true);
      await onSubmit();
    } catch (error) {
      console.error('Error publishing event:', error);
      Alert.alert(t('common.error'), t('events.createEventFailed'));
    } finally {
      setIsPublishing(false);
    }
  };

  if (isPreviewMode) {
    const previewData: Event = {
      id: 'preview',
      created_at: new Date().toISOString(),
      name,
      location,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      image_url: image!.uri,
      campus: campus!,
      created_by: {
        name: user!.name,
        enrollmentNumber: user!.enrollmentNumber,
      },
    };

    return (
      <BottomSheetScrollView
        contentContainerStyle={{ paddingBottom: 16 + bottom }}
        className="flex-1 bg-background">
        <View
          style={{ backgroundColor: colors.card }}
          className="flex-row items-center justify-between px-4 pb-3 pt-1">
          <Pressable onPress={() => setIsPreviewMode(false)}>
            <Text className="text-[17px] font-normal text-[#FF3B30]">{t('events.back')}</Text>
          </Pressable>
          {isPublishing ? (
            <ActivityIndicator className="ml-4" size="small" color={colors.primary} />
          ) : (
            <Text className="text-lg font-bold">{t('events.previewTitle')}</Text>
          )}
          <Pressable onPress={handleSubmit} disabled={isPublishing || isGuest}>
            <Text
              className={cn('text-[17px] font-normal text-primary', isPublishing && 'opacity-50')}>
              {t('events.publish')}
            </Text>
          </Pressable>
        </View>

        <View className="flex-1 px-4 pt-4">
          <Text variant="subhead" color="primary" className="mt-2">
            {t('events.previewDisclaimer')}
          </Text>
          <EventCard event={previewData} />
          <Text
            variant="subhead"
            color="primary"
            className="bg-destructive/20 mt-4 rounded-lg px-4 py-2">
            {t('events.publishDisclaimer', {
              name: user!.name,
              enrollment: user!.enrollmentNumber,
            })}
          </Text>
        </View>
      </BottomSheetScrollView>
    );
  }

  return (
    <BottomSheetScrollView
      contentContainerStyle={{ paddingBottom: bottom + 16 }}
      className="flex-1 bg-background">
      <View
        style={{ backgroundColor: colors.card }}
        className="flex-row items-center justify-between px-4 pb-3 pt-1">
        <Pressable onPress={onClose}>
          <Text className="text-[17px] font-normal text-[#FF3B30]">{t('common.cancel')}</Text>
        </Pressable>
        <Text className="text-lg font-bold">{t('events.newEvent')}</Text>
        <Pressable onPress={handlePreview} disabled={!name || !location || !image}>
          <Text
            className={cn(
              'text-[17px] font-normal text-primary',
              (!name || !location || !image) && 'opacity-50'
            )}>
            {t('events.preview')}
          </Text>
        </Pressable>
      </View>

      <View className="flex-1 px-4 pt-4">
        <View className="mb-4">
          <BottomSheetTextInput
            placeholder={t('events.namePlaceholder')}
            value={name}
            onChangeText={setName}
            className="rounded-xl px-4 py-3 text-[17px]"
            style={{
              backgroundColor: colors.card,
              color: colors.foreground,
            }}
            placeholderTextColor={colors.grey3}
          />
        </View>

        <View className="mb-4">
          <BottomSheetTextInput
            placeholder={t('events.locationPlaceholder')}
            value={location}
            onChangeText={setLocation}
            className="rounded-xl px-4 py-3 text-[17px]"
            style={{
              backgroundColor: colors.card,
              color: colors.foreground,
            }}
            placeholderTextColor={colors.grey3}
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

        <Pressable
          onPress={handleImagePick}
          className="mb-4 overflow-hidden rounded-xl"
          style={{ backgroundColor: colors.card }}>
          {image ? (
            <View>
              <Image source={{ uri: image.uri }} className="h-48 w-full" />
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
      </View>
    </BottomSheetScrollView>
  );
};
