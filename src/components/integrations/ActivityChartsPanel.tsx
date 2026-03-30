import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import AnimatedChart from './AnimatedChart';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface ActivityData {
  dailyProgress: Array<{ date: string; solved: number; goal?: number }>;
  topicDistribution: Array<{ topic: string; solved: number; target: number }>;
  difficultyDistribution: Array<{
    difficulty: string;
    count: number;
    color: string;
  }>;
  skillRadar: Array<{ skill: string; current: number; target: number }>;
  ratingHistory: Array<{ date: string; rating: number; contest: string }>;
}

interface ActivityChartsPanelProps {
  data: ActivityData;
}

const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
};

const ActivityChartsPanel: React.FC<ActivityChartsPanelProps> = ({ data }) => {
  return (
    <div className='space-y-6'>
      {/* Daily Progress Line Chart */}
      <AnimatedChart delay={0.1}>
        <Card className='rounded-2xl shadow-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              📈 Daily Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                solved: { label: 'Problems Solved', color: COLORS.primary },
                goal: { label: 'Goal Target', color: COLORS.warning },
              }}
            >
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={data.dailyProgress}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                  <XAxis
                    dataKey='date'
                    tick={{ fontSize: 12 }}
                    tickFormatter={value =>
                      new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={value =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type='monotone'
                    dataKey='solved'
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
                  />
                  {data.dailyProgress.some(d => d.goal) && (
                    <Line
                      type='monotone'
                      dataKey='goal'
                      stroke={COLORS.warning}
                      strokeWidth={2}
                      strokeDasharray='5 5'
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </AnimatedChart>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Topic Distribution Bar Chart */}
        <AnimatedChart delay={0.2}>
          <Card className='rounded-2xl shadow-md'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                📊 Problems by Topic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  solved: { label: 'Solved', color: COLORS.primary },
                  target: { label: 'Target', color: COLORS.secondary },
                }}
              >
                <ResponsiveContainer width='100%' height={250}>
                  <BarChart data={data.topicDistribution} layout='horizontal'>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                    <XAxis type='number' tick={{ fontSize: 12 }} />
                    <YAxis
                      type='category'
                      dataKey='topic'
                      tick={{ fontSize: 12 }}
                      width={80}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey='solved'
                      fill={COLORS.primary}
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey='target'
                      fill={COLORS.secondary}
                      opacity={0.3}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </AnimatedChart>

        {/* Difficulty Distribution Pie Chart */}
        <AnimatedChart delay={0.3}>
          <Card className='rounded-2xl shadow-md'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                🎯 Difficulty Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  easy: { label: 'Easy', color: COLORS.easy },
                  medium: { label: 'Medium', color: COLORS.medium },
                  hard: { label: 'Hard', color: COLORS.hard },
                }}
              >
                <ResponsiveContainer width='100%' height={250}>
                  <PieChart>
                    <Pie
                      data={data.difficultyDistribution}
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey='count'
                    >
                      {data.difficultyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => [value, name]}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </AnimatedChart>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Skill Radar Chart */}
        <AnimatedChart delay={0.4}>
          <Card className='rounded-2xl shadow-md'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                🎪 Skill Radar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  current: { label: 'Current', color: COLORS.primary },
                  target: { label: 'Target', color: COLORS.secondary },
                }}
              >
                <ResponsiveContainer width='100%' height={300}>
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
                      fillOpacity={0.2}
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
        </AnimatedChart>

        {/* Contest Rating History */}
        <AnimatedChart delay={0.5}>
          <Card className='rounded-2xl shadow-md'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                🏆 Contest Rating History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  rating: { label: 'Rating', color: COLORS.success },
                }}
              >
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={data.ratingHistory}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
                    <XAxis
                      dataKey='date'
                      tick={{ fontSize: 12 }}
                      tickFormatter={value =>
                        new Date(value).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      labelFormatter={value =>
                        new Date(value).toLocaleDateString()
                      }
                      formatter={(value, name, props) => [
                        value,
                        `${name} (${props.payload?.contest || 'Contest'})`,
                      ]}
                    />
                    <Line
                      type='monotone'
                      dataKey='rating'
                      stroke={COLORS.success}
                      strokeWidth={3}
                      dot={{ fill: COLORS.success, strokeWidth: 2, r: 4 }}
                      activeDot={{
                        r: 6,
                        stroke: COLORS.success,
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </AnimatedChart>
      </div>
    </div>
  );
};

export default ActivityChartsPanel;
