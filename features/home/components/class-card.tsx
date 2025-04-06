import { Subject } from '@/types';
import { Text } from '@/ui/text';
import { Pressable, View } from 'react-native';
import { ProgressIndicator } from '@/ui/progress-indicator';
import { cn } from '@/utils/cn';
import { useSubjectAbsence } from '../hooks/use-subject-absence';

interface ClassCardProps {
  subject: Subject;
  time: {
    startTime: string;
    endTime: string;
    room: string;
    center: string;
  };
  onPress: () => void;
}

export const ClassCard = ({ subject, time, onPress }: ClassCardProps) => {
  const { absences, maxAbsences, remainingAbsences } = useSubjectAbsence(subject.id);
  const isHighAbsence = remainingAbsences < 3;
  const isMediumAbsence = remainingAbsences < 8;

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 rounded-2xl bg-card p-4 shadow-sm active:opacity-70">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="mr-3 flex-1">
          <Text className="text-lg font-semibold" numberOfLines={1}>
            {subject.name}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {subject.code} - Turma {subject.classGroup}
          </Text>
        </View>

        {/* Absence Indicator */}
        <View className="items-end">
          <View className="flex-row items-center gap-1">
            <Text
              variant="footnote"
              color="tertiary"
              className={`font-medium ${isHighAbsence ? 'text-destructive' : isMediumAbsence ? 'text-yellow-500' : ''}`}>
              {absences}
            </Text>
            <Text variant="caption2" color="tertiary">
              faltas
            </Text>
          </View>
          <View className="mt-1 w-16">
            <ProgressIndicator
              value={absences}
              max={maxAbsences}
              className={cn(
                'bg-secondary/10',
                isHighAbsence && 'bg-destructive/10',
                isMediumAbsence && 'bg-yellow-500/10'
              )}
              indicatorClassName={cn(
                'bg-primary',
                isHighAbsence && 'bg-destructive',
                isMediumAbsence && 'bg-yellow-500'
              )}
            />
          </View>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-base font-medium">
            {time.startTime} - {time.endTime}
          </Text>
        </View>
        <View className="flex-1 px-4">
          <Text className="text-sm text-muted-foreground" numberOfLines={1}>
            {time.room}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
