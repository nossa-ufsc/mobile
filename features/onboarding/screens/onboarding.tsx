import { useState } from 'react';
import { OnboardingCampusScreen } from './onboarding-campus';
import { OnboardingLoginScreen } from './onboarding-login';
import { OnboardingInitialScreen } from './onboarding-initial';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

export const OnboardingScreen = () => {
  const [scene, setScene] = useState<'initial' | 'campus' | 'login'>('initial');
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingBottom: insets.bottom, paddingTop: insets.top }}>
      {scene === 'login' && <OnboardingLoginScreen />}
      {scene === 'campus' && <OnboardingCampusScreen onNext={() => setScene('login')} />}
      {scene === 'initial' && <OnboardingInitialScreen onNext={() => setScene('campus')} />}
    </View>
  );
};
