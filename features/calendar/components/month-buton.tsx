import { TouchableOpacity } from 'react-native';
import { Text } from '@/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useCalendarState } from '@/features/calendar/hooks/use-calendar-state';
import { useColorScheme } from '@/utils/use-color-scheme';

export const MonthButton = () => {
  const { colors } = useColorScheme();
  const { t } = useTranslation();
  const months = t('common.months', { returnObjects: true }) as string[];
  const { isExpanded, setIsExpanded, currentDate } = useCalendarState();

  return (
    <TouchableOpacity
      onPressIn={() => setIsExpanded(!isExpanded)}
      hitSlop={8}
      className="flex-row items-center gap-1 px-2">
      <Text variant="title3">{months[currentDate.getMonth()]}</Text>
      <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.grey2} />
    </TouchableOpacity>
  );
};
