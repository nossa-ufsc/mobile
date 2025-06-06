import { Subject } from '@/types';
import { Text } from '@/ui/text';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { ProgressIndicator } from '@/ui/progress-indicator';
import { cn } from '@/utils/cn';
import { useSubjectAbsence } from '../hooks/use-subject-absence';
import { useCalendar } from '@/features/calendar/hooks/use-calendar';
import { getItemColor } from '@/features/calendar/components/calendar-day-view';
import * as DropdownMenu from 'zeego/dropdown-menu';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/utils/use-color-scheme';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

interface ClassCardProps {
  subject: Subject;
  time: {
    startTime: string;
    endTime: string;
    room: string;
    center: string;
  };
  onPress: () => void;
  consecutiveClasses: number;
  currentDate: Date;
}

export const ClassCard = ({
  subject,
  time,
  onPress,
  consecutiveClasses,
  currentDate,
}: ClassCardProps) => {
  const { absences, totalAbsences, maxAbsences, remainingAbsences, addAbsence, removeAbsence } =
    useSubjectAbsence(subject.id);
  const isHighAbsence = remainingAbsences < Math.ceil(maxAbsences * 0.15);
  const isMediumAbsence = remainingAbsences < Math.ceil(maxAbsences * 0.4);
  const { getItemsByDateAndSubject } = useCalendar();
  const { colors } = useColorScheme();
  const { showActionSheetWithOptions } = useActionSheet();
  const { bottom } = useSafeAreaInsets();

  const handleAddAbsence = () => {
    if (consecutiveClasses > 0) {
      const options = Array.from(
        { length: consecutiveClasses + 1 },
        (_, i) => `${i + 1} aula${i > 0 ? 's' : ''}`
      );
      options.push('Cancelar');
      const cancelButtonIndex = options.length - 1;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: 'Adicionar Falta',
          message: 'Quantas aulas você faltou?',
          containerStyle: {
            paddingBottom: bottom + 8,
          },
        },
        (selectedIndex) => {
          if (selectedIndex !== undefined && selectedIndex !== cancelButtonIndex) {
            addAbsence(currentDate, selectedIndex + 1, false);
          }
        }
      );
    } else {
      addAbsence(currentDate, 1, false);
    }
  };

  const classAbsences = absences.filter((entry) => entry.date === currentDate.toDateString());

  const hasAbsenceForClass = classAbsences.length > 0;

  const todayItems = getItemsByDateAndSubject(currentDate, subject);

  const handleRemoveAbsence = () => {
    removeAbsence(classAbsences[0].id);
  };

  return (
    <TouchableOpacity className="mb-4 rounded-2xl bg-card p-4 shadow-sm" onPress={onPress}>
      <View className="mb-2 flex-row items-start justify-between">
        <Pressable onPress={onPress} className="mr-3 flex-1 active:opacity-70">
          <Text className="text-lg font-semibold" numberOfLines={1} adjustsFontSizeToFit>
            {subject.name}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {subject.code} - Turma {subject.classGroup}
          </Text>
        </Pressable>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Pressable
              onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              hitSlop={24}
              className="pt-1 active:opacity-50">
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.foreground} />
            </Pressable>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item
              key="absence"
              onSelect={hasAbsenceForClass ? handleRemoveAbsence : handleAddAbsence}>
              <DropdownMenu.ItemTitle>
                {hasAbsenceForClass ? 'Remover falta' : 'Adicionar falta'}
              </DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
            <DropdownMenu.Item key="details" onSelect={onPress}>
              <DropdownMenu.ItemTitle>Ver detalhes</DropdownMenu.ItemTitle>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </View>

      {hasAbsenceForClass && (
        <View className="bg-destructive/10 mt-2 rounded-lg px-3 py-2">
          <Text className="text-sm text-destructive">
            Falta registrada ({classAbsences[0].count} aula{classAbsences[0].count > 1 ? 's' : ''})
          </Text>
        </View>
      )}

      <View className="mt-3 flex-row items-end justify-between">
        <View className="flex-col items-center gap-1">
          <View className="flex-row items-center">
            <Text className="text-base font-medium">
              {time.startTime} - {time.endTime}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="location" size={16} color={colors.grey2} />
            <Text className="flex-1" variant="subhead" color="tertiary" numberOfLines={1}>
              {time.room}
            </Text>
          </View>
        </View>
        <View className="items-end pb-2">
          <View className="flex-row items-center gap-1">
            <Text
              variant="footnote"
              color="tertiary"
              className={`font-medium ${isHighAbsence ? 'text-destructive' : isMediumAbsence ? 'text-yellow-500' : ''}`}>
              {totalAbsences}
            </Text>
            <Text variant="caption2" color="tertiary">
              faltas
            </Text>
          </View>
          <View className="mt-1 w-16">
            <ProgressIndicator
              value={totalAbsences}
              max={maxAbsences}
              className={cn(
                isHighAbsence
                  ? 'bg-red-500/10'
                  : isMediumAbsence
                    ? 'bg-yellow-500/10'
                    : 'bg-secondary/10'
              )}
              indicatorClassName={cn(
                isHighAbsence ? 'bg-red-500' : isMediumAbsence ? 'bg-yellow-500' : 'bg-primary'
              )}
            />
          </View>
        </View>
      </View>

      {!!todayItems?.length && (
        <View className="mt-3 flex-col items-start gap-1 border-t border-border pt-3">
          {todayItems.map((item) => (
            <View key={item.id} className="flex-row items-center gap-3">
              <View className={cn(getItemColor(item.type), 'h-3 w-3 rounded-full')} />
              <Text variant="subhead" className="flex-1 text-foreground" numberOfLines={1}>
                {item.title}
              </Text>
              <Text variant="subhead" color="tertiary" numberOfLines={1}>
                {new Date(item.date).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};
