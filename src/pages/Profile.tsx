import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useProfile } from '@/hooks/useProfile';
import { Trophy, Zap, Check, UserCircle, User } from 'lucide-react';

import ProfileCard from '../components/ProfileCard';

const LevelRing: React.FC<{ percent: number; level: number }> = ({
  percent,
  level,
}) => {
  const size = 120;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className='relative w-[120px] h-[120px] flex items-center justify-center'>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className='transform -rotate-90'
      >
        <defs>
          <linearGradient id='grad' x1='1' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='#7c3aed' />
            <stop offset='100%' stopColor='#06b6d4' />
          </linearGradient>
          <filter id='glow' x='-50%' y='-50%' width='200%' height='200%'>
            <feGaussianBlur stdDeviation='4' result='coloredBlur' />
            <feMerge>
              <feMergeNode in='coloredBlur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
        </defs>

        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke='#f3f4f6'
          fill='none'
        />

        {/* Progress ring with gradient and subtle glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke='url(#grad)'
          strokeLinecap='round'
          fill='none'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 700ms ease' }}
          filter='url(#glow)'
        />

        {/* Inner subtle circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - stroke * 0.6}
          fill='white'
          stroke='none'
        />
      </svg>

      {/* Centered level text overlay */}
      <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
        <div className='text-xs text-muted-foreground'>Level</div>
        <div
          className='text-xl font-bold tracking-tight'
          style={{ textShadow: '0 1px 0 rgba(0,0,0,0.04)' }}
        >
          {level}
        </div>
        <div className='text-[11px] text-muted-foreground mt-1'>{percent}%</div>
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { profile, updateProfile } = useProfile();
  const [xp, setXp] = useState(380);
  const [level, setLevel] = useState(4);
  const [streak, setStreak] = useState(5);
  const [accepted, setAccepted] = useState(false);
  const [classFilter] = useState('all');
  const [batchFilter] = useState('all');
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>('');
  const [ageInput, setAgeInput] = useState<string>('');
  const [yearInput, setYearInput] = useState<string>('');
  const [courseInput, setCourseInput] = useState<string>('');
  const [collegeInput, setCollegeInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [bioInput, setBioInput] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);

  const overridesKey = 'profile_overrides_v1';
  const loadOverrides = () => {
    try {
      return JSON.parse(localStorage.getItem(overridesKey) || '{}');
    } catch {
      return {};
    }
  };
  const saveOverrides = (obj: any) => {
    try {
      localStorage.setItem(overridesKey, JSON.stringify(obj));
    } catch (error) {
      console.error('Error saving overrides:', error);
    }
  };

  const badges = useMemo(
    () => [
      {
        id: 'b1',
        name: 'Getting Started',
        color: 'bg-yellow-100 text-yellow-800',
      },
      { id: 'b2', name: 'Streak 7', color: 'bg-green-100 text-green-800' },
      { id: 'b3', name: 'Top Scorer', color: 'bg-purple-100 text-purple-800' },
    ],
    []
  );

  const recentEvents = useMemo(
    () => [
      { id: 'e1', text: 'Earned "Getting Started" badge', time: '2d ago' },
      { id: 'e2', text: 'Completed daily challenge', time: '3d ago' },
      { id: 'e3', text: 'Reached level 4', time: '1w ago' },
    ],
    []
  );

  const leaderboardData = useMemo(
    () => [
      { id: 'u1', name: 'Alice', class: 'A', batch: '2024', xp: 980 },
      { id: 'u2', name: 'Bob', class: 'B', batch: '2024', xp: 920 },
      { id: 'u3', name: 'Charlie', class: 'A', batch: '2023', xp: 880 },
      { id: 'u4', name: 'You', class: 'A', batch: '2024', xp: xp },
    ],
    [xp]
  );

  const filteredLeaderboard = useMemo(() => {
    return leaderboardData
      .filter(row => {
        if (classFilter !== 'all' && row.class !== classFilter) return false;
        if (batchFilter !== 'all' && row.batch !== batchFilter) return false;
        return true;
      })
      .sort((a, b) => b.xp - a.xp);
  }, [leaderboardData, classFilter, batchFilter]);

  const nextLevelXp = (level + 1) * 300;
  const percent = Math.min(100, Math.round((xp / nextLevelXp) * 100));
  const currentMonthName = new Date().toLocaleString('default', {
    month: 'short',
  });

  const handleAcceptChallenge = () => {
    if (accepted) return;
    setAccepted(true);
    setXp(s => s + 40);
    setStreak(s => s + 1);
    if (xp + 40 >= nextLevelXp) setLevel(l => l + 1);
  };

  if (!profile)
    return (
      <div className='p-6'>You need to be signed in to view your profile.</div>
    );

  return (
    <>
      <style>{`
        .pc-card-wrapper-active {
          --card-opacity: 1 !important;
        }
        .pc-card-wrapper-active::before {
          filter: contrast(1.2) saturate(2.5) blur(40px) opacity(1) !important;
          transform: scale(0.9) translate3d(0, 0, 0.1px) !important;
          background-image: var(--behind-gradient) !important;
        }
        .pc-card-wrapper-active .pc-card {
          background-image: 
            linear-gradient(135deg, #2a2a4e 0%, #26315e 50%, #1f4470 100%) !important;
          border: 1px solid transparent !important;
          background-clip: padding-box !important;
          position: relative !important;
        }
        .pc-card-wrapper-active .pc-card::before {
          content: '' !important;
          position: absolute !important;
          top: -1px !important;
          left: -1px !important;
          right: -1px !important;
          bottom: -1px !important;
          background: linear-gradient(135deg, #00ffff, #ff00ff, #ffff00, #00ffff) !important;
          border-radius: inherit !important;
          z-index: -1 !important;
          animation: borderGlow 3s linear infinite !important;
        }
        @keyframes borderGlow {
          0% { background: linear-gradient(135deg, #00ffff, #ff00ff, #ffff00, #00ffff); }
          25% { background: linear-gradient(135deg, #ff00ff, #ffff00, #00ffff, #ff00ff); }
          50% { background: linear-gradient(135deg, #ffff00, #00ffff, #ff00ff, #ffff00); }
          75% { background: linear-gradient(135deg, #00ffff, #ff00ff, #ffff00, #00ffff); }
          100% { background: linear-gradient(135deg, #00ffff, #ff00ff, #ffff00, #00ffff); }
        }
        .pc-card-wrapper-active .pc-inside {
          background: rgba(0, 0, 0, 0.6) !important;
          background-image: none !important;
        }
        .pc-card-wrapper-active .pc-details h3 {
          background-image: linear-gradient(to bottom, #ffffff, #cccccc) !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
          -webkit-background-clip: text !important;
        }
        .pc-card-wrapper-active .pc-details p {
          background-image: linear-gradient(to bottom, #ffffff, #999999) !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
          -webkit-background-clip: text !important;
        }
      `}</style>
      <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Compact Hero Header */}
          <div className='mb-8 -mt-6'>
            <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <Avatar className='h-20 w-20'>
                    <AvatarImage
                      src={
                        typeof window !== 'undefined'
                          ? JSON.parse(
                              localStorage.getItem('profile_overrides_v1') ||
                                '{}'
                            )?.avatarDataUrl || ''
                          : ''
                      }
                    />
                    <AvatarFallback className='text-2xl'>
                      {profile.full_name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Welcome back,
                    </div>
                    <h1 className='text-4xl font-bold tracking-tight'>
                      {profile.full_name}
                    </h1>
                    <div className='flex items-center gap-2 mt-1'>
                      <Badge variant='secondary' className='capitalize'>
                        {profile.role}
                      </Badge>
                      <span className='text-sm text-muted-foreground'>•</span>
                      <span className='text-sm text-muted-foreground'>
                        {profile.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      const ov =
                        typeof window !== 'undefined'
                          ? JSON.parse(
                              localStorage.getItem('profile_overrides_v1') ||
                                '{}'
                            )
                          : {};
                      setNameInput(profile.full_name || '');
                      setEmailInput(profile.email || '');
                      setAvatarDataUrl(ov?.avatarDataUrl || '');
                      setAgeInput(ov?.age || '');
                      setYearInput(ov?.year || '');
                      setCourseInput(ov?.course || '');
                      setCollegeInput(ov?.college || '');
                      setPhoneInput(ov?.phone || '');
                      setBioInput(ov?.bio || '');
                      setShowEdit(true);
                    }}
                  >
                    <User className='h-4 w-4 mr-2' />
                    Edit Profile
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => setShowProfileCard(true)}
                  >
                    <UserCircle className='h-4 w-4 mr-2' />
                    Interactive Card
                  </Button>
                  <div className='w-64'>
                    <Input placeholder='Search for content, challenges...' />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className='grid grid-cols-1 xl:grid-cols-4 gap-8'>
            <main className='xl:col-span-3 space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Card className='rounded-2xl p-4 shadow-md'>
                  <div className='text-sm text-muted-foreground'>Total XP</div>
                  <div className='text-2xl font-semibold mt-1'>{xp}</div>
                  <div className='text-xs text-muted-foreground mt-2'>
                    Overall progress
                  </div>
                </Card>
                <Card className='rounded-2xl p-4 shadow-md'>
                  <div className='text-sm text-muted-foreground'>This week</div>
                  <div className='text-2xl font-semibold mt-1'>+120 XP</div>
                  <div className='text-xs text-muted-foreground mt-2'>
                    Keep it up!
                  </div>
                </Card>
                <Card className='rounded-2xl p-4 shadow-md'>
                  <div className='text-sm text-muted-foreground'>Today</div>
                  <div className='text-2xl font-semibold mt-1'>
                    {streak} ���
                  </div>
                  <div className='text-xs text-muted-foreground mt-2'>
                    Current streak
                  </div>
                </Card>
              </div>

              {/* Progress Activity - Directly below XP cards */}
              <Card className='rounded-2xl overflow-hidden shadow-md'>
                <CardHeader>
                  <CardTitle className='text-lg'>Progress & Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-col md:flex-row md:items-center gap-6'>
                    <div className='flex-shrink-0'>
                      <LevelRing percent={percent} level={level} />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <div className='text-sm text-muted-foreground'>
                            XP
                          </div>
                          <div className='text-2xl font-semibold'>{xp} XP</div>
                          <div className='text-xs text-muted-foreground'>
                            {xp}/{nextLevelXp} to next level
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-sm text-muted-foreground'>
                            Streak
                          </div>
                          <div className='text-2xl font-semibold'>
                            {streak} 🔥
                          </div>
                        </div>
                      </div>

                      <div className='mt-4'>
                        <Progress
                          value={percent}
                          className='h-3 rounded-full'
                        />
                        <div className='mt-3 flex items-center gap-3'>
                          <Button
                            size='sm'
                            onClick={handleAcceptChallenge}
                            disabled={accepted}
                            className='flex items-center gap-2'
                          >
                            {accepted ? (
                              <Check className='h-4 w-4' />
                            ) : (
                              <Zap className='h-4 w-4' />
                            )}{' '}
                            {accepted ? 'Accepted' : 'Accept Challenge'}
                          </Button>
                          <Button variant='outline' asChild>
                            <Link to='/leaderboard'>View Leaderboard</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <Card className='rounded-xl p-3 shadow-sm'>
                      <h4 className='text-sm font-medium mb-2'>Badges</h4>
                      <div className='flex flex-wrap gap-2'>
                        {badges.map(b => (
                          <div
                            key={b.id}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${b.color}`}
                          >
                            {b.name}
                          </div>
                        ))}
                      </div>
                    </Card>
                    <Card className='rounded-xl p-3 shadow-sm'>
                      <h4 className='text-sm font-medium mb-2'>
                        Recent Activity
                      </h4>
                      <div className='space-y-3'>
                        {recentEvents.map(ev => (
                          <div key={ev.id} className='flex items-start gap-3'>
                            <Avatar className='h-10 w-10'>
                              <AvatarFallback>
                                {ev.text.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium'>{ev.text}</div>
                              <div className='text-xs text-muted-foreground'>
                                {ev.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card className='rounded-2xl overflow-hidden shadow-md bg-white'>
                <CardHeader>
                  <div className='w-full flex items-center justify-between'>
                    <div>
                      <div className='text-sm text-muted-foreground'>
                        Badges
                      </div>
                      <div className='text-3xl font-bold'>{badges.length}</div>
                    </div>
                    <div className='text-right'>
                      <div className='text-xs text-muted-foreground'>
                        Most Recent Badge
                      </div>
                      <div className='text-sm font-semibold'>
                        {badges[0]?.name || '—'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-4 flex-wrap'>
                    {badges.map(b => (
                      <div
                        key={b.id}
                        className='flex flex-col items-center w-24 p-2 bg-gray-50 rounded-lg'
                      >
                        <div className='h-12 w-12 rounded-md bg-gradient-to-br from-white to-gray-100 flex items-center justify-center border'>
                          {/* placeholder badge icon */}
                          <div className='text-sm font-bold'>
                            {b.name.slice(0, 2)}
                          </div>
                        </div>
                        <div className='text-xs mt-2 text-center'>{b.name}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </main>

            <aside className='xl:col-span-1 space-y-6'>
              {/* Interactive Profile Card */}
              <Card className='rounded-2xl p-4 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50'>
                <div className='flex flex-col items-center'>
                  <h3 className='text-lg font-semibold mb-4 text-center'>
                    Interactive Profile
                  </h3>
                  <div className='scale-75 origin-center'>
                    <ProfileCard
                      name={profile.full_name || 'User'}
                      title={profile.role === 'faculty' ? 'Faculty' : 'Student'}
                      handle={(profile.email || '').split('@')[0]}
                      status='Online'
                      contactText='Contact Me'
                      avatarUrl='/spiderman-avatar.png'
                      iconUrl='/spiderman-avatar.png'
                      showUserInfo={true}
                      enableTilt={true}
                      enableMobileTilt={false}
                      onContactClick={() => {
                        // Contact functionality can be implemented here
                      }}
                      showBehindGradient={true}
                      behindGradient='radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ffaac4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00c1ffff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#c137ffff 0%,#07c6ffff 40%,#07c6ffff 60%,#c137ffff 100%)'
                      className='pc-card-wrapper-active'
                    />
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setShowProfileCard(true)}
                    className='mt-3 w-full'
                  >
                    <UserCircle className='h-4 w-4 mr-2' />
                    View Full Card
                  </Button>
                </div>
              </Card>

              <Card className='rounded-3xl p-3'>
                <div className='flex flex-col items-center'>
                  <div className='text-3xl font-bold'>{currentMonthName}</div>

                  {/* Current month streak grid (Mon-Sun). View more reveals previous months */}
                  <div className='w-full mt-3'>
                    {(() => {
                      const today = new Date();
                      const month = today.getMonth();
                      const year = today.getFullYear();
                      const monthName = today.toLocaleString('default', {
                        month: 'short',
                      });
                      const daysInMonth = new Date(
                        year,
                        month + 1,
                        0
                      ).getDate();
                      const firstDay = new Date(year, month, 1).getDay(); // 0 Sun..6 Sat
                      const offset = (firstDay + 6) % 7; // convert to Mon=0
                      const daysArray: number[] = [];
                      const daysPassed = today.getDate();
                      const markedDaysCount = Math.min(streak, daysPassed);

                      for (let i = 0; i < offset; i++) daysArray.push(0);
                      for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);

                      return (
                        <div>
                          <div className='flex items-center justify-between mb-2'>
                            <div className='text-sm font-medium'>
                              {monthName}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              {markedDaysCount} days
                            </div>
                          </div>

                          <div className='grid grid-cols-7 gap-1'>
                            {daysArray.map((d, i) => {
                              if (d === 0)
                                return (
                                  <div
                                    key={i}
                                    className='h-4 rounded bg-transparent'
                                  />
                                );
                              const isPastOrToday = d <= daysPassed;
                              const isMarked =
                                isPastOrToday &&
                                daysPassed - d < markedDaysCount;
                              return (
                                <div
                                  key={i}
                                  className={`flex items-center justify-center h-5 text-[11px] rounded ${isMarked ? 'bg-emerald-400 border border-emerald-600 text-white' : 'bg-white border border-gray-100 text-gray-600'}`}
                                >
                                  {d}
                                </div>
                              );
                            })}
                          </div>

                          <div className='mt-2 text-right'>
                            <button
                              onClick={() => setShowAllMonths(s => !s)}
                              className='text-sm text-primary underline'
                            >
                              {showAllMonths ? 'Hide' : 'View more'}
                            </button>
                          </div>

                          {showAllMonths && (
                            <div className='mt-3 space-y-2'>
                              {Array.from({ length: 3 }).map((_, idx) => {
                                const d = new Date();
                                d.setMonth(month - (idx + 1));
                                const mName = d.toLocaleString('default', {
                                  month: 'short',
                                });
                                const dim = new Date(
                                  d.getFullYear(),
                                  d.getMonth() + 1,
                                  0
                                ).getDate();
                                const arr: boolean[] = new Array(dim).fill(
                                  false
                                );
                                const pastFilled = Math.max(
                                  0,
                                  streak - daysPassed - idx * dim
                                );
                                const fillCount = Math.min(
                                  dim,
                                  Math.max(0, pastFilled)
                                );
                                for (let f = 0; f < fillCount; f++)
                                  arr[dim - 1 - f] = true;
                                return (
                                  <div
                                    key={mName}
                                    className='bg-emerald-50 rounded-lg p-3'
                                  >
                                    <div className='flex items-center justify-between'>
                                      <div className='text-sm font-medium'>
                                        {mName}
                                      </div>
                                      <div className='text-xs text-muted-foreground'>
                                        {arr.filter(Boolean).length} days
                                      </div>
                                    </div>
                                    <div className='mt-2 grid grid-cols-7 gap-1'>
                                      {arr.map((a, i2) => (
                                        <div
                                          key={i2}
                                          className={`h-3 rounded ${a ? 'bg-emerald-400' : 'bg-emerald-100'} border ${a ? 'border-emerald-600' : 'border-transparent'}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className='w-full mt-4 flex flex-col gap-2'>
                    <Button asChild>
                      <Link to='/student/goals'>My Goals</Link>
                    </Button>
                    <Button variant='ghost' asChild>
                      <Link to='/integrations'>Integrations</Link>
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className='rounded-2xl shadow-md overflow-hidden'>
                <CardHeader>
                  <CardTitle className='text-sm'>Leaderboard Snippet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    {filteredLeaderboard.slice(0, 3).map(row => (
                      <div
                        key={row.id}
                        className={`flex items-center justify-between p-2 rounded ${row.name === 'You' ? 'bg-muted/40' : ''}`}
                      >
                        <div className='flex items-center gap-3'>
                          <Trophy className='h-4 w-4 text-yellow-500' />
                          <div className='text-sm font-medium'>{row.name}</div>
                        </div>
                        <div className='text-sm font-semibold'>{row.xp} XP</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className='rounded-2xl shadow-md overflow-hidden'>
                <CardHeader>
                  <CardTitle className='text-sm'>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-col gap-2'>
                    <Button asChild>
                      <Link to='/profile'>View Profile</Link>
                    </Button>
                    <Button variant='ghost' asChild>
                      <Link to='/leaderboard'>Open Leaderboard</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
        {/* Edit Profile Modal */}
        {showEdit && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
            <Card className='w-full max-w-lg shadow-2xl'>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-5'>
                  {/* Avatar selector */}
                  <div className='flex items-center gap-4'>
                    <div className='relative'>
                      <div className='h-20 w-20 rounded-full overflow-hidden border'>
                        <img
                          alt='Avatar'
                          src={
                            avatarDataUrl ||
                            (typeof window !== 'undefined'
                              ? JSON.parse(
                                  localStorage.getItem(
                                    'profile_overrides_v1'
                                  ) || '{}'
                                )?.avatarDataUrl || ''
                              : '')
                          }
                          className='h-full w-full object-cover'
                        />
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <input
                        id='avatar-input'
                        type='file'
                        accept='image/*'
                        className='hidden'
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () =>
                            setAvatarDataUrl(String(reader.result || ''));
                          reader.readAsDataURL(file);
                        }}
                      />
                      <Button
                        variant='outline'
                        onClick={() =>
                          document.getElementById('avatar-input')?.click()
                        }
                      >
                        Select Image
                      </Button>
                      <Button
                        variant='ghost'
                        onClick={() => setAvatarDataUrl('')}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <div className='text-sm font-medium mb-1'>Full name</div>
                      <Input
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        placeholder='Your name'
                      />
                    </div>
                    <div>
                      <div className='text-sm font-medium mb-1'>Email</div>
                      <Input
                        type='email'
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder='you@example.com'
                      />
                    </div>
                    <div>
                      <div className='text-sm font-medium mb-1'>Age</div>
                      <Input
                        type='number'
                        value={ageInput}
                        onChange={e => setAgeInput(e.target.value)}
                        placeholder='18'
                      />
                    </div>
                    <div>
                      <div className='text-sm font-medium mb-1'>Year</div>
                      <Input
                        value={yearInput}
                        onChange={e => setYearInput(e.target.value)}
                        placeholder='2nd Year'
                      />
                    </div>
                    <div>
                      <div className='text-sm font-medium mb-1'>Course</div>
                      <Input
                        value={courseInput}
                        onChange={e => setCourseInput(e.target.value)}
                        placeholder='B.Tech CSE'
                      />
                    </div>
                    <div>
                      <div className='text-sm font-medium mb-1'>College</div>
                      <Input
                        value={collegeInput}
                        onChange={e => setCollegeInput(e.target.value)}
                        placeholder='Your College'
                      />
                    </div>
                    <div>
                      <div className='text-sm font-medium mb-1'>Phone</div>
                      <Input
                        value={phoneInput}
                        onChange={e => setPhoneInput(e.target.value)}
                        placeholder='+91-XXXXXXXXXX'
                      />
                    </div>
                    <div className='md:col-span-2'>
                      <div className='text-sm font-medium mb-1'>Bio</div>
                      <Input
                        value={bioInput}
                        onChange={e => setBioInput(e.target.value)}
                        placeholder='Short bio'
                      />
                    </div>
                  </div>

                  <div className='flex items-center justify-end gap-2 pt-1'>
                    <Button variant='ghost' onClick={() => setShowEdit(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!nameInput.trim() || !emailInput.trim()) return;
                        setSaving(true);
                        await updateProfile?.({
                          full_name: nameInput.trim(),
                          email: emailInput.trim(),
                        });
                        const existing = loadOverrides();
                        const next = {
                          ...existing,
                          avatarDataUrl,
                          age: ageInput,
                          year: yearInput,
                          course: courseInput,
                          college: collegeInput,
                          phone: phoneInput,
                          bio: bioInput,
                        };
                        saveOverrides(next);
                        setSaving(false);
                        setShowEdit(false);
                      }}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 3D Profile Card Modal */}
        {showProfileCard && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
            <div className='relative'>
              <ProfileCard
                name={profile.full_name || 'User'}
                title={profile.role === 'faculty' ? 'Faculty' : 'Student'}
                handle={(profile.email || '').split('@')[0]}
                status='Online'
                contactText='Contact Me'
                avatarUrl='/spiderman-avatar.png'
                iconUrl='/spiderman-avatar.png'
                showUserInfo={true}
                enableTilt={true}
                enableMobileTilt={false}
                onContactClick={() => {
                  // Contact functionality can be implemented here
                }}
                showBehindGradient={true}
                behindGradient='radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ffaac4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00c1ffff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#c137ffff 0%,#07c6ffff 40%,#07c6ffff 60%,#c137ffff 100%)'
                className='pc-card-wrapper-active'
              />
              <button
                onClick={() => setShowProfileCard(false)}
                className='absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur border border-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center'
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;
