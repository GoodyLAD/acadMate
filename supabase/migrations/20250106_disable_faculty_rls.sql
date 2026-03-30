-- Temporarily disable RLS for faculty table to fix admin access
-- This allows admin dashboard to work while we debug the RLS policies

-- Disable RLS on faculty table
ALTER TABLE public.faculty DISABLE ROW LEVEL SECURITY;

-- Disable RLS on student_mentor_assignments table
ALTER TABLE public.student_mentor_assignments DISABLE ROW LEVEL SECURITY;

-- Ensure admin user exists
INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
SELECT 
    auth.uid(),
    COALESCE(auth.email(), 'admin@example.com'),
    COALESCE(auth.email(), 'admin@example.com'),
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

-- Grant all permissions
GRANT ALL ON public.faculty TO authenticated;
GRANT ALL ON public.student_mentor_assignments TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Show current user info
SELECT 
    'Current User Info' as info,
    auth.uid() as user_id,
    auth.role() as auth_role,
    p.role as profile_role,
    p.email,
    p.full_name
FROM public.profiles p
WHERE p.id = auth.uid();
