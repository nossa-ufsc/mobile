import { Pressable, ScrollView, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';
import { cn } from '@/utils/cn';
import type { EventCategory } from '@/types';
import type { EventCategoryFilter as Filter } from '../utils/event-list';

interface EventCategoryFilterProps {
  /** Categorias presentes na lista, já na ordem canônica. */
  categories: EventCategory[];
  value: Filter;
  onChange: (value: Filter) => void;
  className?: string;
}

export const EventCategoryFilter = ({
  categories,
  value,
  onChange,
  className,
}: EventCategoryFilterProps) => {
  const { t } = useTranslation();
  // Com uma categoria só não há o que filtrar.
  if (categories.length < 2) return null;

  const options: { key: Filter; label: string }[] = [
    { key: 'all', label: t('events.filterAll') },
    ...categories.map((c) => ({ key: c as Filter, label: t(`events.categoryFilters.${c}`) })),
  ];

  return (
    <View className={className} accessibilityRole="tablist">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-4">
        {options.map(({ key, label }) => {
          const selected = key === value;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => {
                if (selected) return;
                Haptics.selectionAsync();
                onChange(key);
              }}
              className={cn(
                'items-center justify-center rounded-full px-3.5 py-1.5',
                selected ? 'bg-primary' : 'bg-gray-500/10'
              )}>
              <Text
                variant="subhead"
                className={cn('font-medium', selected ? 'text-white' : 'text-foreground')}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
