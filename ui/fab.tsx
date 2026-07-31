import { Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const isAndroid = Platform.OS === 'android';

export const Fab = ({ onPress }: { onPress: () => void }) => {
  return (
    // Anchored to the bottom-right corner only — a full-screen overlay with
    // pointerEvents="box-none" blocks scrolling on Android.
    <SafeAreaView
      edges={isAndroid ? [] : ['bottom']}
      pointerEvents="box-none"
      className="absolute bottom-0 right-0">
      <Pressable
        onPress={onPress}
        className="shadow-primary/20 m-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg">
        <Ionicons name="add" size={24} color="white" />
      </Pressable>
    </SafeAreaView>
  );
};
