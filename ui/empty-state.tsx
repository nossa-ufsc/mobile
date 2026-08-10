import { View } from 'react-native';
import { Text } from '@/ui/text';

// Centered title/subtitle placeholder for screens with nothing to show.
// Pass an optional action (e.g. a Button) rendered below the subtitle.
export const EmptyState = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) => {
  return (
    <View className="flex-1 items-center justify-center px-8 pt-36">
      <Text className="text-lg font-medium">{title}</Text>
      <Text className="mt-2 text-center text-muted-foreground">{subtitle}</Text>
      {children}
    </View>
  );
};
