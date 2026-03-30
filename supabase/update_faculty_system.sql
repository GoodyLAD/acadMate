-- Update Faculty System for Code-based Assignment
-- Run this in your Supabase SQL Editor

-- Add faculty_code column to faculty table
ALTER TABLE public.faculty ADD COLUMN IF NOT EXISTS faculty_code VARCHAR(10) UNIQUE;
ALTER TABLE public.faculty ADD COLUMN IF NOT EXISTS phone VARCHAR(15);
ALTER TABLE public.faculty ADD COLUMN IF NOT EXISTS specialization TEXT;

-- Update existing faculty with codes
UPDATE public.faculty SET faculty_code = 'CS001' WHERE email = 'sarah.johnson@university.edu';
UPDATE public.faculty SET faculty_code = 'CS002' WHERE email = 'michael.chen@university.edu';
UPDATE public.faculty SET faculty_code = 'IT001' WHERE email = 'emily.rodriguez@university.edu';
UPDATE public.faculty SET faculty_code = 'CS003' WHERE email = 'david.kim@university.edu';

-- Add faculty_code to profiles table for students
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assigned_faculty_code VARCHAR(10);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_roll_number VARCHAR(20);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_faculty_code ON public.faculty(faculty_code);
CREATE INDEX IF NOT EXISTS idx_profiles_faculty_code ON public.profiles(assigned_faculty_code);

-- Update RLS policies
DROP POLICY IF EXISTS "Admins can manage faculty" ON public.faculty;
DROP POLICY IF EXISTS "Admins can manage mentor assignments" ON public.student_mentor_assignments;

-- New RLS policies
CREATE POLICY "Admins can manage faculty" ON public.faculty FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'faculty'
      AND profiles.faculty_level = 'admin'
  )
);

CREATE POLICY "Faculty can view their assigned students" ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.faculty
    WHERE faculty.user_id = auth.uid()
      AND faculty.faculty_code = profiles.assigned_faculty_code
  )
);

-- Grant permissions
GRANT ALL ON public.faculty TO postgres, anon, authenticated, service_role;
GRANT SELECT ON public.profiles TO postgres, anon, authenticated, service_role;
