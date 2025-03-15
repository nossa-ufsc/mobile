import RNSlider from '@react-native-community/slider';
import { Platform } from 'react-native';

import { useColorScheme } from '@/utils/use-color-scheme';
import { COLORS } from '@/theme/colors';

export const Slider = ({
  thumbTintColor,
  minimumTrackTintColor,
  maximumTrackTintColor,
  ...props
}: React.ComponentPropsWithoutRef<typeof RNSlider>) => {
  const { colors } = useColorScheme();
  return (
    <RNSlider
      thumbTintColor={(thumbTintColor ?? Platform.OS === 'ios') ? COLORS.white : colors.primary}
      minimumTrackTintColor={minimumTrackTintColor ?? colors.primary}
      maximumTrackTintColor={
        (maximumTrackTintColor ?? Platform.OS === 'android') ? colors.primary : undefined
      }
      {...props}
    />
  );
};
