import React from 'react';
import { Pressable } from 'react-native';
import { Text } from '@/ui/text';
import { cn } from '@/utils/cn';

export const HeaderTextButton = ({
  label,
  onPress,
  disabled,
  destructive,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) => (
  <Pressable onPress={onPress} disabled={disabled} hitSlop={8}>
    <Text
      className={cn(
        'text-[17px]',
        destructive ? 'text-[#FF3B30]' : 'font-semibold text-primary',
        disabled && 'opacity-40'
      )}>
      {label}
    </Text>
  </Pressable>
);

export const plainHeaderItem = (element: React.ReactElement) => [
  { type: 'custom' as const, element, hidesSharedBackground: true },
];
