-- Create faculty record for the current user
-- This ensures there's a faculty record to match against

-- 1. Check if there are any faculty records
SELECT 
    'Current Faculty Records' as info,
    COUNT(*) as total_faculty,
    STRING_AGG(email, ', ') as faculty_emails
FROM public.faculty;

-- 2. Check if the user's email exists in profiles
SELECT 
    'User Profile Check' as info,
    p.id as profile_id,
    p.full_name,
    p.email,
    p.role
FROM public.profiles p
WHERE p.email = 'karan962575@gmail.com'
LIMIT 1;

-- 3. Create a faculty record for the user if it doesn't exist
INSERT INTO public.faculty (
    name, 
    email, 
    department, 
    designation, 
    faculty_code, 
    phone, 
    specialization, 
    is_verified,
    user_id
)
SELECT 
    COALESCE(p.full_name, 'Faculty Member') as name,
    p.email,
    'Computer Science' as department,
    'Assistant Professor' as designation,
    'FAC' || EXTRACT(YEAR FROM NOW()) || LPAD(EXTRACT(DOY FROM NOW())::text, 3, '0') as faculty_code,
    '+1234567890' as phone,
    'Software Engineering' as specialization,
    true as is_verified,
    p.id as user_id
FROM public.profiles p
WHERE p.email = 'karan962575@gmail.com'
AND p.role = 'faculty'
AND NOT EXISTS (
    SELECT 1 FROM public.faculty f WHERE f.email = p.email
);

-- 4. If the above didn't work, create a faculty record without user_id
INSERT INTO public.faculty (
    name, 
    email, 
    department, 
    designation, 
    faculty_code, 
    phone, 
    specialization, 
    is_verified
)
SELECT 
    'Faculty Member' as name,
    'karan962575@gmail.com' as email,
    'Computer Science' as department,
    'Assistant Professor' as designation,
    'FAC' || EXTRACT(YEAR FROM NOW()) || LPAD(EXTRACT(DOY FROM NOW())::text, 3, '0') as faculty_code,
    '+1234567890' as phone,
    'Software Engineering' as specialization,
    true as is_verified
WHERE NOT EXISTS (
    SELECT 1 FROM public.faculty f WHERE f.email = 'karan962575@gmail.com'
);

-- 5. Show the created faculty record
SELECT 
    'Created Faculty Record' as info,
    f.id as faculty_id,
    f.name as faculty_name,
    f.email as faculty_email,
    f.department,
    f.designation,
    f.faculty_code,
    f.is_verified,
    f.user_id
FROM public.faculty f
WHERE f.email = 'karan962575@gmail.com';

-- 6. Update the user's profile role to faculty if it's not already
UPDATE public.profiles 
SET role = 'faculty'::user_role
WHERE email = 'karan962575@gmail.com'
AND role != 'faculty';

-- 7. Show the updated profile
SELECT 
    'Updated Profile' as info,
    p.id as profile_id,
    p.full_name,
    p.email,
    p.role
FROM public.profiles p
WHERE p.email = 'karan962575@gmail.com';
