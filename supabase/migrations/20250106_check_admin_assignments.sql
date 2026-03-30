-- Check what assignments were actually made through the admin dashboard
-- This will help us understand the current state and fix it properly

-- 1. Check all tables that might contain assignment data
SELECT 'Table: faculty' as table_name, COUNT(*) as record_count FROM public.faculty
UNION ALL
SELECT 'Table: profiles (students)', COUNT(*) FROM public.profiles WHERE role::text = 'student'
UNION ALL
SELECT 'Table: student_mentor_assignments', COUNT(*) FROM public.student_mentor_assignments
UNION ALL
SELECT 'Table: profiles (all)', COUNT(*) FROM public.profiles;

-- 2. Show all faculty records
SELECT 
    'Faculty Records' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.faculty_code,
    f.is_verified,
    f.created_at
FROM public.faculty f
ORDER BY f.created_at DESC;

-- 3. Show all student records
SELECT 
    'Student Records' as info,
    p.id as student_id,
    p.full_name as student_name,
    p.email as student_email,
    p.role,
    p.created_at
FROM public.profiles p
WHERE p.role::text = 'student'
ORDER BY p.created_at DESC;

-- 4. Show all current assignments
SELECT 
    'Current Assignments' as info,
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

-- 5. Check if there are any other tables that might contain assignment data
SELECT 
    'All Tables in Public Schema' as info,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%assignment%' 
OR table_name LIKE '%student%' 
OR table_name LIKE '%faculty%'
OR table_name LIKE '%mentor%'
ORDER BY table_name;

-- 6. Check if there are any columns in profiles that might indicate faculty assignment
SELECT 
    'Profiles Table Columns' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;
