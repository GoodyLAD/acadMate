import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Activity,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Award,
  BookOpen,
  Zap,
  Target,
  TrendingUp,
  Eye,
} from 'lucide-react';
import SocialActivityService from '@/services/socialActivityService';
import { mockSocialActivities } from '@/services/mockDataService';
import { useProfile } from '@/hooks/useProfile';
import { useMockData } from '@/hooks/useMockData';
import { ActivityData } from '@/services/dashboardService';

interface SocialActivityFeedProps {
  loading?: boolean;
}

const SocialActivityFeed: React.FC<SocialActivityFeedProps> = ({
  loading: propLoading,
}) => {
  const { profile } = useProfile();
  const { mockDataEnabled } = useMockData();
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedActivities, setLikedActivities] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const fetchActivities = async () => {
      if (!profile) return;

      setLoading(true);
      setError(null);

      try {
        // Check if mock data is enabled
        if (mockDataEnabled) {
          setActivities(mockSocialActivities);
        } else {
          const socialService = SocialActivityService.getInstance();
          const data = await socialService.getSocialActivities(profile.id, 20);
          setActivities(data);
        }
      } catch (err) {
        console.error('Error fetching social activities:', err);
        setError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [profile, mockDataEnabled]);

  const getActivityIcon = (type: ActivityData['type']) => {
    switch (type) {
      case 'achievement':
        return <Trophy className='h-4 w-4' />;
      case 'certificate':
        return <Award className='h-4 w-4' />;
      case 'course':
        return <BookOpen className='h-4 w-4' />;
      case 'streak':
        return <Zap className='h-4 w-4' />;
      case 'milestone':
        return <Target className='h-4 w-4' />;
      case 'goal':
        return <TrendingUp className='h-4 w-4' />;
      default:
        return <Activity className='h-4 w-4' />;
    }
  };

  const getActivityColor = (type: ActivityData['type']) => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'certificate':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'course':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'streak':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'milestone':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'goal':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 20) return 'bg-purple-500';
    if (level >= 15) return 'bg-blue-500';
    if (level >= 10) return 'bg-green-500';
    if (level >= 5) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const handleLike = (activityId: string) => {
    setLikedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - activityTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (propLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5' />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[1, 2, 3].map(i => (
              <div key={i} className='animate-pulse'>
                <div className='flex items-start gap-3'>
                  <div className='h-10 w-10 bg-gray-200 rounded-full'></div>
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                    <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Activity className='h-5 w-5' />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className='text-center py-8 text-red-500'>
            <Activity className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p className='text-lg font-medium'>Error loading activities</p>
            <p className='text-sm'>{error}</p>
          </div>
        ) : activities.length > 0 ? (
          <div className='space-y-4'>
            {activities.map(activity => (
              <div
                key={activity.id}
                className='p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-shadow'
              >
                <div className='flex items-start gap-3'>
                  <div className='relative'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback>
                        {activity.user.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getLevelColor(activity.user.level)} border-2 border-white`}
                    ></div>
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='font-semibold text-sm'>
                        {activity.user.name}
                      </span>
                      <Badge variant='outline' className='text-xs'>
                        Level {activity.user.level}
                      </Badge>
                      <span className='text-xs text-muted-foreground'>
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>

                    <div className='flex items-center gap-2 mb-2'>
                      <div
                        className={`p-1 rounded-full ${getActivityColor(activity.type)}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <span className='font-medium text-sm'>
                        {activity.title}
                      </span>
                      <Badge
                        variant='outline'
                        className={`text-xs ${getActivityColor(activity.type)}`}
                      >
                        +{activity.points} pts
                      </Badge>
                    </div>

                    <p className='text-sm text-gray-600 mb-3'>
                      {activity.description}
                    </p>

                    <div className='flex items-center gap-4'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleLike(activity.id)}
                        className={`text-xs ${
                          likedActivities.has(activity.id)
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart
                          className={`h-3 w-3 mr-1 ${
                            likedActivities.has(activity.id)
                              ? 'fill-current'
                              : ''
                          }`}
                        />
                        {activity.likes +
                          (likedActivities.has(activity.id) ? 1 : 0)}
                      </Button>

                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-xs text-gray-500 hover:text-blue-500'
                      >
                        <MessageCircle className='h-3 w-3 mr-1' />
                        {activity.comments}
                      </Button>

                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-xs text-gray-500 hover:text-green-500'
                      >
                        <Share2 className='h-3 w-3 mr-1' />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8 text-muted-foreground'>
            <Activity className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p className='text-lg font-medium'>No recent activity</p>
            <p className='text-sm'>
              Start uploading achievements to see activity here!
            </p>
          </div>
        )}

        {activities.length > 0 && (
          <div className='mt-6 text-center'>
            <Button variant='outline' size='sm'>
              <Eye className='h-4 w-4 mr-2' />
              View All Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialActivityFeed;
