-- Fix foreign key relationships for student_mentor_assignments table
-- This ensures the assignments are properly linked

-- 1. Check current foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='student_mentor_assignments';

-- 2. Drop existing foreign key constraints if they exist
ALTER TABLE public.student_mentor_assignments 
DROP CONSTRAINT IF EXISTS student_mentor_assignments_student_id_fkey;

ALTER TABLE public.student_mentor_assignments 
DROP CONSTRAINT IF EXISTS student_mentor_assignments_mentor_id_fkey;

-- 3. Add proper foreign key constraints
ALTER TABLE public.student_mentor_assignments 
ADD CONSTRAINT student_mentor_assignments_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.student_mentor_assignments 
ADD CONSTRAINT student_mentor_assignments_mentor_id_fkey 
FOREIGN KEY (mentor_id) REFERENCES public.faculty(id) ON DELETE CASCADE;

-- 4. Show current assignments
SELECT 
    'Current Assignments' as info,
    COUNT(*) as total_assignments,
    COUNT(DISTINCT student_id) as unique_students,
    COUNT(DISTINCT mentor_id) as unique_mentors
FROM public.student_mentor_assignments;

-- 5. Show sample assignments with student and faculty names
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
