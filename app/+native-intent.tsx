import { Platform } from 'react-native';

// This is necessary due to the OAuth client not being ours for now,
// resulting in a different redirectUrl and consequently not enabling redirection.
// This is a temporary solution to allow the Android app to work with the OAuth client.
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  if (path.includes('tccleal://tccleal.setic_oauth.ufsc.br') && Platform.OS === 'android') {
    const newPath = path.replace(
      'tccleal://tccleal.setic_oauth.ufsc.br',
      'nossa-ufsc://onboarding'
    );

    return newPath;
  }

  return path;
}
