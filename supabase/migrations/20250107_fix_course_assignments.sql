-- Fix course assignment system and add test data
-- This migration ensures courses are properly assigned to students

-- 1. First, let's check what we have
SELECT 'Current state before fix:' as info;

-- Check courses
SELECT 'Courses:' as info;
SELECT id, name, course_code, faculty_id, assigned_student_ids FROM courses;

-- Check student profiles
SELECT 'Student profiles:' as info;
SELECT id, full_name, email, student_id FROM profiles WHERE role = 'student';

-- Check faculty profiles  
SELECT 'Faculty profiles:' as info;
SELECT id, full_name, email, faculty_id FROM profiles WHERE role = 'faculty';

-- 2. Create test faculty if not exists
INSERT INTO profiles (id, full_name, email, role, faculty_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Test Faculty',
    'faculty@test.com',
    'faculty',
    'FAC001',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 3. Create test students if not exists
INSERT INTO profiles (id, full_name, email, role, student_id, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'Test Student 1', 'student1@test.com', 'student', 'STU001', NOW(), NOW()),
    (gen_random_uuid(), 'Test Student 2', 'student2@test.com', 'student', 'STU002', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 4. Create test courses if not exists
INSERT INTO courses (id, name, course_code, description, faculty_id, assigned_student_ids, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Test Course 1',
    'TEST101',
    'This is a test course for debugging',
    (SELECT id FROM profiles WHERE email = 'faculty@test.com' AND role = 'faculty'),
    ARRAY[]::uuid[],
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'TEST101');

INSERT INTO courses (id, name, course_code, description, faculty_id, assigned_student_ids, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'Test Course 2',
    'TEST102',
    'Another test course for debugging',
    (SELECT id FROM profiles WHERE email = 'faculty@test.com' AND role = 'faculty'),
    ARRAY[]::uuid[],
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'TEST102');

-- 5. Assign students to courses
UPDATE courses 
SET assigned_student_ids = ARRAY[
    (SELECT id FROM profiles WHERE email = 'student1@test.com' AND role = 'student'),
    (SELECT id FROM profiles WHERE email = 'student2@test.com' AND role = 'student')
]::uuid[]
WHERE course_code = 'TEST101';

UPDATE courses 
SET assigned_student_ids = ARRAY[
    (SELECT id FROM profiles WHERE email = 'student1@test.com' AND role = 'student')
]::uuid[]
WHERE course_code = 'TEST102';

-- 6. Verify the assignments
SELECT 'After fix - Courses with assignments:' as info;
SELECT 
    c.name as course_name,
    c.course_code,
    c.assigned_student_ids,
    p.full_name as faculty_name
FROM courses c
LEFT JOIN profiles p ON p.id = c.faculty_id
WHERE c.assigned_student_ids IS NOT NULL 
  AND array_length(c.assigned_student_ids, 1) > 0;

-- 7. Test the filtering logic
SELECT 'Filtering test for student1@test.com:' as info;
SELECT 
    c.name as course_name,
    c.course_code,
    c.assigned_student_ids,
    CASE 
        WHEN c.assigned_student_ids IS NOT NULL 
             AND c.assigned_student_ids @> ARRAY[(SELECT id FROM profiles WHERE email = 'student1@test.com' AND role = 'student')]::uuid[]
        THEN 'VISIBLE'
        ELSE 'NOT VISIBLE'
    END as visibility_status
FROM courses c
WHERE c.assigned_student_ids IS NOT NULL 
  AND array_length(c.assigned_student_ids, 1) > 0;
