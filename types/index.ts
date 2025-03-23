export interface User {
  id: string;
  name: string;
  enrollmentNumber: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classGroup: string;
  weeklyClassCount: number;
  absenceCount: number;
  professors: string[];
  schedule: SubjectTime[];
}

export interface SubjectTime {
  weekDay: string;
  startTime: string;
  center: string;
  room: string;
}

export interface CAGRSystemResponse {
  disciplinas?: {
    nome: string;
    codigoDisciplina: string;
    numeroAulas: number;
  }[];
  horarios?: {
    codigoDisciplina: string;
    codigoTurma: string;
    diaSemana: string;
    horario: string;
    localizacaoCentro: string;
    localizacaoEspacoFisico: string;
  }[];
  professores?: {
    codigoDisciplina: string;
    professores: string[];
  }[];
}
