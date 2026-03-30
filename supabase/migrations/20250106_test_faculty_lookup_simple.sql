-- Simple test for faculty lookup
-- This tests the exact queries the application will use

-- 1. Test faculty lookup by user_id
SELECT 
    'Faculty Lookup by User ID' as test,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.user_id
FROM public.faculty f
WHERE f.user_id = '0d761e65-36f1-407f-b9c2-b8a2064410c6'
LIMIT 1;

-- 2. Test faculty lookup by email (fallback)
SELECT 
    'Faculty Lookup by Email' as test,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.user_id
FROM public.faculty f
WHERE f.email = 'karan962575@gmail.com'
LIMIT 1;

-- 3. Show all faculty records
SELECT 
    'All Faculty Records' as test,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.user_id,
    f.is_verified
FROM public.faculty f
ORDER BY f.created_at DESC;

-- 4. Check if user_id column exists
SELECT 
    'Column Check' as test,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'faculty' 
AND column_name = 'user_id'
AND table_schema = 'public';
