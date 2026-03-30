-- Community Backend Migration
-- Creates tables for community posts, comments, groups, and interactions

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
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create community posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Academics', 'Placements', 'Clubs', 'Events', 'General')),
  group_id UUID REFERENCES public.community_groups(id) ON DELETE SET NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  reports_count INTEGER NOT NULL DEFAULT 0,
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
  content TEXT NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  reports_count INTEGER NOT NULL DEFAULT 0,
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
  banned_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_groups
CREATE POLICY "Anyone can view groups" ON public.community_groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create groups" ON public.community_groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Group creators can update their groups" ON public.community_groups FOR UPDATE USING (
  created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Group creators can delete their groups" ON public.community_groups FOR DELETE USING (
  created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for group_memberships
CREATE POLICY "Users can view group memberships" ON public.group_memberships FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON public.group_memberships FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can leave groups" ON public.group_memberships FOR DELETE USING (
  user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for community_posts
CREATE POLICY "Anyone can view non-blocked posts" ON public.community_posts FOR SELECT USING (is_blocked = false);
CREATE POLICY "Authenticated users can create posts" ON public.community_posts FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Authors can update their posts" ON public.community_posts FOR UPDATE USING (
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Authors can delete their posts" ON public.community_posts FOR DELETE USING (
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for post_interactions
CREATE POLICY "Users can view post interactions" ON public.post_interactions FOR SELECT USING (true);
CREATE POLICY "Users can create their own interactions" ON public.post_interactions FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update their own interactions" ON public.post_interactions FOR UPDATE USING (
  user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete their own interactions" ON public.post_interactions FOR DELETE USING (
  user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for post_comments
CREATE POLICY "Anyone can view non-blocked comments" ON public.post_comments FOR SELECT USING (is_blocked = false);
CREATE POLICY "Authenticated users can create comments" ON public.post_comments FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Authors can update their comments" ON public.post_comments FOR UPDATE USING (
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Authors can delete their comments" ON public.post_comments FOR DELETE USING (
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for comment_interactions
CREATE POLICY "Users can view comment interactions" ON public.comment_interactions FOR SELECT USING (true);
CREATE POLICY "Users can create their own comment interactions" ON public.comment_interactions FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update their own comment interactions" ON public.comment_interactions FOR UPDATE USING (
  user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete their own comment interactions" ON public.comment_interactions FOR DELETE USING (
  user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for user_bans
CREATE POLICY "Users can view their own bans" ON public.user_bans FOR SELECT USING (
  user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage bans" ON public.user_bans FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'faculty'
      AND profiles.faculty_level = 'admin'
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_group_id ON public.community_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id ON public.post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_user_id ON public.post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_author_id ON public.post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comment_interactions_comment_id ON public.comment_interactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON public.group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON public.group_memberships(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

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

-- Create default general group
INSERT INTO public.community_groups (id, name, description, created_by)
SELECT 
  'g-general'::uuid,
  'General',
  'General campus discussion',
  p.id
FROM public.profiles p
WHERE p.role = 'faculty' AND p.faculty_level = 'admin'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Enable real-time for community tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comment_interactions;
