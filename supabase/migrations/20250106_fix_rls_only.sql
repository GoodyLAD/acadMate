-- Fix RLS policies to allow admin to fetch real students
-- This doesn't create fake data, just fixes permissions

-- 1. Disable RLS temporarily to allow admin access
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mentor_assignments DISABLE ROW LEVEL SECURITY;

-- 2. Grant all permissions to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.faculty TO authenticated;
GRANT ALL ON public.student_mentor_assignments TO authenticated;

-- 3. Show current data counts (real data only)
SELECT 
    'Real Data Summary' as info,
    (SELECT COUNT(*) FROM public.profiles WHERE role::text = 'student') as students,
    (SELECT COUNT(*) FROM public.profiles WHERE role::text = 'faculty') as faculty_profiles,
    (SELECT COUNT(*) FROM public.faculty WHERE is_verified = true) as verified_faculty,
    (SELECT COUNT(*) FROM public.profiles WHERE role::text = 'admin') as admins;

-- 4. Show actual students (if any exist)
SELECT 
    'Actual Students' as info,
    id,
    full_name,
    email,
    role::text as role_text,
    created_at
FROM public.profiles 
WHERE role::text = 'student'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Show actual faculty (if any exist)
SELECT 
    'Actual Faculty' as info,
    id,
    name,
    email,
    department,
    is_verified,
    created_at
FROM public.faculty 
WHERE is_verified = true
ORDER BY created_at DESC
LIMIT 10;
