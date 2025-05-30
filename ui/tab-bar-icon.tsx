import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

export const TabBarIcon = (props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  size?: number;
}) => {
  return (
    <Ionicons
      name={props.name}
      style={styles.tabBarIcon}
      size={props.size ?? 24}
      color={props.color}
    />
  );
};

export const styles = StyleSheet.create({
  tabBarIcon: {
    marginBottom: -8,
  },
});
