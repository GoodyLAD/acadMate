-- Simple fix for student tables without complex constraints
-- This migration fixes the foreign key issues and adds sample data

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

-- Clear any existing data to avoid conflicts
DELETE FROM student_progress WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';
DELETE FROM student_activities WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';
DELETE FROM student_goals WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';
DELETE FROM student_milestones WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';

-- Insert sample data for ANSH (using the known ID)
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

-- Verify the data was inserted
SELECT 'Sample data inserted successfully!' as status;
SELECT COUNT(*) as progress_records FROM student_progress WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';
SELECT COUNT(*) as activity_records FROM student_activities WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';
SELECT COUNT(*) as goal_records FROM student_goals WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';
SELECT COUNT(*) as milestone_records FROM student_milestones WHERE student_id = '584dd99a-6a33-4a57-9390-56f046e49231';

