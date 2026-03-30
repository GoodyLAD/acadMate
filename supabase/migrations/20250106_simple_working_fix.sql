-- Simple working fix for courses and assignments
-- This will create the necessary data and fix the system

-- First, ensure we have a faculty record for the current user
INSERT INTO faculty (id, name, email, department, designation, is_verified, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Faculty User',
  'karan962575@gmail.com',
  'Computer Science',
  'Professor',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM faculty WHERE email = 'karan962575@gmail.com');

-- Create sample students if they don't exist
INSERT INTO profiles (id, full_name, email, role, department, student_id, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Test Student 1',
  'student1@test.com',
  'student',
  'Computer Science',
  'STU001',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'student1@test.com');

INSERT INTO profiles (id, full_name, email, role, department, student_id, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Test Student 2',
  'student2@test.com',
  'student',
  'Computer Science',
  'STU002',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'student2@test.com');

-- Create sample courses for the faculty
INSERT INTO courses (id, name, course_code, description, credit_hours, faculty_id, assigned_student_ids, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Introduction to Programming',
  'CS101',
  'Learn basic programming concepts',
  3,
  (SELECT id FROM faculty WHERE email = 'karan962575@gmail.com'),
  ARRAY[]::uuid[],
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'CS101');

INSERT INTO courses (id, name, course_code, description, credit_hours, faculty_id, assigned_student_ids, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Data Structures',
  'CS201',
  'Learn about data structures and algorithms',
  4,
  (SELECT id FROM faculty WHERE email = 'karan962575@gmail.com'),
  ARRAY[]::uuid[],
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'CS201');

-- Create student-faculty assignments
INSERT INTO student_mentor_assignments (student_id, mentor_id, created_at, updated_at)
SELECT 
  (SELECT id FROM profiles WHERE email = 'student1@test.com'),
  (SELECT id FROM faculty WHERE email = 'karan962575@gmail.com'),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM student_mentor_assignments 
  WHERE student_id = (SELECT id FROM profiles WHERE email = 'student1@test.com')
  AND mentor_id = (SELECT id FROM faculty WHERE email = 'karan962575@gmail.com')
);

INSERT INTO student_mentor_assignments (student_id, mentor_id, created_at, updated_at)
SELECT 
  (SELECT id FROM profiles WHERE email = 'student2@test.com'),
  (SELECT id FROM faculty WHERE email = 'karan962575@gmail.com'),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM student_mentor_assignments 
  WHERE student_id = (SELECT id FROM profiles WHERE email = 'student2@test.com')
  AND mentor_id = (SELECT id FROM faculty WHERE email = 'karan962575@gmail.com')
);

-- Assign students to courses
UPDATE courses 
SET assigned_student_ids = ARRAY[
  (SELECT id FROM profiles WHERE email = 'student1@test.com'),
  (SELECT id FROM profiles WHERE email = 'student2@test.com')
]::uuid[]
WHERE course_code = 'CS101';

-- Verify everything is working
SELECT 'Verification - Faculty courses:' as info;
SELECT 
  c.name,
  c.course_code,
  c.assigned_student_ids,
  f.name as faculty_name
FROM courses c
JOIN faculty f ON f.id = c.faculty_id
WHERE f.email = 'karan962575@gmail.com';

SELECT 'Verification - Student assignments:' as info;
SELECT 
  f.name as faculty_name,
  p.full_name as student_name,
  p.email as student_email
FROM student_mentor_assignments sma
JOIN faculty f ON f.id = sma.mentor_id
JOIN profiles p ON p.id = sma.student_id
WHERE f.email = 'karan962575@gmail.com';

SELECT 'Verification - Student course assignments:' as info;
SELECT 
  p.full_name as student_name,
  p.email as student_email,
  c.name as course_name,
  c.course_code
FROM courses c
CROSS JOIN LATERAL unnest(c.assigned_student_ids) as student_id
JOIN profiles p ON p.id = student_id
WHERE p.role = 'student';
