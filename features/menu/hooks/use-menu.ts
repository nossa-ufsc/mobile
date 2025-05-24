import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { Menu } from '@/types';

export const useMenu = () => {
  const campus = useEnvironmentStore((state) => state.campus);

  return useQuery({
    queryKey: ['menu', campus],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menus')
        .select('menu')
        .eq('campus', campus)
        .single();

      if (error) {
        console.error('Error fetching menu:', error);
        throw error;
      }

      return data?.menu as Menu;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
