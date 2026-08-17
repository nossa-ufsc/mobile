import { useState } from 'react';
import { View, Pressable, Alert, Switch, ScrollView, TextInput, Platform } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as DropdownMenu from 'zeego/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { CalendarItem } from '@/types';
import { Text } from '@/ui/text';
import { Container } from '@/ui/container';
import { DatePicker } from '@/ui/date-picker';
import { HeaderTextButton, plainHeaderItem } from '@/ui/header-text-button';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { getActiveSubjects } from '@/utils/subjects';
import { getDateLocale } from '@/utils/i18n/get-date-locale';
import { useCalendar } from '../hooks/use-calendar';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Params da rota `/calendar-item`:
 * - `itemId`: edita um item existente (título vira "Salvar" + botão de excluir).
 * - `subjectId`: fixa a disciplina (esconde o seletor) ao criar a partir dos detalhes dela.
 * - `date`: data inicial (ISO) ao criar a partir do calendário.
 */
export type CalendarItemParams = {
  itemId?: string;
  subjectId?: string;
  date?: string;
};

export const CalendarItemScreen = () => {
  const { t } = useTranslation();
  const { colors } = useColorScheme();
  const { itemId, subjectId, date: dateParam } = useLocalSearchParams<CalendarItemParams>();
  const allSubjects = useEnvironmentStore((state) => state.subjects) ?? [];
  const { items, addItem, updateItem, removeItem } = useCalendar();

  const initialItem = itemId ? items.find((item) => item.id === itemId) : undefined;
  const initialSubject = subjectId ? allSubjects.find((s) => s.id === subjectId) : undefined;
  const subjects = getActiveSubjects(allSubjects);

  const ITEM_TYPES: { label: string; value: CalendarItem['type'] }[] = [
    { label: t('calendarItemSheet.types.exam'), value: 'exam' },
    { label: t('calendarItemSheet.types.task'), value: 'task' },
    { label: t('calendarItemSheet.types.assignment'), value: 'assignment' },
  ];

  const [title, setTitle] = useState(initialItem?.title ?? '');
  const [description, setDescription] = useState(initialItem?.description ?? '');
  const [date, setDate] = useState(() =>
    initialItem ? new Date(initialItem.date) : dateParam ? new Date(dateParam) : new Date()
  );
  const [subject, setSubject] = useState(initialItem?.subject ?? initialSubject ?? subjects[0]);
  const [type, setType] = useState<CalendarItem['type']>(initialItem?.type ?? 'exam');
  const [notificationEnabled, setNotificationEnabled] = useState(
    initialItem?.notificationEnabled ?? false
  );
  const [notificationDateManuallySet, setNotificationDateManuallySet] = useState(
    Boolean(initialItem?.notificationDate)
  );
  const [notificationDate, setNotificationDate] = useState(() =>
    initialItem?.notificationDate
      ? new Date(initialItem.notificationDate)
      : new Date(date.getTime() - ONE_DAY_MS)
  );

  const selectedType = ITEM_TYPES.find((itemType) => itemType.value === type);
  const canSubmit = !!title && !!subject;

  const handleDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    if (!notificationDateManuallySet) {
      setNotificationDate(new Date(selectedDate.getTime() - ONE_DAY_MS));
    }
  };

  const handleNotificationDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    if (!selectedDate) return;
    setNotificationDate(selectedDate);
    setNotificationDateManuallySet(true);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const itemData = {
      title,
      description,
      date,
      type,
      subject,
      notificationEnabled,
      notificationDate: notificationEnabled ? notificationDate : undefined,
    };

    if (initialItem) {
      updateItem(initialItem.id, itemData);
    } else {
      addItem(itemData);
    }

    router.back();
  };

  const handleRemove = () => {
    if (!initialItem) return;
    Alert.alert(t('calendarItemSheet.deleteTitle'), t('calendarItemSheet.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          removeItem(initialItem.id);
          router.back();
        },
      },
    ]);
  };

  const inputStyle = { backgroundColor: colors.card, color: colors.foreground };

  const cancelButton = (
    <HeaderTextButton label={t('common.cancel')} onPress={() => router.back()} destructive />
  );
  const submitButton = (
    <HeaderTextButton
      label={initialItem ? t('common.save') : t('common.add')}
      onPress={handleSubmit}
      disabled={!canSubmit}
    />
  );
  const typeSelector = (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Pressable className="flex-row items-center gap-1.5" hitSlop={8}>
          <Text className="text-[17px] font-semibold">{selectedType?.label}</Text>
          <View className="opacity-70">
            <Ionicons name="chevron-down" size={18} color={colors.foreground} />
          </View>
        </Pressable>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {ITEM_TYPES.map((itemType) => (
          <DropdownMenu.CheckboxItem
            key={itemType.value}
            value={type === itemType.value}
            onValueChange={() => setType(itemType.value)}>
            <DropdownMenu.ItemIndicator />
            <DropdownMenu.ItemTitle>{itemType.label}</DropdownMenu.ItemTitle>
          </DropdownMenu.CheckboxItem>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: selectedType?.label ?? '',
          headerTitle: () => typeSelector,
          headerLeft: () => cancelButton,
          headerRight: () => submitButton,
          unstable_headerLeftItems: () => plainHeaderItem(cancelButton),
          unstable_headerRightItems: () => plainHeaderItem(submitButton),
        }}
      />
      <Container>
        <ScrollView
          className="flex-1 px-4"
          contentContainerClassName="py-4 pb-10"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          <View className="mb-4">
            <TextInput
              placeholder={t('calendarItemSheet.titlePlaceholder')}
              value={title}
              onChangeText={setTitle}
              className="rounded-xl px-4 py-3 text-[17px]"
              style={inputStyle}
              placeholderTextColor={colors.grey3}
              returnKeyType="next"
            />
          </View>

          <View className="mb-4">
            <TextInput
              placeholder={t('calendarItemSheet.descriptionPlaceholder')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              className="h-[100px] rounded-xl px-4 py-3 text-[17px]"
              style={inputStyle}
              placeholderTextColor={colors.grey3}
              textAlignVertical="top"
            />
          </View>

          <View className="mb-4">
            <View
              style={{ backgroundColor: colors.card }}
              className="flex-row items-center justify-between rounded-xl px-4 py-3">
              <Text className="text-[17px] text-foreground">{t('calendarItemSheet.date')}</Text>
              <DatePicker
                locale={getDateLocale()}
                mode="datetime"
                onChange={handleDateChange}
                value={date}
                minuteInterval={5}
              />
            </View>
          </View>

          <View
            style={{ backgroundColor: colors.card }}
            className="mb-4 flex flex-col rounded-xl px-4 py-3">
            <View
              style={{ paddingBottom: notificationEnabled ? 12 : 0 }}
              className="flex-row items-center justify-between">
              <Text className="text-[17px] text-foreground">
                {t('calendarItemSheet.notification')}
              </Text>
              <Switch
                value={notificationEnabled}
                onValueChange={setNotificationEnabled}
                trackColor={{ false: colors.grey2, true: colors.primary }}
              />
            </View>
            {notificationEnabled && (
              <View className="flex-row items-center justify-between rounded-xl border-t border-gray-200 pt-3 dark:border-gray-600">
                <Text className="text-[17px] text-foreground">
                  {t('calendarItemSheet.notificationTime')}
                </Text>
                <DatePicker
                  locale={getDateLocale()}
                  mode="datetime"
                  onChange={handleNotificationDateChange}
                  value={notificationDate}
                  minuteInterval={5}
                />
              </View>
            )}
          </View>

          {!initialSubject && (
            <View className="mb-4">
              <View style={{ backgroundColor: colors.card }} className="overflow-hidden rounded-xl">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Pressable className="flex-row items-center justify-between px-4 py-3">
                      <Text className="flex-1 text-[17px] text-foreground" numberOfLines={1}>
                        {subject ? subject.name : t('calendarItemSheet.selectSubject')}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color={colors.grey3} />
                    </Pressable>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    {subjects.map((s) => (
                      <DropdownMenu.CheckboxItem
                        key={s.id}
                        value={s.id === subject?.id}
                        onValueChange={() => setSubject(s)}>
                        <DropdownMenu.ItemIndicator />
                        <DropdownMenu.ItemTitle>{s.name}</DropdownMenu.ItemTitle>
                      </DropdownMenu.CheckboxItem>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </View>
            </View>
          )}

          {initialItem && (
            <Pressable
              onPress={handleRemove}
              className="mb-4 flex-row items-center justify-center rounded-xl px-4 py-3"
              style={{ backgroundColor: colors.card }}>
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              <Text className="ml-2 text-[17px] text-[#FF3B30]">{t('common.delete')}</Text>
            </Pressable>
          )}
          {Platform.OS === 'ios' && <View className="h-4" />}
        </ScrollView>
      </Container>
    </>
  );
};
