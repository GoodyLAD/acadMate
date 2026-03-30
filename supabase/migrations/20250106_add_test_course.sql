-- Add a test course to ensure courses are visible
-- This migration adds a test course for debugging

-- First, ensure we have a faculty record
INSERT INTO public.faculty (name, email, department, designation, is_verified, faculty_code, phone, specialization)
VALUES (
  'Test Faculty',
  'karan962575@gmail.com',
  'Computer Science',
  'Professor',
  true,
  'TEST001',
  '+1234567890',
  'Software Engineering'
)
ON CONFLICT (email) DO NOTHING;

-- Get the faculty ID
DO $$
DECLARE
    faculty_record RECORD;
BEGIN
    -- Get the faculty record
    SELECT id INTO faculty_record FROM public.faculty WHERE email = 'karan962575@gmail.com' LIMIT 1;
    
    -- Insert test course if it doesn't exist
    IF faculty_record.id IS NOT NULL THEN
        INSERT INTO public.courses (
            name, 
            course_code, 
            faculty_id, 
            description, 
            external_link, 
            credit_hours, 
            tags, 
            assigned_student_ids
        ) VALUES (
            'Test Course for Assignment',
            'TEST101',
            faculty_record.id,
            'This is a test course to verify course assignment functionality.',
            'https://www.google.com',
            3,
            ARRAY['Test', 'Debug', 'Assignment'],
            ARRAY[]::text[]
        )
        ON CONFLICT (course_code) DO NOTHING;
        
        -- Also add another test course
        INSERT INTO public.courses (
            name, 
            course_code, 
            faculty_id, 
            description, 
            external_link, 
            credit_hours, 
            tags, 
            assigned_student_ids
        ) VALUES (
            'Advanced Test Course',
            'TEST201',
            faculty_record.id,
            'Advanced test course for debugging course assignment system.',
            'https://www.github.com',
            4,
            ARRAY['Test', 'Advanced', 'Debug'],
            ARRAY[]::text[]
        )
        ON CONFLICT (course_code) DO NOTHING;
    END IF;
END $$;

-- Verify the courses were created
SELECT 
    c.name,
    c.course_code,
    c.description,
    c.external_link,
    c.credit_hours,
    c.tags,
    f.name as faculty_name,
    f.email as faculty_email
FROM public.courses c
JOIN public.faculty f ON c.faculty_id = f.id
WHERE f.email = 'karan962575@gmail.com'
ORDER BY c.course_code;
