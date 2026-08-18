/**
 * FALLBACK start date of the semester, used only when there is no official
 * academic calendar for the user's semester × campus (or the user chose a manual
 * duration) — see features/calendar/utils/academic-calendar.ts. Prefer the CAGR
 * `semestre` (format YYYYN, e.g. 20261 = 2026, semester 1) to pick the year/half;
 * fall back to guessing from the current date when it's unknown (guest/dev).
 * Semester 1 is assumed to start early March, semester 2 early August.
 */
export const getSemesterStartDate = (semester?: number | null): Date => {
  let year: number;
  let isFirstSemester: boolean;

  if (semester && semester > 0) {
    year = Math.floor(semester / 10);
    isFirstSemester = semester % 10 === 1;
  } else {
    const now = new Date();
    year = now.getFullYear();
    isFirstSemester = now.getMonth() <= 5; // Jan (0) to Jun (5)
  }

  const startMonth = isFirstSemester ? 2 : 7; // March (2) or August (7)
  const startDate = new Date(year, startMonth, 8);
  startDate.setHours(0, 0, 0, 0);

  return startDate;
};
