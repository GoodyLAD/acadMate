import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Star,
  Award,
  Target,
  BookOpen,
  Users,
  Zap,
  Flame,
  TrendingUp,
  Crown,
  Medal,
  Gift,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { StudentAchievement, StudentProgress } from '@/hooks/useStudent';

interface EnhancedAchievementDashboardProps {
  achievements: StudentAchievement[];
  progress: StudentProgress | null;
  loading?: boolean;
}

const EnhancedAchievementDashboard: React.FC<
  EnhancedAchievementDashboardProps
> = ({ achievements, progress, loading }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [pointsToNextLevel, setPointsToNextLevel] = useState(100);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  // Calculate stats with fallbacks
  useEffect(() => {
    // Handle case where data might be null/undefined
    const safeAchievements = achievements || [];
    const safeProgress = progress || {
      current_streak_days: 0,
      total_certificates: 0,
      approved_certificates: 0,
    };

    const points = safeAchievements.reduce((sum, achievement) => {
      return sum + (achievement?.points || 0);
    }, 0);

    setTotalPoints(points);

    // Calculate level (every 100 points = 1 level)
    const level = Math.max(1, Math.floor(points / 100) + 1);
    setCurrentLevel(level);

    // Points needed for next level
    const nextLevelPoints = level * 100;
    setPointsToNextLevel(Math.max(0, nextLevelPoints - points));

    // Current streak with fallback
    setCurrentStreak(safeProgress.current_streak_days || 0);
  }, [achievements, progress]);

  const getLevelTitle = (level: number) => {
    if (level >= 20) return 'Legend';
    if (level >= 15) return 'Master';
    if (level >= 10) return 'Expert';
    if (level >= 5) return 'Advanced';
    if (level >= 3) return 'Intermediate';
    return 'Beginner';
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return 'from-purple-600 to-pink-600';
    if (level >= 15) return 'from-blue-600 to-purple-600';
    if (level >= 10) return 'from-green-600 to-blue-600';
    if (level >= 5) return 'from-yellow-600 to-green-600';
    if (level >= 3) return 'from-orange-600 to-yellow-600';
    return 'from-gray-600 to-orange-600';
  };

  const getAchievementIcon = (type: StudentAchievement['achievement_type']) => {
    switch (type) {
      case 'certificate':
        return <Award className='h-5 w-5' />;
      case 'course_completion':
        return <BookOpen className='h-5 w-5' />;
      case 'streak':
        return <Zap className='h-5 w-5' />;
      case 'milestone':
        return <Target className='h-5 w-5' />;
      case 'participation':
        return <Users className='h-5 w-5' />;
      case 'excellence':
        return <Star className='h-5 w-5' />;
      default:
        return <Trophy className='h-5 w-5' />;
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

  const safeAchievements = achievements || [];
  const recentAchievements = safeAchievements.slice(0, 3);
  const achievementTypes = [
    ...new Set(safeAchievements.map(a => a?.achievement_type).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className='p-6'>
              <div className='animate-pulse space-y-4'>
                <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                <div className='h-8 bg-gray-200 rounded w-3/4'></div>
                <div className='h-2 bg-gray-200 rounded'></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Main Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Total Points */}
        <Card className='bg-gradient-to-br from-yellow-500 to-orange-500 text-white'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-yellow-100 text-sm font-medium'>
                  Total Points
                </p>
                <p className='text-3xl font-bold'>{totalPoints}</p>
                <p className='text-yellow-100 text-xs'>Keep earning!</p>
              </div>
              <Trophy className='h-12 w-12 text-yellow-200' />
            </div>
          </CardContent>
        </Card>

        {/* Current Level */}
        <Card
          className={`bg-gradient-to-br ${getLevelColor(currentLevel)} text-white`}
        >
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-white/80 text-sm font-medium'>
                  Level {currentLevel}
                </p>
                <p className='text-2xl font-bold'>
                  {getLevelTitle(currentLevel)}
                </p>
                <p className='text-white/80 text-xs'>
                  {pointsToNextLevel} to next level
                </p>
              </div>
              <Crown className='h-12 w-12 text-white/80' />
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className='bg-gradient-to-br from-purple-500 to-pink-500 text-white'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-purple-100 text-sm font-medium'>
                  Current Streak
                </p>
                <p className='text-3xl font-bold'>{currentStreak}</p>
                <p className='text-purple-100 text-xs'>days in a row</p>
              </div>
              <Flame className='h-12 w-12 text-pink-200' />
            </div>
          </CardContent>
        </Card>

        {/* Achievements Count */}
        <Card className='bg-gradient-to-br from-green-500 to-teal-500 text-white'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-green-100 text-sm font-medium'>
                  Achievements
                </p>
                <p className='text-3xl font-bold'>{achievements.length}</p>
                <p className='text-green-100 text-xs'>
                  {achievementTypes.length} categories
                </p>
              </div>
              <Medal className='h-12 w-12 text-teal-200' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>
                Level {currentLevel} → Level {currentLevel + 1}
              </span>
              <span className='text-sm text-muted-foreground'>
                {100 - pointsToNextLevel}/100 points
              </span>
            </div>
            <Progress
              value={((100 - pointsToNextLevel) / 100) * 100}
              className='h-3'
            />
            <div className='flex items-center justify-between text-sm text-muted-foreground'>
              <span>Next level: {getLevelTitle(currentLevel + 1)}</span>
              <span>{pointsToNextLevel} points needed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5' />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAchievements.length > 0 ? (
            <div className='space-y-4'>
              {recentAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className='flex items-center gap-4 p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-shadow'
                >
                  <div className='flex-shrink-0'>
                    <div
                      className={`p-3 rounded-full ${getAchievementColor(achievement.achievement_type)}`}
                    >
                      {getAchievementIcon(achievement.achievement_type)}
                    </div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h3 className='font-semibold text-gray-900 truncate'>
                        {achievement.title}
                      </h3>
                      <Badge
                        variant='outline'
                        className={`text-xs ${getAchievementColor(achievement.achievement_type)}`}
                      >
                        +{achievement.points} pts
                      </Badge>
                    </div>
                    {achievement.description && (
                      <p className='text-sm text-gray-600 mb-1'>
                        {achievement.description}
                      </p>
                    )}
                    <p className='text-xs text-gray-500'>
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className='flex-shrink-0'>
                    <Button variant='ghost' size='sm'>
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>
              <Trophy className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p className='text-lg font-medium'>No achievements yet</p>
              <p className='text-sm'>
                Start uploading certificates and completing activities to earn
                your first achievement!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Gift className='h-5 w-5' />
            Achievement Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {achievementTypes.map(type => {
              const count = achievements.filter(
                a => a.achievement_type === type
              ).length;
              const totalPoints = achievements
                .filter(a => a.achievement_type === type)
                .reduce((sum, a) => sum + a.points, 0);

              return (
                <div
                  key={type}
                  className={`p-4 rounded-lg border ${getAchievementColor(type)}`}
                >
                  <div className='flex items-center gap-2 mb-2'>
                    {getAchievementIcon(type)}
                    <span className='font-medium text-sm capitalize'>
                      {type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className='text-2xl font-bold'>{count}</div>
                  <div className='text-xs opacity-75'>{totalPoints} points</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAchievementDashboard;
