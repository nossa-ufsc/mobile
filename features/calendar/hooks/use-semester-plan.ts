import { useMemo } from 'react';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { resolveSemesterPlan, SemesterPlan } from '@/features/calendar/utils/academic-calendar';

/** Plano do semestre (oficial ou manual) resolvido a partir do store — versão sem hook. */
export const getSemesterPlan = (): SemesterPlan => {
  const s = useEnvironmentStore.getState();
  return resolveSemesterPlan({
    semester: s.semester,
    semesterDuration: s.semesterDuration,
    academicCalendar: s.academicCalendar,
    campus: s.campus,
  });
};

/** Plano do semestre (oficial ou manual), reativo ao store. */
export const useSemesterPlan = (): SemesterPlan => {
  const semester = useEnvironmentStore((state) => state.semester);
  const semesterDuration = useEnvironmentStore((state) => state.semesterDuration);
  const academicCalendar = useEnvironmentStore((state) => state.academicCalendar);
  const campus = useEnvironmentStore((state) => state.campus);

  return useMemo(
    () =>
      resolveSemesterPlan({
        semester,
        semesterDuration,
        academicCalendar,
        campus,
      }),
    [semester, semesterDuration, academicCalendar, campus]
  );
};
