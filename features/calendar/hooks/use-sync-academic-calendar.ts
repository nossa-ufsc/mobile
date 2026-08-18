import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { useRebuildSchedule } from '@/utils/use-rebuild-schedule';
import {
  getBundledAcademicCalendar,
  getSemesterKey,
  getStoredCalendarFor,
  isSameAcademicCalendar,
  isSameSemesterPlan,
} from '@/features/calendar/utils/academic-calendar';
import { fetchAcademicCalendar } from '@/features/calendar/utils/fetch-academic-calendar';
import { getSemesterPlan } from './use-semester-plan';

/**
 * Mantém `academicCalendar` do store em dia com o Supabase para o semestre × campus
 * do usuário. Só regenera aulas/notificações quando o PLANO muda de fato (início,
 * término, semanas, dias sem aula) — a cópia empacotada e a remota costumam ser
 * idênticas, então na maioria das vezes não há nada a fazer. Muda de verdade quando
 * o CUn altera o calendário no meio do ano ou o usuário troca de campus/semestre.
 *
 * Montar uma única vez, dentro dos providers (app/(app)/_layout.tsx).
 */
export const useSyncAcademicCalendar = () => {
  const semester = useEnvironmentStore((state) => state.semester);
  const campus = useEnvironmentStore((state) => state.campus);
  const isAuthenticated = useEnvironmentStore((state) => state.isAuthenticated);
  const { rebuild } = useRebuildSchedule();
  const rebuilding = useRef(false);

  const semesterKey = getSemesterKey(semester);
  const enabled = isAuthenticated && !!campus;

  const query = useQuery({
    queryKey: ['academic-calendar', semesterKey, campus],
    enabled,
    queryFn: async () => {
      const stored = getStoredCalendarFor(
        useEnvironmentStore.getState().academicCalendar,
        semesterKey,
        campus
      );
      const bundled = getBundledAcademicCalendar(semesterKey, campus);
      try {
        // Sem linha publicada para o semestre → empacotado (se houver); mantém o que
        // já estava no store como último recurso.
        return (await fetchAcademicCalendar(semesterKey, campus!)) ?? bundled ?? stored;
      } catch (error) {
        // Offline/erro: NÃO apaga o que já temos (senão cairia no modo manual e
        // regeneraria tudo duas vezes — agora e quando a rede voltar).
        console.warn('Academic calendar fetch failed, keeping local copy:', error);
        return stored ?? bundled;
      }
    },
    staleTime: 1000 * 60 * 60 * 12, // 12h — muda poucas vezes por ano
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  useEffect(() => {
    if (!enabled || query.data === undefined || rebuilding.current) return;
    const state = useEnvironmentStore.getState();
    const next = query.data;
    if (isSameAcademicCalendar(state.academicCalendar, next)) return;

    const before = getSemesterPlan();
    state.setAcademicCalendar(next);
    const after = getSemesterPlan();

    // Só há o que regenerar se o plano mudou e existe grade. Convidado (dev login)
    // não recebe notificações de aula por decisão do onboarding — não regenerar.
    if (isSameSemesterPlan(before, after) || !state.subjects?.length || state.isGuest) return;

    rebuilding.current = true;
    rebuild(state.subjects)
      .catch((error) => console.error('Error rebuilding schedule after calendar sync:', error))
      .finally(() => {
        rebuilding.current = false;
      });
  }, [enabled, query.data, rebuild]);

  return query;
};
