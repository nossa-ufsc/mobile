import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/ui/text';
import { Button } from '@/ui/button';
import { useColorScheme } from '@/utils/use-color-scheme';
import { Container } from '@/ui/container';

type Step = {
  icon: 'calendar-outline' | 'school-outline' | 'people-outline' | 'code-outline';
  title: string;
  description: string;
};

export const OnboardingInitialScreen = ({ onNext }: { onNext: () => void }) => {
  const { colors } = useColorScheme();

  const steps: Step[] = [
    {
      icon: 'calendar-outline',
      title: 'Gerencie seus horários',
      description: 'Acompanhe e gerencie suas matérias e faltas de forma fácil e organizada.',
    },
    {
      icon: 'people-outline',
      title: 'Eventos e Festas',
      description:
        'Fique por dentro dos próximos eventos e festas da UFSC para não perder nenhuma diversão.',
    },
    {
      icon: 'code-outline',
      title: 'Contribua com o Código',
      description:
        'Ajude a melhorar o app contribuindo com código, sugestões ou reportando problemas.',
    },
  ];

  return (
    <View className="flex-1">
      <Container scrollable className="flex-1 px-6 pt-8">
        <View className="space-y-4">
          <View>
            <Text className="mb-2 text-4xl font-bold" style={{ color: colors.foreground }}>
              Bem-vindo!
            </Text>
          </View>
          <View>
            <Text className="text-base leading-relaxed text-muted-foreground">
              Nossa UFSC é seu companheiro diário para gerenciar sua vida acadêmica. Acompanhe suas
              faltas, provas e eventos em um só lugar.
            </Text>
          </View>
        </View>

        <View className="mt-8 flex-1">
          <View className="w-full max-w-sm gap-4 space-y-8">
            {steps.map((step) => (
              <View key={step.title} className="flex-row items-start gap-4 space-x-4">
                <View className="bg-primary/10 rounded-full p-3">
                  <Ionicons name={step.icon} size={24} color={colors.primary} />
                </View>
                <View className="flex-1 space-y-1">
                  <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
                    {step.title}
                  </Text>
                  <Text className="text-base text-muted-foreground">{step.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Container>

      <View className="mt-auto bg-background px-4 pb-2">
        <Button onPress={onNext} variant="primary">
          Começar
        </Button>
      </View>
    </View>
  );
};
