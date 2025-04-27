export const getSemesterStartDate = (): Date => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  let startMonth: number;

  if (month >= 2 && month <= 6) {
    startMonth = 2;
  } else if (month >= 7 && month <= 11) {
    startMonth = 7;
  } else {
    startMonth = 7;
    now.setFullYear(year - 1);
  }

  const startDate = new Date(now.getFullYear(), startMonth, 1);
  startDate.setHours(0, 0, 0, 0);

  return startDate;
};
