import 'react-native-url-polyfill/auto';
import { SupportedStorage, createClient } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';

// Em desenvolvimento o Supabase não é utilizado (os hooks retornam dados mockados),
// mas o createClient roda no escopo do módulo e lança sem as variáveis de ambiente.
// Valores placeholder permitem iniciar o app sem .env, conforme o README.
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? (__DEV__ ? 'http://localhost:54321' : undefined);
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? (__DEV__ ? 'dev-placeholder-anon-key' : undefined);

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
