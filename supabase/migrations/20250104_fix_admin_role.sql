-- Fix admin role support by recreating the enum with admin included
-- This migration properly adds admin to the user_role enum

-- First, we need to drop the existing enum and recreate it with admin
-- But we need to be careful about existing data

-- Create a new enum with admin included
CREATE TYPE public.user_role_new AS ENUM ('student', 'faculty', 'admin');

-- Update the profiles table to use the new enum
ALTER TABLE public.profiles ALTER COLUMN role TYPE public.user_role_new
  USING (role::text::public.user_role_new);

-- Drop the old enum
DROP TYPE public.user_role;

-- Rename the new enum to the original name
ALTER TYPE public.user_role_new RENAME TO user_role;

-- Update the handle_new_user function to accept admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'faculty' THEN 'faculty'::user_role
      ELSE 'student'::user_role
    END
  );
  RETURN NEW;
END;
$$;

-- Create a test admin account for immediate use
-- Email: admin@sih2.com
-- Password: Admin123!
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

-- Create the profile for the test admin user
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
ON CONFLICT (user_id) DO NOTHING;
