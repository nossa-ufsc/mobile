import { getSettingsHeaderItems, HeaderButton } from '@/ui/header-button';
import { getHeaderTitleItems, HeaderTitle } from '@/ui/header-title';
import { useColorScheme } from '@/utils/use-color-scheme';
import { NewsModal } from '@/features/news/news-modal';
import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function HomeLayout() {
  const { colors } = useColorScheme();
  const { t } = useTranslation();
  return (
    <>
      <Stack screenOptions={SCREEN_OPTIONS}>
        <Stack.Screen
          name="index"
          options={{
            headerRight: () => <HeaderButton onPress={() => router.push('/modal')} />,
            unstable_headerRightItems: () => getSettingsHeaderItems(() => router.push('/modal')),
            headerLeft: () => <HeaderTitle title={t('tabs.home')} />,
            unstable_headerLeftItems: () => getHeaderTitleItems(t('tabs.home')),
            title: '',
            headerStyle: { backgroundColor: colors.background },
          }}
        />
        <Stack.Screen
          name="subject/[id]"
          options={{
            headerBackButtonDisplayMode: 'minimal',
            headerStyle: { backgroundColor: colors.background },
            title: '',
          }}
        />
      </Stack>
      <NewsModal />
    </>
  );
}

const SCREEN_OPTIONS = {
  animation: 'default',
  headerShadowVisible: false,
} as const;
