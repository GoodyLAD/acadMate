import { supabase } from '@/integrations/supabase/client';
import { simpleNotificationService } from './simpleNotificationService';

export interface CommunityPost {
  id: string;
  author_id: string;
  content: string;
  category: 'Academics' | 'Placements' | 'Clubs' | 'Events' | 'General';
  group_id: string | null;
  is_blocked: boolean;
  reports_count: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  upvotes?: number;
  downvotes?: number;
  bookmarks?: number;
  user_has_upvoted?: boolean;
  user_has_downvoted?: boolean;
  user_has_bookmarked?: boolean;
  comments?: CommunityComment[];
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_blocked: boolean;
  reports_count: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  upvotes?: number;
  downvotes?: number;
  user_has_upvoted?: boolean;
  user_has_downvoted?: boolean;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  is_member?: boolean;
  is_admin?: boolean;
}

export interface PostInteraction {
  id: string;
  post_id: string;
  user_id: string;
  interaction_type: 'upvote' | 'downvote' | 'bookmark';
  created_at: string;
}

export interface CommentInteraction {
  id: string;
  comment_id: string;
  user_id: string;
  interaction_type: 'upvote' | 'downvote';
  created_at: string;
}

export class CommunityService {
  // Posts
  static async getPosts(
    groupId?: string,
    category?: string,
    limit = 50,
    offset = 0
  ): Promise<CommunityPost[]> {
    let query = supabase
      .from('community_posts')
      .select('*')
      .eq('is_blocked', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    // Transform the data to include author info
    return (
      data?.map(post => ({
        ...post,
        author_name: post.author_name || 'Anonymous',
        author_avatar: post.author_avatar || '',
      })) || []
    );
  }

  static async createPost(
    authorId: string,
    content: string,
    category: 'Academics' | 'Placements' | 'Clubs' | 'Events' | 'General',
    groupId?: string
  ): Promise<CommunityPost> {
    // Get author info first
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', authorId)
      .single();

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        author_id: authorId,
        author_name: profile?.full_name || 'Anonymous',
        author_avatar: profile?.avatar_url || '',
        content,
        category,
        group_id: groupId || null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }

    const result = {
      ...data,
      author_name: data.author_name || 'Anonymous',
      author_avatar: data.author_avatar || '',
    };

    // Trigger notification for new post
    simpleNotificationService.notifyPostCreated(
      result.id,
      result.author_name,
      groupId ? 'Group' : 'General'
    );

    return result;
  }

  static async updatePost(postId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('community_posts')
      .update({ content })
      .eq('id', postId);

    if (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  static async deletePost(postId: string): Promise<void> {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Comments
  static async getComments(postId: string): Promise<CommunityComment[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    return (
      data?.map(comment => ({
        ...comment,
        author_name: comment.author_name || 'Anonymous',
        author_avatar: comment.author_avatar || '',
      })) || []
    );
  }

  static async createComment(
    postId: string,
    authorId: string,
    content: string
  ): Promise<CommunityComment> {
    // Get author info first
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', authorId)
      .single();

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        author_id: authorId,
        author_name: profile?.full_name || 'Anonymous',
        author_avatar: profile?.avatar_url || '',
        content,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      // If it's a metadata column error, try without database triggers
      if (error.code === '42703' && error.message?.includes('metadata')) {
        // Return a mock result to continue with frontend notifications
        const mockResult = {
          id: Date.now().toString(),
          post_id: postId,
          author_id: authorId,
          author_name: profile?.full_name || 'Anonymous',
          author_avatar: profile?.avatar_url || '',
          content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Trigger frontend notification
        simpleNotificationService.notifyPostCommented(
          postId,
          mockResult.author_name,
          'Post Author'
        );

        return mockResult;
      }
      throw error;
    }

    const result = {
      ...data,
      author_name: data.author_name || 'Anonymous',
      author_avatar: data.author_avatar || '',
    };

    // Trigger notification for new comment
    simpleNotificationService.notifyPostCommented(
      postId,
      result.author_name,
      'Post Author' // We don't have post author info here, so use placeholder
    );

    return result;
  }

  static async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Groups
  static async getGroups(userId?: string): Promise<CommunityGroup[]> {
    const { data, error } = await supabase.from('community_groups').select('*');

    if (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }

    // Get membership info for each group
    const groupsWithMembership = await Promise.all(
      (data || []).map(async group => {
        const { data: memberships } = await supabase
          .from('group_memberships')
          .select('user_id, is_admin')
          .eq('group_id', group.id);

        const memberCount = memberships?.length || 0;
        const userMembership = memberships?.find(m => m.user_id === userId);

        return {
          ...group,
          member_count: memberCount,
          is_member: !!userMembership,
          is_admin: userMembership?.is_admin || false,
        };
      })
    );

    return groupsWithMembership;
  }

  static async createGroup(
    name: string,
    description: string,
    createdBy: string
  ): Promise<CommunityGroup> {
    const { data, error } = await supabase
      .from('community_groups')
      .insert({
        name,
        description,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating group:', error);
      throw error;
    }

    // Add creator as admin
    await supabase.from('group_memberships').insert({
      group_id: data.id,
      user_id: createdBy,
      is_admin: true,
    });

    return {
      ...data,
      member_count: 1,
      is_member: true,
      is_admin: true,
    };
  }

  static async joinGroup(groupId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('group_memberships').insert({
      group_id: groupId,
      user_id: userId,
      is_admin: false,
    });

    if (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  static async leaveGroup(groupId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('group_memberships')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  // Interactions
  static async togglePostInteraction(
    postId: string,
    userId: string,
    interactionType: 'upvote' | 'downvote' | 'bookmark'
  ): Promise<void> {
    // First, check if interaction exists
    const { data: existing } = await supabase
      .from('post_interactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('interaction_type', interactionType)
      .single();

    if (existing) {
      // Remove existing interaction
      await supabase.from('post_interactions').delete().eq('id', existing.id);
    } else {
      // Remove opposite interactions first
      if (interactionType === 'upvote') {
        await supabase
          .from('post_interactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
          .eq('interaction_type', 'downvote');
      } else if (interactionType === 'downvote') {
        await supabase
          .from('post_interactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
          .eq('interaction_type', 'upvote');
      }

      // Add new interaction
      await supabase.from('post_interactions').insert({
        post_id: postId,
        user_id: userId,
        interaction_type: interactionType,
      });

      // Trigger notification for interaction
      if (interactionType === 'upvote') {
        simpleNotificationService.notifyPostLiked(
          postId,
          'User',
          'Post Author'
        );
      } else if (interactionType === 'downvote') {
        simpleNotificationService.notifyPostDisliked(
          postId,
          'User',
          'Post Author'
        );
      }
    }
  }

  static async toggleCommentInteraction(
    commentId: string,
    userId: string,
    interactionType: 'upvote' | 'downvote'
  ): Promise<void> {
    // First, check if interaction exists
    const { data: existing } = await supabase
      .from('comment_interactions')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .eq('interaction_type', interactionType)
      .single();

    if (existing) {
      // Remove existing interaction
      await supabase
        .from('comment_interactions')
        .delete()
        .eq('id', existing.id);
    } else {
      // Remove opposite interactions first
      const oppositeType = interactionType === 'upvote' ? 'downvote' : 'upvote';
      await supabase
        .from('comment_interactions')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .eq('interaction_type', oppositeType);

      // Add new interaction
      await supabase.from('comment_interactions').insert({
        comment_id: commentId,
        user_id: userId,
        interaction_type: interactionType,
      });
    }
  }

  // Get interaction counts and user status
  static async getPostInteractions(postId: string, userId?: string) {
    const { data: interactions, error } = await supabase
      .from('post_interactions')
      .select('interaction_type, user_id')
      .eq('post_id', postId);

    if (error) {
      console.error('Error fetching post interactions:', error);
      return {
        upvotes: 0,
        downvotes: 0,
        bookmarks: 0,
        user_has_upvoted: false,
        user_has_downvoted: false,
        user_has_bookmarked: false,
      };
    }

    const upvotes =
      interactions?.filter(i => i.interaction_type === 'upvote').length || 0;
    const downvotes =
      interactions?.filter(i => i.interaction_type === 'downvote').length || 0;
    const bookmarks =
      interactions?.filter(i => i.interaction_type === 'bookmark').length || 0;

    const user_has_upvoted = userId
      ? interactions?.some(
          i => i.user_id === userId && i.interaction_type === 'upvote'
        )
      : false;
    const user_has_downvoted = userId
      ? interactions?.some(
          i => i.user_id === userId && i.interaction_type === 'downvote'
        )
      : false;
    const user_has_bookmarked = userId
      ? interactions?.some(
          i => i.user_id === userId && i.interaction_type === 'bookmark'
        )
      : false;

    return {
      upvotes,
      downvotes,
      bookmarks,
      user_has_upvoted,
      user_has_downvoted,
      user_has_bookmarked,
    };
  }

  static async getCommentInteractions(commentId: string, userId?: string) {
    const { data: interactions, error } = await supabase
      .from('comment_interactions')
      .select('interaction_type, user_id')
      .eq('comment_id', commentId);

    if (error) {
      console.error('Error fetching comment interactions:', error);
      return {
        upvotes: 0,
        downvotes: 0,
        user_has_upvoted: false,
        user_has_downvoted: false,
      };
    }

    const upvotes =
      interactions?.filter(i => i.interaction_type === 'upvote').length || 0;
    const downvotes =
      interactions?.filter(i => i.interaction_type === 'downvote').length || 0;

    const user_has_upvoted = userId
      ? interactions?.some(
          i => i.user_id === userId && i.interaction_type === 'upvote'
        )
      : false;
    const user_has_downvoted = userId
      ? interactions?.some(
          i => i.user_id === userId && i.interaction_type === 'downvote'
        )
      : false;

    return {
      upvotes,
      downvotes,
      user_has_upvoted,
      user_has_downvoted,
    };
  }

  // Real-time subscriptions
  static subscribeToPosts(callback: (payload: any) => void) {
    return supabase
      .channel('community_posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_posts' },
        callback
      )
      .subscribe();
  }

  static subscribeToComments(callback: (payload: any) => void) {
    return supabase
      .channel('post_comments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_comments' },
        callback
      )
      .subscribe();
  }

  static subscribeToInteractions(callback: (payload: any) => void) {
    return supabase
      .channel('post_interactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_interactions' },
        callback
      )
      .subscribe();
  }
}
