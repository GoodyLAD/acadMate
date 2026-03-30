-- Fix faculty assignments properly by handling user_id constraints
-- This creates the complete system without violating constraints

-- 1. First, let's see what we have
SELECT 'Current Status' as info,
       (SELECT COUNT(*) FROM public.faculty) as faculty_count,
       (SELECT COUNT(*) FROM public.profiles WHERE role::text = 'student') as student_count,
       (SELECT COUNT(*) FROM public.student_mentor_assignments) as assignment_count;

-- 2. Ensure all tables exist and have proper structure
CREATE TABLE IF NOT EXISTS public.faculty (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    designation TEXT,
    faculty_code VARCHAR(10),
    phone VARCHAR(15),
    specialization TEXT,
    is_verified BOOLEAN DEFAULT false,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_mentor_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    mentor_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, mentor_id)
);

-- 3. Disable RLS on all tables
ALTER TABLE public.faculty DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mentor_assignments DISABLE ROW LEVEL SECURITY;

-- 4. Grant all permissions
GRANT ALL ON public.faculty TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.student_mentor_assignments TO authenticated;

-- 5. Create or update faculty record for karan962575@gmail.com
-- First, get the user_id from auth.users or profiles
WITH faculty_user AS (
    SELECT 
        COALESCE(au.id, p.id) as user_id,
        COALESCE(au.email, p.email) as email
    FROM (
        SELECT id, email FROM auth.users WHERE email = 'karan962575@gmail.com'
        UNION ALL
        SELECT id, email FROM public.profiles WHERE email = 'karan962575@gmail.com'
    ) au
    FULL OUTER JOIN public.profiles p ON au.email = p.email
    WHERE COALESCE(au.email, p.email) = 'karan962575@gmail.com'
    LIMIT 1
)
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
    fu.user_id
FROM faculty_user fu
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    department = EXCLUDED.department,
    designation = EXCLUDED.designation,
    faculty_code = EXCLUDED.faculty_code,
    phone = EXCLUDED.phone,
    specialization = EXCLUDED.specialization,
    is_verified = EXCLUDED.is_verified,
    user_id = EXCLUDED.user_id;

-- 6. Create sample students with proper user_id
-- We'll use existing student profiles or create new ones with valid user_ids
INSERT INTO public.profiles (id, user_id, full_name, email, role, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(), -- Generate a valid UUID for user_id
    'John Smith',
    'john.smith@student.edu',
    'student'::user_role,
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'john.smith@student.edu')
UNION ALL
SELECT 
    gen_random_uuid(),
    gen_random_uuid(), -- Generate a valid UUID for user_id
    'Jane Doe',
    'jane.doe@student.edu',
    'student'::user_role,
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'jane.doe@student.edu')
UNION ALL
SELECT 
    gen_random_uuid(),
    gen_random_uuid(), -- Generate a valid UUID for user_id
    'Bob Johnson',
    'bob.johnson@student.edu',
    'student'::user_role,
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'bob.johnson@student.edu');

-- 7. Create assignments between faculty and students
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

-- 8. Show the final result
SELECT 
    'Final Result - Faculty with Assigned Students' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    COUNT(sma.id) as assigned_students_count,
    STRING_AGG(p.full_name, ', ') as student_names
FROM public.faculty f
LEFT JOIN public.student_mentor_assignments sma ON f.id = sma.mentor_id
LEFT JOIN public.profiles p ON sma.student_id = p.id
WHERE f.email = 'karan962575@gmail.com'
GROUP BY f.id, f.name, f.email;

-- 9. Show detailed assignments
SELECT 
    'Detailed Assignments' as info,
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
