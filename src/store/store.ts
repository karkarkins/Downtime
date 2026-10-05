import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Activity, ActivityLocation, LogEntry, TriggerSource } from '@/lib/types';

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const seed = (name: string, emoji: string, location: ActivityLocation): Activity => ({
  id: newId(),
  name,
  emoji,
  location,
  archived: false,
  createdAt: Date.now(),
});

const SEED_ACTIVITIES: Activity[] = [
  seed('Play drums', '🥁', 'home'),
  seed('Play video games', '🎮', 'home'),
  seed('Go for a walk', '🚶', 'anywhere'),
  seed('Read a book', '📖', 'anywhere'),
];

export type ActivityInput = Pick<Activity, 'name' | 'emoji' | 'location'>;

type DowntimeState = {
  activities: Activity[];
  log: LogEntry[];
  /** Best guess of whether you're home; set by geofencing later, or manually on the roll screen. */
  atHome: boolean;
  lastPickId?: string;

  addActivity: (input: ActivityInput) => void;
  updateActivity: (id: string, patch: Partial<ActivityInput>) => void;
  setArchived: (id: string, archived: boolean) => void;
  setAtHome: (atHome: boolean) => void;

  /** Commit to a rolled activity. Any activity still in progress counts as skipped. */
  startActivity: (activityId: string, source: TriggerSource) => void;
  /** Turn down a rolled activity without doing it. */
  skipActivity: (activityId: string, source: TriggerSource) => void;
  finishEntry: (entryId: string, status: 'done' | 'skipped') => void;
};

export const useDowntime = create<DowntimeState>()(
  persist(
    (set) => ({
      activities: SEED_ACTIVITIES,
      log: [],
      atHome: true,

      addActivity: (input) =>
        set((s) => ({
          activities: [
            ...s.activities,
            { ...input, id: newId(), archived: false, createdAt: Date.now() },
          ],
        })),
      updateActivity: (id, patch) =>
        set((s) => ({
          activities: s.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      setArchived: (id, archived) =>
        set((s) => ({
          activities: s.activities.map((a) => (a.id === id ? { ...a, archived } : a)),
        })),
      setAtHome: (atHome) => set({ atHome }),

      startActivity: (activityId, source) =>
        set((s) => {
          const now = Date.now();
          const closed = s.log.map((e) =>
            e.status === 'started' ? { ...e, status: 'skipped' as const, completedAt: now } : e,
          );
          return {
            lastPickId: activityId,
            log: [{ id: newId(), activityId, source, rolledAt: now, status: 'started' }, ...closed],
          };
        }),
      skipActivity: (activityId, source) =>
        set((s) => ({
          lastPickId: activityId,
          log: [
            {
              id: newId(),
              activityId,
              source,
              rolledAt: Date.now(),
              status: 'skipped',
              completedAt: Date.now(),
            },
            ...s.log,
          ],
        })),
      finishEntry: (entryId, status) =>
        set((s) => ({
          log: s.log.map((e) =>
            e.id === entryId ? { ...e, status, completedAt: Date.now() } : e,
          ),
        })),
    }),
    {
      name: 'downtime-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        activities: s.activities,
        log: s.log,
        atHome: s.atHome,
        lastPickId: s.lastPickId,
      }),
    },
  ),
);

/** True once saved data has loaded from storage. */
export function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useDowntime.persist.onFinishHydration(onChange),
    () => useDowntime.persist.hasHydrated(),
    () => false,
  );
}

export function useActivityMap() {
  const activities = useDowntime((s) => s.activities);
  return new Map(activities.map((a) => [a.id, a]));
}
