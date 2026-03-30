-- Fix profiles table RLS policies for admin access
-- This allows admin to fetch students for assignment

-- Disable RLS on profiles table temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON public.profiles TO authenticated;

-- Create a simple policy that allows all operations for authenticated users
-- This is temporary to get the admin dashboard working
CREATE POLICY "Allow all operations for authenticated users" ON public.profiles
    FOR ALL USING (auth.role() = 'authenticated');

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Check if there are any students in the database
SELECT 
    'Student Count' as info,
    COUNT(*) as total_students,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
    COUNT(CASE WHEN role = 'faculty' THEN 1 END) as faculty,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM public.profiles;

-- Show sample student data
SELECT id, email, full_name, role, created_at
FROM public.profiles 
WHERE role = 'student'
LIMIT 5;
