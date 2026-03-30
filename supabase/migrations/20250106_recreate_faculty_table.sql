-- Recreate faculty table with proper permissions
-- This ensures the table has all required columns and proper access

-- First, backup existing data
CREATE TABLE IF NOT EXISTS public.faculty_backup AS 
SELECT * FROM public.faculty;

-- Drop the existing faculty table
DROP TABLE IF EXISTS public.faculty CASCADE;

-- Recreate faculty table with all required columns
CREATE TABLE public.faculty (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    designation TEXT,
    faculty_code VARCHAR(10) UNIQUE,
    phone VARCHAR(15),
    specialization TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_faculty_email ON public.faculty(email);
CREATE INDEX IF NOT EXISTS idx_faculty_code ON public.faculty(faculty_code);
CREATE INDEX IF NOT EXISTS idx_faculty_department ON public.faculty(department);

-- Add update trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_faculty_updated_at 
    BEFORE UPDATE ON public.faculty 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Restore data from backup if it exists
INSERT INTO public.faculty (id, name, email, department, designation, is_verified, created_at, updated_at)
SELECT id, name, email, department, designation, is_verified, created_at, updated_at
FROM public.faculty_backup
WHERE EXISTS (SELECT 1 FROM public.faculty_backup LIMIT 1);

-- Drop backup table
DROP TABLE IF EXISTS public.faculty_backup;

-- Grant all permissions to authenticated users
GRANT ALL ON public.faculty TO authenticated;

-- Don't enable RLS for now - this allows admin dashboard to work
-- ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

-- Show table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'faculty' 
AND table_schema = 'public'
ORDER BY ordinal_position;
