import { StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export const Container = ({
  children,
  scrollable = false,
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {scrollable ? <ScrollView className="flex-1">{children}</ScrollView> : children}
    </SafeAreaView>
  );
};
