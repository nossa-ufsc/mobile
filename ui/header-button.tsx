import { useColorScheme } from '@/utils/use-color-scheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { memo, forwardRef } from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';

export const HeaderButton = memo(
  forwardRef<View, { onPress?: () => void }>(({ onPress }, ref) => {
    const { colors } = useColorScheme();
    return (
      <Pressable
        ref={ref}
        onPressIn={() => {
          onPress?.();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}>
        <FontAwesome className="mr-[15px]" name="gear" size={25} color={colors.grey2} />
      </Pressable>
    );
  })
);

HeaderButton.displayName = 'HeaderButton';
