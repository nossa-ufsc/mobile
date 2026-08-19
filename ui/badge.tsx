import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { Text } from '@/ui/text';
import { cn } from '@/utils/cn';
import { COLORS } from '@/theme/colors';

type MCIName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type BadgeTone = 'neutral' | 'info' | 'warning' | 'positive';

const TONES: Record<
  BadgeTone,
  { container: string; text: string; icon: { light: string; dark: string } | null }
> = {
  neutral: {
    container: 'bg-gray-500/10 dark:bg-gray-500/25',
    text: 'text-gray-600 dark:text-gray-300',
    icon: { light: '#4b5563', dark: '#d1d5db' },
  },
  info: { container: 'bg-primary/10', text: 'text-primary', icon: null },
  warning: {
    container: 'bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-300',
    icon: { light: '#b45309', dark: '#fcd34d' },
  },
  positive: {
    container: 'bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: { light: '#047857', dark: '#6ee7b7' },
  },
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: MCIName;
  className?: string;
}

export const Badge = ({ label, tone = 'neutral', icon, className }: BadgeProps) => {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const t = TONES[tone];
  const iconColor = t.icon ? t.icon[scheme] : COLORS[scheme].primary;

  return (
    <View
      className={cn(
        'flex-row items-center gap-1 rounded-full px-2 py-[3px]',
        t.container,
        className
      )}>
      {icon && <MaterialCommunityIcons name={icon} size={11} color={iconColor} />}
      <Text variant="caption2" className={cn('font-medium', t.text)}>
        {label}
      </Text>
    </View>
  );
};
