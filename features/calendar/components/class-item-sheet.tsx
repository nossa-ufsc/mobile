import { CalendarClassItem } from '@/types';
import { Text } from '@/ui/text';
import { View, Pressable } from 'react-native';
import { useSubjectAbsence } from '@/features/home/hooks/use-subject-absence';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ClassItemSheetProps {
  item: CalendarClassItem;
  onClose?: () => void;
}

export const ClassItemSheet = ({ item, onClose }: ClassItemSheetProps) => {
  const { addAbsence, absences, removeAbsence, updateAbsence } = useSubjectAbsence(item.subject.id);
  const { bottom } = useSafeAreaInsets();
  const existingAbsence = absences.find((entry) => entry.date === item.date.toDateString());

  const maxAbsences = item.consecutiveClasses ? item.consecutiveClasses + 1 : 1;
  const absenceOptions = Array.from({ length: maxAbsences }, (_, i) => i + 1);

  const handleAddAbsence = (count: number) => {
    addAbsence(item.date, count, false);
    onClose?.();
  };

  const handleUpdateAbsence = (count: number) => {
    if (!existingAbsence) return;
    updateAbsence(existingAbsence.id, count);
  };

  const handleRemoveAbsence = () => {
    if (!existingAbsence) return;
    removeAbsence(existingAbsence.id);
  };

  return (
    <BottomSheetScrollView
      contentContainerStyle={{ paddingBottom: 16 + bottom }}
      className="flex-1 px-6 pb-4 pt-2">
      <View className="mb-4 flex-col">
        <Text className="text-2xl font-bold">{item.subject.name}</Text>
        <Text variant="subhead" color="secondary" className="mt-1">
          {item.subject.code}
        </Text>
      </View>

      <View className="gap-6">
        <View className="gap-2">
          <Text color="primary" variant="subhead">
            Horário
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="bg-secondary/5 flex-1 rounded-xl p-4">
              <Text variant="callout">
                {new Date(item.date).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text variant="caption2" color="tertiary">
                Início
              </Text>
            </View>
            <View className="bg-secondary/5 flex-1 rounded-xl p-4">
              <Text variant="callout">
                {maxAbsences} aula{maxAbsences > 1 ? 's' : ''}
              </Text>
              <Text variant="caption2" color="tertiary">
                Duração
              </Text>
            </View>
          </View>
        </View>

        {item.description && (
          <View className="gap-2">
            <Text color="primary" variant="subhead">
              Local
            </Text>
            <View className="bg-secondary/5 rounded-xl p-4">
              <Text variant="callout">{item.description}</Text>
            </View>
          </View>
        )}

        <View className="mb-4 gap-2">
          <View className="flex-row items-center justify-between">
            <Text color="primary" variant="subhead">
              {existingAbsence ? 'Faltas Registradas' : 'Registrar Falta'}
            </Text>
            {existingAbsence && (
              <Pressable onPress={handleRemoveAbsence}>
                <Text variant="callout" className="text-destructive">
                  Remover
                </Text>
              </Pressable>
            )}
          </View>
          <View className="flex-row gap-2">
            {absenceOptions.map((count) => (
              <Pressable
                key={count}
                onPress={() =>
                  existingAbsence ? handleUpdateAbsence(count) : handleAddAbsence(count)
                }
                className={`flex-1 items-center justify-center rounded-xl p-4 ${
                  existingAbsence?.count === count
                    ? 'bg-primary'
                    : 'bg-secondary/10 active:bg-secondary/20'
                }`}>
                <Text
                  variant="callout"
                  className={existingAbsence?.count === count ? 'text-white' : undefined}>
                  {count}
                </Text>
                <Text
                  variant="caption2"
                  className={existingAbsence?.count === count ? 'text-white' : undefined}
                  color={existingAbsence?.count === count ? undefined : 'tertiary'}>
                  {count === 1 ? 'aula' : 'aulas'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </BottomSheetScrollView>
  );
};
