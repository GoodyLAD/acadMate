-- Add basic data to make the system work
-- This is the ONLY migration you need to run

-- Add a faculty record for the current user
INSERT INTO faculty (id, name, email, department, designation, is_verified, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Faculty User',
  'karan962575@gmail.com',
  'Computer Science',
  'Professor',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Add some students
INSERT INTO profiles (id, full_name, email, role, department, student_id, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'John Doe', 'john@student.com', 'student', 'Computer Science', 'STU001', NOW(), NOW()),
  (gen_random_uuid(), 'Jane Smith', 'jane@student.com', 'student', 'Computer Science', 'STU002', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Add some courses
INSERT INTO courses (id, name, course_code, description, credit_hours, faculty_id, assigned_student_ids, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Introduction to Programming', 'CS101', 'Learn basic programming', 3, (SELECT id FROM faculty WHERE email = 'karan962575@gmail.com'), ARRAY[]::uuid[], NOW(), NOW()),
  (gen_random_uuid(), 'Data Structures', 'CS201', 'Learn data structures', 4, (SELECT id FROM faculty WHERE email = 'karan962575@gmail.com'), ARRAY[]::uuid[], NOW(), NOW())
ON CONFLICT (course_code) DO NOTHING;

-- Assign students to faculty
INSERT INTO student_mentor_assignments (student_id, mentor_id, created_at, updated_at)
SELECT 
  p.id,
  f.id,
  NOW(),
  NOW()
FROM profiles p
CROSS JOIN faculty f
WHERE p.role = 'student' 
AND f.email = 'karan962575@gmail.com'
ON CONFLICT (student_id, mentor_id) DO NOTHING;
