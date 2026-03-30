-- Apply Admin Tables Migration
-- Run this in your Supabase SQL Editor

-- Create faculty table for faculty management
CREATE TABLE IF NOT EXISTS public.faculty (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_mentor_assignments table for mentor assignments
CREATE TABLE IF NOT EXISTS public.student_mentor_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, mentor_id)
);

-- Enable Row Level Security
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mentor_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for faculty table
CREATE POLICY "Admins can manage faculty" ON public.faculty FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'faculty'
      AND profiles.faculty_level = 'admin'
  )
);

-- RLS Policies for student_mentor_assignments table
CREATE POLICY "Admins can manage mentor assignments" ON public.student_mentor_assignments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'faculty'
      AND profiles.faculty_level = 'admin'
  )
);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for timestamp updates
CREATE TRIGGER update_faculty_updated_at
  BEFORE UPDATE ON public.faculty
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_mentor_assignments_updated_at
  BEFORE UPDATE ON public.student_mentor_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faculty_email ON public.faculty(email);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON public.faculty(department);
CREATE INDEX IF NOT EXISTS idx_faculty_is_verified ON public.faculty(is_verified);
CREATE INDEX IF NOT EXISTS idx_student_mentor_assignments_student_id ON public.student_mentor_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_mentor_assignments_mentor_id ON public.student_mentor_assignments(mentor_id);

-- Insert some sample faculty data for testing
INSERT INTO public.faculty (name, email, department, designation, is_verified) VALUES
  ('Dr. Sarah Johnson', 'sarah.johnson@university.edu', 'Computer Science', 'Professor', TRUE),
  ('Dr. Michael Chen', 'michael.chen@university.edu', 'Computer Science', 'Associate Professor', TRUE),
  ('Dr. Emily Rodriguez', 'emily.rodriguez@university.edu', 'Information Technology', 'Assistant Professor', FALSE),
  ('Dr. David Kim', 'david.kim@university.edu', 'Computer Science', 'Lecturer', FALSE)
ON CONFLICT (email) DO NOTHING;

-- Create storage bucket for faculty documents if needed
INSERT INTO storage.buckets (id, name, public)
VALUES ('faculty_documents', 'faculty_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for faculty documents
CREATE POLICY "Admins can upload faculty documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'faculty_documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'faculty'
      AND profiles.faculty_level = 'admin'
  )
);

CREATE POLICY "Admins can view faculty documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'faculty_documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'faculty'
      AND profiles.faculty_level = 'admin'
  )
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.faculty TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.student_mentor_assignments TO postgres, anon, authenticated, service_role;
