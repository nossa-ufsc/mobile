import * as NavigationBar from 'expo-navigation-bar';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

import { COLORS } from '@/theme/colors';

const themeStorage = new MMKV({
  id: 'theme-storage',
});

function useColorScheme() {
  const { colorScheme, setColorScheme: setNativeWindColorScheme } = useNativewindColorScheme();

  React.useEffect(() => {
    const stored = themeStorage.getString('theme');
    if (stored === 'light' || stored === 'dark') {
      setNativeWindColorScheme(stored);
    }
  }, []);

  async function setColorScheme(newColorScheme: 'light' | 'dark') {
    setNativeWindColorScheme(newColorScheme);
    themeStorage.set('theme', newColorScheme);

    if (Platform.OS !== 'android') return;
    try {
      await setNavigationBar(newColorScheme);
    } catch (error) {
      console.error('useColorScheme.tsx", "setColorScheme', error);
    }
  }

  function toggleColorScheme() {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light';
    return setColorScheme(newScheme);
  }

  const effectiveColorScheme = colorScheme ?? 'light';

  return {
    colorScheme: effectiveColorScheme,
    isDarkColorScheme: effectiveColorScheme === 'dark',
    setColorScheme,
    toggleColorScheme,
    colors: COLORS[effectiveColorScheme],
  };
}

/**
 * Set the Android navigation bar color based on the color scheme.
 */
function useInitialAndroidBarSync() {
  const { colorScheme } = useColorScheme();
  React.useEffect(() => {
    if (Platform.OS !== 'android') return;
    setNavigationBar(colorScheme).catch((error) => {
      console.error('useColorScheme.tsx", "useInitialColorScheme', error);
    });
  }, []);
}

export { useColorScheme, useInitialAndroidBarSync };

function setNavigationBar(colorScheme: 'light' | 'dark') {
  return Promise.all([NavigationBar.setStyle(colorScheme === 'dark' ? 'light' : 'dark')]);
}
