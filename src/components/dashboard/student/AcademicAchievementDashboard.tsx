import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Trophy,
  Star,
  Target,
  Clock,
  Award,
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  Flame,
  Medal,
  Crown,
} from 'lucide-react';
import DashboardService, { DashboardStats } from '@/services/dashboardService';
import { mockDashboardStats } from '@/services/mockDataService';
import { useProfile } from '@/hooks/useProfile';
import { useMockData } from '@/hooks/useMockData';

interface AcademicAchievementDashboardProps {
  loading?: boolean;
}

const AcademicAchievementDashboard: React.FC<
  AcademicAchievementDashboardProps
> = ({ loading: propLoading }) => {
  const { profile } = useProfile();
  const { mockDataEnabled } = useMockData();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile) return;

      setLoading(true);
      setError(null);

      try {
        // Check if mock data is enabled
        if (mockDataEnabled) {
          setStats(mockDashboardStats);
        } else {
          const dashboardService = DashboardService.getInstance();
          const data = await dashboardService.getDashboardStats(profile.id);
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile, mockDataEnabled]);

  if (propLoading || loading) {
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

  if (error) {
    return (
      <Card>
        <CardContent className='p-6 text-center'>
          <div className='text-red-500 mb-2'>⚠️</div>
          <p className='text-red-600'>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className='p-6 text-center'>
          <div className='text-gray-500 mb-2'>📊</div>
          <p className='text-gray-600'>No data available</p>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'certificate':
        return <Award className='h-4 w-4' />;
      case 'course':
        return <BookOpen className='h-4 w-4' />;
      case 'event':
        return <Calendar className='h-4 w-4' />;
      case 'competition':
        return <Trophy className='h-4 w-4' />;
      case 'leadership':
        return <Crown className='h-4 w-4' />;
      case 'volunteer':
        return <Users className='h-4 w-4' />;
      case 'research':
        return <GraduationCap className='h-4 w-4' />;
      default:
        return <Star className='h-4 w-4' />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'certificate':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'course':
        return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'event':
        return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'competition':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'leadership':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'volunteer':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'research':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-50 text-gray-600';
      case 'rare':
        return 'bg-sky-50 text-sky-600';
      case 'epic':
        return 'bg-violet-50 text-violet-600';
      case 'legendary':
        return 'bg-amber-50 text-amber-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getLevelTitle = (level: number) => {
    if (level >= 50) return 'Academic Legend';
    if (level >= 40) return 'Achievement Master';
    if (level >= 30) return 'Excellence Expert';
    if (level >= 20) return 'High Achiever';
    if (level >= 10) return 'Rising Star';
    return 'Beginner';
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'from-violet-400 to-rose-400';
    if (level >= 40) return 'from-sky-400 to-violet-400';
    if (level >= 30) return 'from-green-400 to-sky-400';
    if (level >= 20) return 'from-amber-400 to-green-400';
    if (level >= 10) return 'from-orange-400 to-amber-400';
    return 'from-gray-400 to-orange-400';
  };

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
        {/* Total Achievements */}
        <Card className='bg-gradient-to-br from-green-100 to-emerald-100 text-green-800 border-green-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-green-600 text-sm font-medium'>
                  Total Achievements
                </p>
                <p className='text-3xl font-bold text-green-700'>
                  {stats.totalAchievements}
                </p>
                <p className='text-green-600 text-xs'>Keep achieving!</p>
              </div>
              <Trophy className='h-12 w-12 text-green-500' />
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className='bg-gradient-to-br from-orange-100 to-red-100 text-orange-800 border-orange-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-orange-600 text-sm font-medium'>
                  Active Streak
                </p>
                <p className='text-3xl font-bold text-orange-700'>
                  {stats.currentStreak}
                </p>
                <p className='text-orange-600 text-xs'>days active</p>
              </div>
              <Flame className='h-12 w-12 text-orange-500' />
            </div>
          </CardContent>
        </Card>

        {/* Level */}
        <Card
          className={`bg-gradient-to-br ${getLevelColor(stats.level)} text-gray-800 border-gray-200`}
        >
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-600 text-sm font-medium'>
                  Level {stats.level}
                </p>
                <p className='text-2xl font-bold text-gray-700'>
                  {getLevelTitle(stats.level)}
                </p>
                <p className='text-gray-600 text-xs'>Keep growing!</p>
              </div>
              <Crown className='h-12 w-12 text-gray-500' />
            </div>
          </CardContent>
        </Card>

        {/* Total Points */}
        <Card className='bg-gradient-to-br from-sky-100 to-indigo-100 text-sky-800 border-sky-200'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sky-600 text-sm font-medium'>Total Points</p>
                <p className='text-3xl font-bold text-sky-700'>
                  {stats.totalPoints}
                </p>
                <p className='text-sky-600 text-xs'>
                  Earned through activities
                </p>
              </div>
              <Star className='h-12 w-12 text-sky-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Target className='h-5 w-5' />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Button className='h-20 flex-col gap-2 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'>
              <Award className='h-6 w-6' />
              <span className='text-sm font-medium'>Upload Certificate</span>
            </Button>
            <Button className='h-20 flex-col gap-2 bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200'>
              <BookOpen className='h-6 w-6' />
              <span className='text-sm font-medium'>Add Course</span>
            </Button>
            <Button className='h-20 flex-col gap-2 bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200'>
              <Calendar className='h-6 w-6' />
              <span className='text-sm font-medium'>Log Event</span>
            </Button>
            <Button className='h-20 flex-col gap-2 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'>
              <Trophy className='h-6 w-6' />
              <span className='text-sm font-medium'>Add Competition</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {stats.recentAchievements.slice(0, 5).map(achievement => (
              <div
                key={achievement.id}
                className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`p-2 rounded-full ${getTypeColor(achievement.type)}`}
                  >
                    {getTypeIcon(achievement.type)}
                  </div>
                  <div>
                    <h4 className='font-medium'>{achievement.title}</h4>
                    <div className='flex items-center gap-2 mt-1'>
                      <Badge
                        className={`text-xs ${getTypeColor(achievement.type)}`}
                      >
                        {achievement.type}
                      </Badge>
                      <span className='text-xs text-gray-500'>
                        {achievement.category}
                      </span>
                      <Badge
                        variant={
                          achievement.status === 'approved'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {achievement.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='flex items-center gap-1 text-green-500'>
                    <Star className='h-4 w-4' />
                    <span className='font-medium'>+{achievement.points}</span>
                  </div>
                  <p className='text-xs text-gray-500'>
                    {new Date(achievement.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <div className='text-center py-8 text-gray-500'>
                <Trophy className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>No achievements yet</p>
                <p className='text-sm'>
                  Start uploading certificates and logging activities!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-5 w-5' />
            Achievement Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {stats.categoryStats.map(category => (
              <div key={category.category} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>
                    {category.category}
                  </span>
                  <span className='text-sm text-gray-500'>
                    {category.count} achievements
                  </span>
                </div>
                <Progress
                  value={(category.count / stats.totalAchievements) * 100}
                  className='h-2'
                />
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>{category.points} points</span>
                  <span>
                    {Math.round(
                      (category.count / stats.totalAchievements) * 100
                    )}
                    %
                  </span>
                </div>
              </div>
            )) || (
              <div className='col-span-full text-center py-8 text-gray-500'>
                <BarChart3 className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>No category data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Medal className='h-5 w-5' />
            Badges & Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {stats.badges.slice(0, 8).map(badgeItem => (
              <div
                key={badgeItem.id}
                className='text-center p-4 border rounded-lg hover:shadow-md transition-shadow'
              >
                <div
                  className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${getBadgeRarityColor(badgeItem.rarity)}`}
                >
                  <Medal className='h-6 w-6' />
                </div>
                <h4 className='font-medium text-sm'>{badgeItem.name}</h4>
                <p className='text-xs text-gray-500 mt-1'>
                  {badgeItem.description}
                </p>
                <p className='text-xs text-gray-400 mt-1'>
                  {new Date(badgeItem.earnedAt).toLocaleDateString()}
                </p>
              </div>
            )) || (
              <div className='col-span-full text-center py-8 text-gray-500'>
                <Medal className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>No badges earned yet</p>
                <p className='text-sm'>Complete achievements to earn badges!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicAchievementDashboard;
