import 'react-native-url-polyfill/auto';
import { SupportedStorage, createClient } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const storage = new MMKV({ id: 'supabase-storage' });

const mmkvSupabaseSupportedStorage = {
  setItem: (key, data) => storage.set(key, data),
  getItem: (key) => storage.getString(key) ?? null,
  removeItem: (key) => storage.delete(key),
} satisfies SupportedStorage;

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: mmkvSupabaseSupportedStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
