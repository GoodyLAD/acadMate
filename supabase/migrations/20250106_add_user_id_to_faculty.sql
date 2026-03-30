-- Add user_id column to faculty table to link with profiles
-- This will allow faculty to be properly linked to their user accounts

-- 1. Add user_id column to faculty table
ALTER TABLE public.faculty 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_faculty_user_id ON public.faculty(user_id);

-- 3. Update existing faculty records to link with profiles
-- This assumes the faculty email matches the profile email
UPDATE public.faculty 
SET user_id = p.id
FROM public.profiles p
WHERE public.faculty.email = p.email
AND public.faculty.user_id IS NULL;

-- 4. Show the updated faculty data
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

-- 5. Show any faculty without user_id (need manual linking)
SELECT 
    'Faculty Without User ID' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email
FROM public.faculty f
WHERE f.user_id IS NULL;
