import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Target, BookOpen, Calendar } from 'lucide-react';
import { StudentProgress } from '@/hooks/useStudent';

interface StudentProgressCardProps {
  progress: StudentProgress | null;
  loading?: boolean;
}

const StudentProgressCard: React.FC<StudentProgressCardProps> = ({
  progress,
  loading,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse space-y-4'>
            <div className='h-4 bg-gray-200 rounded w-3/4'></div>
            <div className='h-8 bg-gray-200 rounded'></div>
            <div className='grid grid-cols-2 gap-4'>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className='h-16 bg-gray-200 rounded'></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-muted-foreground'>
            <TrendingUp className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p>No progress data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCertificates = progress.total_certificates;
  const approvedCertificates = progress.approved_certificates;
  const pendingCertificates = progress.pending_certificates;
  const completionRate =
    totalCertificates > 0
      ? Math.round((approvedCertificates / totalCertificates) * 100)
      : 0;
  const currentStreak = progress.current_streak_days;
  const longestStreak = progress.longest_streak_days;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TrendingUp className='h-5 w-5' />
          Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Overall Progress */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>
              Certificate Completion Rate
            </span>
            <span className='text-sm text-muted-foreground'>
              {completionRate}%
            </span>
          </div>
          <Progress value={completionRate} className='h-2' />
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Award className='h-4 w-4 text-green-500' />
              <span className='text-sm font-medium'>Approved</span>
            </div>
            <div className='text-2xl font-bold text-green-500'>
              {approvedCertificates}
            </div>
            <div className='text-xs text-muted-foreground'>Certificates</div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Target className='h-4 w-4 text-amber-500' />
              <span className='text-sm font-medium'>Pending</span>
            </div>
            <div className='text-2xl font-bold text-amber-500'>
              {pendingCertificates}
            </div>
            <div className='text-xs text-muted-foreground'>Under Review</div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <BookOpen className='h-4 w-4 text-sky-500' />
              <span className='text-sm font-medium'>Courses</span>
            </div>
            <div className='text-2xl font-bold text-sky-500'>
              {progress.courses_enrolled}
            </div>
            <div className='text-xs text-muted-foreground'>Enrolled</div>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-violet-500' />
              <span className='text-sm font-medium'>Streak</span>
            </div>
            <div className='text-2xl font-bold text-violet-500'>
              {currentStreak}
            </div>
            <div className='text-xs text-muted-foreground'>Days</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between text-sm'>
            <span>Total Activities</span>
            <Badge variant='secondary'>{progress.total_activities}</Badge>
          </div>

          {longestStreak > currentStreak && (
            <div className='flex items-center justify-between text-sm'>
              <span>Longest Streak</span>
              <Badge variant='outline'>{longestStreak} days</Badge>
            </div>
          )}

          {progress.last_activity_date && (
            <div className='flex items-center justify-between text-sm'>
              <span>Last Activity</span>
              <span className='text-muted-foreground'>
                {new Date(progress.last_activity_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProgressCard;
