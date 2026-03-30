import React from 'react';
import type { SyncStatus } from './types';

interface Props {
  status: SyncStatus;
  lastSyncAt?: number | null;
}

const colorBy: Record<SyncStatus, string> = {
  idle: 'bg-gray-100 text-gray-700',
  syncing: 'bg-blue-100 text-blue-700',
  success: 'bg-emerald-100 text-emerald-700',
  error: 'bg-red-100 text-red-700',
  paused: 'bg-amber-100 text-amber-800',
};

const labelBy: Record<SyncStatus, string> = {
  idle: 'Idle',
  syncing: 'Syncing…',
  success: 'Synced',
  error: 'Sync error',
  paused: 'Paused',
};

const SyncStatusBadge: React.FC<Props> = ({ status, lastSyncAt }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${colorBy[status]} shadow-sm`}
    >
      <span className='inline-block h-2 w-2 rounded-full bg-current' />
      <span>{labelBy[status]}</span>
      {lastSyncAt ? (
        <span className='text-[11px] opacity-70'>
          {new Date(lastSyncAt).toLocaleTimeString()}
        </span>
      ) : null}
    </div>
  );
};

export default SyncStatusBadge;
