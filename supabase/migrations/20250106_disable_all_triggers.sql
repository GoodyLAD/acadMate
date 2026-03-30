-- Disable All Notification Triggers Temporarily
-- This will allow post creation and commenting to work without trigger errors

-- Drop all notification triggers
DROP TRIGGER IF EXISTS trigger_notify_new_post ON public.community_posts;
DROP TRIGGER IF EXISTS trigger_notify_post_interaction ON public.post_interactions;
DROP TRIGGER IF EXISTS trigger_notify_new_comment ON public.post_comments;
DROP TRIGGER IF EXISTS trigger_notify_comment_interaction ON public.comment_interactions;
DROP TRIGGER IF EXISTS trigger_notify_group_membership ON public.group_memberships;
DROP TRIGGER IF EXISTS trigger_notify_new_group ON public.community_groups;

-- This will allow the community features to work without notification triggers
-- We can re-enable them later once the basic functionality is working
