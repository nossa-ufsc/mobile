import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/ui/empty-state';

export const NoClasses = () => {
  const { t } = useTranslation();
  return <EmptyState title={t('home.noClassesTitle')} subtitle={t('home.noClassesSubtitle')} />;
};
