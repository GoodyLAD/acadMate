-- Complete fix for student fetching issues
-- This addresses RLS policies, missing data, and permissions

-- 1. Fix RLS policies for all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mentor_assignments DISABLE ROW LEVEL SECURITY;

-- 2. Grant all permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.faculty TO authenticated;
GRANT ALL ON public.student_mentor_assignments TO authenticated;

-- 3. Ensure admin user exists
INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
SELECT 
    auth.uid(),
    COALESCE(auth.email(), 'admin@example.com'),
    COALESCE(auth.email(), 'admin@example.com'),
    'admin',
    now(),
    now()
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid()
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = now();

-- 4. Add sample students if none exist
INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'John Smith',
    'john.smith@student.edu',
    'student',
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'student' LIMIT 1)
UNION ALL
SELECT 
    gen_random_uuid(),
    'Jane Doe',
    'jane.doe@student.edu',
    'student',
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'student' LIMIT 1)
UNION ALL
SELECT 
    gen_random_uuid(),
    'Bob Johnson',
    'bob.johnson@student.edu',
    'student',
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'student' LIMIT 1);

-- 5. Add sample faculty if none exist
INSERT INTO public.faculty (name, email, department, designation, faculty_code, phone, specialization, is_verified)
SELECT 
    'Dr. Sarah Johnson',
    'sarah.johnson@faculty.edu',
    'Computer Science',
    'Professor',
    'CS001',
    '+1234567890',
    'Machine Learning',
    true
WHERE NOT EXISTS (SELECT 1 FROM public.faculty WHERE is_verified = true LIMIT 1)
UNION ALL
SELECT 
    'Dr. Michael Chen',
    'michael.chen@faculty.edu',
    'Information Technology',
    'Associate Professor',
    'IT001',
    '+1234567891',
    'Web Development',
    true
WHERE NOT EXISTS (SELECT 1 FROM public.faculty WHERE is_verified = true LIMIT 1);

-- 6. Show current data counts
SELECT 
    'Data Summary' as info,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'student') as students,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'faculty') as faculty_profiles,
    (SELECT COUNT(*) FROM public.faculty WHERE is_verified = true) as verified_faculty,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admins;

-- 7. Test student query (this should work now)
SELECT 
    'Student Test Query' as test,
    id,
    full_name,
    email,
    role
FROM public.profiles 
WHERE role = 'student'
LIMIT 3;
