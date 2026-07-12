import { useCAGRLogin } from '@/features/onboarding/hooks/use-cagr-login';
import { Container } from '@/ui/container';
import { Text } from '@/ui/text';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Platform,
  View,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useNotifications } from '@/utils/use-notifications';
import { Campus } from '@/types';
import { CAMPUS_LABELS } from '../utils/const';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SettingsModal = () => {
  const { handleLogout, reloadSubjects } = useCAGRLogin();
  const { colors } = useColorScheme();
  const { showActionSheetWithOptions } = useActionSheet();
  const { bottom } = useSafeAreaInsets();
  const {
    semesterDuration,
    setSemesterDuration,
    notificationDelay,
    setNotificationDelay,
    notificationsEnabled,
    setNotificationsEnabled,
    campus,
    setCampus,
    isGuest,
  } = useEnvironmentStore();
  const { cancelAllNotifications, generateClassesNotifications } = useNotifications();
  const [isReloading, setIsReloading] = useState(false);

  const handleSemesterDuration = () => {
    const options = ['15 semanas', '16 semanas', '17 semanas', '18 semanas', 'Cancelar'];
    const cancelButtonIndex = 4;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Duração do Semestre',
        message: 'Escolha a duração do semestre',
        containerStyle: {
          paddingBottom: bottom + 8,
        },
      },
      (selectedIndex) => {
        if (selectedIndex === cancelButtonIndex) return;

        const weeks =
          selectedIndex === 0 ? 15 : selectedIndex === 1 ? 16 : selectedIndex === 2 ? 17 : 18;
        setSemesterDuration(weeks);
      }
    );
  };

  const handleCampusChange = () => {
    const campusOptions = Object.values(Campus);
    const options = [...campusOptions.map((c) => CAMPUS_LABELS[c]), 'Cancelar'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Campus',
        message: 'Escolha o seu campus',
        containerStyle: {
          paddingBottom: bottom + 8,
        },
      },
      (selectedIndex) => {
        if (selectedIndex === cancelButtonIndex) return;
        setCampus(campusOptions[selectedIndex!]);
      }
    );
  };

  const handleNotificationDelay = async () => {
    const options = ['5 minutos', '10 minutos', '15 minutos', '30 minutos', 'Cancelar'];
    const cancelButtonIndex = 4;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Antecedência das Notificações',
        message: 'Escolha com quanto tempo de antecedência você quer ser notificado das aulas',
        containerStyle: {
          paddingBottom: bottom + 8,
        },
      },
      async (selectedIndex) => {
        if (selectedIndex === cancelButtonIndex) return;

        const minutes =
          selectedIndex === 0 ? 5 : selectedIndex === 1 ? 10 : selectedIndex === 2 ? 15 : 30;

        await cancelAllNotifications();
        setNotificationDelay(minutes);
        await reloadSubjects();
      }
    );
  };

  const handleNotificationsToggle = async (value: boolean) => {
    if (!value) {
      await cancelAllNotifications();
    }
    setNotificationsEnabled(value);
    if (value) {
      setTimeout(async () => {
        await generateClassesNotifications();
      }, 1000);
    }
  };

  const handleReloadSchedule = async () => {
    Alert.alert(
      'Recarregar Grade',
      'Ao recarregar a grade, você perderá suas personalizações (salas, horários e disciplinas ocultas), todos os itens do calendário e as faltas registradas. Deseja continuar?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Recarregar',
          style: 'destructive',
          onPress: async () => {
            setIsReloading(true);
            try {
              await reloadSubjects();
              Alert.alert('Sucesso', 'Grade recarregada com sucesso!');
            } catch (error) {
              const cancelledByUser = error instanceof Error && error.message.includes('cancelada');
              if (!cancelledByUser) {
                Alert.alert(
                  'Erro',
                  'Não foi possível recarregar a grade. Verifique sua conexão e tente novamente.'
                );
              }
            } finally {
              setIsReloading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleScheduleActions = () => {
    const options = ['Recarregar grade', 'Cancelar'];
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Gerenciar Grade',
        containerStyle: {
          paddingBottom: bottom + 8,
        },
      },
      async (selectedIndex) => {
        if (selectedIndex === 0) {
          handleReloadSchedule();
        }
      }
    );
  };

  const confirmLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Ao sair da conta, você perderá todas as suas configurações e dados salvos. Deseja continuar?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: handleLogout,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      {isReloading && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black/40">
          <View className="items-center rounded-2xl bg-card px-8 py-6">
            <ActivityIndicator size="large" />
            <Text variant="subhead" className="mt-3">
              Recarregando grade...
            </Text>
          </View>
        </View>
      )}
      <Container scrollable edges={['right', 'left']}>
        <Text variant="footnote" className="mb-2 px-2 text-gray-500">
          Geral
        </Text>
        <View className="mb-6 rounded-lg bg-card">
          <TouchableOpacity
            onPress={handleSemesterDuration}
            className="flex-row items-center justify-between border-b border-gray-400/20 px-4 py-3 dark:border-gray-200/10">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-purple-400 shadow-sm">
                <MaterialCommunityIcons name="calendar-clock" size={24} color="white" />
              </View>
              <Text variant="body">Semestre</Text>
            </View>
            <View className="flex-row items-center">
              <Text variant="subhead" color="primary" className="mr-2">
                {semesterDuration} semanas
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCampusChange}
            className="flex-row items-center justify-between px-4 py-3">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-purple-400/80 shadow-sm">
                <MaterialCommunityIcons name="school" size={24} color="white" />
              </View>
              <Text variant="body">Campus</Text>
            </View>
            <View className="flex-row items-center">
              <Text variant="subhead" color="primary" className="mr-2">
                {CAMPUS_LABELS[campus!]}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
            </View>
          </TouchableOpacity>
        </View>

        <Text variant="footnote" className="mb-2 px-2 text-gray-500">
          Notificações
        </Text>
        <View className="mb-6 rounded-lg bg-card">
          <View className="flex-row items-center justify-between border-b border-gray-400/20 px-4 py-3 dark:border-gray-200/10">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-red-400 shadow-sm">
                <MaterialCommunityIcons name="bell-ring" size={24} color="white" />
              </View>
              <Text variant="body">Notificações</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.grey, true: colors.primary }}
            />
          </View>

          {notificationsEnabled && (
            <TouchableOpacity
              onPress={handleNotificationDelay}
              className="flex-row items-center justify-between px-4 py-3">
              <View className="flex-row items-center gap-3">
                <View className="h-8 w-8 items-center justify-center rounded-md bg-red-400/80 shadow-sm">
                  <MaterialCommunityIcons name="clock-time-four" size={24} color="white" />
                </View>
                <Text variant="body">Antecedência</Text>
              </View>
              <View className="flex-row items-center">
                <Text variant="subhead" color="primary" className="mr-2">
                  {notificationDelay} minutos
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <Text variant="footnote" className="mb-2 px-2 text-gray-500">
          Usuário
        </Text>
        <View className="mb-6 rounded-lg bg-card">
          <TouchableOpacity
            onPress={() => router.push('/manage-subjects')}
            className="flex-row items-center justify-between border-b border-gray-400/20 px-4 py-3 dark:border-gray-200/10">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-blue-400/80 shadow-sm">
                <MaterialCommunityIcons name="pencil" size={24} color="white" />
              </View>
              <Text variant="body">Editar disciplinas</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
          </TouchableOpacity>

          {!isGuest && (
            <TouchableOpacity
              onPress={handleScheduleActions}
              className="flex-row items-center justify-between border-b border-gray-400/20 px-4 py-3 dark:border-gray-200/10">
              <View className="flex-row items-center gap-3">
                <View className="h-8 w-8 items-center justify-center rounded-md bg-blue-400 shadow-sm">
                  <MaterialCommunityIcons name="timetable" size={24} color="white" />
                </View>
                <Text variant="body">Gerenciar Grade</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={confirmLogout}
            className="flex-row items-center justify-between px-4 py-3">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-red-500 shadow-sm">
                <MaterialCommunityIcons name="logout" size={24} color="white" />
              </View>
              <Text variant="body">Sair da conta</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
          </TouchableOpacity>
        </View>

        <Text variant="footnote" className="mb-2 px-2 text-gray-500">
          Comunidade
        </Text>
        <View className="mb-6 rounded-lg bg-card">
          <TouchableOpacity
            onPress={() => Linking.openURL('https://github.com/nossa-ufsc/mobile')}
            className="flex-row items-center justify-between border-b border-gray-400/20 px-4 py-3">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-gray-700 shadow-sm">
                <MaterialCommunityIcons name="github" size={24} color="white" />
              </View>
              <Text variant="body">Contribuir com o Código</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL('mailto:gmedeirosferraz@me.com?subject=Aplicativo%20Nossa%20UFSC')
            }
            className="flex-row items-center justify-between px-4 py-3">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-gray-700/80 shadow-sm">
                <MaterialCommunityIcons name="email" size={24} color="white" />
              </View>
              <Text variant="body">Entrar em contato</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
          </TouchableOpacity>
        </View>
      </Container>
    </>
  );
};
