import { Subject } from '@/types';

/**
 * Subjects the user hasn't hidden. Excluded only when explicitly `ignored`;
 * absent = visible. Use at every render/schedule boundary to keep the semantics
 * single-sourced.
 */
export const getActiveSubjects = (subjects: Subject[]): Subject[] =>
  subjects.filter((subject) => !subject.ignored);
