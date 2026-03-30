import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { PLATFORMS } from './platforms';
import type { PlatformKey } from './types';

interface Props {
  platform: PlatformKey;
  account: string;
  onPlatformChange: (p: PlatformKey) => void;
  onAccountChange: (v: string) => void;
}

const PlatformInput: React.FC<Props> = ({
  platform,
  account,
  onPlatformChange,
  onAccountChange,
}) => {
  const meta = useMemo(
    () => PLATFORMS.find(p => p.key === platform)!,
    [platform]
  );
  const valid = useMemo(() => {
    if (meta.key === 'custom') return account.trim().length > 0;
    if (!account.trim()) return false;
    return meta.pattern ? meta.pattern.test(account.trim()) : true;
  }, [account, meta]);

  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
      <div className='sm:col-span-1'>
        <label className='block text-sm font-medium mb-1'>Platform</label>
        <Select
          value={platform}
          onValueChange={v => onPlatformChange(v as PlatformKey)}
        >
          <SelectTrigger className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map(p => (
              <SelectItem key={p.key} value={p.key}>
                {p.icon} {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='sm:col-span-2'>
        <label className='block text-sm font-medium mb-1'>
          Account ID / Profile URL
        </label>
        <Input
          value={account}
          onChange={e => onAccountChange(e.target.value)}
          placeholder={meta.helper}
          className={`h-11 ${account ? (valid ? 'ring-2 ring-emerald-400' : 'ring-2 ring-red-400') : ''}`}
        />
        <p
          className={`mt-1 text-xs ${account ? (valid ? 'text-emerald-600' : 'text-red-600') : 'text-muted-foreground'}`}
        >
          {meta.helper}
        </p>
      </div>
    </div>
  );
};

export default PlatformInput;
