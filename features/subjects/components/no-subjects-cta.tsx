import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/button';
import { EmptyState } from '@/ui/empty-state';

// Shown when the user has no subjects at all (e.g. logged in but CAGR returned
// nothing, or pós-graduação students whose subjects aren't in CAGR). Points them
// to manage-subjects, where subjects can be added manually.
export const NoSubjectsCta = () => {
  const { t } = useTranslation();

  return (
    <EmptyState title={t('home.noSubjectsTitle')} subtitle={t('home.noSubjectsSubtitle')}>
      <Button size="lg" className="mt-6" onPress={() => router.push('/manage-subjects')}>
        {t('home.addSubjectsCta')}
      </Button>
    </EmptyState>
  );
};
