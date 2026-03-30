import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  from_user_id: string | null;
  type:
    | 'post_created'
    | 'post_liked'
    | 'post_disliked'
    | 'post_commented'
    | 'comment_liked'
    | 'comment_disliked'
    | 'user_joined_group'
    | 'user_left_group'
    | 'group_created'
    | 'event_created'
    | 'event_updated'
    | 'event_cancelled'
    | 'achievement_earned'
    | 'certificate_approved'
    | 'certificate_rejected'
    | 'mentor_assigned'
    | 'mentor_unassigned';
  title: string;
  message: string;
  data: Record<string, any>;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  from_user_name?: string;
  from_user_avatar?: string;
}

export class NotificationService {
  // Get notifications for current user
  static async getNotifications(
    limit = 50,
    offset = 0
  ): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select(
        `
        *,
        from_user:profiles!notifications_from_user_id_fkey(full_name, avatar_url)
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return (
      data?.map(notification => ({
        ...notification,
        from_user_name: notification.from_user?.full_name || 'System',
        from_user_avatar: notification.from_user?.avatar_url || '',
      })) || []
    );
  }

  // Get unread notification count
  static async getUnreadCount(): Promise<number> {
    const { data, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .is('read_at', null);

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return data?.length || 0;
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get notification by ID
  static async getNotification(
    notificationId: string
  ): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select(
        `
        *,
        from_user:profiles!notifications_from_user_id_fkey(full_name, avatar_url)
      `
      )
      .eq('id', notificationId)
      .single();

    if (error) {
      console.error('Error fetching notification:', error);
      return null;
    }

    return {
      ...data,
      from_user_name: data.from_user?.full_name || 'System',
      from_user_avatar: data.from_user?.avatar_url || '',
    };
  }

  // Subscribe to real-time notifications
  static subscribeToNotifications(callback: (payload: any) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        callback
      )
      .subscribe();
  }

  // Get notification icon based on type
  static getNotificationIcon(type: Notification['type']): string {
    const iconMap = {
      post_created: '📝',
      post_liked: '👍',
      post_disliked: '👎',
      post_commented: '💬',
      comment_liked: '👍',
      comment_disliked: '👎',
      user_joined_group: '👥',
      user_left_group: '👥',
      group_created: '🏗️',
      event_created: '📅',
      event_updated: '📅',
      event_cancelled: '❌',
      achievement_earned: '🏆',
      certificate_approved: '✅',
      certificate_rejected: '❌',
      mentor_assigned: '👨‍🏫',
      mentor_unassigned: '👨‍🏫',
    };

    return iconMap[type] || '🔔';
  }

  // Get notification color based on type
  static getNotificationColor(type: Notification['type']): string {
    const colorMap = {
      post_created: 'text-blue-600',
      post_liked: 'text-green-600',
      post_disliked: 'text-red-600',
      post_commented: 'text-purple-600',
      comment_liked: 'text-green-600',
      comment_disliked: 'text-red-600',
      user_joined_group: 'text-blue-600',
      user_left_group: 'text-gray-600',
      group_created: 'text-indigo-600',
      event_created: 'text-orange-600',
      event_updated: 'text-yellow-600',
      event_cancelled: 'text-red-600',
      achievement_earned: 'text-yellow-600',
      certificate_approved: 'text-green-600',
      certificate_rejected: 'text-red-600',
      mentor_assigned: 'text-blue-600',
      mentor_unassigned: 'text-gray-600',
    };

    return colorMap[type] || 'text-gray-600';
  }

  // Format notification time
  static formatNotificationTime(createdAt: string): string {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInSeconds = Math.floor(
      (now.getTime() - notificationTime.getTime()) / 1000
    );

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
      return notificationTime.toLocaleDateString();
    }
  }

  // Create a test notification (for development)
  static async createTestNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data: Record<string, any> = {}
  ): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data,
      })
      .select(
        `
        *,
        from_user:profiles!notifications_from_user_id_fkey(full_name, avatar_url)
      `
      )
      .single();

    if (error) {
      console.error('Error creating test notification:', error);
      throw error;
    }

    return {
      ...notification,
      from_user_name: notification.from_user?.full_name || 'System',
      from_user_avatar: notification.from_user?.avatar_url || '',
    };
  }
}
