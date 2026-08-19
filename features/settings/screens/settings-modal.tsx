import { useCAGRLogin } from '@/features/onboarding/hooks/use-cagr-login';
import { Container } from '@/ui/container';
import { Text } from '@/ui/text';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { SupportedLanguage } from '@/utils/i18n';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useNotifications } from '@/utils/use-notifications';
import { Campus } from '@/types';
import { CAMPUS_LABELS } from '../utils/const';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSemesterPlan } from '@/features/calendar/hooks/use-semester-plan';
import { useRebuildSchedule } from '@/utils/use-rebuild-schedule';

export const SettingsModal = () => {
  const { t } = useTranslation();
  const { handleLogout, reloadSubjects } = useCAGRLogin();
  const { colors } = useColorScheme();
  const { showActionSheetWithOptions } = useActionSheet();
  const { bottom } = useSafeAreaInsets();
  const {
    semesterDuration,
    setSemesterDuration,
    subjects,
    notificationDelay,
    setNotificationDelay,
    notificationsEnabled,
    setNotificationsEnabled,
    campus,
    setCampus,
    language,
    setLanguage,
    isGuest,
  } = useEnvironmentStore();
  const { cancelAllNotifications, generateClassesNotifications } = useNotifications();
  const { rebuild } = useRebuildSchedule();
  const semesterPlan = useSemesterPlan();
  const [isReloading, setIsReloading] = useState(false);

  // Com calendário acadêmico oficial para o semestre × campus, a duração vem dele e
  // a linha "Semestre" nem aparece. Sem calendário (semestre ainda não publicado,
  // campus não escolhido), vale a duração manual de sempre.
  const isOfficial = semesterPlan.source === 'official';

  const handleSemesterDuration = () => {
    if (isOfficial) return;
    const weekOptions = [15, 16, 17, 18];
    const options = [
      ...weekOptions.map((w) => t('settings.weeks', { count: w })),
      t('common.cancel'),
    ];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: t('settings.semesterDurationTitle'),
        message: t('settings.semesterDurationMessage'),
        containerStyle: {
          paddingBottom: bottom + 8,
        },
      },
      async (selectedIndex) => {
        if (selectedIndex === undefined || selectedIndex === cancelButtonIndex) return;
        setSemesterDuration(weekOptions[selectedIndex]);
        // A duração mudou: regenera aulas e notificações.
        if (subjects?.length) {
          try {
            await rebuild(subjects);
          } catch (error) {
            console.error('Error rebuilding schedule after semester change:', error);
          }
        }
      }
    );
  };

  const handleCampusChange = () => {
    const campusOptions = Object.values(Campus);
    const options = [...campusOptions.map((c) => CAMPUS_LABELS[c]), t('common.cancel')];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: t('settings.campusTitle'),
        message: t('settings.campusMessage'),
        containerStyle: {
          paddingBottom: bottom + 8,
        },
      },
      (selectedIndex) => {
        if (selectedIndex === undefined || selectedIndex === cancelButtonIndex) return;
        setCampus(campusOptions[selectedIndex]);
      }
    );
  };

  const handleNotificationDelay = async () => {
    const minuteOptions = [5, 10, 15, 30];
    const options = [
      ...minuteOptions.map((m) => t('settings.minutes', { count: m })),
      t('common.cancel'),
    ];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: t('settings.notificationDelayTitle'),
        message: t('settings.notificationDelayMessage'),
        containerStyle: {
          paddingBottom: bottom + 8,
        },
      },
      async (selectedIndex) => {
        if (selectedIndex === undefined || selectedIndex === cancelButtonIndex) return;

        await cancelAllNotifications();
        setNotificationDelay(minuteOptions[selectedIndex]);
        await reloadSubjects();
      }
    );
  };

  const handleLanguageChange = () => {
    const languageOptions: (SupportedLanguage | null)[] = ['pt-BR', 'en-US', 'es', null];
    const labels = [
      t('settings.languageOptions.ptBR'),
      t('settings.languageOptions.enUS'),
      t('settings.languageOptions.es'),
      t('settings.languageOptions.system'),
    ];
    const options = [...labels, t('common.cancel')];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: t('settings.language'),
        containerStyle: {
          paddingBottom: bottom + 8,
        },
      },
      (selectedIndex) => {
        if (selectedIndex === undefined || selectedIndex === cancelButtonIndex) return;
        setLanguage(languageOptions[selectedIndex]);
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
      t('settings.reloadScheduleTitle'),
      t('settings.reloadScheduleMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.reload'),
          style: 'destructive',
          onPress: async () => {
            setIsReloading(true);
            try {
              await reloadSubjects();
              Alert.alert(t('common.success'), t('settings.reloadSuccessMessage'));
            } catch (error) {
              const cancelledByUser =
                error instanceof Error &&
                (error as Error & { cancelledByUser?: boolean }).cancelledByUser;
              if (!cancelledByUser) {
                Alert.alert(t('common.error'), t('settings.reloadErrorMessage'));
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
    const options = [t('settings.reloadSchedule'), t('common.cancel')];
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: t('settings.manageScheduleTitle'),
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
      t('settings.logoutTitle'),
      t('settings.logoutMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.logoutConfirm'),
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
              {t('settings.reloadingSchedule')}
            </Text>
          </View>
        </View>
      )}
      <Container scrollable edges={['right', 'left']}>
        <Text variant="footnote" className="mb-2 px-2 text-gray-500">
          {t('settings.sections.general')}
        </Text>
        <View className="mb-6 rounded-lg bg-card">
          {!isOfficial && (
            <TouchableOpacity
              onPress={handleSemesterDuration}
              className="flex-row items-center justify-between border-b border-gray-400/20 px-4 py-3 dark:border-gray-200/10">
              <View className="flex-row items-center gap-3">
                <View className="h-8 w-8 items-center justify-center rounded-md bg-purple-400 shadow-sm">
                  <MaterialCommunityIcons name="calendar-clock" size={24} color="white" />
                </View>
                <Text variant="body">{t('settings.semester')}</Text>
              </View>
              <View className="flex-row items-center">
                <Text variant="subhead" color="primary" className="mr-2">
                  {t('settings.weeks', { count: semesterDuration })}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleCampusChange}
            className="flex-row items-center justify-between border-b border-gray-400/20 px-4 py-3 dark:border-gray-200/10">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-purple-400/80 shadow-sm">
                <MaterialCommunityIcons name="school" size={24} color="white" />
              </View>
              <Text variant="body">{t('settings.campus')}</Text>
            </View>
            <View className="flex-row items-center">
              <Text variant="subhead" color="primary" className="mr-2">
                {CAMPUS_LABELS[campus!]}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/calendar-colors')}
            className="flex-row items-center justify-between border-b border-gray-400/20 px-4 py-3 dark:border-gray-200/10">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-purple-400/70 shadow-sm">
                <MaterialCommunityIcons name="palette" size={24} color="white" />
              </View>
              <Text variant="body">{t('settings.calendarColors')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLanguageChange}
            className="flex-row items-center justify-between px-4 py-3">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-purple-400/60 shadow-sm">
                <MaterialCommunityIcons name="translate" size={24} color="white" />
              </View>
              <Text variant="body">{t('settings.language')}</Text>
            </View>
            <View className="flex-row items-center">
              <Text variant="subhead" color="primary" className="mr-2">
                {language === 'pt-BR'
                  ? t('settings.languageOptions.ptBR')
                  : language === 'en-US'
                    ? t('settings.languageOptions.enUS')
                    : language === 'es'
                      ? t('settings.languageOptions.es')
                      : t('settings.languageOptions.system')}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
            </View>
          </TouchableOpacity>
        </View>

        <Text variant="footnote" className="mb-2 px-2 text-gray-500">
          {t('settings.sections.notifications')}
        </Text>
        <View className="mb-6 rounded-lg bg-card">
          <View className="flex-row items-center justify-between border-b border-gray-400/20 px-4 py-3 dark:border-gray-200/10">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-red-400 shadow-sm">
                <MaterialCommunityIcons name="bell-ring" size={24} color="white" />
              </View>
              <Text variant="body">{t('settings.notifications')}</Text>
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
                <Text variant="body">{t('settings.notificationDelay')}</Text>
              </View>
              <View className="flex-row items-center">
                <Text variant="subhead" color="primary" className="mr-2">
                  {t('settings.minutes', { count: notificationDelay })}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <Text variant="footnote" className="mb-2 px-2 text-gray-500">
          {t('settings.sections.user')}
        </Text>
        <View className="mb-6 rounded-lg bg-card">
          <TouchableOpacity
            onPress={() => router.push('/manage-subjects')}
            className="flex-row items-center justify-between border-b border-gray-400/20 px-4 py-3 dark:border-gray-200/10">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-blue-400/80 shadow-sm">
                <MaterialCommunityIcons name="pencil" size={24} color="white" />
              </View>
              <Text variant="body">{t('settings.editSubjects')}</Text>
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
                <Text variant="body">{t('settings.manageSchedule')}</Text>
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
              <Text variant="body">{t('settings.logout')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
          </TouchableOpacity>
        </View>

        <Text variant="footnote" className="mb-2 px-2 text-gray-500">
          {t('settings.sections.community')}
        </Text>
        <View className="mb-6 rounded-lg bg-card">
          <TouchableOpacity
            onPress={() => Linking.openURL('https://github.com/nossa-ufsc/mobile')}
            className="flex-row items-center justify-between border-b border-gray-400/20 px-4 py-3">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-md bg-gray-700 shadow-sm">
                <MaterialCommunityIcons name="github" size={24} color="white" />
              </View>
              <Text variant="body">{t('settings.contribute')}</Text>
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
              <Text variant="body">{t('settings.contact')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
          </TouchableOpacity>
        </View>
      </Container>
    </>
  );
};
