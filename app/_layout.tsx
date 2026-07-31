import '../global.css';
import 'expo-dev-client';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Slot, ThemeProvider as NavThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';

import { useColorScheme, useInitialAndroidBarSync } from '@/utils/use-color-scheme';
import { NAV_THEME } from '@/theme';
import { posthogStorage } from '@/utils/posthog-storage';
import { i18n } from '@/utils/i18n';
import { PostHogProvider } from 'posthog-react-native';
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

const queryClient = new QueryClient();

// Em desenvolvimento o PostHog já roda com `disabled: true`, mas o provider lança
// se `apiKey` for undefined. O placeholder permite iniciar o app sem .env.
const posthogApiKey =
  process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? (__DEV__ ? 'phc-dev-placeholder' : undefined);

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      <I18nextProvider i18n={i18n}>
        <PostHogProvider
          apiKey={posthogApiKey}
          options={{
            host: 'https://us.i.posthog.com',
            disabled: __DEV__,
            customStorage: posthogStorage,
          }}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
              <BottomSheetModalProvider>
                <ActionSheetProvider>
                  <NavThemeProvider value={NAV_THEME[colorScheme]}>
                    <Slot />
                  </NavThemeProvider>
                </ActionSheetProvider>
              </BottomSheetModalProvider>
            </QueryClientProvider>
          </GestureHandlerRootView>
        </PostHogProvider>
      </I18nextProvider>
    </>
  );
}
