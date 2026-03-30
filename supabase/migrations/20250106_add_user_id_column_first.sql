-- Add user_id column to faculty table first
-- This ensures the column exists before running other operations

-- 1. Add user_id column to faculty table
ALTER TABLE public.faculty 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_faculty_user_id ON public.faculty(user_id);

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

-- 5. Show faculty without user_id (will use email matching)
SELECT 
    'Faculty without User ID' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email
FROM public.faculty f
WHERE f.user_id IS NULL
LIMIT 5;
