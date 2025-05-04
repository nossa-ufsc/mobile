import { Campus, Event } from '@/types';

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    created_at: '2024-01-01T10:00:00Z',
    name: 'Semana Acadêmica de Computação',
    start_date: '2026-03-15T13:00:00Z',
    end_date: '2026-03-19T22:00:00Z',
    location: 'CTC - Centro Tecnológico',
    image_url:
      'https://img.freepik.com/free-photo/blank-catalog-magazines-book-mock-up-blue-background_1232-4969.jpg',
    campus: Campus.FLORIANOPOLIS,
    created_by: {
      name: 'João Silva',
      enrollmentNumber: '20240001',
    },
  },
  {
    id: '2',
    created_at: '2024-01-05T14:30:00Z',
    name: 'Workshop de Inteligência Artificial',
    start_date: '2026-03-20T09:00:00Z',
    end_date: '2026-03-20T17:00:00Z',
    location: 'Auditório do INE',
    image_url:
      'https://img.freepik.com/free-photo/blank-catalog-magazines-book-mock-up-blue-background_1232-4969.jpg',
    campus: Campus.FLORIANOPOLIS,
    created_by: {
      name: 'Maria Santos',
      enrollmentNumber: '20240002',
    },
  },
  {
    id: '3',
    created_at: '2024-01-10T09:15:00Z',
    name: 'Palestra: Mercado de Trabalho em TI',
    start_date: '2026-03-25T19:00:00Z',
    end_date: '2026-03-25T21:00:00Z',
    location: 'Sala EFI-302',
    image_url:
      'https://img.freepik.com/free-photo/blank-catalog-magazines-book-mock-up-blue-background_1232-4969.jpg',
    campus: Campus.JOINVILLE,
    created_by: {
      name: 'Pedro Oliveira',
      enrollmentNumber: '20240003',
    },
  },
];
