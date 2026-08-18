import { AcademicCalendar, Campus } from '@/types';
import { supabase } from '@/utils/supabase';

// Separado de academic-calendar.ts para que a lógica pura (plano do semestre, contagem
// de aulas) não arraste o cliente Supabase/MMKV.

interface AcademicCalendarRow {
  semester: string;
  campus: Campus;
  start_date: string;
  end_date: string;
  weeks: number;
  recovery_start: string | null;
  recovery_end: string | null;
  recess_start: string;
  class_days_by_weekday: number[];
  total_class_days: number;
  holidays: AcademicCalendar['holidays'];
  non_class_days: AcademicCalendar['nonClassDays'];
  source_resolution: string;
  source_url: string;
  source_sha256: string;
  source_year: number;
  fetched_at: string;
}

const rowToCalendar = (r: AcademicCalendarRow): AcademicCalendar => ({
  semester: r.semester,
  campus: r.campus,
  startDate: r.start_date,
  endDate: r.end_date,
  weeks: r.weeks,
  recoveryStart: r.recovery_start,
  recoveryEnd: r.recovery_end,
  recessStart: r.recess_start,
  classDaysByWeekday: r.class_days_by_weekday,
  totalClassDays: r.total_class_days,
  holidays: r.holidays ?? [],
  nonClassDays: r.non_class_days ?? [],
  source: {
    resolution: r.source_resolution,
    url: r.source_url,
    sha256: r.source_sha256,
    year: r.source_year,
    fetchedAt: r.fetched_at,
  },
});

/** Busca no Supabase; null quando não existe linha para o semestre × campus. */
export const fetchAcademicCalendar = async (
  semesterKey: string,
  campus: Campus
): Promise<AcademicCalendar | null> => {
  const { data, error } = await supabase
    .from('academic_calendars')
    .select('*')
    .eq('semester', semesterKey)
    .eq('campus', campus)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCalendar(data as AcademicCalendarRow) : null;
};
