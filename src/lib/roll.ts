import type { Activity, TriggerSource } from './types';

const SOURCES: readonly TriggerSource[] = ['manual', 'leaving-work', 'arrived-home', 'tiktok'];

export function parseSource(value: unknown): TriggerSource {
  return SOURCES.includes(value as TriggerSource) ? (value as TriggerSource) : 'manual';
}

/** Location triggers mean you're home (or about to be), so home-only activities fit. */
export function isHeadedHome(source: TriggerSource) {
  return source === 'leaving-work' || source === 'arrived-home';
}

/** Activities that make sense right now: home-only ones need you to be (or be heading) home. */
export function eligibleActivities(
  activities: Activity[],
  { source, atHome }: { source: TriggerSource; atHome: boolean },
) {
  const homeOk = isHeadedHome(source) || atHome;
  return activities.filter((a) => !a.archived && (a.location === 'anywhere' || homeOk));
}

/** Random pick that avoids repeating the previous pick when there's another option. */
export function pickActivity(
  candidates: Activity[],
  previousId?: string,
  random: () => number = Math.random,
): Activity | undefined {
  if (candidates.length === 0) return undefined;
  const pool =
    candidates.length > 1 ? candidates.filter((a) => a.id !== previousId) : candidates;
  return pool[Math.floor(random() * pool.length)];
}
