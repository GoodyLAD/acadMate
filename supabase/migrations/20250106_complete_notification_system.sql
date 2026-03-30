-- Complete Notification System Migration
-- This includes both community backend tables AND notification system

-- ==============================================
-- PART 1: COMMUNITY BACKEND TABLES
-- ==============================================

-- Create community groups table
CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group memberships table
CREATE TABLE IF NOT EXISTS public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create community posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Academics', 'Placements', 'Clubs', 'Events', 'General')),
  group_id UUID REFERENCES public.community_groups(id) ON DELETE SET NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  reports INTEGER NOT NULL DEFAULT 0,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post interactions table (upvotes, downvotes, bookmarks)
CREATE TABLE IF NOT EXISTS public.post_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('upvote', 'downvote', 'bookmark')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, interaction_type)
);

-- Create post comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comment interactions table
CREATE TABLE IF NOT EXISTS public.comment_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id, interaction_type)
);

-- Create user bans table
CREATE TABLE IF NOT EXISTS public.user_bans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all tables
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_groups
CREATE POLICY "Anyone can view groups" ON public.community_groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create groups" ON public.community_groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Group creators can update their groups" ON public.community_groups FOR UPDATE USING (created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Group creators can delete their groups" ON public.community_groups FOR DELETE USING (created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for group_memberships
CREATE POLICY "Anyone can view group memberships" ON public.group_memberships FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join groups" ON public.group_memberships FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can leave groups" ON public.group_memberships FOR DELETE USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for community_posts
CREATE POLICY "Anyone can view posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Post authors can update their posts" ON public.community_posts FOR UPDATE USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Post authors can delete their posts" ON public.community_posts FOR DELETE USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for post_interactions
CREATE POLICY "Anyone can view post interactions" ON public.post_interactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can interact with posts" ON public.post_interactions FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for post_comments
CREATE POLICY "Anyone can view comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Comment authors can update their comments" ON public.post_comments FOR UPDATE USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Comment authors can delete their comments" ON public.post_comments FOR DELETE USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for comment_interactions
CREATE POLICY "Anyone can view comment interactions" ON public.comment_interactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can interact with comments" ON public.comment_interactions FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for user_bans
CREATE POLICY "Admins can manage bans" ON public.user_bans FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_community_groups_updated_at
  BEFORE UPDATE ON public.community_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_memberships;

-- ==============================================
-- PART 2: NOTIFICATION SYSTEM
-- ==============================================

-- Create notification types enum
CREATE TYPE public.notification_type AS ENUM (
  'post_created',
  'post_liked',
  'post_disliked',
  'post_commented',
  'comment_liked',
  'comment_disliked',
  'user_joined_group',
  'user_left_group',
  'group_created',
  'event_created',
  'event_updated',
  'event_cancelled',
  'achievement_earned',
  'certificate_approved',
  'certificate_rejected',
  'mentor_assigned',
  'mentor_unassigned'
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (
  user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (
  user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Create notification functions
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_from_user_id UUID DEFAULT NULL,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    from_user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    p_user_id,
    p_from_user_id,
    p_type,
    p_title,
    p_message,
    p_data
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user name
CREATE OR REPLACE FUNCTION public.get_user_name(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_name TEXT;
BEGIN
  SELECT full_name INTO user_name FROM public.profiles WHERE id = user_id;
  RETURN COALESCE(user_name, 'Unknown User');
END;
$$ LANGUAGE plpgsql;

-- Function to get post author
CREATE OR REPLACE FUNCTION public.get_post_author(post_id UUID)
RETURNS UUID AS $$
DECLARE
  author_id UUID;
BEGIN
  SELECT author_id INTO author_id FROM public.community_posts WHERE id = post_id;
  RETURN author_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get comment author
CREATE OR REPLACE FUNCTION public.get_comment_author(comment_id UUID)
RETURNS UUID AS $$
DECLARE
  author_id UUID;
BEGIN
  SELECT author_id INTO author_id FROM public.post_comments WHERE id = comment_id;
  RETURN author_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get group members
CREATE OR REPLACE FUNCTION public.get_group_members(group_id UUID)
RETURNS UUID[] AS $$
DECLARE
  member_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(user_id) INTO member_ids 
  FROM public.group_memberships 
  WHERE group_id = group_id;
  RETURN COALESCE(member_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql;

-- Trigger for new posts
CREATE OR REPLACE FUNCTION public.notify_new_post()
RETURNS TRIGGER AS $$
DECLARE
  author_name TEXT;
  group_members UUID[];
  member_id UUID;
BEGIN
  -- Get author name
  author_name := public.get_user_name(NEW.author_id);
  
  -- Notify group members if post is in a group
  IF NEW.group_id IS NOT NULL THEN
    group_members := public.get_group_members(NEW.group_id);
    
    FOREACH member_id IN ARRAY group_members
    LOOP
      -- Don't notify the author
      IF member_id != NEW.author_id THEN
        PERFORM public.create_notification(
          member_id,
          'post_created',
          'New Post in Group',
          author_name || ' created a new post in the group',
          NEW.author_id,
          jsonb_build_object(
            'post_id', NEW.id,
            'group_id', NEW.group_id,
            'category', NEW.category
          )
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_post
  AFTER INSERT ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_post();

-- Trigger for post interactions (likes/dislikes)
CREATE OR REPLACE FUNCTION public.notify_post_interaction()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  post_author_name TEXT;
  interaction_text TEXT;
BEGIN
  -- Get post author
  post_author_id := public.get_post_author(NEW.post_id);
  post_author_name := public.get_user_name(NEW.user_id);
  
  -- Don't notify if user is interacting with their own post
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Determine interaction type
  IF NEW.interaction_type = 'upvote' THEN
    interaction_text := 'liked your post';
  ELSIF NEW.interaction_type = 'downvote' THEN
    interaction_text := 'disliked your post';
  ELSIF NEW.interaction_type = 'bookmark' THEN
    interaction_text := 'bookmarked your post';
  ELSE
    RETURN NEW;
  END IF;
  
  -- Create notification
  PERFORM public.create_notification(
    post_author_id,
    CASE 
      WHEN NEW.interaction_type = 'upvote' THEN 'post_liked'
      WHEN NEW.interaction_type = 'downvote' THEN 'post_disliked'
      ELSE 'post_liked' -- fallback
    END,
    'Post ' || INITCAP(NEW.interaction_type),
    post_author_name || ' ' || interaction_text,
    NEW.user_id,
    jsonb_build_object(
      'post_id', NEW.post_id,
      'interaction_type', NEW.interaction_type
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_post_interaction
  AFTER INSERT ON public.post_interactions
  FOR EACH ROW EXECUTE FUNCTION public.notify_post_interaction();

-- Trigger for new comments
CREATE OR REPLACE FUNCTION public.notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  post_author_name TEXT;
  comment_author_name TEXT;
  group_members UUID[];
  member_id UUID;
BEGIN
  -- Get post author
  post_author_id := public.get_post_author(NEW.post_id);
  post_author_name := public.get_user_name(post_author_id);
  comment_author_name := public.get_user_name(NEW.author_id);
  
  -- Notify post author if it's not their own comment
  IF post_author_id != NEW.author_id THEN
    PERFORM public.create_notification(
      post_author_id,
      'post_commented',
      'New Comment',
      comment_author_name || ' commented on your post',
      NEW.author_id,
      jsonb_build_object(
        'post_id', NEW.post_id,
        'comment_id', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_comment
  AFTER INSERT ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_comment();

-- Trigger for comment interactions
CREATE OR REPLACE FUNCTION public.notify_comment_interaction()
RETURNS TRIGGER AS $$
DECLARE
  comment_author_id UUID;
  comment_author_name TEXT;
  interaction_text TEXT;
BEGIN
  -- Get comment author
  comment_author_id := public.get_comment_author(NEW.comment_id);
  comment_author_name := public.get_user_name(NEW.user_id);
  
  -- Don't notify if user is interacting with their own comment
  IF comment_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Determine interaction type
  IF NEW.interaction_type = 'upvote' THEN
    interaction_text := 'liked your comment';
  ELSIF NEW.interaction_type = 'downvote' THEN
    interaction_text := 'disliked your comment';
  ELSE
    RETURN NEW;
  END IF;
  
  -- Create notification
  PERFORM public.create_notification(
    comment_author_id,
    CASE 
      WHEN NEW.interaction_type = 'upvote' THEN 'comment_liked'
      WHEN NEW.interaction_type = 'downvote' THEN 'comment_disliked'
      ELSE 'comment_liked' -- fallback
    END,
    'Comment ' || INITCAP(NEW.interaction_type),
    comment_author_name || ' ' || interaction_text,
    NEW.user_id,
    jsonb_build_object(
      'comment_id', NEW.comment_id,
      'interaction_type', NEW.interaction_type
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_comment_interaction
  AFTER INSERT ON public.comment_interactions
  FOR EACH ROW EXECUTE FUNCTION public.notify_comment_interaction();

-- Trigger for group membership changes
CREATE OR REPLACE FUNCTION public.notify_group_membership()
RETURNS TRIGGER AS $$
DECLARE
  group_name TEXT;
  user_name TEXT;
  group_members UUID[];
  member_id UUID;
BEGIN
  -- Get group name and user name
  SELECT name INTO group_name FROM public.community_groups WHERE id = NEW.group_id;
  user_name := public.get_user_name(NEW.user_id);
  
  -- Get all group members
  group_members := public.get_group_members(NEW.group_id);
  
  -- Notify all group members about new member
  FOREACH member_id IN ARRAY group_members
  LOOP
    -- Don't notify the new member themselves
    IF member_id != NEW.user_id THEN
      PERFORM public.create_notification(
        member_id,
        'user_joined_group',
        'New Group Member',
        user_name || ' joined ' || group_name,
        NEW.user_id,
        jsonb_build_object(
          'group_id', NEW.group_id,
          'group_name', group_name
        )
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_group_membership
  AFTER INSERT ON public.group_memberships
  FOR EACH ROW EXECUTE FUNCTION public.notify_group_membership();

-- Trigger for new groups
CREATE OR REPLACE FUNCTION public.notify_new_group()
RETURNS TRIGGER AS $$
DECLARE
  creator_name TEXT;
  all_users UUID[];
  user_id UUID;
BEGIN
  -- Get creator name
  creator_name := public.get_user_name(NEW.created_by);
  
  -- Get all users (for now, notify everyone about new groups)
  -- In a real app, you might want to limit this to certain user types
  SELECT ARRAY_AGG(id) INTO all_users FROM public.profiles WHERE role = 'student';
  
  -- Notify all students about new group
  FOREACH user_id IN ARRAY all_users
  LOOP
    -- Don't notify the creator
    IF user_id != NEW.created_by THEN
      PERFORM public.create_notification(
        user_id,
        'group_created',
        'New Group Created',
        creator_name || ' created a new group: ' || NEW.name,
        NEW.created_by,
        jsonb_build_object(
          'group_id', NEW.id,
          'group_name', NEW.name
        )
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_group
  AFTER INSERT ON public.community_groups
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_group();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Enable real-time for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.notifications 
  SET read_at = now() 
  WHERE id = notification_id 
    AND user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid());
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications 
  SET read_at = now() 
  WHERE user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND read_at IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM public.notifications 
  WHERE user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND read_at IS NULL;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql;
