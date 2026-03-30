import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSimpleNotifications } from '@/hooks/useSimpleNotifications';
import { Bell, Check, CheckCheck, Trash2, X, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useSimpleNotifications();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedNotification, setSelectedNotification] = useState<
    string | null
  >(null);

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
    setSelectedNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      post_created: '📝',
      post_liked: '👍',
      post_disliked: '👎',
      post_commented: '💬',
      comment_liked: '👍',
      comment_disliked: '👎',
      user_joined_group: '👥',
      group_created: '🏗️',
    };
    return iconMap[type as keyof typeof iconMap] || '🔔';
  };

  const getNotificationColor = (type: string) => {
    const colorMap = {
      post_created: 'text-blue-600',
      post_liked: 'text-green-600',
      post_disliked: 'text-red-600',
      post_commented: 'text-purple-600',
      comment_liked: 'text-green-600',
      comment_disliked: 'text-red-600',
      user_joined_group: 'text-blue-600',
      group_created: 'text-indigo-600',
    };
    return colorMap[type as keyof typeof colorMap] || 'text-gray-600';
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-2xl max-h-[80vh] bg-white'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <Bell className='h-6 w-6 text-blue-600' />
              {unreadCount > 0 && (
                <Badge className='absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500'>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </div>
            <CardTitle className='text-xl'>Notifications</CardTitle>
          </div>
          <div className='flex items-center gap-2'>
            {unreadCount > 0 && (
              <Button
                variant='outline'
                size='sm'
                onClick={handleMarkAllAsRead}
                className='text-xs'
              >
                <CheckCheck className='h-4 w-4 mr-1' />
                Mark All Read
              </Button>
            )}
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>

        <CardContent className='p-0'>
          <ScrollArea className='h-[60vh]'>
            {notifications.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                <Bell className='h-12 w-12 mb-4 text-gray-300' />
                <p className='text-lg font-medium'>No notifications yet</p>
                <p className='text-sm'>
                  You'll see updates here when they arrive
                </p>
              </div>
            ) : (
              <div className='space-y-1'>
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read
                        ? 'bg-blue-50 border-l-4 border-l-blue-500'
                        : ''
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className='flex items-start gap-3'>
                      <div className='flex-shrink-0'>
                        <div className='w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg'>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                              <h4 className='font-medium text-gray-900 text-sm'>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                              )}
                            </div>

                            <p className='text-sm text-gray-600 mb-2 line-clamp-2'>
                              {notification.message}
                            </p>

                            <div className='flex items-center gap-2 text-xs text-gray-500'>
                              <span
                                className={getNotificationColor(
                                  notification.type
                                )}
                              >
                                {notification.type
                                  .replace('_', ' ')
                                  .toUpperCase()}
                              </span>
                              <span>•</span>
                              <span>{formatTime(notification.timestamp)}</span>
                              {notification.from_user_name && (
                                <>
                                  <span>•</span>
                                  <span>
                                    from {notification.from_user_name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-8 w-8 p-0'
                                onClick={e => e.stopPropagation()}
                              >
                                <MoreVertical className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              {!notification.read && (
                                <DropdownMenuItem
                                  onClick={e => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  <Check className='h-4 w-4 mr-2' />
                                  Mark as Read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                className='text-red-600'
                              >
                                <Trash2 className='h-4 w-4 mr-2' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
