-- Check current enum values and table structure
-- This helps us understand what we're working with

-- 1. Check if user_role enum exists and what values it has
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') 
        THEN 'user_role enum exists'
        ELSE 'user_role enum does not exist'
    END as enum_status;

-- 2. If it exists, show the values
SELECT 
    unnest(enum_range(NULL::user_role)) as available_roles
WHERE EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role');

-- 3. Check the profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check if there are any existing profiles
SELECT 
    'Current Profiles' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN role::text = 'student' THEN 1 END) as students,
    COUNT(CASE WHEN role::text = 'faculty' THEN 1 END) as faculty,
    COUNT(CASE WHEN role::text = 'admin' THEN 1 END) as admins
FROM public.profiles;
