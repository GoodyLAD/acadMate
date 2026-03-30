-- Test course assignment functionality
-- This will test if courses are properly assigned to students

-- Check if we have the test data
SELECT 'Current test data:' as info;

SELECT 'Faculty records:' as info;
SELECT id, name, email FROM faculty WHERE email = 'karan962575@gmail.com';

SELECT 'Student records:' as info;
SELECT id, full_name, email FROM profiles WHERE role = 'student';

SELECT 'Course records:' as info;
SELECT id, name, course_code, faculty_id, assigned_student_ids FROM courses;

SELECT 'Assignment records:' as info;
SELECT 
  sma.student_id,
  sma.mentor_id,
  p.full_name as student_name,
  f.name as faculty_name
FROM student_mentor_assignments sma
JOIN profiles p ON p.id = sma.student_id
JOIN faculty f ON f.id = sma.mentor_id;

-- Test the exact query that StudentCourses uses
SELECT 'StudentCourses query test:' as info;
SELECT 
  c.id,
  c.name,
  c.course_code,
  c.assigned_student_ids,
  p.full_name as faculty_name
FROM courses c
LEFT JOIN profiles p ON p.id = c.faculty_id
WHERE c.assigned_student_ids && ARRAY[(SELECT id FROM profiles WHERE role = 'student' LIMIT 1)];

-- Test the exact query that CourseAssignment uses for courses
SELECT 'CourseAssignment courses query test:' as info;
SELECT 
  c.id,
  c.name,
  c.course_code,
  c.faculty_id,
  p.full_name as faculty_name
FROM courses c
LEFT JOIN profiles p ON p.id = c.faculty_id
WHERE c.faculty_id = (SELECT id FROM faculty WHERE email = 'karan962575@gmail.com');

-- Test the exact query that CourseAssignment uses for students
SELECT 'CourseAssignment students query test:' as info;
SELECT 
  sma.student_id,
  p.id,
  p.full_name,
  p.email
FROM student_mentor_assignments sma
JOIN profiles p ON p.id = sma.student_id
WHERE sma.mentor_id = (SELECT id FROM faculty WHERE email = 'karan962575@gmail.com');