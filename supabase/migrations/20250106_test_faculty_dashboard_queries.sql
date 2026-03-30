-- Test the exact queries that the faculty dashboard uses
-- This simulates what the application will do

-- 1. Test faculty lookup by email (this is what the app does now)
SELECT 
    'Faculty Lookup Test' as test_name,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.department,
    f.designation
FROM public.faculty f
WHERE f.email = 'karan962575@gmail.com';

-- 2. Test student assignments query (this is what shows students to faculty)
SELECT 
    'Student Assignments Test' as test_name,
    sma.id as assignment_id,
    p.id as student_id,
    p.full_name as student_name,
    p.email as student_email,
    p.student_id as student_roll_number,
    p.department as student_department,
    sma.created_at as assignment_date
FROM public.student_mentor_assignments sma
JOIN public.profiles p ON sma.student_id = p.id
JOIN public.faculty f ON sma.mentor_id = f.id
WHERE f.email = 'karan962575@gmail.com'
ORDER BY sma.created_at DESC;

-- 3. Test the complete faculty dashboard data
WITH faculty_data AS (
    SELECT 
        f.id as faculty_id,
        f.name as faculty_name,
        f.email as faculty_email,
        f.department,
        f.designation
    FROM public.faculty f
    WHERE f.email = 'karan962575@gmail.com'
)
SELECT 
    'Complete Faculty Dashboard Data' as test_name,
    fd.faculty_id,
    fd.faculty_name,
    fd.faculty_email,
    fd.department,
    fd.designation,
    COUNT(sma.id) as assigned_students_count,
    STRING_AGG(p.full_name, ', ') as student_names
FROM faculty_data fd
LEFT JOIN public.student_mentor_assignments sma ON fd.faculty_id = sma.mentor_id
LEFT JOIN public.profiles p ON sma.student_id = p.id
GROUP BY fd.faculty_id, fd.faculty_name, fd.faculty_email, fd.department, fd.designation;

-- 4. Show all data for debugging
SELECT 'All Faculty Records' as info, * FROM public.faculty;
SELECT 'All Student Records' as info, id, full_name, email, role FROM public.profiles WHERE role::text = 'student';
SELECT 'All Assignment Records' as info, * FROM public.student_mentor_assignments;
