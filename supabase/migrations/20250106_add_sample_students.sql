-- Add sample students for testing the assignment system
-- This creates test data to verify the student fetching works

-- Insert sample students
INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'John Smith', 'john.smith@student.edu', 'student', now(), now()),
    (gen_random_uuid(), 'Jane Doe', 'jane.doe@student.edu', 'student', now(), now()),
    (gen_random_uuid(), 'Bob Johnson', 'bob.johnson@student.edu', 'student', now(), now()),
    (gen_random_uuid(), 'Alice Brown', 'alice.brown@student.edu', 'student', now(), now()),
    (gen_random_uuid(), 'Charlie Wilson', 'charlie.wilson@student.edu', 'student', now(), now())
ON CONFLICT (email) DO NOTHING;

-- Insert sample faculty
INSERT INTO public.faculty (name, email, department, designation, faculty_code, phone, specialization, is_verified)
VALUES 
    ('Dr. Sarah Johnson', 'sarah.johnson@faculty.edu', 'Computer Science', 'Professor', 'CS001', '+1234567890', 'Machine Learning', true),
    ('Dr. Michael Chen', 'michael.chen@faculty.edu', 'Information Technology', 'Associate Professor', 'IT001', '+1234567891', 'Web Development', true),
    ('Dr. Emily Rodriguez', 'emily.rodriguez@faculty.edu', 'Data Science', 'Assistant Professor', 'DS001', '+1234567892', 'Data Analytics', true)
ON CONFLICT (email) DO NOTHING;

-- Show the created data
SELECT 'Students' as type, COUNT(*) as count FROM public.profiles WHERE role = 'student'
UNION ALL
SELECT 'Faculty' as type, COUNT(*) as count FROM public.faculty WHERE is_verified = true;
