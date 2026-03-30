import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Star,
  Award,
  Target,
  BookOpen,
  Users,
  Zap,
} from 'lucide-react';
import { StudentAchievement } from '@/hooks/useStudent';

interface StudentAchievementsCardProps {
  achievements: StudentAchievement[];
  loading?: boolean;
}

const StudentAchievementsCard: React.FC<StudentAchievementsCardProps> = ({
  achievements,
  loading,
}) => {
  const getAchievementIcon = (type: StudentAchievement['achievement_type']) => {
    switch (type) {
      case 'certificate':
        return <Award className='h-4 w-4' />;
      case 'course_completion':
        return <BookOpen className='h-4 w-4' />;
      case 'streak':
        return <Zap className='h-4 w-4' />;
      case 'milestone':
        return <Target className='h-4 w-4' />;
      case 'participation':
        return <Users className='h-4 w-4' />;
      case 'excellence':
        return <Star className='h-4 w-4' />;
      default:
        return <Trophy className='h-4 w-4' />;
    }
  };

  const getAchievementColor = (
    type: StudentAchievement['achievement_type']
  ) => {
    switch (type) {
      case 'certificate':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'course_completion':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'streak':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'milestone':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'participation':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'excellence':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalPoints = achievements.reduce(
    (sum, achievement) => sum + achievement.points,
    0
  );
  const achievementTypes = [
    ...new Set(achievements.map(a => a.achievement_type)),
  ];
  const recentAchievements = achievements.slice(0, 3);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5' />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse space-y-4'>
            <div className='h-4 bg-gray-200 rounded w-1/2'></div>
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

  if (achievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5' />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-muted-foreground'>
            <Trophy className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p>No achievements yet</p>
            <p className='text-sm'>
              Keep learning to earn your first achievement!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Trophy className='h-5 w-5' />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Points Summary */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Total Points</span>
            <Badge variant='default' className='bg-yellow-100 text-yellow-800'>
              {totalPoints} pts
            </Badge>
          </div>
          <div className='text-2xl font-bold text-yellow-600'>
            {totalPoints}
          </div>
        </div>

        {/* Achievement Types */}
        <div className='space-y-2'>
          <span className='text-sm font-medium'>Achievement Types</span>
          <div className='flex flex-wrap gap-2'>
            {achievementTypes.map(type => {
              const count = achievements.filter(
                a => a.achievement_type === type
              ).length;
              return (
                <Badge key={type} variant='outline' className='text-xs'>
                  {type.replace('_', ' ')} ({count})
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className='space-y-3'>
          <span className='text-sm font-medium'>Recent Achievements</span>
          <div className='space-y-2'>
            {recentAchievements.map(achievement => (
              <div
                key={achievement.id}
                className='flex items-center gap-3 p-3 rounded-lg border bg-muted/30'
              >
                <div className='flex-shrink-0'>
                  {getAchievementIcon(achievement.achievement_type)}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-sm truncate'>
                      {achievement.title}
                    </span>
                    <Badge
                      variant='outline'
                      className={`text-xs ${getAchievementColor(achievement.achievement_type)}`}
                    >
                      {achievement.points} pts
                    </Badge>
                  </div>
                  {achievement.description && (
                    <p className='text-xs text-muted-foreground mt-1'>
                      {achievement.description}
                    </p>
                  )}
                  <p className='text-xs text-muted-foreground mt-1'>
                    {new Date(achievement.earned_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress to Next Achievement */}
        {achievements.length > 0 && (
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Next Milestone</span>
              <span className='text-sm text-muted-foreground'>
                {achievements.length + 1} achievements
              </span>
            </div>
            <Progress
              value={(achievements.length / (achievements.length + 1)) * 100}
              className='h-2'
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentAchievementsCard;
