import { ScrollView, View, TouchableOpacity } from 'react-native';
import { Text } from '@/ui/text';
import { cn } from '@/utils/cn';
import { useMemo, useRef, useEffect, useState } from 'react';
import { CalendarClassItem, CalendarItem, SavedEvent } from '@/types';
import { useSubjectAbsence } from '@/features/home/hooks/use-subject-absence';
import { useFocusEffect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getDateLocale } from '@/utils/i18n/get-date-locale';
import { expandSavedEvent, type EventOccurrence } from '../utils/expand-saved-event';
import { useCalendarColors, type CalendarPalette } from '../hooks/use-calendar-colors';

interface CalendarDayViewProps {
  className?: string;
  items?: CalendarItem[];
  classItems?: CalendarClassItem[];
  /** Eventos salvos já filtrados pelo dia (ver `getSavedEventsByDate`). */
  savedEvents?: SavedEvent[];
  /** Dia mostrado; define como cada evento salvo é expandido (faixa x bloco). */
  day?: Date;
  onPressItem: (item: CalendarItem) => void;
  onPressClass: (item: CalendarClassItem) => void;
}

const HOUR_HEIGHT = 72;
const TIME_LABEL_WIDTH = 64;
const SIDE_PADDING = 8;
const CLASS_DURATION = 50;

const EVENT_MIN_HEIGHT = 40;
const EVENT_ACCENT_WIDTH = 4;
const NESTED_ACCENT_WIDTH = 3;

const OTHER_ITEM_FIXED_HEIGHT = 40;
const NESTED_ITEM_FIXED_HEIGHT = 30;
const VERTICAL_GAP = 4;
const NESTED_ITEM_VERTICAL_GAP = 8;
const NESTED_ITEMS_HEADER_OFFSET = 40;

interface PositionedItem extends CalendarItem {
  endTime: Date;
  consecutiveClasses?: number;
}

interface PositionedClassItem extends CalendarClassItem {
  endTime: Date;
  type: 'class';
}

interface LayoutedClass extends PositionedClassItem {
  top: number;
  height: number;
  nestedItems: PositionedItem[];
}

interface LayoutedOther extends PositionedItem {
  top: number;
  height: number;
}

type SavedEventOccurrence<K extends EventOccurrence['kind']> = {
  saved: SavedEvent;
  occurrence: Extract<EventOccurrence, { kind: K }>;
};

interface LayoutedEvent extends SavedEventOccurrence<'timed'> {
  top: number;
  height: number;
}

const openEvent = (eventId: string) =>
  router.push({ pathname: '/event/[id]', params: { id: eventId } });

const formatTime = (date: Date) =>
  date.toLocaleTimeString(getDateLocale(), { hour: '2-digit', minute: '2-digit' });

/** Faixa compacta acima da grade com os eventos de dia inteiro / vários dias. */
const AllDayLane = ({
  occurrences,
  onLayoutHeight,
  palette,
}: {
  occurrences: SavedEventOccurrence<'allDay'>[];
  onLayoutHeight: (height: number) => void;
  palette: CalendarPalette;
}) => {
  const { t } = useTranslation();

  return (
    <View
      className="border-b border-gray-200 py-2 dark:border-gray-800"
      onLayout={(e) => onLayoutHeight(e.nativeEvent.layout.height)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-3">
        {occurrences.map(({ saved, occurrence }) => {
          const color = palette.savedEvent(saved);
          const rangeLabel =
            occurrence.dayCount > 1
              ? t('calendar.dayOf', { n: occurrence.dayIndex, total: occurrence.dayCount })
              : t('calendar.allDay');

          return (
            <TouchableOpacity
              key={saved.eventId}
              hitSlop={4}
              accessibilityRole="button"
              onPress={() => openEvent(saved.eventId)}
              className="max-w-[280px] flex-row items-center gap-2 rounded-lg py-1.5 pl-2 pr-3"
              style={{ backgroundColor: color.tint }}>
              <View
                style={{ backgroundColor: color.accent, width: EVENT_ACCENT_WIDTH }}
                className="h-5 rounded-full"
              />
              <Text variant="subhead" className="flex-shrink font-medium" numberOfLines={1}>
                {saved.snapshot.name}
              </Text>
              <Text
                variant="caption2"
                className={cn(
                  occurrence.ongoing
                    ? 'font-semibold text-amber-700 dark:text-amber-300'
                    : 'text-gray-500 dark:text-gray-400'
                )}
                numberOfLines={1}>
                {occurrence.ongoing ? t('events.ongoing') : rangeLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

/** Bloco com duração real na grade, no mesmo lugar que uma aula ocuparia. */
const EventBlock = ({ item, palette }: { item: LayoutedEvent; palette: CalendarPalette }) => {
  const { t } = useTranslation();
  const { saved, occurrence } = item;
  const color = palette.savedEvent(saved);
  const range = `${formatTime(new Date(saved.snapshot.start_date))} – ${formatTime(
    new Date(saved.snapshot.end_date)
  )}`;
  const timeLabel = [
    occurrence.continuesFromPrev ? t('calendar.continuesFromPrev') : null,
    range,
    occurrence.continuesToNext ? `→ ${t('calendar.continues')}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <TouchableOpacity
      hitSlop={4}
      accessibilityRole="button"
      onPress={() => openEvent(saved.eventId)}
      className={cn(
        'absolute left-0 right-0 flex-row overflow-hidden rounded-lg',
        'border border-gray-300 dark:border-gray-700'
      )}
      style={{ top: item.top, height: item.height, backgroundColor: color.tint }}>
      <View style={{ backgroundColor: color.accent, width: EVENT_ACCENT_WIDTH }} />
      <View className="flex-1 justify-start px-3 py-1.5">
        <Text variant="subhead" className="font-semibold" numberOfLines={1}>
          {saved.snapshot.name}
        </Text>
        <Text
          variant="caption2"
          className={cn(occurrence.ongoing && 'font-semibold text-amber-700 dark:text-amber-300')}
          numberOfLines={1}>
          {occurrence.ongoing ? `${t('events.ongoing')} · ${timeLabel}` : timeLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const ClassItem = ({
  item,
  onPressClass,
  onPressItem,
  palette,
}: {
  item: LayoutedClass;
  onPressClass: (item: CalendarClassItem) => void;
  onPressItem: (item: CalendarItem) => void;
  palette: CalendarPalette;
}) => {
  const { absences } = useSubjectAbsence(item.subject.id);
  const existingAbsence = absences.find((entry) => entry.date === item.date.toDateString());

  return (
    <TouchableOpacity
      hitSlop={4}
      className={cn(
        'absolute left-0 right-0 overflow-hidden rounded-lg px-3 py-1',
        'border border-gray-300 dark:border-gray-700'
      )}
      onPressOut={() => onPressClass(item)}
      style={{
        top: item.top,
        height: item.height,
        minHeight: 48,
        backgroundColor: palette.cls().tint,
      }}>
      <View className="flex-row items-center justify-between">
        <Text variant="subhead" className="mr-2 flex-shrink font-semibold">
          {item.title}
        </Text>
        <Text variant="caption2" className="flex-1" numberOfLines={1}>
          {item.subject.code}
        </Text>
      </View>

      {existingAbsence && (
        <View className="bg-destructive/10 mt-2 rounded-lg px-2 py-1">
          <Text className="text-sm text-destructive">
            Falta registrada ({existingAbsence.count} aula{existingAbsence.count > 1 ? 's' : ''})
          </Text>
        </View>
      )}

      <View className="mt-1">
        {item.nestedItems.map((nestedItem, index) => {
          const nestedTop = index * (NESTED_ITEM_FIXED_HEIGHT + NESTED_ITEM_VERTICAL_GAP);
          const color = palette.item(nestedItem);
          return (
            <TouchableOpacity
              key={nestedItem.id}
              onPress={() => onPressItem(nestedItem)}
              hitSlop={4}
              style={{
                top: nestedTop,
                height: NESTED_ITEM_FIXED_HEIGHT,
                position: 'absolute',
                left: 0,
                right: 0,
                minHeight: 32,
                backgroundColor: color.tint,
              }}
              className="flex-row items-center overflow-hidden rounded">
              <View
                style={{ width: NESTED_ACCENT_WIDTH, backgroundColor: color.accent }}
                className="h-full"
              />
              <Text variant="caption1" className="flex-1 px-2 font-medium" numberOfLines={1}>
                {nestedItem.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

export const CalendarDayView = ({
  className,
  items = [],
  classItems = [],
  savedEvents = [],
  day,
  onPressItem,
  onPressClass,
}: CalendarDayViewProps) => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [laneHeight, setLaneHeight] = useState(0);
  const palette = useCalendarColors();

  useFocusEffect(() => {
    setCurrentHour(new Date().getHours());
  });

  const occurrences = useMemo(() => {
    const now = Date.now();
    const referenceDay = day ?? new Date();
    const allDay: SavedEventOccurrence<'allDay'>[] = [];
    const timed: SavedEventOccurrence<'timed'>[] = [];

    savedEvents.forEach((saved) => {
      const occurrence = expandSavedEvent(saved, referenceDay, now);
      if (!occurrence) return;
      if (occurrence.kind === 'allDay') allDay.push({ saved, occurrence });
      else timed.push({ saved, occurrence });
    });

    timed.sort((a, b) => a.occurrence.start.getTime() - b.occurrence.start.getTime());
    return { allDay, timed };
  }, [savedEvents, day]);

  const layout = useMemo(() => {
    // Class items already arrive as merged runs (one per consecutive block) from
    // generateSemesterCalendar, each carrying its true `endDate`. We only need to
    // position them; no re-merging or duration assumptions required.
    const positionedClasses: PositionedClassItem[] = classItems
      .map((item) => {
        const date = new Date(item.date);
        // Prefer the real block end; fall back to slot-count * duration for
        // legacy items persisted before `endDate` existed.
        const endTime = item.endDate
          ? new Date(item.endDate)
          : new Date(date.getTime() + (item.consecutiveClasses + 1) * CLASS_DURATION * 60 * 1000);
        return { ...item, date, endTime, type: 'class' as const };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const layoutedClasses: LayoutedClass[] = [];
    const otherItems = items
      .map((item) => ({
        ...item,
        date: new Date(item.date),
        endTime: new Date(new Date(item.date).getTime() + 60 * 60 * 1000),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const processedOtherIds = new Set<string>();

    positionedClasses.forEach((classItem) => {
      const start = classItem.date;
      const top = start.getHours() * HOUR_HEIGHT + (start.getMinutes() / 60) * HOUR_HEIGHT;
      const durH = (classItem.endTime.getTime() - start.getTime()) / (1000 * 60 * 60);

      const nestedItems: PositionedItem[] = [];
      otherItems.forEach((otherItem) => {
        if (processedOtherIds.has(otherItem.id)) return;

        if (otherItem.date >= classItem.date && otherItem.date < classItem.endTime) {
          nestedItems.push(otherItem);
          processedOtherIds.add(otherItem.id);
        }
      });

      nestedItems.sort((a, b) => a.date.getTime() - b.date.getTime());

      const nestedStackHeight =
        nestedItems.length > 0
          ? nestedItems.length * NESTED_ITEM_FIXED_HEIGHT +
            (nestedItems.length - 1) * NESTED_ITEM_VERTICAL_GAP
          : 0;

      const height = Math.max(
        durH * HOUR_HEIGHT,
        nestedStackHeight + NESTED_ITEMS_HEADER_OFFSET,
        NESTED_ITEM_FIXED_HEIGHT + VERTICAL_GAP
      );

      layoutedClasses.push({ ...classItem, top, height, nestedItems });
    });

    // Eventos com hora ancoram no horário real, igual às aulas (duração de verdade).
    // Não recebem chips aninhados: tarefas/provas que caem dentro deles são
    // simplesmente empurradas pra baixo pelo laço de colisão abaixo.
    const layoutedEvents: LayoutedEvent[] = occurrences.timed.map((entry) => {
      const { start, end, continuesFromPrev } = entry.occurrence;
      const top = continuesFromPrev
        ? 0
        : start.getHours() * HOUR_HEIGHT + (start.getMinutes() / 60) * HOUR_HEIGHT;
      const durH = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return { ...entry, top, height: Math.max(durH * HOUR_HEIGHT, EVENT_MIN_HEIGHT) };
    });

    const layoutedOthers: LayoutedOther[] = [];
    const occupiedUntil: { bottom: number }[] = [];

    otherItems.forEach((item) => {
      if (processedOtherIds.has(item.id)) return;

      const start = item.date;
      const currentTop = start.getHours() * HOUR_HEIGHT + (start.getMinutes() / 60) * HOUR_HEIGHT;
      const currentHeight = OTHER_ITEM_FIXED_HEIGHT;
      let currentBottom = currentTop + currentHeight;

      let adjustedTop = currentTop;

      occupiedUntil.forEach((slot) => {
        if (adjustedTop < slot.bottom) {
          adjustedTop = slot.bottom + VERTICAL_GAP;
        }
      });

      let collision = true;
      while (collision) {
        collision = false;
        currentBottom = adjustedTop + currentHeight;
        for (const placed of layoutedOthers) {
          if (adjustedTop < placed.top + placed.height && currentBottom > placed.top) {
            adjustedTop = placed.top + placed.height + VERTICAL_GAP;
            collision = true;
            break;
          }
        }
        for (const classBlock of layoutedClasses) {
          if (adjustedTop < classBlock.top + classBlock.height && currentBottom > classBlock.top) {
            adjustedTop = classBlock.top + classBlock.height + VERTICAL_GAP;
            collision = true;
            break;
          }
        }
        for (const eventBlock of layoutedEvents) {
          if (adjustedTop < eventBlock.top + eventBlock.height && currentBottom > eventBlock.top) {
            adjustedTop = eventBlock.top + eventBlock.height + VERTICAL_GAP;
            collision = true;
            break;
          }
        }
      }

      layoutedOthers.push({
        ...item,
        top: adjustedTop,
        height: currentHeight,
      });
    });

    return { layoutedClasses, layoutedOthers, layoutedEvents };
  }, [items, classItems, occurrences]);

  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({ hour: i, isNow: i === currentHour }));
  }, [currentHour]);

  useEffect(() => {
    const targetScroll = Math.max(0, currentHour * HOUR_HEIGHT - HOUR_HEIGHT + laneHeight);
    setTimeout(() => scrollRef.current?.scrollTo({ y: targetScroll, animated: true }), 100);
  }, [currentHour, laneHeight]);

  return (
    <ScrollView
      ref={scrollRef}
      className={cn('flex-1', className)}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-24">
      {occurrences.allDay.length > 0 && (
        <AllDayLane
          occurrences={occurrences.allDay}
          onLayoutHeight={setLaneHeight}
          palette={palette}
        />
      )}

      <View className="relative">
        {hours.map(({ hour, isNow }) => (
          <View
            key={`hour-${hour}`}
            className={cn(
              'h-[72px] flex-row border-b border-gray-200 dark:border-gray-800',
              isNow && 'bg-primary/5 dark:bg-primary/10'
            )}>
            <View className="w-16 items-end justify-start py-3 pr-2">
              <Text
                className={cn(
                  'text-xs',
                  isNow ? 'font-medium text-primary' : 'text-gray-500 dark:text-gray-400'
                )}>
                {hour.toString().padStart(2, '0')}:00
              </Text>
            </View>
            <View className="flex-1 border-l border-gray-200 dark:border-gray-800" />
          </View>
        ))}

        <View
          style={{
            position: 'absolute',
            top: 0,
            left: TIME_LABEL_WIDTH,
            right: SIDE_PADDING,
            bottom: 0,
          }}>
          {layout.layoutedClasses.map((classItem) => (
            <ClassItem
              key={classItem.id}
              item={classItem}
              onPressClass={onPressClass}
              onPressItem={onPressItem}
              palette={palette}
            />
          ))}

          {layout.layoutedEvents.map((event) => (
            <EventBlock key={event.saved.eventId} item={event} palette={palette} />
          ))}

          {layout.layoutedOthers.map((item) => {
            const color = palette.item(item);
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onPressItem(item)}
                className={cn(
                  'absolute left-0 right-0 flex-row overflow-hidden rounded-lg',
                  'border border-gray-300 dark:border-gray-700'
                )}
                style={{ top: item.top, backgroundColor: color.tint }}>
                <View style={{ backgroundColor: color.accent, width: EVENT_ACCENT_WIDTH }} />
                <View className="flex-1 flex-col px-3 py-1">
                  <Text variant="caption2" numberOfLines={1}>
                    {item.subject.name}
                  </Text>
                  <Text variant="subhead" className="flex-1" numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};
