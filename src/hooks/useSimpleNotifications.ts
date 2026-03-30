import { useState, useEffect } from 'react';
import {
  simpleNotificationService,
  SimpleNotification,
} from '@/services/simpleNotificationService';

export const useSimpleNotifications = () => {
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load initial notifications
    const initialNotifications = simpleNotificationService.getNotifications();
    setNotifications(initialNotifications);
    setUnreadCount(simpleNotificationService.getUnreadCount());

    // Subscribe to changes
    const unsubscribe = simpleNotificationService.subscribe(
      newNotifications => {
        setNotifications(newNotifications);
        setUnreadCount(simpleNotificationService.getUnreadCount());
      }
    );

    return unsubscribe;
  }, []);

  const markAsRead = (notificationId: string) => {
    simpleNotificationService.markAsRead(notificationId);
  };

  const markAllAsRead = () => {
    simpleNotificationService.markAllAsRead();
  };

  const deleteNotification = (notificationId: string) => {
    simpleNotificationService.deleteNotification(notificationId);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
