-- Complete fix for all student tables and data
-- This migration creates missing tables, adds missing columns, fixes foreign keys, and adds sample data

-- 1. First, create the student_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    category VARCHAR(50) NOT NULL,
    progress_value INTEGER DEFAULT 0,
    max_value INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create student_activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create student_goals table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_value INTEGER DEFAULT 0,
    current_value INTEGER DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    deadline DATE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create student_connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    connection_id UUID NOT NULL,
    connection_type VARCHAR(50) DEFAULT 'peer',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create student_milestones table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    points INTEGER DEFAULT 0,
    achieved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Add missing columns to existing tables if they don't exist
DO $$
BEGIN
    -- Add category column to student_progress if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_progress' AND column_name = 'category') THEN
        ALTER TABLE student_progress ADD COLUMN category VARCHAR(50);
    END IF;
    
    -- Add progress_value column to student_progress if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_progress' AND column_name = 'progress_value') THEN
        ALTER TABLE student_progress ADD COLUMN progress_value INTEGER DEFAULT 0;
    END IF;
    
    -- Add max_value column to student_progress if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_progress' AND column_name = 'max_value') THEN
        ALTER TABLE student_progress ADD COLUMN max_value INTEGER DEFAULT 100;
    END IF;
    
    -- Add completed_at column to student_activities if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_activities' AND column_name = 'completed_at') THEN
        ALTER TABLE student_activities ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add points column to student_activities if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_activities' AND column_name = 'points') THEN
        ALTER TABLE student_activities ADD COLUMN points INTEGER DEFAULT 0;
    END IF;
    
    -- Add activity_type column to student_activities if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_activities' AND column_name = 'activity_type') THEN
        ALTER TABLE student_activities ADD COLUMN activity_type VARCHAR(50);
    END IF;
    
    -- Add title column to student_activities if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_activities' AND column_name = 'title') THEN
        ALTER TABLE student_activities ADD COLUMN title VARCHAR(255);
    END IF;
    
    -- Add description column to student_activities if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_activities' AND column_name = 'description') THEN
        ALTER TABLE student_activities ADD COLUMN description TEXT;
    END IF;
    
    -- Add missing columns to student_goals if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_goals' AND column_name = 'target_value') THEN
        ALTER TABLE student_goals ADD COLUMN target_value INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_goals' AND column_name = 'current_value') THEN
        ALTER TABLE student_goals ADD COLUMN current_value INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_goals' AND column_name = 'category') THEN
        ALTER TABLE student_goals ADD COLUMN category VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_goals' AND column_name = 'deadline') THEN
        ALTER TABLE student_goals ADD COLUMN deadline DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_goals' AND column_name = 'completed') THEN
        ALTER TABLE student_goals ADD COLUMN completed BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_goals' AND column_name = 'title') THEN
        ALTER TABLE student_goals ADD COLUMN title VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_goals' AND column_name = 'description') THEN
        ALTER TABLE student_goals ADD COLUMN description TEXT;
    END IF;
    
    -- Add missing columns to student_milestones if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_milestones' AND column_name = 'title') THEN
        ALTER TABLE student_milestones ADD COLUMN title VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_milestones' AND column_name = 'description') THEN
        ALTER TABLE student_milestones ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_milestones' AND column_name = 'category') THEN
        ALTER TABLE student_milestones ADD COLUMN category VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_milestones' AND column_name = 'points') THEN
        ALTER TABLE student_milestones ADD COLUMN points INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_milestones' AND column_name = 'achieved_at') THEN
        ALTER TABLE student_milestones ADD COLUMN achieved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add missing columns to student_connections if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_connections' AND column_name = 'connection_type') THEN
        ALTER TABLE student_connections ADD COLUMN connection_type VARCHAR(50) DEFAULT 'peer';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'student_connections' AND column_name = 'status') THEN
        ALTER TABLE student_connections ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;
END $$;

-- 7. Drop existing foreign key constraints if they exist
ALTER TABLE student_progress DROP CONSTRAINT IF EXISTS student_progress_student_id_fkey;
ALTER TABLE student_activities DROP CONSTRAINT IF EXISTS student_activities_student_id_fkey;
ALTER TABLE student_goals DROP CONSTRAINT IF EXISTS student_goals_student_id_fkey;
ALTER TABLE student_connections DROP CONSTRAINT IF EXISTS student_connections_student_id_fkey;
ALTER TABLE student_connections DROP CONSTRAINT IF EXISTS student_connections_connection_id_fkey;
ALTER TABLE student_milestones DROP CONSTRAINT IF EXISTS student_milestones_student_id_fkey;

-- 8. Add the correct foreign key constraints pointing to profiles table
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

-- 9. Enable RLS on all tables
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_milestones ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies for all tables
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Students can view their own progress" ON student_progress;
DROP POLICY IF EXISTS "Students can insert their own progress" ON student_progress;
DROP POLICY IF EXISTS "Students can update their own progress" ON student_progress;
DROP POLICY IF EXISTS "Students can view their own activities" ON student_activities;
DROP POLICY IF EXISTS "Students can insert their own activities" ON student_activities;
DROP POLICY IF EXISTS "Students can update their own activities" ON student_activities;
DROP POLICY IF EXISTS "Students can view their own goals" ON student_goals;
DROP POLICY IF EXISTS "Students can insert their own goals" ON student_goals;
DROP POLICY IF EXISTS "Students can update their own goals" ON student_goals;
DROP POLICY IF EXISTS "Students can view their own connections" ON student_connections;
DROP POLICY IF EXISTS "Students can insert their own connections" ON student_connections;
DROP POLICY IF EXISTS "Students can update their own connections" ON student_connections;
DROP POLICY IF EXISTS "Students can view their own milestones" ON student_milestones;
DROP POLICY IF EXISTS "Students can insert their own milestones" ON student_milestones;
DROP POLICY IF EXISTS "Students can update their own milestones" ON student_milestones;

-- Student progress policies
CREATE POLICY "Students can view their own progress" ON student_progress
    FOR SELECT USING (student_id = auth.uid()::uuid);

CREATE POLICY "Students can insert their own progress" ON student_progress
    FOR INSERT WITH CHECK (student_id = auth.uid()::uuid);

CREATE POLICY "Students can update their own progress" ON student_progress
    FOR UPDATE USING (student_id = auth.uid()::uuid);

-- Student activities policies
CREATE POLICY "Students can view their own activities" ON student_activities
    FOR SELECT USING (student_id = auth.uid()::uuid);

CREATE POLICY "Students can insert their own activities" ON student_activities
    FOR INSERT WITH CHECK (student_id = auth.uid()::uuid);

CREATE POLICY "Students can update their own activities" ON student_activities
    FOR UPDATE USING (student_id = auth.uid()::uuid);

-- Student goals policies
CREATE POLICY "Students can view their own goals" ON student_goals
    FOR SELECT USING (student_id = auth.uid()::uuid);

CREATE POLICY "Students can insert their own goals" ON student_goals
    FOR INSERT WITH CHECK (student_id = auth.uid()::uuid);

CREATE POLICY "Students can update their own goals" ON student_goals
    FOR UPDATE USING (student_id = auth.uid()::uuid);

-- Student connections policies
CREATE POLICY "Students can view their own connections" ON student_connections
    FOR SELECT USING (student_id = auth.uid()::uuid OR connection_id = auth.uid()::uuid);

CREATE POLICY "Students can insert their own connections" ON student_connections
    FOR INSERT WITH CHECK (student_id = auth.uid()::uuid);

CREATE POLICY "Students can update their own connections" ON student_connections
    FOR UPDATE USING (student_id = auth.uid()::uuid OR connection_id = auth.uid()::uuid);

-- Student milestones policies
CREATE POLICY "Students can view their own milestones" ON student_milestones
    FOR SELECT USING (student_id = auth.uid()::uuid);

CREATE POLICY "Students can insert their own milestones" ON student_milestones
    FOR INSERT WITH CHECK (student_id = auth.uid()::uuid);

CREATE POLICY "Students can update their own milestones" ON student_milestones
    FOR UPDATE USING (student_id = auth.uid()::uuid);

-- 11. Clear any existing data to avoid conflicts
DELETE FROM student_progress WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';
DELETE FROM student_activities WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';
DELETE FROM student_goals WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';
DELETE FROM student_milestones WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';

-- 12. Insert sample data for ANSH (using the known ID)
INSERT INTO student_progress (student_id, category, progress_value, max_value) VALUES
  ('584dd99a-6a33-4a57-9390-56f046e49231', 'courses_completed', 3, 10),
  ('584dd99a-6a33-4a57-9390-56f046e49231', 'certificates_earned', 2, 5),
  ('584dd99a-6a33-4a57-9390-56f046e49231', 'projects_completed', 5, 15);

INSERT INTO student_activities (student_id, activity_type, title, description, points, completed_at) VALUES
  ('584dd99a-6a33-4a57-9390-56f046e49231', 'course_completion', 'Completed React Course', 'Finished the complete React developer course', 100, NOW() - INTERVAL '2 days'),
  ('584dd99a-6a33-4a57-9390-56f046e49231', 'certificate_earned', 'AWS Certified', 'Earned AWS Cloud Practitioner certification', 150, NOW() - INTERVAL '5 days'),
  ('584dd99a-6a33-4a57-9390-56f046e49231', 'project_submission', 'Portfolio Website', 'Created and submitted portfolio website project', 75, NOW() - INTERVAL '1 week');

INSERT INTO student_goals (student_id, title, description, target_value, current_value, category, deadline) VALUES
  ('584dd99a-6a33-4a57-9390-56f046e49231', 'Complete 10 Courses', 'Finish 10 online courses this semester', 10, 3, 'learning', '2024-06-01'),
  ('584dd99a-6a33-4a57-9390-56f046e49231', 'Earn 5 Certificates', 'Obtain 5 professional certificates', 5, 2, 'certification', '2024-08-01'),
  ('584dd99a-6a33-4a57-9390-56f046e49231', 'Build 15 Projects', 'Create 15 coding projects', 15, 5, 'projects', '2024-12-01');

INSERT INTO student_milestones (student_id, title, description, category, points) VALUES
  ('584dd99a-6a33-4a57-9390-56f046e49231', 'First Course Completed', 'Completed your first online course', 'learning', 50),
  ('584dd99a-6a33-4a57-9390-56f046e49231', 'Certificate Achiever', 'Earned your first professional certificate', 'certification', 100),
  ('584dd99a-6a33-4a57-9390-56f046e49231', 'Project Builder', 'Created your first coding project', 'projects', 75);

-- 13. Verify the data was inserted
SELECT 'Sample data inserted successfully!' as status;
SELECT COUNT(*) as progress_records FROM student_progress WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';
SELECT COUNT(*) as activity_records FROM student_activities WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';
SELECT COUNT(*) as goal_records FROM student_goals WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';
SELECT COUNT(*) as milestone_records FROM student_milestones WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';

-- 14. Show table structure for verification
SELECT 'student_progress table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'student_progress' 
ORDER BY ordinal_position;

SELECT 'student_activities table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'student_activities' 
ORDER BY ordinal_position;
