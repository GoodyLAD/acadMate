-- Fix faculty user_id foreign key constraint issue
-- This handles the case where user_id doesn't exist in auth.users

-- 1. First, let's check what's in auth.users vs profiles
SELECT 
    'Auth Users Count' as info,
    COUNT(*) as count
FROM auth.users;

SELECT 
    'Profiles Count' as info,
    COUNT(*) as count
FROM public.profiles;

-- 2. Check for mismatched user IDs
SELECT 
    'User ID Mismatch Check' as info,
    p.id as profile_id,
    p.email as profile_email,
    au.id as auth_user_id,
    au.email as auth_email
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL
LIMIT 5;

-- 3. Drop the problematic foreign key constraint
ALTER TABLE public.faculty 
DROP CONSTRAINT IF EXISTS faculty_user_id_fkey;

-- 4. Create a new foreign key constraint that references profiles instead of auth.users
ALTER TABLE public.faculty 
ADD CONSTRAINT faculty_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 5. Update faculty records to use profile IDs instead of auth user IDs
-- First, let's see what we have
SELECT 
    'Current Faculty Data' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.user_id as current_user_id,
    p.id as profile_id,
    p.email as profile_email
FROM public.faculty f
LEFT JOIN public.profiles p ON f.email = p.email
LIMIT 5;

-- 6. Update faculty records to use the correct profile IDs
UPDATE public.faculty 
SET user_id = p.id
FROM public.profiles p
WHERE public.faculty.email = p.email
AND public.faculty.user_id IS NULL;

-- 7. For faculty records that still don't have user_id, set it to NULL temporarily
UPDATE public.faculty 
SET user_id = NULL
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- 8. Show the final result
SELECT 
    'Updated Faculty Data' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.user_id,
    p.full_name as profile_name,
    p.role as profile_role
FROM public.faculty f
LEFT JOIN public.profiles p ON f.user_id = p.id
LIMIT 5;
