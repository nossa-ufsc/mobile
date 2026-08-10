import type { TFunction } from 'i18next';
import { Subject } from '@/types';

/**
 * Subjects the user hasn't hidden. Excluded only when explicitly `ignored`;
 * absent = visible. Use at every render/schedule boundary to keep the semantics
 * single-sourced.
 */
export const getActiveSubjects = (subjects: Subject[]): Subject[] =>
  subjects.filter((subject) => !subject.ignored);

export const formatSubjectLabel = (
  subject: Pick<Subject, 'code' | 'classGroup'>,
  t: TFunction
): string =>
  [subject.code, subject.classGroup ? t('common.classGroup', { group: subject.classGroup }) : '']
    .filter(Boolean)
    .join(' • ');
