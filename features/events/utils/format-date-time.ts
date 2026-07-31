import { getDateLocale } from '@/utils/i18n/get-date-locale';

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString(getDateLocale(), {
    day: '2-digit',
    month: '2-digit',
  });
  const formattedTime = date.toLocaleTimeString(getDateLocale(), {
    hour: '2-digit',
    minute: '2-digit',
  });
  return { formattedDate, formattedTime };
};
