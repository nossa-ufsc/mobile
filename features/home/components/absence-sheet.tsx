import { DatePicker } from '@/ui/date-picker';
import { Text } from '@/ui/text';
import { View, Pressable } from 'react-native';
import { useState } from 'react';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/ui/button';

interface AbsenceSheetProps {
  onSubmit: (date: Date, count: number) => void;
  onClose?: () => void;
}

export const AbsenceSheet = ({ onSubmit, onClose }: AbsenceSheetProps) => {
  const { bottom } = useSafeAreaInsets();
  const [date, setDate] = useState(new Date());
  const [count, setCount] = useState(1);

  const handleDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = () => {
    onSubmit(date, count);
    onClose?.();
  };

  return (
    <View className="flex-1 px-6 pt-2">
      <View className="mb-6">
        <Text className="text-2xl font-bold">Adicionar Falta</Text>
      </View>

      <View className="gap-6">
        <View className="gap-2">
          <Text color="primary" variant="subhead">
            Data
          </Text>
          <DatePicker locale="pt-BR" mode="date" onChange={handleDateChange} value={date} />
        </View>

        <View className="gap-2">
          <Text color="primary" variant="subhead">
            Quantidade de Aulas
          </Text>
          <View className="flex-row gap-2">
            {[1, 2, 3, 4].map((number) => (
              <Pressable
                key={number}
                onPress={() => setCount(number)}
                className={`flex-1 items-center justify-center rounded-xl p-3 ${
                  count === number ? 'bg-primary' : 'bg-secondary/10'
                }`}>
                <Text className={count === number ? 'text-white' : undefined} variant="callout">
                  {number}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <Button
        variant="primary"
        onPress={handleSubmit}
        style={{ marginBottom: bottom + 16 }}
        className="mt-auto">
        <Text className="font-medium text-white">Adicionar</Text>
      </Button>
    </View>
  );
};
