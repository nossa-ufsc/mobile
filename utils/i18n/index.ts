import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';
import es from './locales/es.json';

export type SupportedLanguage = 'pt-BR' | 'en-US' | 'es';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['pt-BR', 'en-US', 'es'];

export const detectDeviceLanguage = (): SupportedLanguage => {
  const deviceLanguageCode = Localization.getLocales()[0]?.languageCode;

  if (deviceLanguageCode === 'pt') return 'pt-BR';
  if (deviceLanguageCode === 'es') return 'es';
  return 'en-US';
};

i18next.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    'en-US': { translation: enUS },
    es: { translation: es },
  },
  lng: detectDeviceLanguage(),
  fallbackLng: 'pt-BR',
  interpolation: {
    escapeValue: false,
  },
});

export const i18n = i18next;
