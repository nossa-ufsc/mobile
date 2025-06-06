export const getSemesterStartDate = (): Date => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = January, ..., 11 = December

  let startMonth: number;
  let startDay: number;

  if (month >= 0 && month <= 5) {
    // Jan (0) to Jun (5)
    startMonth = 2; // March (2)
    startDay = 8;
  } else {
    // Jul (6) to Dec (11)
    startMonth = 7; // August (7)
    startDay = 8;
  }

  const startDate = new Date(year, startMonth, startDay);
  startDate.setHours(0, 0, 0, 0);

  return startDate;
};
