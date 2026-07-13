import { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Container } from '@/ui/container';
import { Text } from '@/ui/text';
import { Button } from '@/ui/button';
import { Subject } from '@/types';
import { cn } from '@/utils/cn';
import { timeToMinutes } from '@/utils/time-mapping';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { useRebuildSchedule } from '@/utils/use-rebuild-schedule';
import { useColorScheme } from '@/utils/use-color-scheme';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// UFSC classes run Monday–Saturday; the picker offers those days.
const WEEKDAY_OPTIONS = [
  { label: 'Segunda-feira', weekDay: 1 },
  { label: 'Terça-feira', weekDay: 2 },
  { label: 'Quarta-feira', weekDay: 3 },
  { label: 'Quinta-feira', weekDay: 4 },
  { label: 'Sexta-feira', weekDay: 5 },
  { label: 'Sábado', weekDay: 6 },
];

const timeStringToDate = (time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

const dateToTimeString = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Default institutional class length, used to keep the end after the start.
const DEFAULT_CLASS_MINUTES = 50;

const minutesToTime = (totalMinutes: number): string => {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, totalMinutes));
  const hours = String(Math.floor(clamped / 60)).padStart(2, '0');
  const minutes = String(clamped % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Deep-copies subjects (subject + schedule entries) so edits don't mutate the store.
const toDraft = (subjects: Subject[] | null): Subject[] =>
  (subjects ?? []).map((subject) => ({
    ...subject,
    schedule: subject.schedule.map((slot) => ({ ...slot })),
  }));

// A tappable "HH:MM" pill that opens the native time picker only when pressed.
// Mounting the native picker lazily (instead of an always-on inline picker) keeps
// expanding a subject snappy, and the pill stays readable in both light/dark.
const TimeField = ({
  value,
  minimumDate,
  onChange,
}: {
  value: string;
  minimumDate?: Date;
  onChange: (time: string) => void;
}) => {
  const { colorScheme } = useColorScheme();
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const date = timeStringToDate(value);

  const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (selected) onChange(dateToTimeString(selected));
  };

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        mode: 'time',
        is24Hour: true,
        minimumDate,
        onChange: handleChange,
      });
    } else {
      setShowIOSPicker(true);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={open}
        className="min-w-[80px] rounded-lg bg-background px-3 py-1.5">
        <Text variant="body" className="text-center">
          {value}
        </Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && showIOSPicker && (
        <Modal
          transparent
          visible
          animationType="fade"
          onRequestClose={() => setShowIOSPicker(false)}>
          <Pressable
            className="flex-1 justify-end bg-black/40"
            onPress={() => setShowIOSPicker(false)}>
            <Pressable className="rounded-t-3xl bg-card px-4 pb-10 pt-3" onPress={() => {}}>
              <DateTimePicker
                value={date}
                mode="time"
                display="spinner"
                locale="pt-BR"
                themeVariant={colorScheme}
                minimumDate={minimumDate}
                onChange={handleChange}
              />
              <Button size="lg" onPress={() => setShowIOSPicker(false)}>
                Concluir
              </Button>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
};

export const ManageSubjectsScreen = () => {
  const router = useRouter();
  const { fromOnboarding, subjectId } = useLocalSearchParams<{
    fromOnboarding?: string;
    subjectId?: string;
  }>();
  const { colors } = useColorScheme();
  const { showActionSheetWithOptions } = useActionSheet();
  const { bottom } = useSafeAreaInsets();

  const subjects = useEnvironmentStore((state) => state.subjects);
  const setSubjects = useEnvironmentStore((state) => state.setSubjects);
  const { rebuild } = useRebuildSchedule();

  const [draft, setDraft] = useState<Subject[]>(() => toDraft(subjects));
  const [isSaving, setIsSaving] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>(subjectId ? [subjectId] : []);
  const displayedDraft = subjectId ? draft.filter((subject) => subject.id === subjectId) : draft;

  const toggleExpanded = (subjectId: string) => {
    setExpandedIds((current) =>
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId]
    );
  };

  const toggleIgnored = (subjectId: string) => {
    setDraft((current) =>
      current.map((subject) =>
        subject.id === subjectId ? { ...subject, ignored: !subject.ignored } : subject
      )
    );
  };

  const updateSlot = (
    subjectId: string,
    slotIndex: number,
    patch: Partial<Subject['schedule'][number]>
  ) => {
    setDraft((current) =>
      current.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              schedule: subject.schedule.map((slot, index) =>
                index === slotIndex ? { ...slot, ...patch } : slot
              ),
            }
          : subject
      )
    );
  };

  // Updates a slot's start or end time while keeping the end strictly after the
  // start (the end picker also enforces this via minimumDate, but a change to the
  // start can invalidate an existing end, so we clamp here too).
  const updateSlotTime = (
    subjectId: string,
    slotIndex: number,
    field: 'startTime' | 'endTime',
    time: string
  ) => {
    setDraft((current) =>
      current.map((subject) => {
        if (subject.id !== subjectId) return subject;
        return {
          ...subject,
          schedule: subject.schedule.map((slot, index) => {
            if (index !== slotIndex) return slot;
            const next = { ...slot, [field]: time };
            if (timeToMinutes(next.endTime) <= timeToMinutes(next.startTime)) {
              next.endTime = minutesToTime(timeToMinutes(next.startTime) + DEFAULT_CLASS_MINUTES);
            }
            return next;
          }),
        };
      })
    );
  };

  const pickWeekDay = (subjectId: string, slotIndex: number) => {
    const options = [...WEEKDAY_OPTIONS.map((option) => option.label), 'Cancelar'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Dia da semana',
        containerStyle: { paddingBottom: bottom + 8 },
      },
      (selectedIndex) => {
        if (selectedIndex == null || selectedIndex === cancelButtonIndex) return;
        updateSlot(subjectId, slotIndex, { weekDay: WEEKDAY_OPTIONS[selectedIndex].weekDay });
      }
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      setSubjects(draft);
      await rebuild(draft);

      if (fromOnboarding === 'true') {
        router.replace('/(app)/(tabs)/(home)');
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Error saving subjects:', error);
      Alert.alert('Erro', 'Não foi possível salvar suas alterações. Tente novamente.');
      setIsSaving(false);
    }
  };

  return (
    <Container>
      {fromOnboarding !== 'true' && (
        <Stack.Screen
          options={{
            title: subjectId ? 'Editar disciplina' : 'Editar disciplinas',
            headerLeft: () => (
              <Pressable
                onPress={() => router.back()}
                hitSlop={8}
                style={{ alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="close" size={24} color={colors.primary} />
              </Pressable>
            ),
          }}
        />
      )}

      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="py-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets>
        <Text variant="footnote" color="tertiary" className="mb-4">
          Desative as disciplinas que não quer acompanhar e ajuste o dia, a sala ou o horário de
          cada aula. As alterações valem para seu horário, calendário, notificações e widgets.
        </Text>

        {displayedDraft.length === 0 && (
          <Text variant="body" color="tertiary" className="mt-8 text-center">
            Nenhuma disciplina para gerenciar.
          </Text>
        )}

        {displayedDraft.map((subject) => {
          const isExpanded = expandedIds.includes(subject.id);
          const showSchedule = !subject.ignored && isExpanded;
          return (
            <View key={subject.id} className="mb-4 overflow-hidden rounded-2xl bg-card">
              <View
                className={cn(
                  'flex-row items-center justify-between p-4',
                  showSchedule && 'border-b border-border'
                )}>
                <TouchableOpacity
                  className="flex-1 pr-3"
                  disabled={subject.ignored}
                  onPress={() => toggleExpanded(subject.id)}>
                  <Text variant="title3" numberOfLines={2}>
                    {subject.name}
                  </Text>
                  <Text variant="footnote" color="tertiary" numberOfLines={1}>
                    {subject.code}
                    {subject.classGroup ? ` • Turma ${subject.classGroup}` : ''}
                  </Text>
                </TouchableOpacity>
                <View className="flex-row items-center gap-3">
                  {!subject.ignored && (
                    <TouchableOpacity hitSlop={8} onPress={() => toggleExpanded(subject.id)}>
                      <MaterialCommunityIcons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={22}
                        color={colors.grey}
                      />
                    </TouchableOpacity>
                  )}
                  <Switch
                    value={!subject.ignored}
                    onValueChange={() => toggleIgnored(subject.id)}
                    trackColor={{ false: colors.grey2, true: colors.primary }}
                  />
                </View>
              </View>

              {showSchedule && (
                <View className="gap-3 p-4">
                  {subject.schedule.length === 0 && (
                    <Text variant="footnote" color="tertiary">
                      Sem horários cadastrados.
                    </Text>
                  )}

                  {subject.schedule.map((slot, index) => (
                    <View key={index} className="gap-2 rounded-xl border border-border p-3">
                      <TouchableOpacity
                        onPress={() => pickWeekDay(subject.id, index)}
                        className="flex-row items-center gap-1 self-start">
                        <Text variant="subhead" className="font-medium">
                          {WEEKDAY_LABELS[slot.weekDay] ?? '—'}
                        </Text>
                        <MaterialCommunityIcons name="chevron-down" size={18} color={colors.grey} />
                      </TouchableOpacity>

                      <View className="flex-row items-center justify-between">
                        <Text variant="footnote" color="tertiary">
                          Início
                        </Text>
                        <TimeField
                          value={slot.startTime}
                          onChange={(time) => updateSlotTime(subject.id, index, 'startTime', time)}
                        />
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text variant="footnote" color="tertiary">
                          Fim
                        </Text>
                        <TimeField
                          value={slot.endTime}
                          minimumDate={timeStringToDate(slot.startTime)}
                          onChange={(time) => updateSlotTime(subject.id, index, 'endTime', time)}
                        />
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text variant="footnote" color="tertiary">
                          Sala
                        </Text>
                        <TextInput
                          value={slot.room}
                          onChangeText={(room) => updateSlot(subject.id, index, { room })}
                          placeholder="Sala"
                          placeholderTextColor={colors.grey2}
                          className="min-w-[96px] rounded-lg bg-background px-3 py-1.5 text-center text-[15px] text-foreground"
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View className="border-t border-border px-4 py-3">
        <Button size="lg" onPress={handleSave} disabled={isSaving} isLoading={isSaving}>
          {/* Non-string child so Button renders its spinner while isLoading. */}
          <Text variant="body">Salvar</Text>
        </Button>
      </View>
    </Container>
  );
};
