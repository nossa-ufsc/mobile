import { View } from 'react-native';
import { Text } from '@/ui/text';
import { useTranslation } from 'react-i18next';

export const EventsEmptyState = () => {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-lg" color="primary" variant="heading">
        {t('events.emptyTitle')}
      </Text>
      <Text className="mt-1 text-center" color="tertiary" variant="body">
        {t('events.emptySubtitle')}
      </Text>
    </View>
  );
};
