import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Event } from '@/types';
import { supabase } from '@/utils/supabase';
import { useEnvironmentStore } from '@/utils/use-environment-store';

/**
 * Um evento específico. Usa a lista já carregada em `['events', campus]` como
 * dado inicial pra abrir o modal instantaneamente e busca no Supabase por trás
 * (útil pra deep links ou se a lista ainda não foi carregada).
 */
export const useEvent = (id: string | undefined) => {
  const campus = useEnvironmentStore((state) => state.campus);
  const queryClient = useQueryClient();

  const cached = queryClient
    .getQueryData<Event[]>(['events', campus])
    ?.find((event) => event.id === id);

  return useQuery({
    queryKey: ['event', id],
    enabled: !!id,
    initialData: cached,
    initialDataUpdatedAt: cached ? queryClient.getQueryState(['events', campus])?.dataUpdatedAt : 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .maybeSingle();

      if (error) {
        console.error('Error fetching event:', error);
        throw error;
      }

      return data as Event | null;
    },
    staleTime: 1000 * 60 * 5,
  });
};
