import { View, Image, Platform } from 'react-native';
import { Event } from '@/types';
import { Text } from '@/ui/text';
import { formatDateTime } from '../utils/format-date-time';

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const startDateTime = formatDateTime(event.start_date);
  const endDateTime = formatDateTime(event.end_date);
  const isAndroid = Platform.OS === 'android';

  const isSameDay = startDateTime.formattedDate === endDateTime.formattedDate;

  const dateTimeRange = isSameDay
    ? `${startDateTime.formattedTime} - ${endDateTime.formattedTime}`
    : `${startDateTime.formattedDate}, ${startDateTime.formattedTime} - ${endDateTime.formattedDate}, ${endDateTime.formattedTime}`;

  return (
    <View className="mb-4 h-[220px] w-full self-center pb-2">
      <Image
        source={{ uri: event.image_url }}
        className="h-full w-full rounded-xl"
        resizeMode="cover"
      />
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
          height: isAndroid ? 90 : 80,
          width: '100%',
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          paddingHorizontal: 4,
        }}>
        <View className="pl-1.5">
          <Text variant="title3" className="text-white" adjustsFontSizeToFit numberOfLines={1}>
            {event.name}
          </Text>
          <Text variant="subhead" className="text-white" adjustsFontSizeToFit numberOfLines={1}>
            {event.location} • {dateTimeRange}
          </Text>
          <Text variant="footnote" className="text-white" numberOfLines={1} adjustsFontSizeToFit>
            Enviado por {event.created_by.name}
          </Text>
        </View>
      </View>
    </View>
  );
};
