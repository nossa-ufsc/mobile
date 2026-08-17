import { Linking, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';
import { useColorScheme } from '@/utils/use-color-scheme';
import { getDateLocale } from '@/utils/i18n/get-date-locale';

interface MenuSourceFooterProps {
  sourceUrl?: string;
  updatedAt?: string;
}

export const MenuSourceFooter = ({ sourceUrl, updatedAt }: MenuSourceFooterProps) => {
  const { t } = useTranslation();
  const { colors } = useColorScheme();
  if (!sourceUrl && !updatedAt) return null;

  const updated = updatedAt ? new Date(updatedAt) : null;
  const updatedLabel =
    updated && !isNaN(updated.getTime())
      ? updated.toLocaleString(getDateLocale(), {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

  return (
    <View className="mt-2 items-center gap-1.5 px-2 pb-2">
      {sourceUrl && (
        <Pressable
          accessibilityRole="link"
          onPress={() => {
            Haptics.selectionAsync();
            Linking.openURL(sourceUrl).catch(() => {});
          }}
          className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5 active:opacity-60">
          <Ionicons name="document-text-outline" size={14} color={colors.primary} />
          <Text variant="footnote" className="font-medium text-primary">
            {t('menu.openSource')}
          </Text>
          <Ionicons name="open-outline" size={12} color={colors.primary} />
        </Pressable>
      )}
      {updatedLabel && (
        <Text variant="caption2" color="quarternary">
          {t('menu.updatedAt', { date: updatedLabel })}
        </Text>
      )}
    </View>
  );
};
