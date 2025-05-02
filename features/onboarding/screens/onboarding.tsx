import { useState } from 'react';
import { OnboardingCampusScreen } from './onboarding-campus';
import { OnboardingLoginScreen } from './onboarding-login';
import { OnboardingInitialScreen } from './onboarding-initial';

export const OnboardingScreen = () => {
  const [scene, setScene] = useState<'initial' | 'campus' | 'login'>('initial');

  if (scene === 'initial') {
    return <OnboardingInitialScreen onNext={() => setScene('campus')} />;
  }

  if (scene === 'campus') {
    return <OnboardingCampusScreen onNext={() => setScene('login')} />;
  }

  if (scene === 'login') {
    return <OnboardingLoginScreen />;
  }

  return null;
};
