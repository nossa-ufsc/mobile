import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/ui/text';
import { Button } from '@/ui/button';
import { useColorScheme } from '@/utils/use-color-scheme';
import { Container } from '@/ui/container';
import { useCAGRLogin } from '@/features/onboarding/hooks/use-cagr-login';
import { router } from 'expo-router';

type Step = {
  icon: 'key-outline' | 'shield-checkmark-outline' | 'sync-outline';
  title: string;
  description: string;
};

export const OnboardingLoginScreen = () => {
  const { colors } = useColorScheme();
  const { handleLogin, isLoading } = useCAGRLogin();

  const steps: Step[] = [
    {
      icon: 'key-outline',
      title: 'Login Único',
      description: 'Use suas credenciais do idUFSC para acessar todas as funcionalidades do app.',
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Dados Seguros',
      description: 'Seus dados são salvos apenas no seu dispositivo de forma segura.',
    },
    {
      icon: 'sync-outline',
      title: 'Sincronização Automática',
      description: 'Suas disciplinas são sincronizadas automaticamente com o CAGR.',
    },
  ];

  return (
    <View className="flex-1">
      <Container scrollable className="flex-1 px-6 pt-8">
        <View className="space-y-4">
          <View>
            <Text className="mb-2 text-4xl font-bold" style={{ color: colors.foreground }}>
              Entre com o seu ID UFSC
            </Text>
          </View>
          <View>
            <Text className="text-base leading-relaxed text-muted-foreground">
              Para facilitar sua experiência, usamos seu login do CAGR para sincronizar
              automaticamente suas disciplinas. Seus dados são salvos apenas no seu dispositivo e
              você não precisará inserir informações manualmente.
            </Text>
          </View>
        </View>

        <View className="mt-8">
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
        <Button
          variant="primary"
          onPress={() =>
            handleLogin({
              onSuccess: () => {
                router.push('/(app)/(tabs)/(home)');
              },
            })
          }
          isLoading={isLoading}
          disabled={isLoading}>
          Entrar
        </Button>
      </View>
    </View>
  );
};
