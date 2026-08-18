import { useEffect } from 'react';
import type { Event } from '@/types';
import { useCalendar } from '@/features/calendar/hooks/use-calendar';

/**
 * Atualiza os snapshots dos eventos salvos sempre que a lista fresca chega do servidor
 * (nome, local, datas…) e reagenda o lembrete se o horário mudou. Eventos que sumiram
 * da lista são mantidos como estão.
 */
export const useSyncSavedEvents = (events?: Event[]) => {
  const { refreshSavedEvents } = useCalendar();

  useEffect(() => {
    if (!events?.length) return;
    refreshSavedEvents(events);
    // `refreshSavedEvents` é recriado a cada render; só a lista importa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);
};
