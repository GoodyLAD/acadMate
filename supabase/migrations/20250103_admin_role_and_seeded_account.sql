-- Add admin role support and create seeded admin account
-- This migration adds admin as a valid role and creates a test admin account

-- First, update the user_role enum to include admin
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';

-- Create a seeded admin account for testing
-- Email: admin@sih2.com
-- Password: Admin123! (you should change this in production)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@sih2.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "System Administrator", "role": "admin"}',
  FALSE,
  now(),
  now(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL
) ON CONFLICT (email) DO NOTHING;

-- Create the profile for the seeded admin user
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
  'admin',
  'admin',
  now(),
  now()
FROM auth.users u
WHERE u.email = 'admin@sih2.com'
ON CONFLICT (user_id) DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with roles: student, faculty, admin';
