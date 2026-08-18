import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps } from 'react';

export interface NewsItem {
  /** Stable id used to track whether the user has seen this item. Never reuse. */
  id: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  description: string;
  /** Optional external URL surfaced as a tappable link on the slide. */
  link?: {
    label: string;
    url: string;
  };
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
  {
    id: 'open-source',
    icon: 'github',
    title: 'Agora somos open source',
    description:
      'Tem alguma ideia ou algo te incomoda no app? Agora o código é aberto: contribua com melhorias e ajude a construir o Nossa UFSC. Toda ajuda é bem-vinda!',
    link: {
      label: 'Ver no GitHub',
      url: 'https://github.com/nossa-ufsc/mobile',
    },
  },
  {
    id: 'menu-v2',
    icon: 'silverware-fork-knife',
    title: 'Cardápio do RU de cara nova',
    description:
      'O cardápio agora é sincronizado automaticamente com o site do seu RU. Quando informado, você também pode ver o almoço e jantar separados, alergênicos (glúten, lácteos) e os ingredientes de cada prato.',
  },
  {
    id: 'events-v2',
    icon: 'calendar-star',
    title: 'Eventos da UFSC no app',
    description:
      'A aba Eventos agora traz automaticamente a agenda oficial da UFSC - palestras, cursos, atividades de cultura, esporte e mais.'
  },
];
