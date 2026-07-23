import { Text } from '@/ui/text';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

export const NoClasses = () => {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center pt-36">
      <Text className="text-lg font-medium">{t('home.noClassesTitle')}</Text>
      <Text className="mt-2 text-center text-muted-foreground">
        {t('home.noClassesSubtitle')}
      </Text>
    </View>
  );
};
