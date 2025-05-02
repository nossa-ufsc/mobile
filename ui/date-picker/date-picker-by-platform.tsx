import { Platform } from 'react-native';
import { DatePicker as DatePickerAndroid } from './date-picker-android';
import { DatePicker as DatePickerIOS } from './date-picker';

export const DatePicker = Platform.OS === 'android' ? DatePickerAndroid : DatePickerIOS;
