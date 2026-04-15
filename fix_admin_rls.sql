-- SQL script to comprehensively fix RLS policies for 'student_mentor_assignments'
-- Run this in your Supabase SQL Editor.

-- 1. Drop existing policies to prevent conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "sma_admin_all" ON public.student_mentor_assignments;
  DROP POLICY IF EXISTS "sma_select_own" ON public.student_mentor_assignments;
EXCEPTION WHEN OTHERS THEN 
  NULL; 
END $$;

-- 2. Explicitly Rebuild RLS with proper USING and WITH CHECK clauses
-- Admin can do EVERYTHING (Select, Insert, Update, Delete)
CREATE POLICY "sma_admin_all" ON public.student_mentor_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid()::uuid 
        AND (role = 'admin'::public.user_role OR faculty_level = 'admin'::public.faculty_level)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid()::uuid 
        AND (role = 'admin'::public.user_role OR faculty_level = 'admin'::public.faculty_level)
    )
  );

-- Everyone else can only view their own
CREATE POLICY "sma_select_own" ON public.student_mentor_assignments FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid)
    OR
    mentor_id IN (SELECT id FROM public.faculty WHERE user_id = auth.uid()::uuid)
  );

-- Output success message
DO $$ BEGIN RAISE NOTICE 'student_mentor_assignments RLS policies updated successfully!'; END $$;
