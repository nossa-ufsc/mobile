import { useCAGRLogin } from '@/features/onboarding/hooks/use-cagr-login';
import { OnboardingScreen } from '@/features/onboarding/screens/onboarding';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

export default function Onboarding() {
  // This is necessary due to the OAuth client not being ours for now,
  // resulting in a different redirectUrl and consequently not enabling redirection.
  // This is a temporary solution to allow the Android app to work with the OAuth client.
  const { code } = useLocalSearchParams();
  const { handleForcedAuthentication } = useCAGRLogin();

  useEffect(() => {
    if (code) {
      handleForcedAuthentication(code as string);
    }
  }, [code]);

  return <OnboardingScreen />;
}
