import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Target, Calendar } from 'lucide-react';
import type { Goal } from '@/components/goals/types';

interface GoalProgress {
  goalId: string;
  title: string;
  platform: string;
  target: number;
  current: number;
  unit: string;
  endDate: string;
  dailyData: Array<{ date: string; actual: number; target: number }>;
  onTrack: boolean;
}

interface GoalLinkedChartsProps {
  goals: Goal[];
  activityData: Array<{ date: string; solved: number }>;
}

const GoalLinkedCharts: React.FC<GoalLinkedChartsProps> = ({
  goals,
  activityData,
}) => {
  // Transform goals into progress data with linked activity
  const goalProgress: GoalProgress[] = goals.map(goal => {
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dailyTarget = goal.target / totalDays;

    // Generate daily target line
    const dailyData = activityData.map((day, index) => ({
      date: day.date,
      actual: Math.min(goal.progress, (index + 1) * dailyTarget),
      target: (index + 1) * dailyTarget,
    }));

    const daysElapsed = Math.ceil(
      (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const expectedProgress = Math.min(goal.target, daysElapsed * dailyTarget);
    const onTrack = goal.progress >= expectedProgress * 0.9; // 90% tolerance

    return {
      goalId: goal.id,
      title: goal.title,
      platform: goal.platform,
      target: goal.target,
      current: goal.progress,
      unit: goal.unit,
      endDate: goal.endDate,
      dailyData,
      onTrack,
    };
  });

  if (goals.length === 0) {
    return (
      <Card className='rounded-2xl shadow-md'>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Target className='h-12 w-12 text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>No Goals Set</h3>
          <p className='text-muted-foreground text-center'>
            Create your first goal to see progress tracking and analytics here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold tracking-tight'>
          Goal Progress Tracking
        </h2>
        <Badge variant='secondary' className='bg-indigo-100 text-indigo-800'>
          {goals.length} Active Goals
        </Badge>
      </div>

      {/* Goal Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {goalProgress.map(goal => {
          const progressPercent = Math.round(
            (goal.current / goal.target) * 100
          );
          const daysLeft = Math.ceil(
            (new Date(goal.endDate).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          );

          return (
            <Card
              key={goal.goalId}
              className='rounded-xl border border-gray-200/70 bg-white shadow-sm hover:shadow-md transition-all duration-200'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-sm font-medium line-clamp-2'>
                    {goal.title}
                  </CardTitle>
                  <Badge
                    variant={goal.onTrack ? 'default' : 'destructive'}
                    className={
                      goal.onTrack ? 'bg-green-100 text-green-800' : ''
                    }
                  >
                    {goal.onTrack ? 'On Track' : 'Behind'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Progress</span>
                  <span className='font-medium'>
                    {goal.current}/{goal.target} {goal.unit}
                  </span>
                </div>
                <Progress value={progressPercent} className='h-2' />
                <div className='flex items-center justify-between text-xs text-muted-foreground'>
                  <span className='flex items-center gap-1'>
                    <Calendar className='h-3 w-3' />
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Goal Progress Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {goalProgress.slice(0, 2).map(goal => (
          <Card key={goal.goalId} className='rounded-2xl shadow-md'>
            <CardHeader>
              <CardTitle className='text-lg font-semibold line-clamp-1'>
                {goal.title}
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                Target: {goal.target} {goal.unit} by{' '}
                {new Date(goal.endDate).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  actual: { label: 'Actual Progress', color: COLORS.primary },
                  target: { label: 'Target Line', color: COLORS.warning },
                }}
              >
                <ResponsiveContainer width='100%' height={200}>
                  <LineChart data={goal.dailyData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                    <XAxis
                      dataKey='date'
                      tick={{ fontSize: 10 }}
                      tickFormatter={value =>
                        new Date(value).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type='monotone'
                      dataKey='actual'
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={{ fill: COLORS.primary, r: 3 }}
                    />
                    <Line
                      type='monotone'
                      dataKey='target'
                      stroke={COLORS.warning}
                      strokeWidth={2}
                      strokeDasharray='5 5'
                      dot={false}
                    />
                    <ReferenceLine
                      y={goal.target}
                      stroke={COLORS.success}
                      strokeDasharray='3 3'
                      label={{ value: 'Goal', position: 'topRight' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skill Development Radar */}
      <Card className='rounded-2xl shadow-md'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            🎪 Skill Development Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              current: { label: 'Current Level', color: COLORS.primary },
              target: { label: 'Target Level', color: COLORS.secondary },
            }}
          >
            <ResponsiveContainer width='100%' height={400}>
              <RadarChart data={data.skillRadar}>
                <PolarGrid stroke='#e2e8f0' />
                <PolarAngleAxis
                  dataKey='skill'
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <Radar
                  name='Current'
                  dataKey='current'
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name='Target'
                  dataKey='target'
                  stroke={COLORS.secondary}
                  fill='transparent'
                  strokeWidth={2}
                  strokeDasharray='5 5'
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalLinkedCharts;
