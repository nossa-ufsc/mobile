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
  /** Link externo pra ingressos (Cheers, Sympla) ou inscrição (eventos oficiais). Opcional. */
  ticket_url?: string | null;
  /** Moderação: eventos entram como `pending` e só aparecem no app depois de `approved`. */
  status?: EventStatus;
  /** De onde veio: cadastrado por aluno, importado da Cheers ou do calendário oficial da UFSC. */
  source?: EventSource;
  /** Texto corrido (parágrafos separados por \n). Só eventos oficiais têm. */
  description?: string | null;
  /** Tags cruas da fonte, em minúsculas (ex.: "palestra", "cinema"). */
  tags?: string[] | null;
  /** Categoria normalizada pelo pipeline; festas de aluno/Cheers são `festa`. */
  category?: EventCategory | null;
  /** Página do evento no site da UFSC. */
  info_url?: string | null;
  is_free?: boolean | null;
  /** Dia inteiro: `end_date` é o fim (inclusivo) do último dia. */
  is_all_day?: boolean;
  updated_at?: string | null;
  /** Perfil do organizador no Instagram (URL completa). Festas da Cheers têm. */
  instagram_url?: string | null;
  /** Faixa etária normalizada pelo pipeline (Cheers). */
  age_rating?: EventAgeRating | null;
}

export type EventStatus = 'pending' | 'approved' | 'rejected';
export type EventSource = 'user' | 'cheers' | 'ufsc';
export type EventAgeRating = 'free' | '16' | '16_accompanied' | '18' | '18_accompanied';
export type EventCategory =
  'festa' | 'palestra' | 'curso' | 'cultura' | 'academico' | 'esporte' | 'saude' | 'outro';

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
  // When true, the user has chosen to hide this subject from schedule, calendar,
  // notifications and widgets. Absent (undefined) means visible — see getActiveSubjects.
  ignored?: boolean;
  manual?: boolean;
}

export interface SubjectTime {
  weekDay: number;
  startTime: string;
  endTime: string;
  center: string;
  room: string;
  classCount?: number;
}

export interface CAGRSystemResponse {
  // CAGR semester identifier, format YYYYN (e.g. 20261 = 2026, semester 1).
  semestre?: number;
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
  // Actual end of the merged class block (accounts for arbitrary/off-grid times).
  endDate: Date;
}

/**
 * Evento da aba Eventos salvo no calendário do app. Guarda um `snapshot` dos campos
 * usados na UI pra o item continuar aparecendo mesmo se o evento sair da lista (a
 * query só traz eventos futuros do campus atual) — nunca é apagado automaticamente.
 */
export interface SavedEvent {
  /** Id do evento; é a chave (evita duplicata). */
  eventId: string;
  savedAt: string;
  snapshot: Pick<
    Event,
    | 'name'
    | 'start_date'
    | 'end_date'
    | 'is_all_day'
    | 'location'
    | 'category'
    | 'image_url'
    | 'source'
    | 'campus'
  >;
  notificationEnabled?: boolean;
  notificationDate?: string;
  notificationId?: string;
}

export type MenuCategory =
  'base' | 'carne' | 'vegetariano' | 'guarnicao' | 'salada' | 'molho' | 'sobremesa' | 'outro';

export type MenuMeal = 'almoco' | 'jantar';

export interface MenuAllergens {
  gluten?: boolean;
  lacteos?: boolean;
  origemAnimal?: boolean;
}

export interface MenuDish {
  nome: string;
  categoria: MenuCategory;
  refeicao?: MenuMeal;
  alergenos?: MenuAllergens;
  ingredientes?: string;
}

export interface MenuItem {
  dia: string;
  data: string;
  itens: string[];
  pratos?: MenuDish[];
}

export interface Menu {
  cardapio: MenuItem[] | { url_imagem: string };
  diaInicial: string | null;
  diaFinal: string | null;
  versao?: 2;
  refeicoes?: MenuMeal[];
  fonteUrl?: string;
  atualizadoEm?: string;
}
