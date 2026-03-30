import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useSimpleNotifications } from '@/hooks/useSimpleNotifications';
import NotificationCenter from './NotificationCenter';

const NotificationBell: React.FC = () => {
  const { unreadCount } = useSimpleNotifications();
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] =
    useState(false);

  const handleBellClick = () => {
    setIsNotificationCenterOpen(true);
  };

  const handleCloseNotificationCenter = () => {
    setIsNotificationCenterOpen(false);
  };

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        onClick={handleBellClick}
        className='relative p-2 hover:bg-gray-100 rounded-full'
      >
        <Bell className='h-5 w-5 text-gray-600' />
        {unreadCount > 0 && (
          <Badge className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500 text-white border-0'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={handleCloseNotificationCenter}
      />
    </>
  );
};

export default NotificationBell;
