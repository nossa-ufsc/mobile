import { cn } from '@/utils/cn';
import { ScrollView, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

export const Container = ({
  children,
  scrollable = false,
  autoPadding = true,
  showsVerticalScrollIndicator = false,
  // The app already resolves the top inset elsewhere (native stack headers on
  // tab screens, the onboarding wrapper's own `useSafeAreaInsets` padding), so
  // Container must not re-apply `top` or it double-insets. `bottom` is also
  // excluded so content extends under the translucent native tab bar on iOS —
  // scroll views compensate via `contentInsetAdjustmentBehavior`. Callers that
  // render full-screen with no header can opt back in via `edges`.
  edges = ['right', 'left'],
  className,
  contentClassName,
  contentStyle,
}: {
  children: React.ReactNode;
  scrollable?: boolean;
  autoPadding?: boolean;
  edges?: readonly Edge[];
  className?: string;
  contentClassName?: string;
  contentStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
}) => {
  return (
    <SafeAreaView edges={edges} className={cn('flex-1 bg-background')}>
      {scrollable ? (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
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
