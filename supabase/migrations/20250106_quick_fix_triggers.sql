-- Quick Fix for Post Creation Triggers
-- This disables the problematic triggers temporarily and recreates them properly

-- 1. Drop the problematic trigger
DROP TRIGGER IF EXISTS trigger_notify_new_post ON public.community_posts;

-- 2. Recreate the function with proper variable naming
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

-- 3. Recreate the trigger
CREATE TRIGGER trigger_notify_new_post
  AFTER INSERT ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_post();

-- 4. Fix the get_group_members function
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
