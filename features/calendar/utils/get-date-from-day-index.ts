export const getDateFromDayIndex = (dayIndex: number) => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentWeekDay = today.getDay();

  const adjustedCurrentWeekDay = currentWeekDay === 0 ? 7 : currentWeekDay;
  const diff = dayIndex - adjustedCurrentWeekDay;

  const targetDate = new Date(today);
  targetDate.setDate(currentDay + diff);
  return targetDate;
};
