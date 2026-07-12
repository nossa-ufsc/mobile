import { MMKV } from 'react-native-mmkv';

// PostHog defaults to file-based storage via `expo-file-system` when no custom
// storage is provided. In SDK 54+ those legacy `expo-file-system` methods throw,
// so we back PostHog with MMKV instead (already used across the app).
const storage = new MMKV({ id: 'posthog-storage' });

export const posthogStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
};
