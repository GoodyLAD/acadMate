import React, { useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import SyncStatusBadge from './SyncStatusBadge';
import type { Goal } from './types';

interface Props {
  goal: Goal | null;
  onOpenChange: (open: boolean) => void;
  onSyncNow: (id: string) => void;
}

function predict(goal: Goal) {
  const start = new Date(goal.startDate + 'T00:00:00').getTime();
  const days = Math.max(
    1,
    Math.round((Date.now() - start) / (1000 * 60 * 60 * 24))
  );
  const pace = goal.progress / days; // per day
  const remaining = Math.max(0, goal.target - goal.progress);
  const etaDays = pace > 0 ? Math.ceil(remaining / pace) : Infinity;
  const eta = isFinite(etaDays)
    ? new Date(Date.now() + etaDays * 24 * 60 * 60 * 1000)
    : null;
  const suggestion =
    pace >=
    goal.target /
      Math.max(
        1,
        Math.round(
          (new Date(goal.endDate + 'T00:00:00').getTime() - start) /
            (1000 * 60 * 60 * 24)
        )
      )
      ? 'On track'
      : 'Increase pace';
  return { pace: Math.round(pace * 10) / 10, eta, suggestion };
}

const GoalDetailPanel: React.FC<Props> = ({
  goal,
  onOpenChange,
  onSyncNow,
}) => {
  const stats = useMemo(() => (goal ? predict(goal) : null), [goal]);
  return (
    <Sheet open={!!goal} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>{goal?.title}</SheetTitle>
        </SheetHeader>
        {goal && (
          <div className='mt-4 space-y-4'>
            <div className='flex items-center justify-between'>
              <SyncStatusBadge
                status={goal.syncStatus || 'idle'}
                lastSyncAt={goal.lastSyncAt}
              />
              <Button size='sm' onClick={() => onSyncNow(goal.id)}>
                Sync Now
              </Button>
            </div>
            <div className='rounded-lg border p-4 bg-white'>
              <div className='text-sm text-muted-foreground'>Platform</div>
              <div className='font-medium capitalize'>{goal.platform}</div>
              <div className='mt-2 text-sm text-muted-foreground'>Account</div>
              <div className='font-medium break-all'>{goal.account}</div>
            </div>
            <div className='rounded-lg border p-4 bg-white'>
              <div className='text-sm text-muted-foreground'>Progress</div>
              <div className='font-semibold'>
                {goal.progress}/{goal.target} {goal.unit}
              </div>
              <div className='text-sm'>
                {Math.round((goal.progress / Math.max(1, goal.target)) * 100)}%
              </div>
            </div>
            <div className='rounded-lg border p-4 bg-white'>
              <div className='text-sm text-muted-foreground'>Pacing</div>
              <div className='text-sm'>
                Current pace:{' '}
                <span className='font-semibold'>
                  {stats?.pace ?? 0}/{goal.unit.slice(0, -1)}/day
                </span>
              </div>
              <div className='text-sm'>
                Predicted completion:{' '}
                <span className='font-semibold'>
                  {stats?.eta ? stats.eta.toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className='text-sm'>
                Suggestion:{' '}
                <span className='font-semibold'>{stats?.suggestion}</span>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default GoalDetailPanel;
