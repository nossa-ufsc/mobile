import { useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';

const COLLAPSED_LINES = 8;

interface EventDescriptionProps {
  text: string;
}

/** Texto corrido do evento, recolhido em 8 linhas com "Ler mais" quando é longo. */
export const EventDescription = ({ text }: EventDescriptionProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const clean = text.trim();
  // Heurística determinística (onTextLayout não é confiável no UITextView).
  const isLong = clean.length > 420 || clean.split('\n').length > COLLAPSED_LINES;

  return (
    <View>
      <Text
        variant="body"
        selectable
        className="text-foreground/85 leading-6"
        numberOfLines={isLong && !expanded ? COLLAPSED_LINES : undefined}>
        {clean}
      </Text>
      {isLong && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            Haptics.selectionAsync();
            setExpanded((v) => !v);
          }}
          hitSlop={8}
          className="mt-2 self-start active:opacity-60">
          <Text variant="subhead" className="font-semibold text-primary">
            {expanded ? t('events.readLess') : t('events.readMore')}
          </Text>
        </Pressable>
      )}
    </View>
  );
};
