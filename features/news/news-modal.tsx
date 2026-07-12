import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Sheet, useSheetRef } from '@/ui/bottom-sheet';
import { Text } from '@/ui/text';
import { Button } from '@/ui/button';
import { cn } from '@/utils/cn';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { NEWS_ITEMS } from './news-items';

// Module-level so the modal presents at most once per app launch, even if the
// host screen remounts (e.g. when switching tabs). Resets on a fresh JS context.
let hasPresentedThisSession = false;

export const NewsModal = () => {
  const sheetRef = useSheetRef();
  const pagerRef = useRef<PagerView>(null);
  const { colors } = useColorScheme();
  const markNewsSeen = useEnvironmentStore((state) => state.markNewsSeen);

  // Snapshot once so marking items seen doesn't shrink the carousel mid-session.
  // Read seen ids imperatively to avoid re-rendering as we mark items seen.
  const [unseen] = useState(() => {
    const seenNewsIds = useEnvironmentStore.getState().seenNewsIds;
    return NEWS_ITEMS.filter((item) => !seenNewsIds.includes(item.id));
  });
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (hasPresentedThisSession || unseen.length === 0) return;
    hasPresentedThisSession = true;
    sheetRef.current?.present();
    // The first slide is visible on open, so mark it seen immediately.
    markNewsSeen(unseen[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (unseen.length === 0) return null;

  const isLast = pageIndex >= unseen.length - 1;

  const handleNext = () => {
    if (isLast) {
      sheetRef.current?.dismiss();
    } else {
      pagerRef.current?.setPage(pageIndex + 1);
    }
  };

  return (
    <Sheet ref={sheetRef} enableDynamicSizing enableContentPanningGesture={false}>
      <BottomSheetView>
        <View className="px-6 pb-6 pt-2">
          <Text variant="footnote" color="tertiary" className="mb-4 text-center">
            Novidades
          </Text>

          <PagerView
            ref={pagerRef}
            style={{ height: 240 }}
            initialPage={0}
            onPageSelected={(event) => {
              const index = event.nativeEvent.position;
              setPageIndex(index);
              const item = unseen[index];
              if (item) markNewsSeen(item.id);
            }}>
            {unseen.map((item) => (
              <View key={item.id} className="items-center justify-center px-2">
                <View className="bg-primary/10 mb-5 h-16 w-16 items-center justify-center rounded-2xl">
                  <MaterialCommunityIcons name={item.icon} size={32} color={colors.primary} />
                </View>
                <Text variant="title3" className="mb-2 text-center">
                  {item.title}
                </Text>
                <Text variant="body" color="tertiary" className="text-center">
                  {item.description}
                </Text>
              </View>
            ))}
          </PagerView>

          {unseen.length > 1 && (
            <View className="my-4 flex-row justify-center gap-2">
              {unseen.map((item, index) => (
                <View
                  key={item.id}
                  className={cn(
                    'h-2 w-2 rounded-full',
                    index === pageIndex ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  )}
                />
              ))}
            </View>
          )}

          <Button size="lg" onPress={handleNext} className="mt-2">
            {isLast ? 'Entendi' : 'Próximo'}
          </Button>
        </View>
      </BottomSheetView>
    </Sheet>
  );
};
