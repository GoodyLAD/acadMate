-- Check admin user and role
-- This helps verify the admin user has the correct role

-- Check current user's profile
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
WHERE id = auth.uid();

-- Check all admin users
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
WHERE role = 'admin';

-- Check if the current user is authenticated
SELECT auth.uid() as current_user_id, auth.role() as current_user_role;
