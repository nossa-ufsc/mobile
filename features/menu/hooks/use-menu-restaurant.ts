import { useEnvironmentStore } from '@/utils/use-environment-store';
import { getRestaurantsForCampus, resolveRestaurantKey } from '../utils/restaurants';

export const useMenuRestaurant = () => {
  const campus = useEnvironmentStore((state) => state.campus);
  const stored = useEnvironmentStore((state) => state.menuRestaurant);
  const select = useEnvironmentStore((state) => state.setMenuRestaurant);

  const restaurants = getRestaurantsForCampus(campus);
  const selectedKey = resolveRestaurantKey(campus, stored);
  const selected = restaurants.find((r) => r.key === selectedKey) ?? null;

  return { restaurants, selectedKey, selected, select };
};
