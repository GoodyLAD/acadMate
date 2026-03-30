-- Fix All Ambiguous Column References
-- This fixes all ambiguous column reference errors in the database

-- 1. Fix get_group_members function
DROP FUNCTION IF EXISTS public.get_group_members(UUID);

CREATE OR REPLACE FUNCTION public.get_group_members(p_group_id UUID)
RETURNS UUID[] AS $$
DECLARE
  member_ids UUID[];
BEGIN
  SELECT ARRAY_AGG(user_id) INTO member_ids 
  FROM public.group_memberships 
  WHERE group_id = p_group_id;
  RETURN COALESCE(member_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql;

-- 2. Fix RLS policies with ambiguous user_id references
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_memberships;
CREATE POLICY "Users can leave groups" ON public.group_memberships FOR DELETE USING (
  user_id = (SELECT id FROM public.profiles WHERE profiles.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (
  user_id = (SELECT id FROM public.profiles WHERE profiles.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (
  user_id = (SELECT id FROM public.profiles WHERE profiles.user_id = auth.uid())
);

-- 3. Fix notification functions with ambiguous user_id references
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.notifications 
  SET read_at = now() 
  WHERE id = notification_id 
    AND user_id = (SELECT id FROM public.profiles WHERE profiles.user_id = auth.uid());
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications 
  SET read_at = now() 
  WHERE user_id = (SELECT id FROM public.profiles WHERE profiles.user_id = auth.uid())
    AND read_at IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM public.notifications 
  WHERE user_id = (SELECT id FROM public.profiles WHERE profiles.user_id = auth.uid())
    AND read_at IS NULL;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql;
