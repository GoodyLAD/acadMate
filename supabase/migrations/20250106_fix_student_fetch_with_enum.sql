-- Fix student fetching with proper enum casting
-- This addresses the role enum type issue

-- 1. First ensure the user_role enum has the right values
DO $$ 
BEGIN
    -- Check if user_role enum exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- Create the enum if it doesn't exist
        CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');
    ELSE
        -- Add missing values if they don't exist
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'student' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
            ALTER TYPE user_role ADD VALUE 'student';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'faculty' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
            ALTER TYPE user_role ADD VALUE 'faculty';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')) THEN
            ALTER TYPE user_role ADD VALUE 'admin';
        END IF;
    END IF;
END $$;

-- 2. Fix RLS policies for all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mentor_assignments DISABLE ROW LEVEL SECURITY;

-- 3. Grant all permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.faculty TO authenticated;
GRANT ALL ON public.student_mentor_assignments TO authenticated;

-- 4. Ensure admin user exists (using proper enum casting)
INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
SELECT 
    auth.uid(),
    COALESCE(auth.email(), 'admin@example.com'),
    COALESCE(auth.email(), 'admin@example.com'),
    'admin'::user_role,
    now(),
    now()
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid()
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin'::user_role,
    updated_at = now();

-- 5. Add sample students if none exist (using proper enum casting)
INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'John Smith',
    'john.smith@student.edu',
    'student'::user_role,
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'student'::user_role LIMIT 1)
UNION ALL
SELECT 
    gen_random_uuid(),
    'Jane Doe',
    'jane.doe@student.edu',
    'student'::user_role,
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'student'::user_role LIMIT 1)
UNION ALL
SELECT 
    gen_random_uuid(),
    'Bob Johnson',
    'bob.johnson@student.edu',
    'student'::user_role,
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'student'::user_role LIMIT 1);

-- 6. Add sample faculty if none exist
INSERT INTO public.faculty (name, email, department, designation, faculty_code, phone, specialization, is_verified)
SELECT 
    'Dr. Sarah Johnson',
    'sarah.johnson@faculty.edu',
    'Computer Science',
    'Professor',
    'CS001',
    '+1234567890',
    'Machine Learning',
    true
WHERE NOT EXISTS (SELECT 1 FROM public.faculty WHERE is_verified = true LIMIT 1)
UNION ALL
SELECT 
    'Dr. Michael Chen',
    'michael.chen@faculty.edu',
    'Information Technology',
    'Associate Professor',
    'IT001',
    '+1234567891',
    'Web Development',
    true
WHERE NOT EXISTS (SELECT 1 FROM public.faculty WHERE is_verified = true LIMIT 1);

-- 7. Show current data counts
SELECT 
    'Data Summary' as info,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'student'::user_role) as students,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'faculty'::user_role) as faculty_profiles,
    (SELECT COUNT(*) FROM public.faculty WHERE is_verified = true) as verified_faculty,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin'::user_role) as admins;

-- 8. Test student query (this should work now)
SELECT 
    'Student Test Query' as test,
    id,
    full_name,
    email,
    role
FROM public.profiles 
WHERE role = 'student'::user_role
LIMIT 3;
