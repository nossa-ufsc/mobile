import { useEnvironmentStore } from '@/utils/use-environment-store';

export const useSubjectAbsence = (subjectId: string) => {
  const subjects = useEnvironmentStore((state) => state.subjects);
  const setSubjects = useEnvironmentStore((state) => state.setSubjects);
  const semesterDuration = useEnvironmentStore((state) => state.semesterDuration);
  const subject = subjects?.find((s) => s.id === subjectId);

  const totalClasses = subject ? subject.weeklyClassCount * semesterDuration : 0;
  const maxAbsences = Math.floor(totalClasses * 0.25);
  const absences = subject?.absenceCount ?? 0;
  const remainingAbsences = Math.max(0, maxAbsences - absences);

  const addAbsence = async () => {
    if (!subjects) return;

    const updatedSubjects = subjects.map((subject) => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          absenceCount: (subject.absenceCount ?? 0) + 1,
        };
      }
      return subject;
    });

    setSubjects(updatedSubjects);
  };

  const removeAbsence = async () => {
    if (!subjects) return;

    const updatedSubjects = subjects.map((subject) => {
      if (subject.id === subjectId) {
        const newCount = Math.max(0, (subject.absenceCount ?? 0) - 1);
        return {
          ...subject,
          absenceCount: newCount,
        };
      }
      return subject;
    });

    setSubjects(updatedSubjects);
  };

  const resetAbsences = async () => {
    if (!subjects) return;

    const updatedSubjects = subjects.map((subject) => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          absenceCount: 0,
        };
      }
      return subject;
    });

    setSubjects(updatedSubjects);
  };

  const setAbsences = async (count: number) => {
    if (!subjects) return;

    const updatedSubjects = subjects.map((subject) => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          absenceCount: Math.max(0, count),
        };
      }
      return subject;
    });

    setSubjects(updatedSubjects);
  };

  return {
    absences,
    maxAbsences,
    remainingAbsences,
    addAbsence,
    removeAbsence,
    resetAbsences,
    setAbsences,
    totalClasses,
  };
};
