-- Simple test for course assignment system
-- This will test the basic functionality without complex queries

-- Check if we have the basic data
SELECT 'Basic data check:' as info;

-- Check faculty
SELECT 'Faculty records:' as info;
SELECT id, name, email FROM faculty;

-- Check students
SELECT 'Student records:' as info;
SELECT id, full_name, email FROM profiles WHERE role = 'student';

-- Check courses
SELECT 'Course records:' as info;
SELECT id, name, course_code, faculty_id FROM courses;

-- Check assignments
SELECT 'Assignment records:' as info;
SELECT 
  sma.student_id,
  sma.mentor_id,
  p.full_name as student_name,
  f.name as faculty_name
FROM student_mentor_assignments sma
JOIN profiles p ON p.id = sma.student_id
JOIN faculty f ON f.id = sma.mentor_id;

-- Check course assignments (simple way)
SELECT 'Course assignments:' as info;
SELECT 
  c.name as course_name,
  c.course_code,
  c.assigned_student_ids,
  p.full_name as faculty_name
FROM courses c
LEFT JOIN profiles p ON p.id = c.faculty_id;

-- Test if a specific student is in course assignments
SELECT 'Student in course test:' as info;
SELECT 
  c.name as course_name,
  c.course_code,
  p.full_name as student_name
FROM courses c
CROSS JOIN LATERAL unnest(c.assigned_student_ids) as student_id
JOIN profiles p ON p.id = student_id
WHERE p.role = 'student';
