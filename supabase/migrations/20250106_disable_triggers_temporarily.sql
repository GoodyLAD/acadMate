-- Temporarily Disable All Notification Triggers
-- This will help identify if the triggers are causing the post creation issue

-- Disable all notification triggers
DROP TRIGGER IF EXISTS trigger_notify_new_post ON public.community_posts;
DROP TRIGGER IF EXISTS trigger_notify_post_interaction ON public.post_interactions;
DROP TRIGGER IF EXISTS trigger_notify_new_comment ON public.post_comments;
DROP TRIGGER IF EXISTS trigger_notify_comment_interaction ON public.comment_interactions;
DROP TRIGGER IF EXISTS trigger_notify_group_membership ON public.group_memberships;
DROP TRIGGER IF EXISTS trigger_notify_new_group ON public.community_groups;

-- This should allow post creation to work without trigger errors
-- You can test post creation now, and if it works, we know the issue is with the triggers
