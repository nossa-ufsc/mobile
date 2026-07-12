import { useEnvironmentStore } from './use-environment-store';
import { useRebuildSchedule } from './use-rebuild-schedule';
import { useEffect, useRef } from 'react';

export const useMigrateCalendarItems = () => {
  const { isAuthenticated, subjects, isCalendarFixMigrated, setIsCalendarFixMigrated } =
    useEnvironmentStore();
  const { rebuild } = useRebuildSchedule();
  // Guards against a second concurrent run while the async rebuild is in flight
  // (the persisted flag is only set after success, so it can't guard the gap).
  const isMigrating = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!subjects || subjects.length === 0) return;
    if (isCalendarFixMigrated) return;
    if (isMigrating.current) return;

    isMigrating.current = true;

    (async () => {
      try {
        await rebuild(subjects);
        // Mark migrated only after a successful rebuild so a failure retries later.
        setIsCalendarFixMigrated(true);
      } catch (error) {
        console.error('Calendar migration scheduling error:', error);
        isMigrating.current = false;
      }
    })();
  }, [isAuthenticated, subjects]);
};
