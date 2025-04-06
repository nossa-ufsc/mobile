import { Subject } from '@/types';
import { useEnvironmentStore } from '@/utils/use-environment-store';

export const useSubjectDetails = (subjectId: string) => {
  const subjects = useEnvironmentStore((state) => state.subjects);
  const subject = subjects?.find((s: Subject) => s.id === subjectId);

  return {
    subject,
  };
};
