import { useColorScheme } from '@/utils/use-color-scheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { memo, forwardRef } from 'react';
import { Platform, Pressable, View } from 'react-native';
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
        <FontAwesome
          name="gear"
          size={25}
          color={colors.grey2}
          style={{ marginRight: Platform.OS === 'android' ? 15 : 0 }}
        />
      </Pressable>
    );
  })
);

HeaderButton.displayName = 'HeaderButton';

export const getSettingsHeaderItems = (onPress: () => void) => [
  {
    type: 'button' as const,
    label: 'Ajustes',
    icon: { type: 'sfSymbol' as const, name: 'gearshape' as const },
    onPress: () => {
      onPress();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    sharesBackground: false,
  },
];
