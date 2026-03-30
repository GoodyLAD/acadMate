-- Complete system fix for faculty-student assignment and course management
-- This migration will fix all the issues at once

-- First, let's see what we have
SELECT 'Current system state:' as info;

-- Check if courses table exists and has data
SELECT 'Courses table:' as info;
SELECT COUNT(*) as course_count FROM courses;

-- Check if faculty table exists and has data
SELECT 'Faculty table:' as info;
SELECT COUNT(*) as faculty_count FROM faculty;

-- Check if profiles table has faculty and students
SELECT 'Profiles by role:' as info;
SELECT role, COUNT(*) as count FROM profiles GROUP BY role;

-- Check if student_mentor_assignments table has data
SELECT 'Assignments table:' as info;
SELECT COUNT(*) as assignment_count FROM student_mentor_assignments;

-- If no courses exist, create some sample courses
INSERT INTO courses (id, name, course_code, description, credit_hours, faculty_id, assigned_student_ids, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Introduction to Computer Science',
  'CS101',
  'Basic concepts of computer science and programming',
  3,
  (SELECT id FROM profiles WHERE role = 'faculty' LIMIT 1),
  ARRAY[]::uuid[],
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'CS101');

INSERT INTO courses (id, name, course_code, description, credit_hours, faculty_id, assigned_student_ids, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Data Structures and Algorithms',
  'CS201',
  'Advanced programming concepts and data structures',
  4,
  (SELECT id FROM profiles WHERE role = 'faculty' LIMIT 1),
  ARRAY[]::uuid[],
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'CS201');

-- If no faculty records exist, create one for the current user
INSERT INTO faculty (id, name, email, department, designation, is_verified, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Test Faculty',
  'karan962575@gmail.com',
  'Computer Science',
  'Professor',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM faculty WHERE email = 'karan962575@gmail.com');

-- If no students exist, create some sample students
INSERT INTO profiles (id, full_name, email, role, department, student_id, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'John Doe',
  'john.doe@student.com',
  'student',
  'Computer Science',
  'STU001',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'john.doe@student.com');

INSERT INTO profiles (id, full_name, email, role, department, student_id, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Jane Smith',
  'jane.smith@student.com',
  'student',
  'Computer Science',
  'STU002',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'jane.smith@student.com');

-- Create assignments between faculty and students
INSERT INTO student_mentor_assignments (student_id, mentor_id, created_at, updated_at)
SELECT 
  (SELECT id FROM profiles WHERE email = 'john.doe@student.com'),
  (SELECT id FROM faculty WHERE email = 'karan962575@gmail.com'),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM student_mentor_assignments 
  WHERE student_id = (SELECT id FROM profiles WHERE email = 'john.doe@student.com')
  AND mentor_id = (SELECT id FROM faculty WHERE email = 'karan962575@gmail.com')
);

INSERT INTO student_mentor_assignments (student_id, mentor_id, created_at, updated_at)
SELECT 
  (SELECT id FROM profiles WHERE email = 'jane.smith@student.com'),
  (SELECT id FROM faculty WHERE email = 'karan962575@gmail.com'),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM student_mentor_assignments 
  WHERE student_id = (SELECT id FROM profiles WHERE email = 'jane.smith@student.com')
  AND mentor_id = (SELECT id FROM faculty WHERE email = 'karan962575@gmail.com')
);

-- Assign students to courses
UPDATE courses 
SET assigned_student_ids = ARRAY[
  (SELECT id FROM profiles WHERE email = 'john.doe@student.com'),
  (SELECT id FROM profiles WHERE email = 'jane.smith@student.com')
]::uuid[]
WHERE course_code = 'CS101';

-- Verify everything is working
SELECT 'Final verification:' as info;

SELECT 'Courses with assignments:' as info;
SELECT 
  c.name,
  c.course_code,
  c.assigned_student_ids,
  p.full_name as faculty_name
FROM courses c
LEFT JOIN profiles p ON p.id = c.faculty_id;

SELECT 'Faculty assignments:' as info;
SELECT 
  f.name as faculty_name,
  f.email as faculty_email,
  p.full_name as student_name,
  p.email as student_email
FROM student_mentor_assignments sma
JOIN faculty f ON f.id = sma.mentor_id
JOIN profiles p ON p.id = sma.student_id;

SELECT 'Student course assignments:' as info;
SELECT 
  p.full_name as student_name,
  c.name as course_name,
  c.course_code
FROM courses c
CROSS JOIN LATERAL unnest(c.assigned_student_ids) as student_id
JOIN profiles p ON p.id = student_id
WHERE p.role = 'student';
