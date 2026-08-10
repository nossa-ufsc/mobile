import { useState } from 'react';
import { TouchableOpacity, Modal, Pressable, Platform } from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';
import { Button } from '@/ui/button';
import { minutesToTime } from '@/utils/time-mapping';
import { useColorScheme } from '@/utils/use-color-scheme';
import { getDateLocale } from '@/utils/i18n/get-date-locale';

const timeStringToDate = (time: string): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

const dateToTimeString = (date: Date): string =>
  minutesToTime(date.getHours() * 60 + date.getMinutes());

// A tappable "HH:MM" pill that opens the native time picker only when pressed.
// Mounting the native picker lazily (instead of an always-on inline picker) keeps
// expanding a subject snappy, and the pill stays readable in both light/dark.
// The whole interface stays in the "HH:MM" string domain; Date conversion is an
// internal detail.
export const TimeField = ({
  value,
  minimumTime,
  onChange,
}: {
  value: string;
  minimumTime?: string;
  onChange: (time: string) => void;
}) => {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const date = timeStringToDate(value);
  const minimumDate = minimumTime ? timeStringToDate(minimumTime) : undefined;

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
                locale={getDateLocale()}
                themeVariant={colorScheme}
                minimumDate={minimumDate}
                onChange={handleChange}
              />
              <Button size="lg" onPress={() => setShowIOSPicker(false)}>
                {t('subjects.done')}
              </Button>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
};
