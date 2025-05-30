import { CalendarItem, Subject } from '@/types';
import { Text } from '@/ui/text';
import { View, Pressable, Alert, Switch } from 'react-native';
import { useState } from 'react';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useCalendar } from '../hooks/use-calendar';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/utils/cn';
import * as DropdownMenu from 'zeego/dropdown-menu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DatePicker } from '@/ui/date-picker';

interface CalendarItemSheetProps {
  subjects: Subject[];
  initialSubject?: Subject;
  initialItem?: CalendarItem;
  onClose?: () => void;
  initialDate?: Date;
}

const ITEM_TYPES: { label: string; value: CalendarItem['type'] }[] = [
  { label: 'Prova', value: 'exam' },
  { label: 'Lembrete', value: 'task' },
  { label: 'Trabalho', value: 'assignment' },
];

export const CalendarItemSheet = ({
  subjects,
  initialSubject,
  initialItem,
  initialDate,
  onClose,
}: CalendarItemSheetProps) => {
  const { colors } = useColorScheme();
  const { addItem, updateItem, removeItem } = useCalendar();
  const { bottom } = useSafeAreaInsets();

  const [title, setTitle] = useState(initialItem?.title ?? '');
  const [description, setDescription] = useState(initialItem?.description ?? '');
  const [date, setDate] = useState(
    initialItem ? new Date(initialItem.date) : (initialDate ?? new Date())
  );
  const [subject, setSubject] = useState(initialItem?.subject ?? initialSubject ?? subjects[0]);
  const [type, setType] = useState<CalendarItem['type']>(initialItem?.type ?? 'exam');
  const [notificationEnabled, setNotificationEnabled] = useState(
    initialItem?.notificationEnabled ?? false
  );
  const [notificationDate, setNotificationDate] = useState(
    initialItem?.notificationDate
      ? new Date(initialItem.notificationDate)
      : new Date(date.getTime() + 24 * 60 * 60 * 1000)
  );

  const selectedType = ITEM_TYPES.find((t) => t.value === type);

  const handleDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
      if (notificationDate <= selectedDate) {
        setNotificationDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
      }
    }
  };

  const handleNotificationDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setNotificationDate(selectedDate);
    }
  };

  const handleSubmit = () => {
    if (!title || !subject) return;

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

    setTitle('');
    setDescription('');
    setDate(new Date());
    setSubject(subjects[0]);
    setType('exam');
    setNotificationEnabled(false);
    setNotificationDate(new Date(date.getTime() + 24 * 60 * 60 * 1000));
    onClose?.();
  };

  const handleRemove = () => {
    Alert.alert('Excluir Item', 'Tem certeza que deseja excluir este item?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          if (initialItem) {
            removeItem(initialItem.id);
            onClose?.();
          }
        },
      },
    ]);
  };

  return (
    <BottomSheetScrollView
      contentContainerStyle={{ paddingBottom: 16 + bottom }}
      className="flex-1 bg-background">
      <View
        style={{ backgroundColor: colors.card }}
        className="flex-row items-center justify-between px-4 pb-3 pt-1">
        <Pressable onPress={onClose}>
          <Text className="text-[17px] font-normal text-[#FF3B30]">Cancelar</Text>
        </Pressable>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Pressable className="android:gap-3 flex-row items-center gap-1.5">
              <Text className="text-lg font-bold">{selectedType?.label}</Text>
              <View className="pl-0.5 opacity-70">
                <Ionicons name="chevron-down" size={20} color={colors.foreground} />
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
        <Pressable onPress={handleSubmit} disabled={!title || !subject}>
          <Text
            className={cn(
              'text-[17px] font-normal text-primary',
              (!title || !subject) && 'opacity-50'
            )}>
            {initialItem ? 'Salvar' : 'Adicionar'}
          </Text>
        </Pressable>
      </View>

      <View className="flex-1 px-4 pt-4">
        <View className="mb-4">
          <BottomSheetTextInput
            placeholder="Digite o título"
            value={title}
            onChangeText={setTitle}
            className="rounded-xl px-4 py-3 text-[17px]"
            style={{
              backgroundColor: colors.card,
              color: colors.foreground,
            }}
            placeholderTextColor={colors.grey3}
          />
        </View>

        <View className="mb-4">
          <BottomSheetTextInput
            placeholder="Digite uma observação (opcional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            className="h-[100px] rounded-xl  px-4 py-3 text-[17px]"
            style={{
              backgroundColor: colors.card,
              color: colors.foreground,
            }}
            placeholderTextColor={colors.grey3}
            textAlignVertical="top"
          />
        </View>

        <View className="mb-4">
          <View
            style={{ backgroundColor: colors.card }}
            className="flex-row items-center justify-between rounded-xl px-4 py-3">
            <Text className="text-[17px] text-foreground">Data</Text>
            <DatePicker
              locale="pt-BR"
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
            <Text className="text-[17px] text-foreground">Notificação</Text>
            <Switch
              value={notificationEnabled}
              onValueChange={setNotificationEnabled}
              trackColor={{ false: colors.grey2, true: colors.primary }}
            />
          </View>
          {notificationEnabled && (
            <View className="flex-row items-center justify-between rounded-xl border-t border-gray-200 pt-3 dark:border-gray-600">
              <Text className="text-[17px] text-foreground">Horário</Text>
              <DatePicker
                locale="pt-BR"
                mode="datetime"
                onChange={handleNotificationDateChange}
                value={notificationDate}
                minimumDate={new Date(date.getTime() + 60 * 1000)}
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
                    <Text className="text-[17px] text-foreground">
                      {subject ? subject.name : 'Selecione uma disciplina'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={colors.grey3} />
                  </Pressable>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  {subjects.map((s) => (
                    <DropdownMenu.CheckboxItem
                      key={s.id}
                      value={s.id === subject.id}
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
            className="mb-4 mt-auto flex-row items-center justify-center rounded-xl bg-card px-4 py-3"
            style={{
              marginBottom: bottom + 8,
            }}>
            <Ionicons name="trash-outline" size={24} color="#FF3B30" className="mr-2" />
            <Text className="text-[17px] text-[#FF3B30]">Excluir</Text>
          </Pressable>
        )}
      </View>
    </BottomSheetScrollView>
  );
};
