-- Add recommendation system columns to profiles table
-- This migration adds columns to support the AI-powered course recommendation system

-- Add new columns to profiles table for recommendation system
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS certifications text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS career_goals text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS experience_level text DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS preferred_learning_style text DEFAULT 'mixed' CHECK (preferred_learning_style IN ('visual', 'hands-on', 'theoretical', 'mixed')),
ADD COLUMN IF NOT EXISTS completed_courses text[] DEFAULT '{}';

-- Create index for better query performance on recommendation columns
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON profiles USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_profiles_certifications ON profiles USING GIN (certifications);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_profiles_career_goals ON profiles USING GIN (career_goals);
CREATE INDEX IF NOT EXISTS idx_profiles_experience_level ON profiles (experience_level);
CREATE INDEX IF NOT EXISTS idx_profiles_completed_courses ON profiles USING GIN (completed_courses);

-- Add comments for documentation
COMMENT ON COLUMN profiles.interests IS 'Array of student interests for course recommendations';
COMMENT ON COLUMN profiles.certifications IS 'Array of student certifications for course recommendations';
COMMENT ON COLUMN profiles.skills IS 'Array of student skills for course recommendations';
COMMENT ON COLUMN profiles.career_goals IS 'Array of student career goals for course recommendations';
COMMENT ON COLUMN profiles.experience_level IS 'Student experience level: beginner, intermediate, or advanced';
COMMENT ON COLUMN profiles.preferred_learning_style IS 'Student preferred learning style: visual, hands-on, theoretical, or mixed';
COMMENT ON COLUMN profiles.completed_courses IS 'Array of completed course IDs for tracking progress';

-- Create a function to update completed courses when a student enrolls
CREATE OR REPLACE FUNCTION update_completed_courses()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be called when a student completes a course
  -- For now, it's a placeholder for future implementation
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for updating completed courses (placeholder for future use)
-- DROP TRIGGER IF EXISTS trigger_update_completed_courses ON course_enrollments;
-- CREATE TRIGGER trigger_update_completed_courses
--   AFTER INSERT OR UPDATE ON course_enrollments
--   FOR EACH ROW
--   EXECUTE FUNCTION update_completed_courses();

-- Insert some sample data for testing (optional)
-- UPDATE profiles 
-- SET 
--   interests = ARRAY['web_development', 'data_science'],
--   certifications = ARRAY['aws_certified'],
--   skills = ARRAY['javascript', 'python', 'react'],
--   career_goals = ARRAY['software engineer', 'data scientist'],
--   experience_level = 'intermediate',
--   preferred_learning_style = 'hands-on'
-- WHERE role = 'student' 
-- AND id = '584dd99a-6a33-4a57-9390-56f046e49231'; -- ANSH's profile

