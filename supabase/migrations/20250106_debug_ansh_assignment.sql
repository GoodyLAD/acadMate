-- Debug script to check the specific assignment of karan962575 to ansh
-- This will help us understand why the wrong students are showing

-- 1. Check if there's a student named "ansh" or similar
SELECT 'Students with "ansh" in name or email' as info,
       p.id as student_id,
       p.full_name,
       p.email,
       p.role,
       p.created_at
FROM public.profiles p
WHERE LOWER(p.full_name) LIKE '%ansh%' 
   OR LOWER(p.email) LIKE '%ansh%'
   OR p.role::text = 'student'
ORDER BY p.created_at DESC;

-- 2. Check all faculty records
SELECT 'All Faculty Records' as info,
       f.id as faculty_id,
       f.name as faculty_name,
       f.email as faculty_email,
       f.faculty_code,
       f.is_verified,
       f.created_at
FROM public.faculty f
ORDER BY f.created_at DESC;

-- 3. Check all current assignments
SELECT 'Current Assignments' as info,
       sma.id as assignment_id,
       p.full_name as student_name,
       p.email as student_email,
       f.name as faculty_name,
       f.email as faculty_email,
       sma.created_at
FROM public.student_mentor_assignments sma
LEFT JOIN public.profiles p ON sma.student_id = p.id
LEFT JOIN public.faculty f ON sma.mentor_id = f.id
ORDER BY sma.created_at DESC;

-- 4. Check if there are any assignments specifically for karan962575@gmail.com
SELECT 'Assignments for karan962575@gmail.com' as info,
       sma.id as assignment_id,
       p.full_name as student_name,
       p.email as student_email,
       f.name as faculty_name,
       f.email as faculty_email,
       sma.created_at
FROM public.student_mentor_assignments sma
LEFT JOIN public.profiles p ON sma.student_id = p.id
LEFT JOIN public.faculty f ON sma.mentor_id = f.id
WHERE f.email = 'karan962575@gmail.com'
ORDER BY sma.created_at DESC;

-- 5. Check if there are any other tables that might contain assignment data
SELECT 'All Tables with assignment/student/faculty in name' as info,
       table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%assignment%' 
     OR table_name LIKE '%student%' 
     OR table_name LIKE '%faculty%'
     OR table_name LIKE '%mentor%')
ORDER BY table_name;

-- 6. Check if there are any columns in profiles that might indicate faculty assignment
SELECT 'Profiles Table Columns' as info,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;
