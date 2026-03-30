export type PlatformKey =
  | 'leetcode'
  | 'codeforces'
  | 'hackerrank'
  | 'gfg'
  | 'spoj'
  | 'custom';

export type GoalUnit = 'problems' | 'contests' | 'points';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'paused';

export interface Goal {
  id: string;
  title: string;
  platform: PlatformKey;
  account: string; // handle or URL
  target: number;
  unit: GoalUnit;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  autoSync: boolean;
  privacy: 'public' | 'private';
  progress: number; // current value toward target
  lastSyncAt?: number | null;
  syncStatus?: SyncStatus;
  activity?: Array<{ t: number; v: number }>; // simple timeseries for sparkline
  createdAt: number;
  updatedAt: number;
  completed?: boolean;
  paused?: boolean;
}
