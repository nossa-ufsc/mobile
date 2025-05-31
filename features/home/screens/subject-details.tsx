import { Container } from '@/ui/container';
import { Text } from '@/ui/text';
import { View, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSubjectAbsence } from '../hooks/use-subject-absence';
import { useCalendar } from '@/features/calendar/hooks/use-calendar';
import { useRef, useState } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Sheet } from '@/ui/bottom-sheet';
import { CalendarItemSheet } from '@/features/calendar/components/calendar-item-sheet';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { CalendarItem } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/utils/use-color-scheme';
import { AbsenceSheet } from '../components/absence-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export const SubjectDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const subjects = useEnvironmentStore((state) => state.subjects);
  const subject = subjects?.find((s) => s.id === id);
  const { getItemsBySubject } = useCalendar();
  const { addAbsence, removeAbsence, maxAbsences, absences, remainingAbsences, totalAbsences } =
    useSubjectAbsence(id);
  const calendarSheetRef = useRef<BottomSheetModal>(null);
  const absenceSheetRef = useRef<BottomSheetModal>(null);
  const { colors } = useColorScheme();
  const [selectedItem, setSelectedItem] = useState<CalendarItem | undefined>(undefined);
  const insets = useSafeAreaInsets();

  if (!subjects || !subject) return null;

  const handleAddPress = () => {
    setSelectedItem(undefined);
    calendarSheetRef.current?.present();
  };

  const handleClose = () => {
    calendarSheetRef.current?.dismiss();
    setSelectedItem(undefined);
  };

  const handleCloseAbsence = () => {
    absenceSheetRef.current?.dismiss();
  };

  const handlePressItem = (item: CalendarItem) => {
    setSelectedItem(item);
    calendarSheetRef.current?.present();
  };

  const sortedItems = getItemsBySubject(subject).sort((a, b) => {
    const now = new Date();
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);
    const aIsPast = aDate < now;
    const bIsPast = bDate < now;

    if (aIsPast && !bIsPast) return 1;
    if (!aIsPast && bIsPast) return -1;
    return aDate.getTime() - bDate.getTime();
  });

  const handleAddAbsence = () => {
    absenceSheetRef.current?.present();
  };

  return (
    <Container contentStyle={{ paddingBottom: insets.bottom }} scrollable className="px-4">
      <View className="pb-4 pt-2">
        <Text variant="mediumTitle" numberOfLines={2} className="mb-1">
          {subject.name}
        </Text>
        <Text variant="subhead" color="tertiary">
          {subject.code} • Turma {subject.classGroup}
        </Text>
        <Text variant="footnote" color="tertiary">
          {subject.professors.map((professor) => professor).join(', ')}
        </Text>
      </View>

      <View className="mb-6 overflow-hidden rounded-2xl bg-card">
        <View className="flex-row items-center justify-between border-b border-border p-4">
          <Text variant="title3">Frequência</Text>
          <Pressable hitSlop={8} onPress={handleAddAbsence}>
            <Ionicons name="add" size={24} color={colors.foreground} />
          </Pressable>
        </View>

        <View className="p-4">
          <View className="mb-6 flex-col rounded-xl bg-[#f3f3f7] p-4 dark:bg-[#1b1b1f]">
            <View className="mb-3 items-center">
              <Text variant="largeTitle" className="text-center">
                {totalAbsences}
              </Text>
              <Text variant="subhead" color="tertiary" className="text-center">
                Faltas Registradas
              </Text>
            </View>
            <View className="mb-3 h-[1px] w-full bg-border" />
            <View className="flex-row justify-between">
              <View className="flex-1 items-center">
                <Text variant="callout" color="tertiary">
                  {maxAbsences}
                </Text>
                <Text variant="caption2" color="tertiary">
                  Máximo
                </Text>
              </View>
              <View className="h-8 w-[1px] bg-border" />
              <View className="flex-1 items-center">
                <Text variant="callout" color="tertiary">
                  {remainingAbsences}
                </Text>
                <Text variant="caption2" color="tertiary">
                  Restantes
                </Text>
              </View>
            </View>
          </View>

          {absences.length === 0 ? (
            <Text variant="callout" color="tertiary" className="text-center">
              Nenhuma falta registrada
            </Text>
          ) : (
            absences
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry) => (
                <View
                  key={entry.id}
                  className="mb-3 flex-row items-center justify-between rounded-xl bg-[#f3f3f7] p-4 dark:bg-[#1b1b1f]">
                  <View>
                    <Text variant="callout">
                      {entry.count} aula{entry.count > 1 ? 's' : ''}
                    </Text>
                    <Text variant="caption2" color="tertiary">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <Pressable
                    hitSlop={4}
                    onPress={() => removeAbsence(entry.id)}
                    className="bg-destructive/10 active:bg-destructive/20 h-8 w-8 items-center justify-center rounded-full">
                    <Text variant="callout" className="text-destructive">
                      ×
                    </Text>
                  </Pressable>
                </View>
              ))
          )}
        </View>
      </View>

      <View className="mb-6 overflow-hidden rounded-2xl bg-card">
        <View className="flex-row items-center justify-between border-b border-border p-4">
          <Text variant="title3">Atividades</Text>
          <Pressable hitSlop={8} onPress={handleAddPress}>
            <Ionicons name="add" size={24} color={colors.foreground} />
          </Pressable>
        </View>
        {sortedItems.length === 0 ? (
          <View className="p-4">
            <Text variant="callout" color="tertiary" className="text-center">
              Nenhuma atividade encontrada
            </Text>
          </View>
        ) : (
          sortedItems.map((item, index) => {
            const isPast = new Date(item.date) < new Date();
            return (
              <Pressable
                key={item.id}
                onPress={() => handlePressItem(item)}
                className={`p-4 ${
                  index !== sortedItems.length - 1 ? 'border-b border-border' : ''
                } ${isPast ? 'opacity-50' : ''}`}>
                <View className="mb-1 flex-row items-center justify-between">
                  <Text variant="body" className="flex-1">
                    {item.title}
                  </Text>
                  <Text variant="subhead" color="tertiary">
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                {item.description && (
                  <Text variant="footnote" color="tertiary">
                    {item.description}
                  </Text>
                )}
              </Pressable>
            );
          })
        )}
      </View>

      <View className="mb-6 overflow-hidden rounded-2xl bg-card">
        <View className="border-b border-border p-4">
          <Text variant="title3">Horários</Text>
        </View>
        {subject.schedule.map((time, index) => (
          <View
            key={index}
            className={`p-4 ${
              index !== subject.schedule.length - 1 ? 'border-b border-border' : ''
            }`}>
            <View className="mb-1 flex-row items-center justify-between">
              <Text variant="body">
                {time.startTime} - {time.endTime}
              </Text>
              <Text variant="subhead" color="tertiary">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][time.weekDay]}
              </Text>
            </View>
            <Text variant="footnote" color="tertiary">
              {time.room} • {time.center}
            </Text>
          </View>
        ))}
      </View>

      <Sheet
        onAnimate={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        ref={calendarSheetRef}
        enableDynamicSizing>
        <CalendarItemSheet
          subjects={subjects}
          onClose={handleClose}
          initialItem={selectedItem}
          initialSubject={subject}
        />
      </Sheet>

      <Sheet
        onAnimate={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        ref={absenceSheetRef}
        enableDynamicSizing>
        <AbsenceSheet
          onSubmit={(date, count) => addAbsence(date, count, true)}
          onClose={handleCloseAbsence}
        />
      </Sheet>
    </Container>
  );
};
