import { useCAGRLogin } from '@/features/onboarding/hooks/use-cagr-login';
import { Button } from '@/ui/button';
import { Container } from '@/ui/container';
import { Text } from '@/ui/text';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, TouchableOpacity, Switch } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useNotifications } from '@/utils/use-notifications';

export default function Modal() {
  const { handleLogout, reloadSubjects } = useCAGRLogin();
  const { colors } = useColorScheme();
  const { showActionSheetWithOptions } = useActionSheet();
  const {
    setSubjects,
    semesterDuration,
    setSemesterDuration,
    notificationDelay,
    setNotificationDelay,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useEnvironmentStore();
  const { cancelAllNotifications } = useNotifications();

  const handleSemesterDuration = () => {
    const options = ['15 semanas', '16 semanas', '17 semanas', '18 semanas', 'Cancelar'];
    const cancelButtonIndex = 4;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Duração do Semestre',
        message: 'Escolha a duração do semestre',
      },
      (selectedIndex) => {
        if (selectedIndex === cancelButtonIndex) return;

        const weeks =
          selectedIndex === 0 ? 15 : selectedIndex === 1 ? 16 : selectedIndex === 2 ? 17 : 18;
        setSemesterDuration(weeks);
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
      await reloadSubjects();
    }
  };

  const handleScheduleActions = () => {
    const options = ['Recarregar grade', 'Apagar grade', 'Cancelar'];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        title: 'Gerenciar Grade',
        message: 'Escolha uma ação para sua grade horária',
      },
      async (selectedIndex) => {
        if (selectedIndex === 0) {
          await reloadSubjects();
        } else if (selectedIndex === 1) {
          setSubjects(null);
        }
      }
    );
  };

  return (
    <>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <Container scrollable>
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
              <Text variant="body">Duração do Semestre</Text>
            </View>
            <View className="flex-row items-center">
              <Text variant="subhead" color="primary" className="mr-2">
                {semesterDuration} semanas
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
            </View>
          </TouchableOpacity>

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
              className="flex-row items-center justify-between border-b border-gray-400/20 px-4 py-3 dark:border-gray-200/10">
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

          <TouchableOpacity
            onPress={handleScheduleActions}
            className="flex-row items-center justify-between px-4 py-3">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-blue-400 shadow-sm">
                <MaterialCommunityIcons name="timetable" size={24} color="white" />
              </View>
              <Text variant="body">Gerenciar Grade</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
          </TouchableOpacity>
        </View>

        <Button onPress={handleLogout} variant="secondary" size="lg" className="w-full">
          <Text>Sair</Text>
        </Button>
      </Container>
    </>
  );
}
