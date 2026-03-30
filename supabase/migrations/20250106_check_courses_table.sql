-- Check the courses table structure
SELECT 'Courses table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what's in the assigned_student_ids field
SELECT 'Courses with assigned_student_ids:' as info;
SELECT id, name, course_code, assigned_student_ids, pg_typeof(assigned_student_ids) as field_type
FROM courses 
LIMIT 5;

-- Check student profiles
SELECT 'Student profiles:' as info;
SELECT id, full_name, email, role 
FROM profiles 
WHERE role = 'student' 
LIMIT 5;

