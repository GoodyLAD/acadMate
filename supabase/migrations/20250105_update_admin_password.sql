-- Update admin account password to 123456
-- This migration updates the seeded admin account password

-- Update the existing admin account password
UPDATE auth.users
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = 'admin@sih2.com';

-- Ensure the profile exists with admin role
INSERT INTO public.profiles (
  user_id,
  full_name,
  email,
  role,
  faculty_level,
  created_at,
  updated_at
)
SELECT
  u.id,
  'System Administrator',
  u.email,
  'admin'::user_role,
  'admin'::faculty_level,
  now(),
  now()
FROM auth.users u
WHERE u.email = 'admin@sih2.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin'::user_role,
  faculty_level = 'admin'::faculty_level,
  updated_at = now();
