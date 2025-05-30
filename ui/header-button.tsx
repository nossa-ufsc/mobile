import { useColorScheme } from '@/utils/use-color-scheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, TouchableOpacity } from 'react-native';

export const HeaderButton = forwardRef<typeof Pressable, { onPress?: () => void }>(
  ({ onPress }, ref) => {
    const { colors } = useColorScheme();
    return (
      <TouchableOpacity onPressIn={onPress}>
        <FontAwesome name="gear" size={25} color={colors.grey2} style={[styles.headerRight]} />
      </TouchableOpacity>
    );
  }
);

export const styles = StyleSheet.create({
  headerRight: {
    marginRight: 15,
  },
});
