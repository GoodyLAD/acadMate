-- Test assignment system
-- This will help verify that the assignment system is working correctly

-- First, let's see what we have in the system
SELECT 'Current system state:' as info;

-- Check faculty table
SELECT 'Faculty records:' as info;
SELECT id, name, email, is_verified FROM faculty ORDER BY created_at DESC LIMIT 5;

-- Check student profiles
SELECT 'Student profiles:' as info;
SELECT id, full_name, email, role FROM profiles WHERE role = 'student' ORDER BY created_at DESC LIMIT 5;

-- Check current assignments
SELECT 'Current assignments:' as info;
SELECT 
  sma.id,
  sma.student_id,
  sma.mentor_id,
  p1.full_name as student_name,
  f.name as faculty_name
FROM student_mentor_assignments sma
LEFT JOIN profiles p1 ON p1.id = sma.student_id
LEFT JOIN faculty f ON f.id = sma.mentor_id
ORDER BY sma.created_at DESC;

-- If no assignments exist, create a test assignment
INSERT INTO student_mentor_assignments (student_id, mentor_id)
SELECT 
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1),
  (SELECT id FROM faculty WHERE is_verified = true LIMIT 1)
WHERE NOT EXISTS (
  SELECT 1 FROM student_mentor_assignments 
  WHERE student_id = (SELECT id FROM profiles WHERE role = 'student' LIMIT 1)
  AND mentor_id = (SELECT id FROM faculty WHERE is_verified = true LIMIT 1)
);

-- Verify the test assignment was created
SELECT 'Test assignment created:' as info;
SELECT 
  sma.id,
  sma.student_id,
  sma.mentor_id,
  p1.full_name as student_name,
  f.name as faculty_name
FROM student_mentor_assignments sma
LEFT JOIN profiles p1 ON p1.id = sma.student_id
LEFT JOIN faculty f ON f.id = sma.mentor_id
ORDER BY sma.created_at DESC LIMIT 3;
