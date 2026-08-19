import { useState } from 'react';
import { LayoutAnimation, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { CalendarColorKind } from '@/types';
import { Container } from '@/ui/container';
import { Text } from '@/ui/text';
import { cn } from '@/utils/cn';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import {
  ColorSwatchPicker,
  useColorName,
} from '@/features/calendar/components/color-swatch-picker';
import { useCalendarColors } from '@/features/calendar/hooks/use-calendar-colors';
import {
  CALENDAR_COLOR_KINDS,
  DEFAULT_TYPE_COLORS,
} from '@/features/calendar/utils/calendar-colors';

export const CalendarColorsScreen = () => {
  const { t } = useTranslation();
  const { colors } = useColorScheme();
  const colorName = useColorName();
  const palette = useCalendarColors();
  const prefs = useEnvironmentStore((state) => state.calendarTypeColors);
  const setCalendarTypeColor = useEnvironmentStore((state) => state.setCalendarTypeColor);
  const [expandedKind, setExpandedKind] = useState<CalendarColorKind | null>(null);

  const kindLabel = (kind: CalendarColorKind) =>
    kind === 'class' ? t('calendarColors.kinds.class') : t(`calendarItemSheet.types.${kind}`);

  const toggle = (kind: CalendarColorKind) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedKind((current) => (current === kind ? null : kind));
  };

  return (
    <Container scrollable edges={['right', 'left']}>
      <Text variant="footnote" className="mb-2 px-2 text-gray-500">
        {t('calendarColors.description')}
      </Text>
      <View className="mb-6 rounded-lg bg-card">
        {CALENDAR_COLOR_KINDS.map((kind, index) => {
          const isLast = index === CALENDAR_COLOR_KINDS.length - 1;
          const expanded = expandedKind === kind;
          const { accent } = palette.kind(kind);
          return (
            <View
              key={kind}
              className={cn(!isLast && 'border-b border-gray-400/20 dark:border-gray-200/10')}>
              <TouchableOpacity
                onPress={() => toggle(kind)}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                className="flex-row items-center justify-between px-4 py-3">
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-8 w-8 rounded-full shadow-sm"
                    style={{ backgroundColor: accent }}
                  />
                  <Text variant="body">{kindLabel(kind)}</Text>
                </View>
                <View className="flex-row items-center">
                  <Text variant="subhead" color="primary" className="mr-2">
                    {colorName(prefs[kind])}
                  </Text>
                  <MaterialCommunityIcons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.grey}
                  />
                </View>
              </TouchableOpacity>
              {expanded && (
                <View className="px-4 pb-4">
                  <ColorSwatchPicker
                    layout="grid"
                    value={prefs[kind]}
                    defaultColor={DEFAULT_TYPE_COLORS[kind]}
                    onChange={(color) => setCalendarTypeColor(kind, color)}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </Container>
  );
};
