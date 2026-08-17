import { View, Image, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '@/types';
import { Text } from '@/ui/text';
import { formatDateTime } from '../utils/format-date-time';
import { useTranslation } from 'react-i18next';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

export const EventCard = ({ event, onPress }: EventCardProps) => {
  const { t } = useTranslation();
  const startDateTime = formatDateTime(event.start_date);
  const isAndroid = Platform.OS === 'android';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={event.name}
      className="mb-4 h-[220px] w-full self-center pb-2 active:opacity-90">
      <Image
        source={{ uri: event.image_url }}
        className="h-full w-full rounded-xl"
        resizeMode="cover"
      />
      {!!event.ticket_url && (
        <View className="absolute left-3 top-3 flex-row items-center gap-1 rounded-lg bg-black/70 px-2 py-1">
          <Ionicons name="ticket-outline" size={14} color="white" />
          <Text variant="subhead" className="font-medium text-white">
            {t('events.tickets')}
          </Text>
        </View>
      )}
      <View className="absolute right-3 top-3 rounded-lg bg-black/70 px-2 py-1">
        <Text variant="subhead" className="text-center font-medium text-white">
          {startDateTime.formattedDate}
        </Text>
      </View>
      <View
        className="bg-black/50"
        style={{
          position: 'absolute',
          bottom: 8,
          height: isAndroid ? 80 : 72,
          justifyContent: 'center',
          width: '100%',
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          paddingHorizontal: 4,
        }}>
        <View className="gap-0.5 pl-1.5">
          <Text variant="title3" className="text-white" adjustsFontSizeToFit numberOfLines={1}>
            {event.name}
          </Text>
          <Text variant="subhead" className="text-white" adjustsFontSizeToFit numberOfLines={1}>
            {event.location} • {startDateTime.formattedTime}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
