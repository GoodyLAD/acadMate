-- SQL Script to add 2 Teachers (Faculty) and 10 Students
-- You can run this directly in your Supabase SQL Editor.
-- The default password for all these users is "Password123!"

DO $$
DECLARE
  pwd_hash text;
  i integer;
  uid uuid;
BEGIN
  -- Generate a common crypt hash for the password "Password123!"
  pwd_hash := crypt('Password123!', gen_salt('bf'));

  -- ==========================================
  -- 1. ADD 2 TEACHERS
  -- ==========================================
  FOR i IN 1..2 LOOP
    uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
      phone_change, phone_change_token, email_change_token_new, email_change, 
      email_change_token_current, email_change_confirm_status, reauthentication_token, 
      confirmation_token, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid,
      uid, 'authenticated', 'authenticated', 
      'teacher' || i || '@university.edu', pwd_hash, now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', 'Teacher ' || i, 'role', 'faculty'),
      false, now(), now(),
      '', '', '', '', '', 0, '', '', ''
    );
    
    -- Option: Also insert them into the public.faculty table explicitly
    INSERT INTO public.faculty (name, email, department, designation, is_verified, user_id)
    VALUES (
      'Teacher ' || i, 
      'teacher' || i || '@university.edu', 
      'Computer Science', 
      'Assistant Professor', 
      true, 
      uid
    );
  END LOOP;

  -- ==========================================
  -- 2. ADD 10 STUDENTS
  -- ==========================================
  FOR i IN 1..10 LOOP
    uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
      phone_change, phone_change_token, email_change_token_new, email_change, 
      email_change_token_current, email_change_confirm_status, reauthentication_token, 
      confirmation_token, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid,
      uid, 'authenticated', 'authenticated', 
      'student' || i || '@university.edu', pwd_hash, now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', 'Student ' || i, 'role', 'student'),
      false, now(), now(),
      '', '', '', '', '', 0, '', '', ''
    );
  END LOOP;

END $$;
