import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import type { CalendarColor, CalendarPaletteKey } from '@/types';
import { cn } from '@/utils/cn';
import { useColorScheme } from '@/utils/use-color-scheme';
import { CALENDAR_PALETTE, toAccent } from '../utils/calendar-colors';

const SWATCH_SIZE = 36;
const RING_WIDTH = 2;
const RING_GAP = 2;
const CELL_SIZE = SWATCH_SIZE + 2 * (RING_WIDTH + RING_GAP);
const DEFAULT_DOT_SIZE = 12;

interface ColorSwatchPickerProps {
  value: CalendarColor | undefined;
  onChange: (color: CalendarColor | undefined) => void;
  defaultColor: CalendarColor;
  layout: 'grid' | 'row';
  className?: string;
}

export const useColorName = () => {
  const { t } = useTranslation();
  return (color: CalendarColor | undefined): string => {
    if (!color) return t('calendarColors.default');
    if (color === 'primary') return t('calendarColors.names.primary');
    if (color.startsWith('#')) return color.toUpperCase();
    return t(`calendarColors.names.${color as CalendarPaletteKey}`);
  };
};

interface SwatchProps {
  accent: string;
  selected: boolean;
  label: string;
  isDefault?: boolean;
  onPress: () => void;
}

const Swatch = ({ accent, selected, label, isDefault, onPress }: SwatchProps) => {
  const { colors } = useColorScheme();
  const ringColor = selected ? colors.foreground : isDefault ? colors.grey3 : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      hitSlop={4}
      onPress={() => {
        if (selected) return;
        Haptics.selectionAsync();
        onPress();
      }}
      className="items-center active:opacity-70">
      <View
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          borderRadius: CELL_SIZE / 2,
          borderWidth: RING_WIDTH,
          borderColor: ringColor,
          padding: RING_GAP,
        }}>
        <View
          className="flex-1 items-center justify-center rounded-full"
          style={{ backgroundColor: isDefault ? 'transparent' : accent }}>
          {isDefault ? (
            <View
              style={{
                width: DEFAULT_DOT_SIZE,
                height: DEFAULT_DOT_SIZE,
                borderRadius: DEFAULT_DOT_SIZE / 2,
                backgroundColor: accent,
              }}
            />
          ) : (
            selected && <Ionicons name="checkmark" size={18} color="white" />
          )}
        </View>
      </View>
    </Pressable>
  );
};

export const ColorSwatchPicker = ({
  value,
  onChange,
  defaultColor,
  layout,
  className,
}: ColorSwatchPickerProps) => {
  const { t } = useTranslation();
  const { colors } = useColorScheme();
  const colorName = useColorName();
  const defaultAccent = toAccent(defaultColor, { primary: colors.primary }) ?? colors.primary;

  const cells = (
    <>
      <Swatch
        accent={defaultAccent}
        selected={value === undefined}
        label={t('calendarColors.default')}
        isDefault
        onPress={() => onChange(undefined)}
      />
      {CALENDAR_PALETTE.map(({ key, hex }) => (
        <Swatch
          key={key}
          accent={hex}
          selected={value === key}
          label={colorName(key)}
          onPress={() => onChange(key)}
        />
      ))}
    </>
  );

  if (layout === 'row') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        className={className}
        contentContainerClassName="gap-3 px-4">
        {cells}
      </ScrollView>
    );
  }

  return <View className={cn('flex-row flex-wrap gap-x-3 gap-y-3', className)}>{cells}</View>;
};
