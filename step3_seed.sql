-- SEED DATA

-- =============================================================================

-- Default VC Issuer
INSERT INTO public.issuers (id, name, did, public_key_jwk, sign_key_id, status)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Smart Student Hub',
  'did:example:smarthub',
  '{"kty":"EC","crv":"P-256","x":"placeholder","y":"placeholder","use":"sig","alg":"ES256","kid":"key-1"}',
  'key-1',
  'active'
);

-- Seeded admin account  →  email: admin@sih2.com  |  password: Admin123!
-- Uses DO block to avoid ON CONFLICT issues with auth.users named indexes.
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Only insert if the admin user doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@sih2.com') THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
      phone, phone_change, phone_change_token,
      email_change_token_new, email_change, email_change_token_current,
      email_change_confirm_status,
      reauthentication_token, confirmation_token, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid,
      admin_id,
      'authenticated',
      'authenticated',
      'admin@sih2.com',
      crypt('Admin123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"System Administrator","role":"admin"}',
      false, now(), now(),
      null, '', '',
      '', '', '',
      0,
      '', '', ''
    );
  END IF;
END $$;

-- Safety-net: profile for admin (trigger fires on INSERT above, but this handles edge cases)
INSERT INTO public.profiles (user_id, full_name, email, role, faculty_level)
SELECT
  id,
  'System Administrator',
  email,
  'admin'::public.user_role,
  'admin'::public.faculty_level
FROM auth.users
WHERE email = 'admin@sih2.com'
ON CONFLICT (user_id) DO NOTHING;

-- Sample faculty
INSERT INTO public.faculty (name, email, department, designation, is_verified) VALUES
  ('Dr. Sarah Johnson',   'sarah.johnson@university.edu',   'Computer Science',       'Professor',           true),
  ('Dr. Michael Chen',    'michael.chen@university.edu',    'Computer Science',       'Associate Professor', true),
  ('Dr. Emily Rodriguez', 'emily.rodriguez@university.edu', 'Information Technology', 'Assistant Professor', false),
  ('Dr. David Kim',       'david.kim@university.edu',       'Computer Science',       'Lecturer',            false);

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
