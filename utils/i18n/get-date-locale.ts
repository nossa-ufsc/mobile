import { i18n } from './index';

const DATE_LOCALES: Record<string, string> = {
  'pt-BR': 'pt-BR',
  'en-US': 'en-US',
  es: 'es-ES',
};

export const getDateLocale = (): string => DATE_LOCALES[i18n.language] ?? 'pt-BR';
