import { useState, type ComponentProps } from 'react';
import { View, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Event } from '@/types';
import { Text } from '@/ui/text';
import { cn } from '@/utils/cn';
import { COLORS } from '@/theme/colors';
import { formatEventCardWhen, type EventCardWhen } from '../utils/format-date-time';
import { EVENT_CATEGORY_META, getEventCategory } from '../utils/event-category-meta';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type Chip = { key: string; label: string; icon?: IoniconName };

interface EventCardProps {
  event: Event;
  /** Referência de "agora" (ms). Define "Hoje"/"Amanhã"/"Em andamento". */
  now?: number;
  onPress?: () => void;
  className?: string;
}

/**
 * Linha "quando" já traduzida. Separa com "·" pra ler de relance:
 * "Hoje · 20:00" / "Qui, 20 ago · Dia inteiro" / "Em andamento · até Dom, 06 set".
 */
const formatWhenLabel = (when: EventCardWhen, t: TFunction) => {
  if (when.kind === 'ongoing') {
    return `${t('events.ongoing')} · ${t('events.until', { date: when.until })}`;
  }
  const first = when.relative ? t(`events.${when.relative}`) : when.date;
  const second =
    when.time ?? (when.endDate ? t('events.until', { date: when.endDate }) : t('events.allDay'));
  return `${first} · ${second}`;
};

const OverlayChip = ({ icon, label }: Omit<Chip, 'key'>) => (
  <View
    className="flex-row items-center gap-1 rounded-lg px-2 py-1"
    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
    {icon && <Ionicons name={icon} size={13} color="white" />}
    <Text variant="footnote" className="font-medium text-white" numberOfLines={1}>
      {label}
    </Text>
  </View>
);

/** Zoom do cartaz dentro da moldura: corta um pouco das bordas em troca de menos "barra" nas laterais. */
const COVER_ZOOM = 1.2;

/**
 * Cartaz na moldura 16:9 sem cortar demais: uma cópia borrada e escurecida preenche o fundo
 * e o cartaz inteiro fica por cima (contain), levemente ampliado. Sem imagem, tile da categoria.
 */
const EventCover = ({
  uri,
  tintClassName,
  icon,
  color,
  onError,
  failed,
}: {
  uri: string;
  tintClassName: string;
  icon: IoniconName;
  color: string;
  failed: boolean;
  onError: () => void;
}) => (
  <View
    className={cn('w-full items-center justify-center overflow-hidden', tintClassName)}
    style={{ aspectRatio: 16 / 9 }}>
    {failed || !uri ? (
      <Ionicons name={icon} size={40} color={color} />
    ) : (
      <>
        <Image
          source={{ uri }}
          className="absolute inset-0 h-full w-full"
          resizeMode="cover"
          blurRadius={24}
        />
        <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }} />
        <Image
          source={{ uri }}
          className="h-full w-full"
          style={{ transform: [{ scale: COVER_ZOOM }] }}
          resizeMode="contain"
          onError={onError}
          accessibilityIgnoresInvertColors
        />
      </>
    )}
  </View>
);

export const EventCard = ({ event, now = Date.now(), onPress, className }: EventCardProps) => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
  const [imageFailed, setImageFailed] = useState(false);

  const category = getEventCategory(event);
  const meta = EVENT_CATEGORY_META[category];
  const categoryLabel = t(`events.categories.${category}`);
  const when = formatEventCardWhen(event, now);
  const whenLabel = formatWhenLabel(when, t);
  const ongoing = when.kind === 'ongoing';

  const chips: Chip[] = [{ key: 'category', label: categoryLabel }];
  if (event.is_free === true) chips.push({ key: 'free', label: t('events.free') });

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={[event.name, whenLabel, event.location, ...chips.map((c) => c.label)]
        .filter(Boolean)
        .join(', ')}
      className={cn(
        'w-full overflow-hidden rounded-2xl bg-card shadow-sm active:opacity-80',
        className
      )}
      style={{ borderCurve: 'continuous' }}>
      <View>
        <EventCover
          uri={event.image_url}
          tintClassName={meta.tintClassName}
          icon={meta.icon}
          color={meta.color}
          failed={imageFailed}
          onError={() => setImageFailed(true)}
        />
        <View className="absolute left-3 right-3 top-3 flex-row flex-wrap justify-end gap-1.5">
          {chips.map(({ key, ...chip }) => (
            <OverlayChip key={key} {...chip} />
          ))}
        </View>
      </View>

      <View className="gap-0.5 px-4 pb-3.5 pt-3">
        <Text
          variant="footnote"
          numberOfLines={1}
          className={cn(
            'font-semibold',
            ongoing ? 'text-amber-600 dark:text-amber-400' : 'text-primary'
          )}>
          {whenLabel}
        </Text>
        <Text variant="heading" numberOfLines={2}>
          {event.name}
        </Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="location-outline" size={14} color={colors.grey} />
          <Text variant="subhead" color="tertiary" numberOfLines={1} className="flex-1">
            {event.location}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
