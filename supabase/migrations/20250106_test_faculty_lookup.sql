-- Test faculty lookup scenarios
-- This simulates what the application will do

-- 1. Test faculty lookup by user_id (if available)
-- Replace 'your-user-id-here' with an actual user ID from profiles
SELECT 
    'Faculty Lookup by User ID' as test,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.user_id
FROM public.faculty f
WHERE f.user_id IS NOT NULL
LIMIT 3;

-- 2. Test faculty lookup by email (fallback method)
-- Replace 'your-email@example.com' with an actual faculty email
SELECT 
    'Faculty Lookup by Email' as test,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.user_id
FROM public.faculty f
WHERE f.email IS NOT NULL
LIMIT 3;

-- 3. Test student assignments for a specific faculty
-- This shows what students are assigned to each faculty
SELECT 
    'Student Assignments by Faculty' as test,
    f.name as faculty_name,
    f.email as faculty_email,
    COUNT(sma.id) as assigned_students,
    STRING_AGG(p.full_name, ', ') as student_names
FROM public.faculty f
LEFT JOIN public.student_mentor_assignments sma ON f.id = sma.mentor_id
LEFT JOIN public.profiles p ON sma.student_id = p.id
GROUP BY f.id, f.name, f.email
ORDER BY assigned_students DESC
LIMIT 5;

-- 4. Test the exact query the application will use
-- This simulates the faculty dashboard query
WITH faculty_lookup AS (
    SELECT f.id, f.name, f.email
    FROM public.faculty f
    WHERE f.user_id IS NOT NULL
    LIMIT 1
)
SELECT 
    'Application Query Test' as test,
    sma.id as assignment_id,
    p.full_name as student_name,
    p.email as student_email,
    f.name as faculty_name,
    sma.created_at
FROM faculty_lookup fl
LEFT JOIN public.student_mentor_assignments sma ON fl.id = sma.mentor_id
LEFT JOIN public.profiles p ON sma.student_id = p.id
LEFT JOIN public.faculty f ON sma.mentor_id = f.id
ORDER BY sma.created_at DESC;
