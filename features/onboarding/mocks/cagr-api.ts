import { User, Subject } from '@/types';

export const mockFetchUserInformation = async (): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    id: '20240001',
    name: 'Maria Silva',
    enrollmentNumber: '20240001',
  };
};

export const mockFetchSubjects = async (): Promise<Subject[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: 'ARQ7101',
      name: 'História e Teoria da Arquitetura I',
      code: 'ARQ7101',
      classGroup: '01208A',
      weeklyClassCount: 2,
      absences: [],
      professors: ['Ana Carolina Santos'],
      schedule: [
        {
          weekDay: 1,
          startTime: '08:20',
          endTime: '09:10',
          center: 'CTC',
          room: 'ARQ108',
        },
        {
          weekDay: 1,
          startTime: '09:10',
          endTime: '10:00',
          center: 'CTC',
          room: 'ARQ108',
        },
      ],
    },
    {
      id: 'ARQ7102',
      name: 'Desenho Arquitetônico I',
      code: 'ARQ7102',
      classGroup: '01208A',
      weeklyClassCount: 4,
      absences: [],
      professors: ['Roberto Oliveira'],
      schedule: [
        {
          weekDay: 2,
          startTime: '18:30',
          endTime: '19:20',
          center: 'CTC',
          room: 'ARQ205',
        },
        {
          weekDay: 2,
          startTime: '19:20',
          endTime: '20:10',
          center: 'CTC',
          room: 'ARQ205',
        },
        {
          weekDay: 4,
          startTime: '18:30',
          endTime: '19:20',
          center: 'CTC',
          room: 'ARQ205',
        },
        {
          weekDay: 4,
          startTime: '19:20',
          endTime: '20:10',
          center: 'CTC',
          room: 'ARQ205',
        },
      ],
    },
    {
      id: 'ARQ7103',
      name: 'Projeto Arquitetônico I',
      code: 'ARQ7103',
      classGroup: '01208A',
      weeklyClassCount: 4,
      absences: [],
      professors: ['Mariana Costa'],
      schedule: [
        {
          weekDay: 3,
          startTime: '20:20',
          endTime: '21:10',
          center: 'CTC',
          room: 'ARQ301',
        },
        {
          weekDay: 3,
          startTime: '21:10',
          endTime: '22:00',
          center: 'CTC',
          room: 'ARQ301',
        },
        {
          weekDay: 5,
          startTime: '20:20',
          endTime: '21:10',
          center: 'CTC',
          room: 'ARQ301',
        },
        {
          weekDay: 5,
          startTime: '21:10',
          endTime: '22:00',
          center: 'CTC',
          room: 'ARQ301',
        },
      ],
    },
  ];
};
