import { Subject } from '@/types';
import { Text } from '@/ui/text';
import { View } from 'react-native';

interface ClassCardProps {
  subject: Subject;
  time: {
    startTime: string;
    endTime: string;
    room: string;
    center: string;
  };
}

export const ClassCard = ({ subject, time }: ClassCardProps) => {
  return (
    <View className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold" numberOfLines={1}>
            {subject.name}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {subject.code} - Turma {subject.classGroup}
          </Text>
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
    </View>
  );
};
