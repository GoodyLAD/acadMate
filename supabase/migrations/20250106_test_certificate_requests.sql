-- Test script to check if certificate requests from assigned students show up
-- This will help us debug why faculty dashboard isn't showing student requests

-- 1. Check if certificates table exists
SELECT 'Certificates Table Check' as info,
       CASE 
         WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'certificates' AND table_schema = 'public') 
         THEN 'EXISTS' 
         ELSE 'NOT EXISTS' 
       END as table_status;

-- 2. Check certificates table structure
SELECT 'Certificates Table Structure' as info,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'certificates'
ORDER BY ordinal_position;

-- 3. Check if there are any certificates in the database
SELECT 'All Certificates' as info,
       COUNT(*) as total_certificates
FROM public.certificates;

-- 4. Show all certificates with student details
SELECT 'All Certificates with Student Details' as info,
       c.id as certificate_id,
       c.title,
       c.description,
       c.category,
       c.status,
       c.uploaded_at,
       p.full_name as student_name,
       p.email as student_email
FROM public.certificates c
LEFT JOIN public.profiles p ON c.student_id = p.id
ORDER BY c.uploaded_at DESC;

-- 5. Check faculty assignments
SELECT 'Faculty Assignments' as info,
       f.email as faculty_email,
       f.name as faculty_name,
       p.full_name as student_name,
       p.email as student_email,
       sma.created_at as assigned_at
FROM public.student_mentor_assignments sma
JOIN public.faculty f ON sma.mentor_id = f.id
JOIN public.profiles p ON sma.student_id = p.id
ORDER BY sma.created_at DESC;

-- 6. Check if there are certificates from assigned students
SELECT 'Certificates from Assigned Students' as info,
       c.id as certificate_id,
       c.title,
       c.status,
       p.full_name as student_name,
       p.email as student_email,
       f.name as faculty_name,
       f.email as faculty_email,
       c.uploaded_at
FROM public.certificates c
JOIN public.profiles p ON c.student_id = p.id
JOIN public.student_mentor_assignments sma ON p.id = sma.student_id
JOIN public.faculty f ON sma.mentor_id = f.id
WHERE f.email = 'karan962575@gmail.com'
ORDER BY c.uploaded_at DESC;

-- 7. Test the exact query the faculty dashboard uses
WITH faculty_info AS (
    SELECT id as faculty_id FROM public.faculty WHERE email = 'karan962575@gmail.com'
),
assigned_students AS (
    SELECT sma.student_id
    FROM public.student_mentor_assignments sma
    JOIN faculty_info f ON sma.mentor_id = f.faculty_id
)
SELECT 'Faculty Dashboard Query Test' as info,
       c.id as certificate_id,
       c.title,
       c.status,
       p.full_name as student_name,
       p.email as student_email,
       c.uploaded_at
FROM public.certificates c
JOIN public.profiles p ON c.student_id = p.id
JOIN assigned_students a ON p.id = a.student_id
ORDER BY c.uploaded_at DESC;

-- 8. Create a test certificate for ansh if none exist
INSERT INTO public.certificates (
    id,
    student_id,
    title,
    description,
    category,
    status,
    file_url,
    file_name,
    uploaded_at
)
SELECT 
    gen_random_uuid(),
    p.id,
    'Test Certificate for Ansh',
    'This is a test certificate to verify faculty dashboard functionality',
    'academic',
    'pending',
    'https://example.com/test-certificate.pdf',
    'test-certificate.pdf',
    now()
FROM public.profiles p
WHERE p.role::text = 'student' 
AND (LOWER(p.full_name) LIKE '%ansh%' OR LOWER(p.email) LIKE '%ansh%')
AND NOT EXISTS (
    SELECT 1 FROM public.certificates c2 
    WHERE c2.student_id = p.id 
    AND c2.title = 'Test Certificate for Ansh'
);

-- 9. Show the final result after creating test certificate
SELECT 'Final Result - Test Certificate Created' as info,
       c.id as certificate_id,
       c.title,
       c.status,
       p.full_name as student_name,
       p.email as student_email,
       f.name as faculty_name,
       f.email as faculty_email,
       c.uploaded_at
FROM public.certificates c
JOIN public.profiles p ON c.student_id = p.id
JOIN public.student_mentor_assignments sma ON p.id = sma.student_id
JOIN public.faculty f ON sma.mentor_id = f.id
WHERE f.email = 'karan962575@gmail.com'
ORDER BY c.uploaded_at DESC;
