import { AbsenceEntry } from '@/types';
import { generateRandomId } from '@/utils/generate-random-id';
import { useEnvironmentStore } from '@/utils/use-environment-store';

export const useSubjectAbsence = (subjectId: string) => {
  const subjects = useEnvironmentStore((state) => state.subjects);
  const setSubjects = useEnvironmentStore((state) => state.setSubjects);
  const semesterDuration = useEnvironmentStore((state) => state.semesterDuration);
  const subject = subjects?.find((s) => s.id === subjectId);

  const totalClasses = subject ? subject.weeklyClassCount * semesterDuration : 0;
  const maxAbsences = Math.floor(totalClasses * 0.25);
  const absences = subject?.absences ?? [];
  const totalAbsences = absences.reduce((sum, entry) => sum + entry.count, 0);
  const remainingAbsences = Math.max(0, maxAbsences - totalAbsences);

  const addAbsence = async (date: Date, numberOfAbsences = 1, isManual = false) => {
    if (!subjects || !subject) return;

    const newEntry: AbsenceEntry = {
      id: generateRandomId(),
      date: date.toDateString(),
      count: numberOfAbsences,
      isManual,
    };

    const updatedSubjects = subjects.map((s) => {
      if (s.id === subjectId) {
        return {
          ...s,
          absences: [...(s.absences ?? []), newEntry],
        };
      }
      return s;
    });

    setSubjects(updatedSubjects);
  };

  const removeAbsence = async (entryId: string) => {
    if (!subjects) return;

    const updatedSubjects = subjects.map((s) => {
      if (s.id === subjectId) {
        return {
          ...s,
          absences: (s.absences ?? []).filter((entry) => entry.id !== entryId),
        };
      }
      return s;
    });

    setSubjects(updatedSubjects);
  };

  const updateAbsence = async (entryId: string, count: number) => {
    if (!subjects) return;

    const updatedSubjects = subjects.map((s) => {
      if (s.id === subjectId) {
        return {
          ...s,
          absences: (s.absences ?? []).map((entry) =>
            entry.id === entryId ? { ...entry, count } : entry
          ),
        };
      }
      return s;
    });

    setSubjects(updatedSubjects);
  };

  const resetAbsences = async () => {
    if (!subjects) return;

    const updatedSubjects = subjects.map((s) => {
      if (s.id === subjectId) {
        return {
          ...s,
          absences: [],
        };
      }
      return s;
    });

    setSubjects(updatedSubjects);
  };

  return {
    absences,
    totalAbsences,
    maxAbsences,
    remainingAbsences,
    addAbsence,
    removeAbsence,
    updateAbsence,
    resetAbsences,
  };
};
