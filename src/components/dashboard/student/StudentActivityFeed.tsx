import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Upload,
  BookOpen,
  CheckCircle,
  User,
  Trophy,
  Target,
  Users,
  Briefcase,
  Clock,
  Activity,
} from 'lucide-react';
import { StudentActivity } from '@/hooks/useStudent';

interface StudentActivityFeedProps {
  activities: StudentActivity[];
  loading?: boolean;
}

const StudentActivityFeed: React.FC<StudentActivityFeedProps> = ({
  activities,
  loading,
}) => {
  const getActivityIcon = (type: StudentActivity['activity_type']) => {
    switch (type) {
      case 'certificate_upload':
        return <Upload className='h-4 w-4 text-blue-600' />;
      case 'course_enroll':
        return <BookOpen className='h-4 w-4 text-green-600' />;
      case 'course_complete':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'profile_update':
        return <User className='h-4 w-4 text-purple-600' />;
      case 'achievement_earned':
        return <Trophy className='h-4 w-4 text-yellow-600' />;
      case 'goal_set':
        return <Target className='h-4 w-4 text-orange-600' />;
      case 'goal_achieved':
        return <Target className='h-4 w-4 text-green-600' />;
      case 'social_connection':
        return <Users className='h-4 w-4 text-pink-600' />;
      case 'portfolio_update':
        return <Briefcase className='h-4 w-4 text-indigo-600' />;
      default:
        return <Activity className='h-4 w-4 text-gray-600' />;
    }
  };

  const getActivityColor = (type: StudentActivity['activity_type']) => {
    switch (type) {
      case 'certificate_upload':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'course_enroll':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'course_complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'profile_update':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'achievement_earned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'goal_set':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'goal_achieved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'social_connection':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'portfolio_update':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const groupActivitiesByDate = (activities: StudentActivity[]) => {
    const groups: { [key: string]: StudentActivity[] } = {};

    activities.forEach(activity => {
      const date = new Date(activity.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });

    return groups;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5' />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse space-y-4'>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className='flex items-center gap-3'>
                <div className='h-8 w-8 bg-gray-200 rounded-full'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5' />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-muted-foreground'>
            <Activity className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p>No recent activity</p>
            <p className='text-sm'>
              Start uploading certificates or setting goals to see activity
              here!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedActivities = groupActivitiesByDate(activities);
  const sortedDates = Object.keys(groupedActivities).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Activity className='h-5 w-5' />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-96'>
          <div className='space-y-6'>
            {sortedDates.map(date => (
              <div key={date} className='space-y-3'>
                <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                  <Clock className='h-4 w-4' />
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>

                <div className='space-y-2'>
                  {groupedActivities[date].map(activity => (
                    <div
                      key={activity.id}
                      className='flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors'
                    >
                      <div className='flex-shrink-0 mt-0.5'>
                        {getActivityIcon(activity.activity_type)}
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='font-medium text-sm'>
                            {activity.title}
                          </span>
                          <Badge
                            variant='outline'
                            className={`text-xs ${getActivityColor(activity.activity_type)}`}
                          >
                            {activity.activity_type.replace('_', ' ')}
                          </Badge>
                        </div>

                        {activity.description && (
                          <p className='text-xs text-muted-foreground mb-2'>
                            {activity.description}
                          </p>
                        )}

                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <Clock className='h-3 w-3' />
                          <span>{formatTimeAgo(activity.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default StudentActivityFeed;
