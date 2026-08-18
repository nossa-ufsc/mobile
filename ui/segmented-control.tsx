import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/ui/text';
import { cn } from '@/utils/cn';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  accessibilityLabel?: string;
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  className,
  accessibilityLabel,
}: SegmentedControlProps<T>) => {
  return (
    <View
      className={cn('flex-row rounded-full bg-gray-500/10 p-1', className)}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) return;
              Haptics.selectionAsync();
              onChange(option.value);
            }}
            className={cn(
              'flex-1 items-center justify-center rounded-full px-3 py-1.5',
              selected && 'bg-card dark:bg-gray-500/25'
            )}>
            <Text
              variant="subhead"
              className={cn('font-medium', selected ? 'text-foreground' : 'text-muted-foreground')}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
