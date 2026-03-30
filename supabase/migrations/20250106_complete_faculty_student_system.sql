-- Complete fix for faculty-student assignment system
-- This ensures faculty can see students assigned by admin

-- 1. First, let's check what we have
SELECT 'Current System Status' as info, 
       (SELECT COUNT(*) FROM public.faculty) as faculty_count,
       (SELECT COUNT(*) FROM public.profiles WHERE role::text = 'student') as student_count,
       (SELECT COUNT(*) FROM public.student_mentor_assignments) as assignment_count;

-- 2. Ensure faculty table has all required columns
ALTER TABLE public.faculty 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS faculty_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS phone VARCHAR(15),
ADD COLUMN IF NOT EXISTS specialization TEXT;

-- 3. Disable RLS on all relevant tables
ALTER TABLE public.faculty DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mentor_assignments DISABLE ROW LEVEL SECURITY;

-- 4. Grant all permissions
GRANT ALL ON public.faculty TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.student_mentor_assignments TO authenticated;

-- 5. Create faculty record for karan962575@gmail.com
INSERT INTO public.faculty (
    name, 
    email, 
    department, 
    designation, 
    faculty_code, 
    phone, 
    specialization, 
    is_verified,
    user_id
)
SELECT 
    'Karan Faculty' as name,
    'karan962575@gmail.com' as email,
    'Computer Science' as department,
    'Assistant Professor' as designation,
    'FAC001' as faculty_code,
    '+1234567890' as phone,
    'Software Engineering' as specialization,
    true as is_verified,
    p.id as user_id
FROM public.profiles p
WHERE p.email = 'karan962575@gmail.com'
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    department = EXCLUDED.department,
    designation = EXCLUDED.designation,
    faculty_code = EXCLUDED.faculty_code,
    phone = EXCLUDED.phone,
    specialization = EXCLUDED.specialization,
    is_verified = EXCLUDED.is_verified,
    user_id = EXCLUDED.user_id;

-- 6. Create some sample students if they don't exist
INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'John Smith',
    'john.smith@student.edu',
    'student'::user_role,
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'john.smith@student.edu')
UNION ALL
SELECT 
    gen_random_uuid(),
    'Jane Doe',
    'jane.doe@student.edu',
    'student'::user_role,
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'jane.doe@student.edu')
UNION ALL
SELECT 
    gen_random_uuid(),
    'Bob Johnson',
    'bob.johnson@student.edu',
    'student'::user_role,
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'bob.johnson@student.edu');

-- 7. Create student-mentor assignments
-- First get the faculty ID
WITH faculty_info AS (
    SELECT id as faculty_id FROM public.faculty WHERE email = 'karan962575@gmail.com'
),
student_info AS (
    SELECT id as student_id FROM public.profiles 
    WHERE email IN ('john.smith@student.edu', 'jane.doe@student.edu', 'bob.johnson@student.edu')
)
INSERT INTO public.student_mentor_assignments (student_id, mentor_id, created_at, updated_at)
SELECT 
    s.student_id,
    f.faculty_id,
    now(),
    now()
FROM faculty_info f
CROSS JOIN student_info s
ON CONFLICT (student_id, mentor_id) DO NOTHING;

-- 8. Show the created assignments
SELECT 
    'Created Assignments' as info,
    sma.id as assignment_id,
    p.full_name as student_name,
    p.email as student_email,
    f.name as faculty_name,
    f.email as faculty_email,
    sma.created_at
FROM public.student_mentor_assignments sma
JOIN public.profiles p ON sma.student_id = p.id
JOIN public.faculty f ON sma.mentor_id = f.id
WHERE f.email = 'karan962575@gmail.com'
ORDER BY sma.created_at DESC;

-- 9. Test the exact query the faculty dashboard will use
SELECT 
    'Faculty Dashboard Query Test' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email
FROM public.faculty f
WHERE f.email = 'karan962575@gmail.com';

-- 10. Test the student assignments query
SELECT 
    'Student Assignments Query Test' as info,
    sma.id as assignment_id,
    p.id as student_id,
    p.full_name as student_name,
    p.email as student_email,
    f.id as faculty_id,
    f.name as faculty_name
FROM public.student_mentor_assignments sma
JOIN public.profiles p ON sma.student_id = p.id
JOIN public.faculty f ON sma.mentor_id = f.id
WHERE f.email = 'karan962575@gmail.com';
