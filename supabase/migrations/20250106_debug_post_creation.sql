-- Debug Post Creation Issue
-- This helps identify what's causing the post creation to fail

-- First, let's check if the community_posts table exists and has the right structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'community_posts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any constraints that might be causing issues
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'community_posts' 
AND table_schema = 'public';

-- Check if the profiles table has the expected structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('id', 'user_id', 'full_name', 'avatar_url')
ORDER BY ordinal_position;
