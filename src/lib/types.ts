export type ActivityLocation = 'home' | 'anywhere';

export type Activity = {
  id: string;
  name: string;
  emoji: string;
  location: ActivityLocation;
  archived: boolean;
  createdAt: number;
};

/** What prompted a roll. */
export type TriggerSource = 'manual' | 'leaving-work' | 'arrived-home' | 'tiktok';

export type LogStatus = 'started' | 'done' | 'skipped';

export type LogEntry = {
  id: string;
  activityId: string;
  source: TriggerSource;
  rolledAt: number;
  status: LogStatus;
  completedAt?: number;
};
