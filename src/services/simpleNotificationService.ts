// Simple Notification Service (Frontend-only)
// This provides basic notifications without database triggers

export interface SimpleNotification {
  id: string;
  type:
    | 'post_created'
    | 'post_liked'
    | 'post_disliked'
    | 'post_commented'
    | 'comment_liked'
    | 'comment_disliked'
    | 'user_joined_group'
    | 'group_created';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, any>;
}

class SimpleNotificationService {
  private notifications: SimpleNotification[] = [];
  private listeners: ((notifications: SimpleNotification[]) => void)[] = [];

  // Get all notifications
  getNotifications(): SimpleNotification[] {
    return this.notifications.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Add a notification
  addNotification(
    notification: Omit<SimpleNotification, 'id' | 'timestamp' | 'read'>
  ): void {
    const newNotification: SimpleNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    this.notifyListeners();
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Mark all as read
  markAllAsRead(): void {
    this.notifications.forEach(n => (n.read = true));
    this.notifyListeners();
  }

  // Delete notification
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(
      n => n.id !== notificationId
    );
    this.notifyListeners();
  }

  // Subscribe to changes
  subscribe(
    listener: (notifications: SimpleNotification[]) => void
  ): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Simulate notifications for community activities
  notifyPostCreated(
    postId: string,
    authorName: string,
    groupName?: string
  ): void {
    this.addNotification({
      type: 'post_created',
      title: 'New Post',
      message: groupName
        ? `${authorName} created a new post in ${groupName}`
        : `${authorName} created a new post`,
      data: { postId, groupName },
    });
  }

  notifyPostLiked(
    postId: string,
    likerName: string,
    postAuthorName: string
  ): void {
    this.addNotification({
      type: 'post_liked',
      title: 'Post Liked',
      message: `${likerName} liked your post`,
      data: { postId, likerName, postAuthorName },
    });
  }

  notifyPostDisliked(
    postId: string,
    dislikerName: string,
    postAuthorName: string
  ): void {
    this.addNotification({
      type: 'post_disliked',
      title: 'Post Disliked',
      message: `${dislikerName} disliked your post`,
      data: { postId, dislikerName, postAuthorName },
    });
  }

  notifyPostCommented(
    postId: string,
    commenterName: string,
    postAuthorName: string
  ): void {
    this.addNotification({
      type: 'post_commented',
      title: 'New Comment',
      message: `${commenterName} commented on your post`,
      data: { postId, commenterName, postAuthorName },
    });
  }

  notifyCommentLiked(
    commentId: string,
    likerName: string,
    commentAuthorName: string
  ): void {
    this.addNotification({
      type: 'comment_liked',
      title: 'Comment Liked',
      message: `${likerName} liked your comment`,
      data: { commentId, likerName, commentAuthorName },
    });
  }

  notifyCommentDisliked(
    commentId: string,
    dislikerName: string,
    commentAuthorName: string
  ): void {
    this.addNotification({
      type: 'comment_disliked',
      title: 'Comment Disliked',
      message: `${dislikerName} disliked your comment`,
      data: { commentId, dislikerName, commentAuthorName },
    });
  }

  notifyUserJoinedGroup(
    groupId: string,
    userName: string,
    groupName: string
  ): void {
    this.addNotification({
      type: 'user_joined_group',
      title: 'New Group Member',
      message: `${userName} joined ${groupName}`,
      data: { groupId, userName, groupName },
    });
  }

  notifyGroupCreated(
    groupId: string,
    creatorName: string,
    groupName: string
  ): void {
    this.addNotification({
      type: 'group_created',
      title: 'New Group Created',
      message: `${creatorName} created a new group: ${groupName}`,
      data: { groupId, creatorName, groupName },
    });
  }
}

// Export singleton instance
export const simpleNotificationService = new SimpleNotificationService();
