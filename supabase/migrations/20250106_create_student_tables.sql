-- Create missing student-related tables
-- This migration creates the tables that useStudent.ts expects

-- Create student_progress table or add missing columns if it exists
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE student_progress 
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS progress_value INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_value INTEGER DEFAULT 100;

-- Create student_activities table
CREATE TABLE IF NOT EXISTS student_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_goals table
CREATE TABLE IF NOT EXISTS student_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  category VARCHAR(50),
  deadline DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_connections table
CREATE TABLE IF NOT EXISTS student_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, connection_id)
);

-- Create student_milestones table
CREATE TABLE IF NOT EXISTS student_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category VARCHAR(50),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_student_id ON student_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_student_goals_student_id ON student_goals(student_id);
CREATE INDEX IF NOT EXISTS idx_student_connections_student_id ON student_connections(student_id);
CREATE INDEX IF NOT EXISTS idx_student_connections_connection_id ON student_connections(connection_id);
CREATE INDEX IF NOT EXISTS idx_student_milestones_student_id ON student_milestones(student_id);

-- Enable RLS (Row Level Security)
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Students can only see their own data
CREATE POLICY "Students can view own progress" ON student_progress
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can view own activities" ON student_activities
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can view own goals" ON student_goals
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can view own connections" ON student_connections
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = connection_id);

CREATE POLICY "Students can view own milestones" ON student_milestones
  FOR SELECT USING (auth.uid() = student_id);

-- Students can insert their own data
CREATE POLICY "Students can insert own progress" ON student_progress
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can insert own activities" ON student_activities
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can insert own goals" ON student_goals
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can insert own connections" ON student_connections
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can insert own milestones" ON student_milestones
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Students can update their own data
CREATE POLICY "Students can update own progress" ON student_progress
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Students can update own activities" ON student_activities
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Students can update own goals" ON student_goals
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Students can update own connections" ON student_connections
  FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = connection_id);

CREATE POLICY "Students can update own milestones" ON student_milestones
  FOR UPDATE USING (auth.uid() = student_id);

-- Insert some sample data for testing
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

-- Add comments for documentation
COMMENT ON TABLE student_progress IS 'Tracks student progress in various categories';
COMMENT ON TABLE student_activities IS 'Records student activities and achievements';
COMMENT ON TABLE student_goals IS 'Stores student learning goals and targets';
COMMENT ON TABLE student_connections IS 'Manages connections between students';
COMMENT ON TABLE student_milestones IS 'Tracks student milestones and achievements';