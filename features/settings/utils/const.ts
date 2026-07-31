import { Campus } from '@/types';

// Campus names are proper nouns and are not translated across locales.
export const CAMPUS_LABELS: Record<Campus, string> = {
  [Campus.FLORIANOPOLIS]: 'Florianópolis',
  [Campus.ARARANGUA]: 'Araranguá',
  [Campus.BLUMENAU]: 'Blumenau',
  [Campus.JOINVILLE]: 'Joinville',
  [Campus.CURITIBANOS]: 'Curitibanos',
};
