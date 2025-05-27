import { TouchableOpacity } from 'react-native';
import { Text } from '@/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { useCalendarState } from '@/features/calendar/hooks/use-calendar-state';
import { MONTHS } from '@/utils/const';
import { useColorScheme } from '@/utils/use-color-scheme';

export const MonthButton = () => {
  const { colors } = useColorScheme();
  const { isExpanded, setIsExpanded, currentDate } = useCalendarState();

  return (
    <TouchableOpacity
      onPress={() => setIsExpanded(!isExpanded)}
      className="flex-row items-center gap-1 px-2">
      <Text variant="title3">{MONTHS[currentDate.getMonth()]}</Text>
      <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.grey2} />
    </TouchableOpacity>
  );
};
