export const timeMapping: Record<string, string> = {
  '07:30': '08:20',
  '08:20': '09:10',
  '09:10': '10:00',
  '10:10': '11:00',
  '11:00': '11:50',
  '13:30': '14:20',
  '14:20': '15:10',
  '15:10': '16:00',
  '16:20': '17:10',
  '17:10': '18:00',
  '18:30': '19:20',
  '19:20': '20:10',
  '20:20': '21:10',
  '21:10': '22:00',
};

export const numericTimeMapping: Record<number, string> = {
  730: '07:30',
  820: '08:20',
  910: '09:10',
  1010: '10:10',
  1100: '11:00',
  1330: '13:30',
  1420: '14:20',
  1510: '15:10',
  1620: '16:20',
  1710: '17:10',
  1830: '18:30',
  1920: '19:20',
  2020: '20:20',
  2110: '21:10',
};

export const numericTimeOrder: Record<string, number> = {
  '07:30': 0,
  '08:20': 1,
  '09:10': 2,
  '10:10': 3,
  '11:00': 4,
  '13:30': 5,
  '14:20': 6,
  '15:10': 7,
  '16:20': 8,
  '17:10': 9,
  '18:30': 10,
  '19:20': 11,
  '20:20': 12,
  '21:10': 13,
};

export const formatNumericTime = (numericTime: number): string => {
  return numericTimeMapping[numericTime] || numericTime.toString();
};

export const getEndTime = (startTime: string): string => {
  return timeMapping[startTime] || startTime;
};

export const cagrDayIndexToJsIndex = (cagrDayIndex: number): number => {
  // CAGR: 1=Sunday, 2=Monday, ..., 7=Saturday
  // JS: 0=Sunday, 1=Monday, ..., 6=Saturday
  return (cagrDayIndex - 1) % 7;
};
