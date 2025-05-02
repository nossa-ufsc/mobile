import { cn } from '@/utils/cn';
import { SafeAreaView, ScrollView, StyleProp, ViewStyle } from 'react-native';

export const Container = ({
  children,
  scrollable = false,
  autoPadding = true,
  showsVerticalScrollIndicator = false,
  className,
  contentClassName,
  contentStyle,
}: {
  children: React.ReactNode;
  scrollable?: boolean;
  autoPadding?: boolean;
  className?: string;
  contentClassName?: string;
  contentStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
}) => {
  return (
    <SafeAreaView className={cn('flex-1 bg-background')}>
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          contentContainerClassName={contentClassName}
          contentContainerStyle={contentStyle}
          className={cn('flex-1', autoPadding && 'px-2 py-4', className)}>
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
};
