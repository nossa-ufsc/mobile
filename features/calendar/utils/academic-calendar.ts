import { AcademicCalendar, Campus, Subject } from '@/types';
import bundledCalendars from '../data/academic-calendars.json';
import { getSemesterStartDate } from './get-semester-start-date';

/**
 * Calendário acadêmico oficial (PDF do DAE → tabela `academic_calendars`).
 *
 * O app usa o calendário do semestre × campus do usuário para: (1) ancorar o
 * calendário de aulas nas datas reais de início/término, (2) não gerar aula em
 * feriado/dia não letivo e (3) calcular o limite de faltas com o número real de
 * dias letivos por dia da semana. Quando não há calendário (semestre antigo, sem
 * rede e sem fallback empacotado, ou o usuário escolheu manual), tudo cai no
 * comportamento anterior: `semesterDuration` semanas a partir de uma data chutada.
 */

const BUNDLED = bundledCalendars as AcademicCalendar[];

/** "2026.2" a partir do `semestre` do CAGR (YYYYN); sem ele, infere pela data atual. */
export const getSemesterKey = (semester?: number | null, now = new Date()): string => {
  if (semester && semester > 0) {
    return `${Math.floor(semester / 10)}.${semester % 10}`;
  }
  return `${now.getFullYear()}.${now.getMonth() <= 5 ? 1 : 2}`;
};

/** Data local → "YYYY-MM-DD" (sem UTC, para bater com as datas do calendário). */
export const toLocalIsoDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** "YYYY-MM-DD" → Date local à meia-noite. */
export const fromIsoDate = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

export const getBundledAcademicCalendar = (
  semesterKey: string,
  campus: Campus | null
): AcademicCalendar | null => {
  if (!campus) return null;
  return BUNDLED.find((c) => c.semester === semesterKey && c.campus === campus) ?? null;
};

/**
 * Tudo que o gerador de aulas e o cálculo de faltas precisam saber sobre o
 * semestre, já resolvido entre "oficial" e "manual".
 */
export interface SemesterPlan {
  source: 'official' | 'manual';
  /** Primeiro dia letivo (meia-noite local). */
  startDate: Date;
  /** Último dia letivo, inclusivo (meia-noite local). Null no modo manual. */
  endDate: Date | null;
  /** Semanas de calendário a gerar a partir da semana de `startDate`. */
  weeks: number;
  /** "YYYY-MM-DD" sem aula (feriados do campus + dias não letivos). */
  skipDates: Set<string>;
  calendar: AcademicCalendar | null;
}

export interface ResolveSemesterPlanInput {
  semester: number | null;
  semesterDuration: number;
  academicCalendar: AcademicCalendar | null;
  campus: Campus | null;
}

/** O calendário do store só vale se for do semestre × campus atual. */
export const getStoredCalendarFor = (
  academicCalendar: AcademicCalendar | null,
  semesterKey: string,
  campus: Campus | null
): AcademicCalendar | null =>
  academicCalendar &&
  academicCalendar.semester === semesterKey &&
  academicCalendar.campus === campus
    ? academicCalendar
    : null;

/**
 * Decide o plano do semestre. Prefere o calendário salvo no store (vindo do
 * Supabase); se não houver, tenta o empacotado; sem nenhum dos dois (semestre sem
 * calendário publicado, campus não escolhido), usa `semesterDuration` semanas a
 * partir de `getSemesterStartDate` — o único caso em que a duração é editável.
 */
export const resolveSemesterPlan = (input: ResolveSemesterPlanInput): SemesterPlan => {
  const semesterKey = getSemesterKey(input.semester);
  const calendar =
    getStoredCalendarFor(input.academicCalendar, semesterKey, input.campus) ??
    getBundledAcademicCalendar(semesterKey, input.campus);

  if (calendar) {
    return {
      source: 'official',
      startDate: fromIsoDate(calendar.startDate),
      endDate: fromIsoDate(calendar.endDate),
      weeks: calendar.weeks,
      skipDates: new Set([...calendar.holidays, ...calendar.nonClassDays].map((d) => d.date)),
      calendar,
    };
  }
  return {
    source: 'manual',
    startDate: getSemesterStartDate(input.semester),
    endDate: null,
    weeks: input.semesterDuration,
    skipDates: new Set(),
    calendar: null,
  };
};

/**
 * Total de aulas da disciplina no semestre. Com calendário oficial, soma por dia da
 * semana (nº real de dias letivos naquele dia × aulas do slot); no manual, mantém a
 * aproximação antiga (aulas por semana × semanas).
 */
export const countSemesterClasses = (subject: Subject, plan: SemesterPlan): number => {
  if (plan.calendar) {
    // Sem horário cadastrado (TCC, estágio, "a definir"): não dá para saber o dia da
    // semana; aproxima com a média de dias letivos de seg–sex do semestre.
    if (subject.schedule.length === 0) {
      const weekdays = plan.calendar.classDaysByWeekday.slice(0, 5);
      const avgDays = Math.round(weekdays.reduce((a, b) => a + b, 0) / weekdays.length);
      return subject.weeklyClassCount * avgDays;
    }
    return subject.schedule.reduce((total, slot) => {
      // slot.weekDay é índice JS (0 = domingo); classDaysByWeekday é seg..sáb.
      const days =
        slot.weekDay >= 1 && slot.weekDay <= 6
          ? (plan.calendar!.classDaysByWeekday[slot.weekDay - 1] ?? 0)
          : 0;
      return total + days * (slot.classCount ?? 1);
    }, 0);
  }
  return subject.weeklyClassCount * plan.weeks;
};

/**
 * Mesmo plano na prática? Compara só o que muda a geração de aulas (início, término,
 * semanas, dias sem aula) — o empacotado e o remoto costumam ser idênticos e aí não
 * vale regenerar aulas/notificações.
 */
export const isSameSemesterPlan = (a: SemesterPlan, b: SemesterPlan): boolean =>
  a.source === b.source &&
  a.startDate.getTime() === b.startDate.getTime() &&
  (a.endDate?.getTime() ?? null) === (b.endDate?.getTime() ?? null) &&
  a.weeks === b.weeks &&
  a.skipDates.size === b.skipDates.size &&
  [...a.skipDates].every((d) => b.skipDates.has(d));

/** Mesmo calendário? (para decidir se vale gravar no store). */
export const isSameAcademicCalendar = (
  a: AcademicCalendar | null,
  b: AcademicCalendar | null
): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.semester === b.semester &&
    a.campus === b.campus &&
    a.startDate === b.startDate &&
    a.endDate === b.endDate &&
    a.weeks === b.weeks &&
    a.classDaysByWeekday.join(',') === b.classDaysByWeekday.join(',') &&
    JSON.stringify(a.holidays) === JSON.stringify(b.holidays) &&
    JSON.stringify(a.nonClassDays) === JSON.stringify(b.nonClassDays)
  );
};
