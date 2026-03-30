-- Test the complete real certificate flow from student upload to faculty dashboard
-- This verifies that real certificate uploads will show up in faculty dashboard

-- 1. First, let's see the current state
SELECT 'Current State Check' as info,
       (SELECT COUNT(*) FROM public.certificates) as total_certificates,
       (SELECT COUNT(*) FROM public.certificates WHERE status = 'pending') as pending_certificates,
       (SELECT COUNT(*) FROM public.student_mentor_assignments) as total_assignments;

-- 2. Show all certificates with their assignment status
SELECT 'All Certificates with Assignment Status' as info,
       c.id as certificate_id,
       c.title,
       c.status,
       c.uploaded_at,
       p.full_name as student_name,
       p.email as student_email,
       CASE 
         WHEN sma.id IS NOT NULL THEN 'ASSIGNED TO FACULTY'
         ELSE 'NOT ASSIGNED'
       END as assignment_status,
       f.name as faculty_name,
       f.email as faculty_email
FROM public.certificates c
JOIN public.profiles p ON c.student_id = p.id
LEFT JOIN public.student_mentor_assignments sma ON p.id = sma.student_id
LEFT JOIN public.faculty f ON sma.mentor_id = f.id
ORDER BY c.uploaded_at DESC;

-- 3. Test the exact faculty dashboard query for karan962575@gmail.com
WITH faculty_info AS (
    SELECT id as faculty_id FROM public.faculty WHERE email = 'karan962575@gmail.com'
),
assigned_students AS (
    SELECT sma.student_id
    FROM public.student_mentor_assignments sma
    JOIN faculty_info f ON sma.mentor_id = f.faculty_id
)
SELECT 'Faculty Dashboard Query - Real Data' as info,
       c.id as certificate_id,
       c.title,
       c.description,
       c.category,
       c.status,
       c.file_name,
       c.uploaded_at,
       p.full_name as student_name,
       p.email as student_email,
       p.student_id as student_roll_number
FROM public.certificates c
JOIN public.profiles p ON c.student_id = p.id
JOIN assigned_students a ON p.id = a.student_id
ORDER BY c.uploaded_at DESC;

-- 4. Create a realistic certificate upload simulation
-- This simulates what happens when a student uploads a certificate
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
    'Advanced Programming Certificate',
    'Completed advanced programming course with distinction',
    'academic',
    'pending',
    'https://storage.supabase.co/certificates/' || p.user_id || '/' || extract(epoch from now()) || '.pdf',
    'advanced_programming_certificate.pdf',
    now()
FROM public.profiles p
WHERE p.role::text = 'student' 
AND (LOWER(p.full_name) LIKE '%ansh%' OR LOWER(p.email) LIKE '%ansh%')
AND NOT EXISTS (
    SELECT 1 FROM public.certificates c2 
    WHERE c2.student_id = p.id 
    AND c2.title = 'Advanced Programming Certificate'
);

-- 5. Create another realistic certificate
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
    'Hackathon Winner Certificate',
    'First place in university hackathon competition',
    'co_curricular',
    'pending',
    'https://storage.supabase.co/certificates/' || p.user_id || '/' || extract(epoch from now()) || '.pdf',
    'hackathon_winner_certificate.pdf',
    now() - interval '2 days'
FROM public.profiles p
WHERE p.role::text = 'student' 
AND (LOWER(p.full_name) LIKE '%ansh%' OR LOWER(p.email) LIKE '%ansh%')
AND NOT EXISTS (
    SELECT 1 FROM public.certificates c2 
    WHERE c2.student_id = p.id 
    AND c2.title = 'Hackathon Winner Certificate'
);

-- 6. Show the final result - what faculty dashboard will see
SELECT 'FINAL RESULT - Faculty Dashboard View' as info,
       c.id as certificate_id,
       c.title,
       c.description,
       c.category,
       c.status,
       c.file_name,
       c.uploaded_at,
       p.full_name as student_name,
       p.email as student_email,
       p.student_id as student_roll_number,
       f.name as faculty_name,
       f.email as faculty_email
FROM public.certificates c
JOIN public.profiles p ON c.student_id = p.id
JOIN public.student_mentor_assignments sma ON p.id = sma.student_id
JOIN public.faculty f ON sma.mentor_id = f.id
WHERE f.email = 'karan962575@gmail.com'
ORDER BY c.uploaded_at DESC;

-- 7. Show statistics for faculty dashboard
SELECT 'Faculty Dashboard Statistics' as info,
       COUNT(*) as total_certificates,
       COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending_certificates,
       COUNT(CASE WHEN c.status = 'approved' THEN 1 END) as approved_certificates,
       COUNT(CASE WHEN c.status = 'rejected' THEN 1 END) as rejected_certificates
FROM public.certificates c
JOIN public.profiles p ON c.student_id = p.id
JOIN public.student_mentor_assignments sma ON p.id = sma.student_id
JOIN public.faculty f ON sma.mentor_id = f.id
WHERE f.email = 'karan962575@gmail.com';

-- 8. Test the exact query structure that the faculty dashboard uses
-- This is the exact query from the updated FacultyDashboard.tsx
WITH faculty_info AS (
    SELECT id as faculty_id FROM public.faculty WHERE email = 'karan962575@gmail.com'
),
assigned_students AS (
    SELECT sma.student_id
    FROM public.student_mentor_assignments sma
    JOIN faculty_info f ON sma.mentor_id = f.faculty_id
)
SELECT 'EXACT FACULTY DASHBOARD QUERY' as info,
       c.id as certificate_id,
       c.title,
       c.description,
       c.category,
       c.status,
       c.file_url,
       c.file_name,
       c.uploaded_at,
       p.id as student_id,
       p.full_name as student_name,
       p.email as student_email,
       p.student_id as student_roll_number,
       p.department as student_department
FROM public.certificates c
JOIN public.profiles p ON c.student_id = p.id
JOIN assigned_students a ON p.id = a.student_id
ORDER BY c.uploaded_at DESC;
