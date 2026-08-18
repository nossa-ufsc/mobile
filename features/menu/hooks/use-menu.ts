import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Menu } from '@/types';
import { useMenuRestaurant } from './use-menu-restaurant';

export const useMenu = () => {
  const { selectedKey } = useMenuRestaurant();

  return useQuery({
    queryKey: ['menu', selectedKey],
    enabled: !!selectedKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menus')
        .select('menu')
        .eq('campus', selectedKey)
        .single();

      if (error) throw error;

      return data?.menu as Menu;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};
