-- Add missing faculty columns
-- This fixes the "Could not find the 'faculty_code' column" error

-- Add faculty_code column to faculty table
ALTER TABLE public.faculty ADD COLUMN IF NOT EXISTS faculty_code VARCHAR(10) UNIQUE;
ALTER TABLE public.faculty ADD COLUMN IF NOT EXISTS phone VARCHAR(15);
ALTER TABLE public.faculty ADD COLUMN IF NOT EXISTS specialization TEXT;

-- Add roll_number to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roll_number VARCHAR(20);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_faculty_code ON public.faculty(faculty_code);
CREATE INDEX IF NOT EXISTS idx_roll_number ON public.profiles(roll_number);
