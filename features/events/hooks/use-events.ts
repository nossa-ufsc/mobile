import { useQuery } from '@tanstack/react-query';
import { Event } from '@/types';
import { supabase } from '@/utils/supabase';
import { useEnvironmentStore } from '@/utils/use-environment-store';

export const useEvents = () => {
  const campus = useEnvironmentStore((state) => state.campus);
  const now = new Date().toISOString();

  return useQuery({
    queryKey: ['events', campus],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('campus', campus)
        .gte('end_date', now)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      return data as Event[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};
