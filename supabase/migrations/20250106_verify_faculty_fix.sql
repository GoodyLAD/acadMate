-- Verify that the faculty fix is working correctly
-- This checks the current state after running the migration

-- 1. Check faculty table structure
SELECT 
    'Faculty Table Structure' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'faculty' 
AND table_schema = 'public'
AND column_name = 'user_id';

-- 2. Check faculty records and their user_id status
SELECT 
    'Faculty Records Summary' as info,
    COUNT(*) as total_faculty,
    COUNT(user_id) as faculty_with_user_id,
    COUNT(*) - COUNT(user_id) as faculty_without_user_id
FROM public.faculty;

-- 3. Show faculty with linked profiles
SELECT 
    'Faculty with Linked Profiles' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.user_id,
    p.full_name as profile_name,
    p.role as profile_role
FROM public.faculty f
LEFT JOIN public.profiles p ON f.user_id = p.id
WHERE f.user_id IS NOT NULL
ORDER BY f.name
LIMIT 10;

-- 4. Show faculty without linked profiles (will use email matching)
SELECT 
    'Faculty without Linked Profiles' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.user_id
FROM public.faculty f
WHERE f.user_id IS NULL
ORDER BY f.name
LIMIT 10;

-- 5. Check if there are any student_mentor_assignments
SELECT 
    'Student Mentor Assignments' as info,
    COUNT(*) as total_assignments,
    COUNT(DISTINCT student_id) as unique_students,
    COUNT(DISTINCT mentor_id) as unique_mentors
FROM public.student_mentor_assignments;

-- 6. Show sample assignments
SELECT 
    'Sample Assignments' as info,
    sma.id as assignment_id,
    p.full_name as student_name,
    p.email as student_email,
    f.name as faculty_name,
    f.email as faculty_email,
    sma.created_at
FROM public.student_mentor_assignments sma
LEFT JOIN public.profiles p ON sma.student_id = p.id
LEFT JOIN public.faculty f ON sma.mentor_id = f.id
ORDER BY sma.created_at DESC
LIMIT 5;
