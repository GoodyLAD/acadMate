-- Temporarily disable notification triggers to fix comment creation
-- This allows comments to work while we fix the database schema

-- Drop all notification triggers
DROP TRIGGER IF EXISTS notify_new_post ON public.community_posts;
DROP TRIGGER IF EXISTS notify_post_interaction ON public.post_interactions;
DROP TRIGGER IF EXISTS notify_new_comment ON public.post_comments;
DROP TRIGGER IF EXISTS notify_comment_interaction ON public.comment_interactions;
DROP TRIGGER IF EXISTS notify_group_membership ON public.group_memberships;
DROP TRIGGER IF EXISTS notify_new_group ON public.community_groups;
