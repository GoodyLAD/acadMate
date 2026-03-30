-- Simple fix for faculty user_id column
-- This makes user_id nullable and removes the foreign key constraint

-- 1. Drop the problematic foreign key constraint
ALTER TABLE public.faculty 
DROP CONSTRAINT IF EXISTS faculty_user_id_fkey;

-- 2. Make user_id nullable
ALTER TABLE public.faculty 
ALTER COLUMN user_id DROP NOT NULL;

-- 3. Update faculty records to link with profiles by email
UPDATE public.faculty 
SET user_id = p.id
FROM public.profiles p
WHERE public.faculty.email = p.email
AND public.faculty.user_id IS NULL;

-- 4. Show the result
SELECT 
    'Faculty with User ID' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.user_id,
    p.full_name as profile_name,
    p.role as profile_role
FROM public.faculty f
LEFT JOIN public.profiles p ON f.user_id = p.id
WHERE f.user_id IS NOT NULL
LIMIT 5;

SELECT 
    'Faculty without User ID' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email
FROM public.faculty f
WHERE f.user_id IS NULL
LIMIT 5;
