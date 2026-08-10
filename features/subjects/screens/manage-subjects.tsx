import { useState } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Container } from '@/ui/container';
import { Text } from '@/ui/text';
import { Button } from '@/ui/button';
import { Subject, SubjectTime } from '@/types';
import { timeToMinutes, minutesToTime } from '@/utils/time-mapping';
import { generateRandomId } from '@/utils/generate-random-id';
import { useEnvironmentStore } from '@/utils/use-environment-store';
import { useRebuildSchedule } from '@/utils/use-rebuild-schedule';
import { useColorScheme } from '@/utils/use-color-scheme';
import { SubjectCard } from '../components/subject-card';

// Default institutional class length, used to keep the end after the start.
const DEFAULT_CLASS_MINUTES = 50;

// Deep-copies subjects (subject + schedule entries) so edits don't mutate the store.
const toDraft = (subjects: Subject[] | null): Subject[] =>
  (subjects ?? []).map((subject) => ({
    ...subject,
    schedule: subject.schedule.map((slot) => ({ ...slot })),
  }));

const makeSlot = (): SubjectTime => ({
  weekDay: 1,
  startTime: '08:20',
  endTime: minutesToTime(timeToMinutes('08:20') + DEFAULT_CLASS_MINUTES),
  center: '',
  room: '',
});

const makeNextSlot = (schedule: SubjectTime[]): SubjectTime => {
  const last = schedule[schedule.length - 1];
  if (!last) return makeSlot();
  return { ...last, weekDay: last.weekDay >= 6 ? 1 : last.weekDay + 1 };
};

const slotsOverlap = (a: SubjectTime, b: SubjectTime): boolean =>
  a.weekDay === b.weekDay &&
  timeToMinutes(a.startTime) < timeToMinutes(b.endTime) &&
  timeToMinutes(b.startTime) < timeToMinutes(a.endTime);

const conflictsFor = (subject: Subject): number[] =>
  subject.ignored
    ? []
    : subject.schedule.flatMap((slot, index) =>
        subject.schedule.some(
          (other, otherIndex) => otherIndex !== index && slotsOverlap(slot, other)
        )
          ? [index]
          : []
      );

const deriveWeeklyClassCount = (schedule: SubjectTime[]): number =>
  Math.round(
    schedule.reduce(
      (total, slot) =>
        total + Math.max(0, timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime)),
      0
    ) / DEFAULT_CLASS_MINUTES
  );

export const ManageSubjectsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { fromOnboarding, subjectId } = useLocalSearchParams<{
    fromOnboarding?: string;
    subjectId?: string;
  }>();
  const { colors } = useColorScheme();
  const { bottom } = useSafeAreaInsets();

  const subjects = useEnvironmentStore((state) => state.subjects);
  const setSubjects = useEnvironmentStore((state) => state.setSubjects);
  const { rebuild } = useRebuildSchedule();

  const [draft, setDraft] = useState<Subject[]>(() => toDraft(subjects));
  const [isSaving, setIsSaving] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>(subjectId ? [subjectId] : []);

  const displayedDraft = subjectId ? draft.filter((subject) => subject.id === subjectId) : draft;
  const isValid = displayedDraft.every(
    (subject) =>
      (!subject.manual || subject.name.trim().length > 0) && conflictsFor(subject).length === 0
  );

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

  const updateSubjectField = (
    subjectId: string,
    patch: Partial<Pick<Subject, 'name' | 'code' | 'classGroup'>>
  ) => {
    setDraft((current) =>
      current.map((subject) => (subject.id === subjectId ? { ...subject, ...patch } : subject))
    );
  };

  const addSubject = () => {
    const id = generateRandomId();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft((current) => [
      ...current,
      {
        id,
        name: '',
        code: '',
        classGroup: '',
        weeklyClassCount: 1,
        absences: [],
        professors: [],
        schedule: [makeSlot()],
        manual: true,
      },
    ]);
    setExpandedIds((current) => [...current, id]);
  };

  const addSlot = (subjectId: string) => {
    setDraft((current) =>
      current.map((subject) =>
        subject.id === subjectId
          ? { ...subject, schedule: [...subject.schedule, makeNextSlot(subject.schedule)] }
          : subject
      )
    );
  };

  const removeSlot = (subjectId: string, slotIndex: number) => {
    setDraft((current) =>
      current.map((subject) =>
        subject.id === subjectId
          ? { ...subject, schedule: subject.schedule.filter((_, index) => index !== slotIndex) }
          : subject
      )
    );
  };

  const deleteSubject = (subjectId: string) => {
    const subject = draft.find((s) => s.id === subjectId);
    Alert.alert(
      t('subjects.deleteSubjectTitle'),
      t('subjects.deleteSubjectMessage', { name: subject?.name || subject?.code || '' }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setDraft((current) => current.filter((s) => s.id !== subjectId));
            setExpandedIds((current) => current.filter((id) => id !== subjectId));
          },
        },
      ]
    );
  };

  const updateSlot = (subjectId: string, slotIndex: number, patch: Partial<SubjectTime>) => {
    setDraft((current) =>
      current.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              schedule: subject.schedule.map((slot, index) => {
                if (index !== slotIndex) return slot;
                const next = { ...slot, ...patch };
                if (timeToMinutes(next.endTime) <= timeToMinutes(next.startTime)) {
                  next.endTime = minutesToTime(
                    timeToMinutes(next.startTime) + DEFAULT_CLASS_MINUTES
                  );
                }
                return next;
              }),
            }
          : subject
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const cleaned = draft.map((subject) =>
        subject.manual
          ? {
              ...subject,
              name: subject.name.trim(),
              code: subject.code.trim(),
              classGroup: subject.classGroup.trim(),
              weeklyClassCount: deriveWeeklyClassCount(subject.schedule),
            }
          : subject
      );

      setSubjects(cleaned);
      await rebuild(cleaned);

      if (fromOnboarding === 'true') {
        router.replace('/(app)/(tabs)/(home)');
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Error saving subjects:', error);
      Alert.alert(t('common.error'), t('subjects.saveFailed'));
      setIsSaving(false);
    }
  };

  const showAddButton = !subjectId;
  const showEmptyState = displayedDraft.length === 0;
  const addButtonProminent = showEmptyState;

  return (
    <Container>
      {fromOnboarding !== 'true' && (
        <Stack.Screen
          options={{
            title: subjectId ? t('subjects.editSubject') : t('subjects.editSubjects'),
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
        {showEmptyState ? (
          subjectId ? (
            <Text variant="body" color="tertiary" className="mt-8 text-center">
              {t('subjects.noneToManage')}
            </Text>
          ) : (
            <View className="items-center px-4 pt-24">
              <Text variant="title3" className="text-center">
                {t('subjects.emptyTitle')}
              </Text>
              <Text variant="subhead" color="tertiary" className="mt-2 text-center">
                {t('subjects.emptySubtitle')}
              </Text>
            </View>
          )
        ) : (
          <Text variant="footnote" color="tertiary" className="mb-4">
            {t('subjects.helperText')}
          </Text>
        )}

        {displayedDraft.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            isExpanded={expandedIds.includes(subject.id)}
            conflictingSlotIndices={conflictsFor(subject)}
            onToggleExpanded={() => toggleExpanded(subject.id)}
            onToggleIgnored={() => toggleIgnored(subject.id)}
            onDelete={() => deleteSubject(subject.id)}
            onUpdateField={(patch) => updateSubjectField(subject.id, patch)}
            onAddSlot={() => addSlot(subject.id)}
            onRemoveSlot={(slotIndex) => removeSlot(subject.id, slotIndex)}
            onUpdateSlot={(slotIndex, patch) => updateSlot(subject.id, slotIndex, patch)}
          />
        ))}

        {showAddButton && (
          <Button
            variant={addButtonProminent ? 'primary' : 'tonal'}
            size="lg"
            className={addButtonProminent ? 'mt-6' : ''}
            onPress={addSubject}>
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={addButtonProminent ? 'white' : colors.primary}
              />
              <Text
                variant="body"
                className={
                  addButtonProminent ? 'font-medium text-white' : 'font-medium text-primary'
                }>
                {t('subjects.addSubject')}
              </Text>
            </View>
          </Button>
        )}
      </ScrollView>

      <View className="border-t border-border px-4 pt-3" style={{ paddingBottom: bottom + 12 }}>
        <Button size="lg" onPress={handleSave} disabled={isSaving || !isValid} isLoading={isSaving}>
          <Text variant="body">{t('common.save')}</Text>
        </Button>
      </View>
    </Container>
  );
};
