import { CalendarItem, Subject } from '@/types';
import { Button } from '@/ui/button';
import { DatePicker } from '@/ui/date-picker';
import { Text } from '@/ui/text';
import { View, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useCalendar } from '../hooks/use-calendar';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/utils/cn';
import * as DropdownMenu from 'zeego/dropdown-menu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const selectedType = ITEM_TYPES.find((t) => t.value === type);

  const handleDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
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
    <View className="flex-1 px-6 pt-2">
      <View className="mb-6 flex-row items-center justify-between">
        {initialItem && (
          <Pressable onPress={handleRemove} className="absolute right-0">
            <Ionicons name="trash-outline" size={24} color={colors.foreground} />
          </Pressable>
        )}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Pressable className="android:gap-3 flex-row items-center gap-1.5">
              <Text className="text-2xl font-bold">{selectedType?.label}</Text>
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
      </View>

      <View className="gap-4">
        <View className="gap-2">
          <Text color="primary" variant="subhead">
            Título
          </Text>
          <BottomSheetTextInput
            placeholder="Digite o título"
            value={title}
            onChangeText={setTitle}
            style={{
              padding: 16,
              borderRadius: 12,
              fontSize: 16,
              borderWidth: 1,
              borderColor: colors.grey2,
              color: colors.foreground,
            }}
          />
        </View>

        <View className="gap-2">
          <Text color="primary" variant="subhead">
            Descrição
          </Text>
          <BottomSheetTextInput
            placeholder="Digite uma descrição (opcional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{
              padding: 16,
              borderRadius: 12,
              fontSize: 16,
              borderWidth: 1,
              borderColor: colors.grey2,
              height: 100,
              textAlignVertical: 'top',
              color: colors.foreground,
            }}
          />
        </View>

        <View className="gap-2">
          <Text color="primary" variant="subhead">
            Data e Hora
          </Text>
          <DatePicker
            locale="pt-BR"
            mode="datetime"
            onChange={handleDateChange}
            value={date}
            minuteInterval={5}
          />
        </View>

        {!initialSubject && (
          <View className="gap-2">
            <Text color="primary" variant="subhead">
              Disciplina
            </Text>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Pressable
                  className={cn(
                    'flex-row items-center justify-between ',
                    !subject && 'border-gray-300'
                  )}>
                  <Text className="text-base font-medium">
                    {subject ? `${subject.code} - ${subject.name}` : 'Selecione uma disciplina'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.foreground} />
                </Pressable>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                {subjects.map((s) => (
                  <DropdownMenu.CheckboxItem
                    key={s.id}
                    value={s.id === subject.id}
                    onValueChange={() => setSubject(s)}>
                    <DropdownMenu.ItemIndicator />
                    <DropdownMenu.ItemTitle>{`${s.code} - ${s.name}`}</DropdownMenu.ItemTitle>
                  </DropdownMenu.CheckboxItem>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </View>
        )}
      </View>
      <Button
        variant="primary"
        onPress={handleSubmit}
        disabled={!title || !subject}
        style={{ marginBottom: bottom + 16 }}
        className="mt-auto">
        <Text className="font-medium text-white">{initialItem ? 'Salvar' : 'Adicionar'}</Text>
      </Button>
    </View>
  );
};
