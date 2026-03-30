-- Fix real student fetching for admin assignment system
-- This ensures the system can fetch actual logged-in students

-- 1. First, let's check what the current role column looks like
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'role'
AND table_schema = 'public';

-- 2. Check if there are any existing students
SELECT 
    'Current Students' as info,
    COUNT(*) as total_students,
    array_agg(DISTINCT role::text) as role_types
FROM public.profiles;

-- 3. If the role column is an enum, we need to handle it properly
-- Let's create a function to safely get students
CREATE OR REPLACE FUNCTION get_students_for_assignment()
RETURNS TABLE (
    id uuid,
    full_name text,
    email text,
    role text,
    created_at timestamptz,
    updated_at timestamptz
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        p.id,
        p.full_name,
        p.email,
        p.role::text as role,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    WHERE p.role::text = 'student'
    ORDER BY p.full_name;
$$;

-- 4. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_students_for_assignment() TO authenticated;

-- 5. Test the function
SELECT * FROM get_students_for_assignment() LIMIT 5;

-- 6. Also create a function to get faculty
CREATE OR REPLACE FUNCTION get_faculty_for_assignment()
RETURNS TABLE (
    id uuid,
    name text,
    email text,
    department text,
    designation text,
    faculty_code text,
    phone text,
    specialization text,
    is_verified boolean
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        f.id,
        f.name,
        f.email,
        f.department,
        f.designation,
        f.faculty_code,
        f.phone,
        f.specialization,
        f.is_verified
    FROM public.faculty f
    WHERE f.is_verified = true
    ORDER BY f.name;
$$;

-- 7. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_faculty_for_assignment() TO authenticated;

-- 8. Test the faculty function
SELECT * FROM get_faculty_for_assignment() LIMIT 5;

-- 9. Show summary of available data
SELECT 
    'Data Summary' as info,
    (SELECT COUNT(*) FROM get_students_for_assignment()) as students,
    (SELECT COUNT(*) FROM get_faculty_for_assignment()) as verified_faculty,
    (SELECT COUNT(*) FROM public.profiles WHERE role::text = 'admin') as admins;
