-- Debug script to see what's actually in the database
-- This will help us understand why faculty can't see assigned students

-- 1. Check if faculty record exists
SELECT 
    'Faculty Record Check' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.user_id,
    f.is_verified
FROM public.faculty f
WHERE f.email = 'karan962575@gmail.com';

-- 2. Check all faculty records
SELECT 
    'All Faculty Records' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.user_id,
    f.is_verified
FROM public.faculty f
ORDER BY f.created_at DESC;

-- 3. Check all student records
SELECT 
    'All Student Records' as info,
    p.id as profile_id,
    p.full_name,
    p.email,
    p.role
FROM public.profiles p
WHERE p.role::text = 'student'
ORDER BY p.created_at DESC;

-- 4. Check all assignments
SELECT 
    'All Assignments' as info,
    sma.id as assignment_id,
    sma.student_id,
    sma.mentor_id,
    sma.created_at
FROM public.student_mentor_assignments sma
ORDER BY sma.created_at DESC;

-- 5. Check assignments with student and faculty names
SELECT 
    'Assignments with Names' as info,
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

-- 6. Test the exact query the faculty dashboard uses
SELECT 
    'Faculty Dashboard Query Test' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email
FROM public.faculty f
WHERE f.email = 'karan962575@gmail.com';

-- 7. Test the student assignments query for this faculty
SELECT 
    'Student Assignments for Faculty' as info,
    sma.id as assignment_id,
    p.id as student_id,
    p.full_name as student_name,
    p.email as student_email,
    f.id as faculty_id,
    f.name as faculty_name
FROM public.student_mentor_assignments sma
JOIN public.profiles p ON sma.student_id = p.id
JOIN public.faculty f ON sma.mentor_id = f.id
WHERE f.email = 'karan962575@gmail.com'
ORDER BY sma.created_at DESC;
