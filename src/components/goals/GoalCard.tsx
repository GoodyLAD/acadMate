import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import SyncStatusBadge from './SyncStatusBadge';
import type { Goal } from './types';
import {
  Pause,
  CheckCircle2,
  Pencil,
  Plus,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { PLATFORMS } from './platforms';

interface Props {
  goal: Goal;
  onBump: (id: string, delta: number) => void;
  onComplete: (id: string) => void;
  onTogglePause: (id: string) => void;
  onEdit: (g: Goal) => void;
  onOpenDetail: (g: Goal) => void;
}

function Sparkline({ points }: { points: Array<{ t: number; v: number }> }) {
  const path = useMemo(() => {
    const maxV = Math.max(1, ...points.map(p => p.v));
    const lastN = points.slice(-20);
    if (!lastN.length) return 'M0,12 L120,12';
    const stepX = 120 / Math.max(1, lastN.length - 1);
    const coords = lastN
      .map((p, i) => {
        const x = i * stepX;
        const y = 24 - (p.v / maxV) * 24;
        return `${x},${y}`;
      })
      .join(' L');
    return `M${coords}`;
  }, [points]);
  return (
    <svg
      width='120'
      height='24'
      viewBox='0 0 120 24'
      className='opacity-70 text-indigo-500'
    >
      <path d={path} fill='none' stroke='currentColor' strokeWidth='2' />
    </svg>
  );
}

function isUrl(v: string) {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

const GoalCard: React.FC<Props> = ({
  goal,
  onBump,
  onComplete,
  onTogglePause,
  onEdit,
  onOpenDetail,
}) => {
  const pct = Math.round((goal.progress / Math.max(1, goal.target)) * 100);
  const pf = PLATFORMS.find(p => p.key === goal.platform);
  const icon = pf?.icon ?? '🎯';
  const platformLabel = pf?.label ?? goal.platform.toUpperCase();
  const accIsUrl = isUrl(goal.account);
  const accLabel = accIsUrl
    ? (() => {
        try {
          const u = new URL(goal.account);
          const leaf =
            u.pathname.split('/').filter(Boolean).pop() || u.hostname;
          return leaf;
        } catch {
          return goal.account;
        }
      })()
    : goal.account;

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-indigo-100 to-sky-100 p-[1px] shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5`}
    >
      <Card
        className={`rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm ${goal.completed ? 'ring-1 ring-emerald-300' : 'ring-1 ring-black/5'}`}
      >
        <CardHeader className='pb-3'>
          <div className='flex items-start justify-between gap-3 flex-wrap'>
            <div className='flex items-center gap-3 min-w-0'>
              <div className='h-9 w-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-sm text-base shrink-0'>
                {icon}
              </div>
              <CardTitle className='text-lg font-semibold leading-tight min-w-0'>
                <button
                  className='hover:underline text-left line-clamp-2'
                  onClick={() => onOpenDetail(goal)}
                >
                  {goal.title}
                </button>
              </CardTitle>
            </div>
            <div className='shrink-0'>
              <SyncStatusBadge
                status={goal.syncStatus || 'idle'}
                lastSyncAt={goal.lastSyncAt}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4 pt-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700'>
              <span className='text-sm'>{icon}</span>
              <span>{platformLabel}</span>
            </span>
            <span className='text-xs text-muted-foreground'>•</span>
            <div className='text-sm text-gray-700 min-w-0 truncate'>
              {accIsUrl ? (
                <a
                  href={goal.account}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex items-center gap-1 hover:underline'
                >
                  {accLabel}
                  <ExternalLink className='h-3.5 w-3.5' />
                </a>
              ) : (
                <span>@{accLabel}</span>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <div className='text-muted-foreground'>Progress</div>
              <div className='font-medium'>
                {goal.progress}/{goal.target} {goal.unit}
              </div>
            </div>
            <Progress value={pct} className='h-2 bg-indigo-100' />
            <div className='flex items-center justify-between text-sm'>
              <div className='text-muted-foreground'>
                Due {new Date(goal.endDate + 'T00:00:00').toLocaleDateString()}
              </div>
              <div className='font-medium'>{pct}%</div>
            </div>
          </div>

          <div className='h-px bg-gray-100' />

          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
            <div className='sm:flex-1 min-w-[120px] overflow-hidden'>
              <Sparkline points={goal.activity || []} />
            </div>
            <div className='flex flex-wrap items-center justify-end gap-2'>
              <Button
                size='sm'
                variant='secondary'
                className='rounded-full'
                onClick={() => onBump(goal.id, 1)}
              >
                <Plus className='h-4 w-4' /> +1
              </Button>
              <Button
                size='sm'
                variant='secondary'
                className='rounded-full'
                onClick={() =>
                  onBump(goal.id, Math.max(1, Math.round(goal.target * 0.1)))
                }
              >
                <PlusCircle className='h-4 w-4' /> +10%
              </Button>
              <Button size='sm' variant='ghost' onClick={() => onEdit(goal)}>
                <Pencil className='h-4 w-4' /> Edit
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onTogglePause(goal.id)}
              >
                <Pause className='h-4 w-4' /> {goal.paused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                size='sm'
                className='rounded-full bg-emerald-600 hover:bg-emerald-600/90'
                onClick={() => onComplete(goal.id)}
              >
                <CheckCircle2 className='h-4 w-4' /> Complete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalCard;
