-- Verify that the faculty fix is working correctly
-- This checks the current state after running the migration

-- 1. Check if user_id column exists in faculty table
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'faculty' 
            AND column_name = 'user_id'
            AND table_schema = 'public'
        ) 
        THEN 'user_id column EXISTS' 
        ELSE 'user_id column DOES NOT EXIST' 
    END as column_status;

-- 2. Check faculty table structure
SELECT 
    'Faculty Table Structure' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'faculty' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check faculty records count
SELECT 
    'Faculty Records Count' as info,
    COUNT(*) as total_faculty
FROM public.faculty;

-- 4. If user_id column exists, show faculty with/without user_id
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'faculty' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        -- Show faculty records summary
        PERFORM (
            SELECT 
                'Faculty Records Summary' as info,
                COUNT(*) as total_faculty,
                COUNT(user_id) as faculty_with_user_id,
                COUNT(*) - COUNT(user_id) as faculty_without_user_id
            FROM public.faculty
        );
        
        -- Show faculty with linked profiles
        PERFORM (
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
            LIMIT 10
        );
    END IF;
END $$;

-- 5. Show all faculty records (regardless of user_id column)
SELECT 
    'All Faculty Records' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.created_at
FROM public.faculty f
ORDER BY f.name
LIMIT 10;

-- 6. Check if there are any student_mentor_assignments
SELECT 
    'Student Mentor Assignments' as info,
    COUNT(*) as total_assignments,
    COUNT(DISTINCT student_id) as unique_students,
    COUNT(DISTINCT mentor_id) as unique_mentors
FROM public.student_mentor_assignments;
