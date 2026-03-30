-- Fix notifications table to add missing columns
-- This migration adds the missing columns that are causing the community comment error

-- Add missing columns to notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS from_user_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS data JSONB;

-- Create community tables if they don't exist
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  author_name TEXT,
  author_avatar TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Academics', 'Placements', 'Clubs', 'Events', 'General')),
  group_id UUID REFERENCES public.community_groups(id),
  is_blocked BOOLEAN DEFAULT false,
  reports_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  author_name TEXT,
  author_avatar TEXT,
  content TEXT NOT NULL,
  is_blocked BOOLEAN DEFAULT false,
  reports_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  is_admin BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('upvote', 'downvote', 'bookmark')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, interaction_type)
);

CREATE TABLE IF NOT EXISTS public.comment_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id, interaction_type)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_group_id ON public.community_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_author_id ON public.post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON public.group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON public.group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id ON public.post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_user_id ON public.post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_interactions_comment_id ON public.comment_interactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_interactions_user_id ON public.comment_interactions(user_id);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_interactions ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "community_posts_select_all" ON public.community_posts
  FOR SELECT USING (NOT is_blocked);

CREATE POLICY "community_posts_insert_authenticated" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "community_posts_update_own" ON public.community_posts
  FOR UPDATE USING (author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "community_posts_delete_own" ON public.community_posts
  FOR DELETE USING (author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "post_comments_select_all" ON public.post_comments
  FOR SELECT USING (NOT is_blocked);

CREATE POLICY "post_comments_insert_authenticated" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "post_comments_update_own" ON public.post_comments
  FOR UPDATE USING (author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "post_comments_delete_own" ON public.post_comments
  FOR DELETE USING (author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "community_groups_select_all" ON public.community_groups
  FOR SELECT USING (true);

CREATE POLICY "community_groups_insert_authenticated" ON public.community_groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "community_groups_update_creator" ON public.community_groups
  FOR UPDATE USING (created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "group_memberships_select_authenticated" ON public.group_memberships
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "group_memberships_insert_authenticated" ON public.group_memberships
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "group_memberships_delete_own" ON public.group_memberships
  FOR DELETE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "post_interactions_select_authenticated" ON public.post_interactions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "post_interactions_insert_authenticated" ON public.post_interactions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "post_interactions_delete_own" ON public.post_interactions
  FOR DELETE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "comment_interactions_select_authenticated" ON public.comment_interactions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "comment_interactions_insert_authenticated" ON public.comment_interactions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "comment_interactions_delete_own" ON public.comment_interactions
  FOR DELETE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
