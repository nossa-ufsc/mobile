import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StatusBar, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/utils/use-color-scheme';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
/** Arrastar pra baixo além disso (com zoom 1x) fecha o visualizador. */
const DISMISS_DISTANCE = 120;
const SPRING = { damping: 20, stiffness: 200 };

interface ImageViewerProps {
  uri: string;
  visible: boolean;
  onClose: () => void;
  accessibilityLabel?: string;
}

/**
 * Visualizador de imagem em tela cheia: pinça pra dar zoom (em torno dos dedos),
 * arrasta quando ampliada, toque duplo alterna o zoom e arrastar pra baixo fecha.
 */
export const ImageViewer = ({ uri, visible, onClose, accessibilityLabel }: ImageViewerProps) => {
  const { width: W, height: H } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const { colors, isDarkColorScheme } = useColorScheme();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    Image.getSize(
      uri,
      (w, h) => alive && setSize({ w, h }),
      () => alive && setSize({ w: W, h: H })
    );
    return () => {
      alive = false;
    };
  }, [uri, visible, W, H]);

  // Tamanho da imagem "contida" na tela (o que se vê com zoom 1x).
  const fit = size ? Math.min(W / size.w, H / size.h) : 1;
  const dispW = size ? size.w * fit : W;
  const dispH = size ? size.h * fit : H;

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    scale.value = 1;
    savedScale.value = 1;
    tx.value = 0;
    ty.value = 0;
    savedTx.value = 0;
    savedTy.value = 0;
  }, [visible, scale, savedScale, tx, ty, savedTx, savedTy]);

  /** Mantém a imagem cobrindo a tela: sem folga nas bordas quando ampliada. */
  const clampedTranslation = (s: number, x: number, y: number) => {
    'worklet';
    const maxX = Math.max(0, (dispW * s - W) / 2);
    const maxY = Math.max(0, (dispH * s - H) / 2);
    return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
  };

  const settle = () => {
    'worklet';
    if (scale.value < MIN_SCALE) {
      scale.value = withSpring(MIN_SCALE, SPRING);
      tx.value = withSpring(0, SPRING);
      ty.value = withSpring(0, SPRING);
      savedScale.value = MIN_SCALE;
      savedTx.value = 0;
      savedTy.value = 0;
      return;
    }
    const s = Math.min(scale.value, MAX_SCALE);
    const { x, y } = clampedTranslation(s, tx.value, ty.value);
    scale.value = withSpring(s, SPRING);
    tx.value = withSpring(x, SPRING);
    ty.value = withSpring(y, SPRING);
    savedScale.value = s;
    savedTx.value = x;
    savedTy.value = y;
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const next = clamp(savedScale.value * e.scale, MIN_SCALE * 0.6, MAX_SCALE * 1.4);
      const k = next / savedScale.value;
      // Ponto sob os dedos (relativo ao centro) fica parado durante o zoom.
      const fx = e.focalX - W / 2;
      const fy = e.focalY - H / 2;
      scale.value = next;
      tx.value = fx - k * (fx - savedTx.value);
      ty.value = fy - k * (fy - savedTy.value);
    })
    .onEnd(() => settle());

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (savedScale.value > MIN_SCALE) {
        tx.value = savedTx.value + e.translationX;
        ty.value = savedTy.value + e.translationY;
      } else {
        // 1x: arrasto vertical pra fechar.
        ty.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (savedScale.value > MIN_SCALE) {
        settle();
        return;
      }
      if (Math.abs(ty.value) > DISMISS_DISTANCE || Math.abs(e.velocityY) > 1200) {
        ty.value = withTiming(Math.sign(ty.value || e.velocityY) * H, { duration: 180 }, () =>
          runOnJS(onClose)()
        );
      } else {
        ty.value = withSpring(0, SPRING);
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (savedScale.value > MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE, SPRING);
        tx.value = withSpring(0, SPRING);
        ty.value = withSpring(0, SPRING);
        savedScale.value = MIN_SCALE;
        savedTx.value = 0;
        savedTy.value = 0;
        return;
      }
      const k = DOUBLE_TAP_SCALE;
      const fx = e.x - W / 2;
      const fy = e.y - H / 2;
      const { x, y } = clampedTranslation(k, fx * (1 - k), fy * (1 - k));
      scale.value = withSpring(k, SPRING);
      tx.value = withSpring(x, SPRING);
      ty.value = withSpring(y, SPRING);
      savedScale.value = k;
      savedTx.value = x;
      savedTy.value = y;
    });

  const gesture = Gesture.Race(doubleTap, Gesture.Simultaneous(pinch, pan));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  // Fundo some conforme arrasta pra fechar.
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: savedScale.value > MIN_SCALE ? 1 : 1 - Math.min(Math.abs(ty.value) / (H * 0.6), 0.6),
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle={isDarkColorScheme ? 'light-content' : 'dark-content'} />
        <Animated.View style={[{ flex: 1, backgroundColor: colors.background }, backdropStyle]} />
        <GestureDetector gesture={gesture}>
          <View
            className="absolute inset-0 items-center justify-center"
            collapsable={false}
            accessible
            accessibilityRole="image"
            accessibilityLabel={accessibilityLabel}>
            <Animated.Image
              source={{ uri }}
              style={[{ width: dispW, height: dispH }, imageStyle]}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </View>
        </GestureDetector>
        <Pressable
          onPress={onClose}
          hitSlop={10}
          accessibilityRole="button"
          className="absolute left-4 h-9 w-9 items-center justify-center rounded-full bg-black/45 active:opacity-70"
          style={{ top: top + 12 }}>
          <Ionicons name="close" size={22} color="white" />
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
};
