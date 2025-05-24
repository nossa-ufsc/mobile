export enum Campus {
  ARARANGUA = 'ararangua',
  FLORIANOPOLIS = 'florianopolis',
  JOINVILLE = 'joinville',
  BLUMENAU = 'blumenau',
  CURITIBANOS = 'curitibanos',
}

interface EventCreator {
  name: string;
  enrollmentNumber: string;
}

export interface Event {
  id: string;
  created_at: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  image_url: string;
  campus: Campus;
  created_by: EventCreator;
}

export interface User {
  id: string;
  name: string;
  enrollmentNumber: string;
}

export interface AbsenceEntry {
  id: string;
  date: string;
  count: number;
  isManual: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classGroup: string;
  weeklyClassCount: number;
  absences: AbsenceEntry[];
  professors: string[];
  schedule: SubjectTime[];
}

export interface SubjectTime {
  weekDay: number;
  startTime: string;
  endTime: string;
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
    diaSemana: number;
    horario: string;
    localizacaoCentro: string;
    localizacaoEspacoFisico: string;
  }[];
  professores?: {
    codigoDisciplina: string;
    professores: {
      nomeProfessor: string;
    }[];
  }[];
}

export interface CalendarItem {
  id: string;
  title: string;
  description?: string;
  date: Date;
  subject: Subject;
  type: 'task' | 'exam' | 'assignment';
  notificationEnabled?: boolean;
  notificationDate?: Date;
  notificationId?: string;
}

export interface CalendarClassItem extends Omit<CalendarItem, 'type'> {
  consecutiveClasses: number;
}

export interface MenuItem {
  dia: string;
  data: string;
  itens: string[];
}

export interface Menu {
  cardapio: MenuItem[] | { url_imagem: string };
  diaInicial: string | null;
  diaFinal: string | null;
}
