-- Debug student_mentor_assignments table
-- This will help us understand why assigned students are not showing up

-- Check the structure of student_mentor_assignments table
SELECT 'Table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_mentor_assignments' 
AND table_schema = 'public';

-- Check what data is in the table
SELECT 'Current assignments:' as info;
SELECT 
  sma.id,
  sma.student_id,
  sma.mentor_id,
  p1.full_name as student_name,
  p1.email as student_email,
  p2.full_name as mentor_name,
  p2.email as mentor_email
FROM student_mentor_assignments sma
LEFT JOIN profiles p1 ON p1.id = sma.student_id
LEFT JOIN profiles p2 ON p2.id = sma.mentor_id
ORDER BY sma.created_at DESC;

-- Check profiles table for faculty
SELECT 'Faculty profiles:' as info;
SELECT id, full_name, email, role 
FROM profiles 
WHERE role = 'faculty' 
ORDER BY created_at DESC;

-- Check profiles table for students
SELECT 'Student profiles:' as info;
SELECT id, full_name, email, role 
FROM profiles 
WHERE role = 'student' 
ORDER BY created_at DESC;

-- Check if there are any assignments for the current user
SELECT 'Assignments for current user:' as info;
SELECT 
  sma.id,
  sma.student_id,
  sma.mentor_id,
  p1.full_name as student_name,
  p2.full_name as mentor_name
FROM student_mentor_assignments sma
LEFT JOIN profiles p1 ON p1.id = sma.student_id
LEFT JOIN profiles p2 ON p2.id = sma.mentor_id
WHERE sma.mentor_id = auth.uid()
ORDER BY sma.created_at DESC;
