-- Fix Ambiguous Column Reference
-- This fixes the ambiguous column reference error in the get_group_members function

-- Drop and recreate the function with proper parameter naming
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
