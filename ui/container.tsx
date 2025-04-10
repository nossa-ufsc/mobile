import { cn } from '@/utils/cn';
import { SafeAreaView, ScrollView } from 'react-native';

export const Container = ({
  children,
  scrollable = false,
  autoPadding = true,
  className,
}: {
  children: React.ReactNode;
  scrollable?: boolean;
  autoPadding?: boolean;
  className?: string;
}) => {
  return (
    <SafeAreaView className={cn('flex-1 bg-background')}>
      {scrollable ? (
        <ScrollView className={cn('flex-1', autoPadding && 'px-2 py-4', className)}>
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
};
