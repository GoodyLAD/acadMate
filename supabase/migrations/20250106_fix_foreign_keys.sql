-- Fix foreign key constraints for student tables
-- This migration fixes the foreign key references to point to the correct table

-- First, drop the existing foreign key constraints if they exist
ALTER TABLE student_progress DROP CONSTRAINT IF EXISTS student_progress_student_id_fkey;
ALTER TABLE student_activities DROP CONSTRAINT IF EXISTS student_activities_student_id_fkey;
ALTER TABLE student_goals DROP CONSTRAINT IF EXISTS student_goals_student_id_fkey;
ALTER TABLE student_connections DROP CONSTRAINT IF EXISTS student_connections_student_id_fkey;
ALTER TABLE student_connections DROP CONSTRAINT IF EXISTS student_connections_connection_id_fkey;
ALTER TABLE student_milestones DROP CONSTRAINT IF EXISTS student_milestones_student_id_fkey;

-- Add the correct foreign key constraints pointing to profiles table
ALTER TABLE student_progress 
ADD CONSTRAINT student_progress_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE student_activities 
ADD CONSTRAINT student_activities_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE student_goals 
ADD CONSTRAINT student_goals_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE student_connections 
ADD CONSTRAINT student_connections_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE student_connections 
ADD CONSTRAINT student_connections_connection_id_fkey 
FOREIGN KEY (connection_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE student_milestones 
ADD CONSTRAINT student_milestones_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Now insert sample data with the correct student ID
-- First, let's check if ANSH exists in profiles table and get the correct ID
DO $$
DECLARE
    ansh_profile_id UUID;
BEGIN
    -- Get ANSH's profile ID
    SELECT id INTO ansh_profile_id 
    FROM profiles 
    WHERE full_name ILIKE '%ansh%' 
    OR email ILIKE '%ansh%' 
    LIMIT 1;
    
    -- If ANSH exists, insert sample data
    IF ansh_profile_id IS NOT NULL THEN
        -- Insert progress data
        INSERT INTO student_progress (student_id, category, progress_value, max_value) 
        VALUES 
            (ansh_profile_id, 'courses_completed', 3, 10),
            (ansh_profile_id, 'certificates_earned', 2, 5),
            (ansh_profile_id, 'projects_completed', 5, 15)
        ON CONFLICT (student_id, category) DO NOTHING;
        
        -- Insert activities data
        INSERT INTO student_activities (student_id, activity_type, title, description, points, completed_at) 
        VALUES 
            (ansh_profile_id, 'course_completion', 'Completed React Course', 'Finished the complete React developer course', 100, NOW() - INTERVAL '2 days'),
            (ansh_profile_id, 'certificate_earned', 'AWS Certified', 'Earned AWS Cloud Practitioner certification', 150, NOW() - INTERVAL '5 days'),
            (ansh_profile_id, 'project_submission', 'Portfolio Website', 'Created and submitted portfolio website project', 75, NOW() - INTERVAL '1 week')
        ON CONFLICT DO NOTHING;
        
        -- Insert goals data
        INSERT INTO student_goals (student_id, title, description, target_value, current_value, category, deadline) 
        VALUES 
            (ansh_profile_id, 'Complete 10 Courses', 'Finish 10 online courses this semester', 10, 3, 'learning', '2024-06-01'),
            (ansh_profile_id, 'Earn 5 Certificates', 'Obtain 5 professional certificates', 5, 2, 'certification', '2024-08-01'),
            (ansh_profile_id, 'Build 15 Projects', 'Create 15 coding projects', 15, 5, 'projects', '2024-12-01')
        ON CONFLICT DO NOTHING;
        
        -- Insert milestones data
        INSERT INTO student_milestones (student_id, title, description, category, points) 
        VALUES 
            (ansh_profile_id, 'First Course Completed', 'Completed your first online course', 'learning', 50),
            (ansh_profile_id, 'Certificate Achiever', 'Earned your first professional certificate', 'certification', 100),
            (ansh_profile_id, 'Project Builder', 'Created your first coding project', 'projects', 75)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Sample data inserted for student ID: %', ansh_profile_id;
    ELSE
        RAISE NOTICE 'No student profile found with name containing "ansh"';
    END IF;
END $$;

-- Create a unique constraint on student_progress for student_id + category to prevent duplicates
-- First check if the constraint already exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'student_progress_student_category_unique'
    ) THEN
        ALTER TABLE student_progress 
        ADD CONSTRAINT student_progress_student_category_unique 
        UNIQUE (student_id, category);
    END IF;
END $$;

-- Add comments
COMMENT ON CONSTRAINT student_progress_student_id_fkey ON student_progress IS 'References profiles table for student';
COMMENT ON CONSTRAINT student_activities_student_id_fkey ON student_activities IS 'References profiles table for student';
COMMENT ON CONSTRAINT student_goals_student_id_fkey ON student_goals IS 'References profiles table for student';
COMMENT ON CONSTRAINT student_connections_student_id_fkey ON student_connections IS 'References profiles table for student';
COMMENT ON CONSTRAINT student_connections_connection_id_fkey ON student_connections IS 'References profiles table for connection';
COMMENT ON CONSTRAINT student_milestones_student_id_fkey ON student_milestones IS 'References profiles table for student';
