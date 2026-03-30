-- Complete admin access fix
-- This ensures admin users can access all necessary tables

-- First, ensure the faculty table has all required columns
ALTER TABLE public.faculty ADD COLUMN IF NOT EXISTS faculty_code VARCHAR(10) UNIQUE;
ALTER TABLE public.faculty ADD COLUMN IF NOT EXISTS phone VARCHAR(15);
ALTER TABLE public.faculty ADD COLUMN IF NOT EXISTS specialization TEXT;

-- Add roll_number to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roll_number VARCHAR(20);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_faculty_code ON public.faculty(faculty_code);
CREATE INDEX IF NOT EXISTS idx_roll_number ON public.profiles(roll_number);

-- Drop all existing RLS policies on faculty table
DROP POLICY IF EXISTS "Admins can view all faculty" ON public.faculty;
DROP POLICY IF EXISTS "Admins can insert faculty" ON public.faculty;
DROP POLICY IF EXISTS "Admins can update faculty" ON public.faculty;
DROP POLICY IF EXISTS "Admins can delete faculty" ON public.faculty;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.faculty;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.faculty;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.faculty;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.faculty;

-- Create new RLS policies for faculty table
CREATE POLICY "Admins can do everything with faculty" ON public.faculty
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Drop all existing RLS policies on student_mentor_assignments table
DROP POLICY IF EXISTS "Admins can view all assignments" ON public.student_mentor_assignments;
DROP POLICY IF EXISTS "Admins can insert assignments" ON public.student_mentor_assignments;
DROP POLICY IF EXISTS "Admins can update assignments" ON public.student_mentor_assignments;
DROP POLICY IF EXISTS "Admins can delete assignments" ON public.student_mentor_assignments;

-- Create new RLS policies for student_mentor_assignments table
CREATE POLICY "Admins can do everything with assignments" ON public.student_mentor_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.faculty TO authenticated;
GRANT ALL ON public.student_mentor_assignments TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Ensure the admin user exists and has the correct role
-- This will create a profile for the current user if it doesn't exist
INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
SELECT 
    auth.uid(),
    'Admin User',
    auth.email(),
    'admin',
    now(),
    now()
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid()
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = now();
