-- Check the actual structure of the faculty table
-- This will help us understand what columns exist

-- 1. Check faculty table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'faculty' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if there's a relationship between faculty and profiles
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name='faculty' OR ccu.table_name='faculty');

-- 3. Show sample faculty data
SELECT 
    'Faculty Data Sample' as info,
    *
FROM public.faculty
LIMIT 3;

-- 4. Check if there's an id column that matches profiles
SELECT 
    'Faculty ID Check' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email
FROM public.faculty f
LIMIT 3;
