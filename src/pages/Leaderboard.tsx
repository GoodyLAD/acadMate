import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

const LeaderboardPage: React.FC = () => {
  const { profile } = useProfile();
  const [classFilter, setClassFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');

  const leaderboardData = useMemo(
    () => [
      { id: 'u1', name: 'Alice', class: 'A', batch: '2024', xp: 980 },
      { id: 'u2', name: 'Bob', class: 'B', batch: '2024', xp: 920 },
      { id: 'u3', name: 'Charlie', class: 'A', batch: '2023', xp: 880 },
      {
        id: 'u4',
        name: profile?.full_name || 'You',
        class: 'A',
        batch: '2024',
        xp: 380,
      },
    ],
    [profile]
  );

  const filtered = useMemo(() => {
    return leaderboardData
      .filter(r => {
        if (classFilter !== 'all' && r.class !== classFilter) return false;
        if (batchFilter !== 'all' && r.batch !== batchFilter) return false;
        return true;
      })
      .sort((a, b) => b.xp - a.xp);
  }, [leaderboardData, classFilter, batchFilter]);

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-2xl font-semibold'>Leaderboard</h1>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' asChild>
            <Link to='/profile'>Back to Profile</Link>
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <main className='lg:col-span-2'>
          <Card>
            <CardHeader className='flex items-center justify-between'>
              <CardTitle className='text-sm'>Top Students</CardTitle>
              <div className='flex items-center gap-2'>
                <select
                  className='text-sm rounded border px-2 py-1'
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
                >
                  <option value='all'>All classes</option>
                  <option value='A'>Class A</option>
                  <option value='B'>Class B</option>
                </select>
                <select
                  className='text-sm rounded border px-2 py-1'
                  value={batchFilter}
                  onChange={e => setBatchFilter(e.target.value)}
                >
                  <option value='all'>All batches</option>
                  <option value='2024'>2024</option>
                  <option value='2023'>2023</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {filtered.map(row => (
                  <div
                    key={row.id}
                    className={`flex items-center justify-between p-3 rounded ${row.name === (profile?.full_name || 'You') ? 'bg-muted/40' : ''}`}
                  >
                    <div className='flex items-center gap-3'>
                      <Trophy className='h-5 w-5 text-yellow-500' />
                      <div className='text-sm font-medium'>{row.name}</div>
                      <div className='text-xs text-muted-foreground'>
                        {row.class} • {row.batch}
                      </div>
                    </div>
                    <div className='text-sm font-semibold'>{row.xp} XP</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>

        <aside className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Quick Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col gap-2'>
                <Button
                  onClick={() => {
                    setClassFilter('all');
                    setBatchFilter('all');
                  }}
                >
                  Reset
                </Button>
                <Button variant='ghost' onClick={() => setClassFilter('A')}>
                  Class A
                </Button>
                <Button variant='ghost' onClick={() => setBatchFilter('2024')}>
                  Batch 2024
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Your Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-sm'>
                <div className='font-medium'>{profile?.full_name || 'You'}</div>
                <div className='text-muted-foreground'>
                  Rank:{' '}
                  {filtered.findIndex(
                    r => r.name === (profile?.full_name || 'You')
                  ) + 1 || '—'}
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default LeaderboardPage;
