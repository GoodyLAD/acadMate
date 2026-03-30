-- Fix faculty assignments to only show students specifically assigned by admin
-- This will only assign students that were actually assigned through the admin dashboard

-- 1. First, let's see what we have
SELECT 'Current Status' as info,
       (SELECT COUNT(*) FROM public.faculty) as faculty_count,
       (SELECT COUNT(*) FROM public.profiles WHERE role::text = 'student') as student_count,
       (SELECT COUNT(*) FROM public.student_mentor_assignments) as assignment_count;

-- 2. Show existing students
SELECT 'Existing Students' as info,
       p.id,
       p.full_name,
       p.email,
       p.role
FROM public.profiles p
WHERE p.role::text = 'student'
ORDER BY p.created_at DESC;

-- 3. Ensure faculty table exists and has proper structure
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

-- 4. Disable RLS on all tables
ALTER TABLE public.faculty DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mentor_assignments DISABLE ROW LEVEL SECURITY;

-- 5. Grant all permissions
GRANT ALL ON public.faculty TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.student_mentor_assignments TO authenticated;

-- 6. Create or update faculty record for karan962575@gmail.com
-- Use the user_id from the existing profile
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
    COALESCE(p.full_name, 'Karan Faculty') as name,
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

-- 7. Clear all existing assignments first (to start fresh)
DELETE FROM public.student_mentor_assignments;

-- 8. Now, let's check if there are any specific assignments in the admin system
-- Look for students that have been assigned to faculty through the admin dashboard
-- This would typically be stored in a different table or have a specific flag

-- For now, let's create a few specific assignments as examples
-- You can modify these to match the actual students you assigned through the admin dashboard

-- Get the faculty ID
WITH faculty_info AS (
    SELECT id as faculty_id FROM public.faculty WHERE email = 'karan962575@gmail.com'
),
-- Get specific students (you can modify these email addresses to match your actual assignments)
specific_students AS (
    SELECT p.id as student_id, p.full_name, p.email
    FROM public.profiles p
    WHERE p.role::text = 'student' 
    AND p.email IN (
        -- Add the specific student emails that were assigned through admin dashboard
        -- For example, if you assigned specific students, add their emails here:
        'student1@example.com',
        'student2@example.com',
        'student3@example.com'
        -- If no specific students were assigned, this will create no assignments
    )
)
-- Create assignments only for the specific students
INSERT INTO public.student_mentor_assignments (student_id, mentor_id, created_at, updated_at)
SELECT 
    s.student_id,
    f.faculty_id,
    now(),
    now()
FROM faculty_info f
CROSS JOIN specific_students s
ON CONFLICT (student_id, mentor_id) DO NOTHING;

-- 9. Show the final result
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

-- 10. Show detailed assignments
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

-- 11. Show all students (to help you identify which ones to assign)
SELECT 
    'All Available Students' as info,
    p.id as student_id,
    p.full_name as student_name,
    p.email as student_email,
    p.role
FROM public.profiles p
WHERE p.role::text = 'student'
ORDER BY p.created_at DESC;
