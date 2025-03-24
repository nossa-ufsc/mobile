import { useCAGRLogin } from '@/features/onboarding/hooks/use-cagr-login';
import { Button } from '@/ui/button';
import { Container } from '@/ui/container';
import { Text } from '@/ui/text';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

export default function Modal() {
  const { handleLogout } = useCAGRLogin();
  return (
    <>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <Container>
        <Button onPress={handleLogout} variant="secondary" size="lg" className="my-4 w-full">
          <Text>Sair</Text>
        </Button>
      </Container>
    </>
  );
}
