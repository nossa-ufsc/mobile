import { User, Subject, CAGRSystemResponse } from '@/types';
import { formatNumericTime, getEndTime, cagrDayIndexToJsIndex } from '@/utils/time-mapping';

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

  const mockCAGRResponse: CAGRSystemResponse = {
    disciplinas: [
      {
        nome: 'História e Teoria da Arquitetura I',
        codigoDisciplina: 'ARQ7101',
        numeroAulas: 4,
      },
      {
        nome: 'Desenho Arquitetônico I',
        codigoDisciplina: 'ARQ7102',
        numeroAulas: 6,
      },
      {
        nome: 'Projeto Arquitetônico I',
        codigoDisciplina: 'ARQ7103',
        numeroAulas: 8,
      },
      {
        nome: 'Urbanismo e Paisagismo I',
        codigoDisciplina: 'ARQ7104',
        numeroAulas: 4,
      },
      {
        nome: 'Materiais e Técnicas Construtivas I',
        codigoDisciplina: 'ARQ7105',
        numeroAulas: 4,
      },
    ],
    horarios: [
      {
        codigoDisciplina: 'ARQ7101',
        codigoTurma: '01208A',
        diaSemana: 2,
        horario: '0820',
        localizacaoCentro: 'CTC',
        localizacaoEspacoFisico: 'ARQ-108',
      },
      {
        codigoDisciplina: 'ARQ7101',
        codigoTurma: '01208A',
        diaSemana: 2,
        horario: '0910',
        localizacaoCentro: 'CTC',
        localizacaoEspacoFisico: 'ARQ-108',
      },
      {
        codigoDisciplina: 'ARQ7102',
        codigoTurma: '01208A',
        diaSemana: 3,
        horario: '1330',
        localizacaoCentro: 'CTC',
        localizacaoEspacoFisico: 'ARQ-205',
      },
      {
        codigoDisciplina: 'ARQ7102',
        codigoTurma: '01208A',
        diaSemana: 3,
        horario: '1420',
        localizacaoCentro: 'CTC',
        localizacaoEspacoFisico: 'ARQ-205',
      },
      {
        codigoDisciplina: 'ARQ7102',
        codigoTurma: '01208A',
        diaSemana: 3,
        horario: '1510',
        localizacaoCentro: 'CTC',
        localizacaoEspacoFisico: 'ARQ-205',
      },
      {
        codigoDisciplina: 'ARQ7103',
        codigoTurma: '01208A',
        diaSemana: 4,
        horario: '0820',
        localizacaoCentro: 'CTC',
        localizacaoEspacoFisico: 'ARQ-301',
      },
      {
        codigoDisciplina: 'ARQ7103',
        codigoTurma: '01208A',
        diaSemana: 4,
        horario: '0910',
        localizacaoCentro: 'CTC',
        localizacaoEspacoFisico: 'ARQ-301',
      },
      {
        codigoDisciplina: 'ARQ7103',
        codigoTurma: '01208A',
        diaSemana: 4,
        horario: '1010',
        localizacaoCentro: 'CTC',
        localizacaoEspacoFisico: 'ARQ-301',
      },
      {
        codigoDisciplina: 'ARQ7103',
        codigoTurma: '01208A',
        diaSemana: 4,
        horario: '1100',
        localizacaoCentro: 'CTC',
        localizacaoEspacoFisico: 'ARQ-301',
      },
      {
        codigoDisciplina: 'ARQ7104',
        codigoTurma: '01208A',
        diaSemana: 5,
        horario: '1330',
        localizacaoCentro: 'CTC',
        localizacaoEspacoFisico: 'ARQ-202',
      },
      {
        codigoDisciplina: 'ARQ7104',
        codigoTurma: '01208A',
        diaSemana: 5,
        horario: '1420',
        localizacaoCentro: 'CTC',
        localizacaoEspacoFisico: 'ARQ-202',
      },
      {
        codigoDisciplina: 'ARQ7105',
        codigoTurma: '01208A',
        diaSemana: 6,
        horario: '1010',
        localizacaoCentro: 'CTC',
        localizacaoEspacoFisico: 'ARQ-105',
      },
      {
        codigoDisciplina: 'ARQ7105',
        codigoTurma: '01208A',
        diaSemana: 6,
        horario: '1100',
        localizacaoCentro: 'CTC',
        localizacaoEspacoFisico: 'ARQ-105',
      },
    ],
    professores: [
      {
        codigoDisciplina: 'ARQ7101',
        professores: [{ nomeProfessor: 'Ana Carolina Santos' }],
      },
      {
        codigoDisciplina: 'ARQ7102',
        professores: [{ nomeProfessor: 'Roberto Oliveira' }],
      },
      {
        codigoDisciplina: 'ARQ7103',
        professores: [{ nomeProfessor: 'Mariana Costa' }, { nomeProfessor: 'Pedro Mendes' }],
      },
      {
        codigoDisciplina: 'ARQ7104',
        professores: [{ nomeProfessor: 'Luiz Fernando Almeida' }],
      },
      {
        codigoDisciplina: 'ARQ7105',
        professores: [{ nomeProfessor: 'Carlos Eduardo Lima' }],
      },
    ],
  };

  const subjects: Subject[] = [];

  mockCAGRResponse.disciplinas?.forEach((subject) => {
    const subjectTimes =
      mockCAGRResponse.horarios
        ?.filter((schedule) => schedule.codigoDisciplina === subject.codigoDisciplina)
        .map((schedule) => {
          const numericTime = parseInt(schedule.horario, 10);
          const formattedStartTime = formatNumericTime(numericTime);
          return {
            weekDay: cagrDayIndexToJsIndex(schedule.diaSemana),
            startTime: formattedStartTime,
            endTime: getEndTime(formattedStartTime),
            center: schedule.localizacaoCentro,
            room: schedule.localizacaoEspacoFisico,
          };
        }) ?? [];

    const professorData = mockCAGRResponse.professores?.find(
      (p) => p.codigoDisciplina === subject.codigoDisciplina
    );
    const professors = professorData?.professores.map((p) => p.nomeProfessor) ?? [];

    const classGroup =
      mockCAGRResponse.horarios
        ?.find((h) => h.codigoDisciplina === subject.codigoDisciplina)
        ?.codigoTurma.trim() ?? '';

    subjects.push({
      id: subject.codigoDisciplina,
      name: subject.nome,
      code: subject.codigoDisciplina,
      classGroup,
      weeklyClassCount: subject.numeroAulas,
      absences: [],
      professors,
      schedule: subjectTimes,
    });
  });

  return subjects;
};
