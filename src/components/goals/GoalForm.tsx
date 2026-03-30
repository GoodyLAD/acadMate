import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import PlatformInput from './PlatformInput';
import { defaultSuggestions } from './platforms';
import type { Goal, GoalUnit, PlatformKey } from './types';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<Goal>;
  onSave: (g: Goal) => void;
}

const units: GoalUnit[] = ['problems', 'contests', 'points'];

function daysBetween(a: string, b: string) {
  const A = new Date(a + 'T00:00:00');
  const B = new Date(b + 'T00:00:00');
  return Math.max(
    1,
    Math.round((B.getTime() - A.getTime()) / (1000 * 60 * 60 * 24))
  );
}

const GoalForm: React.FC<Props> = ({ open, onOpenChange, initial, onSave }) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [platform, setPlatform] = useState<PlatformKey>(
    initial?.platform ?? 'leetcode'
  );
  const [account, setAccount] = useState(initial?.account ?? '');
  const [target, setTarget] = useState<number>(initial?.target ?? 50);
  const [unit, setUnit] = useState<GoalUnit>(initial?.unit ?? 'problems');
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [startDate, setStartDate] = useState(initial?.startDate ?? today);
  const [endDate, setEndDate] = useState(initial?.endDate ?? today);
  const [autoSync, setAutoSync] = useState(initial?.autoSync ?? true);
  const [privacy, setPrivacy] = useState<'public' | 'private'>(
    initial?.privacy ?? 'private'
  );
  const [submitting, setSubmitting] = useState(false);

  const dailyRate = useMemo(() => {
    const days = daysBetween(startDate, endDate);
    return Math.max(0, Math.ceil((target || 0) / days));
  }, [startDate, endDate, target]);

  const valid = title.trim() && account.trim() && Number(target) > 0;

  const handleSave = () => {
    if (!valid) return;
    setSubmitting(true);
    const now = Date.now();
    const g: Goal = {
      id: initial?.id ?? crypto.randomUUID(),
      title: title.trim(),
      platform,
      account: account.trim(),
      target: Number(target),
      unit,
      startDate,
      endDate,
      autoSync,
      privacy,
      progress: initial?.progress ?? 0,
      lastSyncAt: null,
      syncStatus: 'idle',
      activity: initial?.activity ?? [],
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
      completed: false,
      paused: false,
    };
    onSave(g);
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[720px]'>
        <DialogHeader>
          <DialogTitle>{initial?.id ? 'Edit Goal' : 'Create Goal'}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Goal title</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder='Solve 50 LeetCode problems'
              className='h-11'
            />
            <div className='mt-2 flex flex-wrap gap-2'>
              {defaultSuggestions.map(s => (
                <button
                  key={s}
                  type='button'
                  onClick={() => setTitle(s)}
                  className='text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200'
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <PlatformInput
            platform={platform}
            account={account}
            onPlatformChange={setPlatform}
            onAccountChange={setAccount}
          />

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <div>
              <label className='block text-sm font-medium mb-1'>Target</label>
              <Input
                type='number'
                min={1}
                value={target}
                onChange={e => setTarget(Number(e.target.value))}
                className='h-11'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Unit</label>
              <Select value={unit} onValueChange={v => setUnit(v as GoalUnit)}>
                <SelectTrigger className='w-full h-11'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map(u => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='rounded-md bg-indigo-50 text-indigo-800 p-3 text-sm flex items-center justify-between'>
              <span>Daily pace</span>
              <span className='font-semibold'>
                {dailyRate}/{unit.slice(0, -1)}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Start date
              </label>
              <Input
                type='date'
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className='h-11'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>End date</label>
              <Input
                type='date'
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className='h-11'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            <div className='flex items-center justify-between rounded-md border p-3'>
              <div>
                <div className='text-sm font-medium'>Auto-sync</div>
                <div className='text-xs text-muted-foreground'>
                  Fetch from platform periodically
                </div>
              </div>
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </div>
            <div className='flex items-center justify-between rounded-md border p-3'>
              <div>
                <div className='text-sm font-medium'>Privacy</div>
                <div className='text-xs text-muted-foreground'>
                  Public or private goal
                </div>
              </div>
              <Select value={privacy} onValueChange={v => setPrivacy(v as any)}>
                <SelectTrigger className='w-28 h-9'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='public'>public</SelectItem>
                  <SelectItem value='private'>private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='rounded-md bg-emerald-50 text-emerald-800 p-3 text-sm'>
              <div className='font-medium'>ETA helper</div>
              <div className='text-xs'>
                Stay on pace to finish by{' '}
                {new Date(endDate + 'T00:00:00').toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='ghost' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!valid || submitting} onClick={handleSave}>
            {initial?.id ? 'Save Changes' : 'Save Goal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoalForm;
