import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Text } from '@/ui/text';
import { Button } from '@/ui/button';
import { useColorScheme } from '@/utils/use-color-scheme';
import { Container } from '@/ui/container';
import { useCAGRLogin } from '@/features/onboarding/hooks/use-cagr-login';
import { router } from 'expo-router';
import { useEnvironmentStore } from '@/utils/use-environment-store';

type Step = {
  icon: 'key-outline' | 'shield-checkmark-outline' | 'sync-outline';
  title: string;
  description: string;
};

export const OnboardingLoginScreen = () => {
  const { colors } = useColorScheme();
  const { t } = useTranslation();
  const { handleLogin, isLoading } = useCAGRLogin();
  const { setIsGuest } = useEnvironmentStore();

  const steps: Step[] = [
    {
      icon: 'key-outline',
      title: t('onboarding.login.step1Title'),
      description: t('onboarding.login.step1Description'),
    },
    {
      icon: 'shield-checkmark-outline',
      title: t('onboarding.login.step2Title'),
      description: t('onboarding.login.step2Description'),
    },
    {
      icon: 'sync-outline',
      title: t('onboarding.login.step3Title'),
      description: t('onboarding.login.step3Description'),
    },
  ];

  return (
    <View className="flex-1">
      <Container scrollable className="flex-1 px-6 pt-8">
        <View className="space-y-4">
          <View>
            <Text className="mb-2 text-4xl font-bold" style={{ color: colors.foreground }}>
              {t('onboarding.login.title')}
            </Text>
          </View>
          <View>
            <Text className="text-base leading-relaxed text-muted-foreground">
              {t('onboarding.login.subtitle')}
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

      <View className="mt-auto flex-col gap-3 bg-background px-4 pb-2">
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
          {t('onboarding.login.enter')}
        </Button>
        {__DEV__ && (
          <Text color="tertiary" variant="body" className="self-center">
            {t('onboarding.login.notStudent')}{' '}
            <Text
              onPress={() =>
                handleLogin({
                  onSuccess: () => {
                    setIsGuest(true);
                    router.push('/(app)/(tabs)/(home)');
                  },
                  isGuest: true,
                })
              }
              variant="body"
              color="primary"
              className="underline">
              {t('onboarding.login.enterAsGuest')}
            </Text>
          </Text>
        )}
      </View>
    </View>
  );
};
