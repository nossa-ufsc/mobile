import { View, TextInput, Switch, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';
import { Button } from '@/ui/button';
import { Subject, SubjectTime } from '@/types';
import { cn } from '@/utils/cn';
import { formatSubjectLabel } from '@/utils/subjects';
import { useColorScheme } from '@/utils/use-color-scheme';
import { TimeField } from './time-field';

interface SubjectCardProps {
  subject: Subject;
  isExpanded: boolean;
  conflictingSlotIndices: number[];
  onToggleExpanded: () => void;
  onToggleIgnored: () => void;
  onDelete: () => void;
  onUpdateField: (patch: Partial<Pick<Subject, 'name' | 'code' | 'classGroup'>>) => void;
  onAddSlot: () => void;
  onRemoveSlot: (slotIndex: number) => void;
  onUpdateSlot: (slotIndex: number, patch: Partial<SubjectTime>) => void;
}

export const SubjectCard = ({
  subject,
  isExpanded,
  conflictingSlotIndices,
  onToggleExpanded,
  onToggleIgnored,
  onDelete,
  onUpdateField,
  onAddSlot,
  onRemoveSlot,
  onUpdateSlot,
}: SubjectCardProps) => {
  const { t } = useTranslation();
  const { colors } = useColorScheme();
  const { showActionSheetWithOptions } = useActionSheet();
  const { bottom } = useSafeAreaInsets();

  const weekdayLabels = t('common.weekdaysAbbr', { returnObjects: true }) as string[];
  const weekdaysFull = t('common.weekdaysFull', { returnObjects: true }) as string[];
  const weekdayOptions = [1, 2, 3, 4, 5, 6].map((weekDay) => ({
    label: weekdaysFull[weekDay],
    weekDay,
  }));

  const showSchedule = !subject.ignored && isExpanded;
  const hasConflicts = !subject.ignored && conflictingSlotIndices.length > 0;

  const stepSlotClassCount = (slotIndex: number, current: number, delta: number) => {
    const next = Math.max(1, Math.min(10, current + delta));
    if (next === current) return;
    Haptics.selectionAsync();
    onUpdateSlot(slotIndex, { classCount: next });
  };

  const pickWeekDay = (slotIndex: number) => {
    const options = [...weekdayOptions.map((option) => option.label), t('common.cancel')];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: t('subjects.weekdayPickerTitle'),
        containerStyle: { paddingBottom: bottom + 8 },
      },
      (selectedIndex) => {
        if (selectedIndex == null || selectedIndex === cancelButtonIndex) return;
        onUpdateSlot(slotIndex, { weekDay: weekdayOptions[selectedIndex].weekDay });
      }
    );
  };

  return (
    <View className="mb-4 overflow-hidden rounded-2xl bg-card">
      <View
        className={cn(
          'flex-row items-center justify-between p-4',
          showSchedule && 'border-b border-border'
        )}>
        {subject.manual ? (
          <View className="flex-1 gap-2 pr-3">
            <TextInput
              value={subject.name}
              onChangeText={(name) => onUpdateField({ name })}
              placeholder={t('subjects.namePlaceholder')}
              placeholderTextColor={colors.grey2}
              className={cn(
                'rounded-lg bg-background px-3 py-1.5 text-[17px] font-semibold text-foreground',
                !subject.name.trim() && 'border border-destructive'
              )}
            />
            <View className="flex-row gap-2">
              <TextInput
                value={subject.code}
                onChangeText={(code) => onUpdateField({ code })}
                placeholder={t('subjects.codePlaceholder')}
                placeholderTextColor={colors.grey2}
                autoCapitalize="characters"
                className="flex-1 rounded-lg bg-background px-3 py-1.5 text-[15px] text-foreground"
              />
              <TextInput
                value={subject.classGroup}
                onChangeText={(classGroup) => onUpdateField({ classGroup })}
                placeholder={t('subjects.classGroupPlaceholder')}
                placeholderTextColor={colors.grey2}
                autoCapitalize="characters"
                className="flex-1 rounded-lg bg-background px-3 py-1.5 text-[15px] text-foreground"
              />
            </View>
          </View>
        ) : (
          <TouchableOpacity
            className="flex-1 pr-3"
            disabled={subject.ignored}
            onPress={onToggleExpanded}>
            <Text variant="title3">{subject.name}</Text>
            <Text variant="footnote" color="tertiary" numberOfLines={1}>
              {formatSubjectLabel(subject, t)}
            </Text>
          </TouchableOpacity>
        )}
        <View className="flex-row items-center gap-3">
          {!subject.ignored && (
            <TouchableOpacity hitSlop={8} onPress={onToggleExpanded}>
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={colors.grey}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            hitSlop={8}
            onPress={onDelete}
            accessibilityLabel={t('subjects.deleteSubjectTitle')}>
            <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.destructive} />
          </TouchableOpacity>
          <Switch
            value={!subject.ignored}
            onValueChange={onToggleIgnored}
            trackColor={{ false: colors.grey2, true: colors.primary }}
          />
        </View>
      </View>

      {hasConflicts && !showSchedule && (
        <Text variant="footnote" className="px-4 pb-3 text-destructive">
          {t('subjects.overlapError')}
        </Text>
      )}

      {showSchedule && (
        <View className="gap-3 p-4">
          {subject.schedule.length === 0 && (
            <Text variant="footnote" color="tertiary">
              {t('subjects.noSchedules')}
            </Text>
          )}

          {hasConflicts && (
            <Text variant="footnote" className="text-destructive">
              {t('subjects.overlapError')}
            </Text>
          )}

          {subject.schedule.map((slot, index) => (
            <View
              key={index}
              className={cn(
                'gap-2 rounded-xl border p-3',
                conflictingSlotIndices.includes(index) ? 'border-destructive' : 'border-border'
              )}>
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => pickWeekDay(index)}
                  className="flex-row items-center gap-1 self-start">
                  <Text variant="subhead" className="font-medium">
                    {weekdayLabels[slot.weekDay] ?? '—'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={18} color={colors.grey} />
                </TouchableOpacity>
                <TouchableOpacity
                  hitSlop={8}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onRemoveSlot(index);
                  }}
                  accessibilityLabel={t('subjects.removeTime')}>
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={18}
                    color={colors.destructive}
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center justify-between">
                <Text variant="footnote" color="tertiary">
                  {t('subjects.start')}
                </Text>
                <TimeField
                  value={slot.startTime}
                  onChange={(startTime) => onUpdateSlot(index, { startTime })}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <Text variant="footnote" color="tertiary">
                  {t('subjects.end')}
                </Text>
                <TimeField
                  value={slot.endTime}
                  minimumTime={slot.startTime}
                  onChange={(endTime) => onUpdateSlot(index, { endTime })}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <Text variant="footnote" color="tertiary">
                  {t('subjects.room')}
                </Text>
                <TextInput
                  value={slot.room}
                  onChangeText={(room) => onUpdateSlot(index, { room })}
                  placeholder={t('subjects.roomPlaceholder')}
                  placeholderTextColor={colors.grey2}
                  className="min-w-[96px] rounded-lg bg-background px-3 py-1.5 text-center text-[15px] text-foreground"
                />
              </View>

              {subject.manual && (
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text variant="footnote" color="tertiary">
                      {t('subjects.classCountLabel')}
                    </Text>
                    <Text variant="caption2" color="quarternary">
                      {t('subjects.classCountHint')}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3 rounded-lg bg-background px-2 py-1">
                    <TouchableOpacity
                      hitSlop={8}
                      onPress={() => stepSlotClassCount(index, slot.classCount ?? 1, -1)}>
                      <MaterialCommunityIcons name="minus" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <Text variant="body" className="min-w-[24px] text-center font-medium">
                      {slot.classCount ?? 1}
                    </Text>
                    <TouchableOpacity
                      hitSlop={8}
                      onPress={() => stepSlotClassCount(index, slot.classCount ?? 1, 1)}>
                      <MaterialCommunityIcons name="plus" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}

          <Button
            variant="plain"
            size="sm"
            className="self-start"
            onPress={() => {
              Haptics.selectionAsync();
              onAddSlot();
            }}>
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
              <Text variant="subhead" className="font-medium text-primary">
                {t('subjects.addTime')}
              </Text>
            </View>
          </Button>
        </View>
      )}
    </View>
  );
};
