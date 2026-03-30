-- Fix faculty table RLS policies for admin access
-- This fixes the 403 Forbidden error when admin tries to access faculty table

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all faculty" ON public.faculty;
DROP POLICY IF EXISTS "Admins can insert faculty" ON public.faculty;
DROP POLICY IF EXISTS "Admins can update faculty" ON public.faculty;
DROP POLICY IF EXISTS "Admins can delete faculty" ON public.faculty;

-- Create new comprehensive RLS policies for faculty table
CREATE POLICY "Admins can view all faculty" ON public.faculty
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert faculty" ON public.faculty
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update faculty" ON public.faculty
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete faculty" ON public.faculty
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Also fix student_mentor_assignments table RLS policies
DROP POLICY IF EXISTS "Admins can view all assignments" ON public.student_mentor_assignments;
DROP POLICY IF EXISTS "Admins can insert assignments" ON public.student_mentor_assignments;
DROP POLICY IF EXISTS "Admins can update assignments" ON public.student_mentor_assignments;
DROP POLICY IF EXISTS "Admins can delete assignments" ON public.student_mentor_assignments;

CREATE POLICY "Admins can view all assignments" ON public.student_mentor_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert assignments" ON public.student_mentor_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update assignments" ON public.student_mentor_assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete assignments" ON public.student_mentor_assignments
    FOR DELETE USING (
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
