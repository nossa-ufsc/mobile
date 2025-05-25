import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/ui/text';
import { Button } from '@/ui/button';
import { useColorScheme } from '@/utils/use-color-scheme';
import { Container } from '@/ui/container';
import { CAMPUS_LABELS } from '@/features/settings/utils/const';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { Campus } from '@/types';
import { cn } from '@/utils/cn';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const OnboardingCampusScreen = ({ onNext }: { onNext: () => void }) => {
  const { colors } = useColorScheme();
  const campuses = Object.entries(CAMPUS_LABELS);
  const setCampus = useEnvironmentStore((state) => state.setCampus);
  const selectedCampus = useEnvironmentStore((state) => state.campus);
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <Container scrollable className="flex-1 px-6 pt-8">
        <View className="space-y-4">
          <View>
            <Text className="mb-2 text-4xl font-bold" style={{ color: colors.foreground }}>
              Selecione seu Campus
            </Text>
          </View>
          <View>
            <Text className="text-base leading-relaxed text-muted-foreground">
              Escolha o seu Campus para continuar. Essa informação é necessária para sincronizarmos
              os eventos e o cardápio do R.U.
            </Text>
          </View>
        </View>

        <View className="mt-8 flex-1 gap-2">
          {campuses.map(([key, campus]) => (
            <TouchableOpacity
              key={key}
              className={cn(
                'flex-row items-center gap-4 rounded-lg bg-card p-4',
                selectedCampus === key && 'bg-primary/20'
              )}
              onPress={() => setCampus(key as Campus)}>
              <View className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                <Ionicons name="location-outline" size={24} color={colors.primary} />
              </View>
              <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
                {campus}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Container>

      <View
        style={{ bottom: insets.bottom + 8 }}
        className="absolute left-0 right-0 bg-background px-4">
        <Button onPress={onNext} variant="primary">
          Próximo
        </Button>
      </View>
    </View>
  );
};
