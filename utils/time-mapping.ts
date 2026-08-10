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

export const formatNumericTime = (numericTime: number): string => {
  return numericTimeMapping[numericTime] || numericTime.toString();
};

export const getEndTime = (startTime: string): string => {
  return timeMapping[startTime] || startTime;
};

/**
 * Converts an "HH:MM" string into minutes since midnight.
 * Returns NaN for malformed/empty input so callers can treat it as invalid.
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (totalMinutes: number): string => {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, totalMinutes));
  const hours = String(Math.floor(clamped / 60)).padStart(2, '0');
  const minutes = String(clamped % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Max gap (minutes) between one slot ending and the next starting for them to
 * still count as a single consecutive block. 20 exactly reproduces the previous
 * grid-based behavior (back-to-back slots have a 0-min gap; the three
 * institutional lunch breaks are 10/20/10 min) while also absorbing small
 * manual time adjustments.
 */
export const CONSECUTIVE_GAP_TOLERANCE_MINUTES = 20;

/**
 * Whether two class slots should be merged into a single consecutive block.
 * Works for arbitrary (off-grid) times: the next slot must start after the
 * previous one ends, within CONSECUTIVE_GAP_TOLERANCE_MINUTES.
 */
export const areClassesConsecutive = (previousEndTime: string, nextStartTime: string): boolean => {
  const gap = timeToMinutes(nextStartTime) - timeToMinutes(previousEndTime);
  return gap >= 0 && gap <= CONSECUTIVE_GAP_TOLERANCE_MINUTES;
};

export const cagrDayIndexToJsIndex = (cagrDayIndex: number): number => {
  // CAGR: 1=Sunday, 2=Monday, ..., 7=Saturday
  // JS: 0=Sunday, 1=Monday, ..., 6=Saturday
  return (cagrDayIndex - 1) % 7;
};
