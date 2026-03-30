-- Fix existing student tables by adding missing columns
-- This migration adds missing columns to existing tables

-- Fix student_progress table
ALTER TABLE student_progress 
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS progress_value INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_value INTEGER DEFAULT 100;

-- Create student_activities table if it doesn't exist
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

-- Create student_goals table if it doesn't exist
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

-- Create student_connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, connection_id)
);

-- Create student_milestones table if it doesn't exist
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

-- Enable RLS (Row Level Security) if not already enabled
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  -- Students can only see their own data
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_progress' AND policyname = 'Students can view own progress') THEN
    CREATE POLICY "Students can view own progress" ON student_progress
      FOR SELECT USING (auth.uid() = student_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_activities' AND policyname = 'Students can view own activities') THEN
    CREATE POLICY "Students can view own activities" ON student_activities
      FOR SELECT USING (auth.uid() = student_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_goals' AND policyname = 'Students can view own goals') THEN
    CREATE POLICY "Students can view own goals" ON student_goals
      FOR SELECT USING (auth.uid() = student_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_connections' AND policyname = 'Students can view own connections') THEN
    CREATE POLICY "Students can view own connections" ON student_connections
      FOR SELECT USING (auth.uid() = student_id OR auth.uid() = connection_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_milestones' AND policyname = 'Students can view own milestones') THEN
    CREATE POLICY "Students can view own milestones" ON student_milestones
      FOR SELECT USING (auth.uid() = student_id);
  END IF;
END $$;

-- Insert sample data only if tables are empty
INSERT INTO student_progress (student_id, category, progress_value, max_value) 
SELECT '584dd99a-6a33-4a57-9390-56f046e49231', 'courses_completed', 3, 10
WHERE NOT EXISTS (SELECT 1 FROM student_progress WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231');

INSERT INTO student_progress (student_id, category, progress_value, max_value) 
SELECT '584dd99a-6a33-4a57-9390-56f046e49231', 'certificates_earned', 2, 5
WHERE NOT EXISTS (SELECT 1 FROM student_progress WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231' AND category = 'certificates_earned');

INSERT INTO student_progress (student_id, category, progress_value, max_value) 
SELECT '584dd99a-6a33-4a57-9390-56f046e49231', 'projects_completed', 5, 15
WHERE NOT EXISTS (SELECT 1 FROM student_progress WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231' AND category = 'projects_completed');

-- Add comments for documentation
COMMENT ON TABLE student_progress IS 'Tracks student progress in various categories';
COMMENT ON TABLE student_activities IS 'Records student activities and achievements';
COMMENT ON TABLE student_goals IS 'Stores student learning goals and targets';
COMMENT ON TABLE student_connections IS 'Manages connections between students';
COMMENT ON TABLE student_milestones IS 'Tracks student milestones and achievements';