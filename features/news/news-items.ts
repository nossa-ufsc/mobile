import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps } from 'react';

export interface NewsItem {
  /** Stable id used to track whether the user has seen this item. Never reuse. */
  id: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  description: string;
}

// Add a new entry (with a fresh `id`) to announce a feature. Items are shown once
// per person, oldest-first; already-seen items are skipped automatically.
export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'edit-classes',
    icon: 'pencil',
    title: 'Edite suas disciplinas',
    description:
      'Agora você pode escolher quais disciplinas acompanhar e ajustar a sala e o horário de cada aula. Acesse em Configurações → Editar disciplinas.',
  },
  {
    id: 'widgets',
    icon: 'widgets',
    title: 'Widgets na tela inicial',
    description:
      'Adicione o widget do Nossa UFSC à sua tela inicial e veja as aulas do dia sem abrir o app.',
  },
];
