-- Add sample courses for testing course assignment
-- This migration adds sample courses for faculty to test the course assignment system

-- First, let's ensure we have a faculty record for the test user
INSERT INTO public.faculty (name, email, department, designation, is_verified, faculty_code, phone, specialization)
VALUES (
  'Dr. John Smith',
  'karan962575@gmail.com',
  'Computer Science',
  'Professor',
  true,
  'CS001',
  '+1234567890',
  'Machine Learning'
)
ON CONFLICT (email) DO NOTHING;

-- Get the faculty ID
DO $$
DECLARE
    faculty_record RECORD;
BEGIN
    -- Get the faculty record
    SELECT id INTO faculty_record FROM public.faculty WHERE email = 'karan962575@gmail.com' LIMIT 1;
    
    -- Insert sample courses if they don't exist
    IF faculty_record.id IS NOT NULL THEN
        -- Course 1: Introduction to Programming
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
            'Introduction to Programming',
            'CS101',
            faculty_record.id,
            'Learn the fundamentals of programming with Python. This course covers variables, loops, functions, and basic data structures.',
            'https://www.coursera.org/learn/python',
            3,
            ARRAY['Programming', 'Beginner', 'Python'],
            ARRAY[]::text[]
        )
        ON CONFLICT (course_code) DO NOTHING;

        -- Course 2: Data Structures and Algorithms
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
            'Data Structures and Algorithms',
            'CS201',
            faculty_record.id,
            'Advanced course covering fundamental data structures and algorithmic problem-solving techniques.',
            'https://www.edx.org/learn/data-structures',
            4,
            ARRAY['Algorithms', 'Data Structures', 'Advanced'],
            ARRAY[]::text[]
        )
        ON CONFLICT (course_code) DO NOTHING;

        -- Course 3: Machine Learning Fundamentals
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
            'Machine Learning Fundamentals',
            'CS301',
            faculty_record.id,
            'Introduction to machine learning concepts, algorithms, and applications using Python and scikit-learn.',
            'https://www.coursera.org/learn/machine-learning',
            4,
            ARRAY['Machine Learning', 'AI', 'Python', 'Statistics'],
            ARRAY[]::text[]
        )
        ON CONFLICT (course_code) DO NOTHING;

        -- Course 4: Web Development
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
            'Web Development',
            'CS401',
            faculty_record.id,
            'Full-stack web development using HTML, CSS, JavaScript, and modern frameworks like React.',
            'https://www.freecodecamp.org/learn/',
            3,
            ARRAY['Web Development', 'JavaScript', 'React', 'Frontend'],
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
