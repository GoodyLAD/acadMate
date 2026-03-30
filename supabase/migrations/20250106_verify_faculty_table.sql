-- Verify faculty table structure and permissions
-- This helps debug the 403 error

-- Check if faculty table exists and show its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'faculty' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'faculty' 
AND schemaname = 'public';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'faculty' 
AND schemaname = 'public';

-- Test admin access (this should work after running the RLS fix)
-- SELECT COUNT(*) FROM public.faculty;
