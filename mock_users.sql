-- =============================================================================
-- SIH2 SEED DATA — 1 Admin, 2 Faculty, 10 Students
-- Password for ALL accounts: Test@1234
-- Faculty 1 → Students 1-5 | Faculty 2 → Students 6-10
-- Run this in the Supabase SQL Editor AFTER running supabase_complete_schema.sql
-- =============================================================================

DO $$
DECLARE
  -- ── Auth UUIDs (auth.users) ────────────────────────────────────────────────
  -- NOTE: UUIDs only allow hex chars: 0-9 and a-f
  uid_admin  uuid := 'a0000000-0000-0000-0000-000000000001';
  uid_fac1   uuid := 'f1000000-0000-0000-0000-000000000001';
  uid_fac2   uuid := 'f2000000-0000-0000-0000-000000000001';
  uid_stu1   uuid := 'c1000000-0000-0000-0000-000000000001';
  uid_stu2   uuid := 'c2000000-0000-0000-0000-000000000001';
  uid_stu3   uuid := 'c3000000-0000-0000-0000-000000000001';
  uid_stu4   uuid := 'c4000000-0000-0000-0000-000000000001';
  uid_stu5   uuid := 'c5000000-0000-0000-0000-000000000001';
  uid_stu6   uuid := 'c6000000-0000-0000-0000-000000000001';
  uid_stu7   uuid := 'c7000000-0000-0000-0000-000000000001';
  uid_stu8   uuid := 'c8000000-0000-0000-0000-000000000001';
  uid_stu9   uuid := 'c9000000-0000-0000-0000-000000000001';
  uid_stu10  uuid := 'ca000000-0000-0000-0000-000000000001';

  -- ── Profile UUIDs (public.profiles) ───────────────────────────────────────
  pid_admin  uuid := 'a0000000-0000-0000-0000-000000000002';
  pid_fac1   uuid := 'f1000000-0000-0000-0000-000000000002';
  pid_fac2   uuid := 'f2000000-0000-0000-0000-000000000002';
  pid_stu1   uuid := 'c1000000-0000-0000-0000-000000000002';
  pid_stu2   uuid := 'c2000000-0000-0000-0000-000000000002';
  pid_stu3   uuid := 'c3000000-0000-0000-0000-000000000002';
  pid_stu4   uuid := 'c4000000-0000-0000-0000-000000000002';
  pid_stu5   uuid := 'c5000000-0000-0000-0000-000000000002';
  pid_stu6   uuid := 'c6000000-0000-0000-0000-000000000002';
  pid_stu7   uuid := 'c7000000-0000-0000-0000-000000000002';
  pid_stu8   uuid := 'c8000000-0000-0000-0000-000000000002';
  pid_stu9   uuid := 'c9000000-0000-0000-0000-000000000002';
  pid_stu10  uuid := 'ca000000-0000-0000-0000-000000000002';

  -- ── Faculty table UUIDs (public.faculty) ──────────────────────────────────
  fid_admin  uuid := 'a0000000-0000-0000-0000-000000000003';
  fid_fac1   uuid := 'f1000000-0000-0000-0000-000000000003';
  fid_fac2   uuid := 'f2000000-0000-0000-0000-000000000003';

  -- ── Shared hashed password ─────────────────────────────────────────────────
  hashed_pw  text;

BEGIN
  hashed_pw := crypt('Test@1234', gen_salt('bf', 10));

  -- ===========================================================================
  -- STEP 1 — auth.users (login credentials)
  -- ===========================================================================
  INSERT INTO auth.users (
    id, instance_id,
    email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, raw_app_meta_data,
    role, aud,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    is_super_admin
  ) VALUES
    -- Admin
    (uid_admin, '00000000-0000-0000-0000-000000000000',
     'admin@sih2.edu', hashed_pw, now(),
     '{"full_name":"Dr. Admin Singh","role":"faculty"}',
     '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '', false),

    -- Faculty 1
    (uid_fac1, '00000000-0000-0000-0000-000000000000',
     'rajesh.kumar@sih2.edu', hashed_pw, now(),
     '{"full_name":"Prof. Rajesh Kumar","role":"faculty"}',
     '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '', false),

    -- Faculty 2
    (uid_fac2, '00000000-0000-0000-0000-000000000000',
     'priya.sharma@sih2.edu', hashed_pw, now(),
     '{"full_name":"Prof. Priya Sharma","role":"faculty"}',
     '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '', false),

    -- Student 1
    (uid_stu1, '00000000-0000-0000-0000-000000000000',
     'aarav.patel@sih2.edu', hashed_pw, now(),
     '{"full_name":"Aarav Patel","role":"student"}',
     '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '', false),

    -- Student 2
    (uid_stu2, '00000000-0000-0000-0000-000000000000',
     'sneha.iyer@sih2.edu', hashed_pw, now(),
     '{"full_name":"Sneha Iyer","role":"student"}',
     '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '', false),

    -- Student 3
    (uid_stu3, '00000000-0000-0000-0000-000000000000',
     'rohan.mehta@sih2.edu', hashed_pw, now(),
     '{"full_name":"Rohan Mehta","role":"student"}',
     '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '', false),

    -- Student 4
    (uid_stu4, '00000000-0000-0000-0000-000000000000',
     'ananya.singh@sih2.edu', hashed_pw, now(),
     '{"full_name":"Ananya Singh","role":"student"}',
     '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '', false),

    -- Student 5
    (uid_stu5, '00000000-0000-0000-0000-000000000000',
     'karan.verma@sih2.edu', hashed_pw, now(),
     '{"full_name":"Karan Verma","role":"student"}',
     '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '', false),

    -- Student 6
    (uid_stu6, '00000000-0000-0000-0000-000000000000',
     'neha.gupta@sih2.edu', hashed_pw, now(),
     '{"full_name":"Neha Gupta","role":"student"}',
     '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '', false),

    -- Student 7
    (uid_stu7, '00000000-0000-0000-0000-000000000000',
     'arjun.nair@sih2.edu', hashed_pw, now(),
     '{"full_name":"Arjun Nair","role":"student"}',
     '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '', false),

    -- Student 8
    (uid_stu8, '00000000-0000-0000-0000-000000000000',
     'divya.reddy@sih2.edu', hashed_pw, now(),
     '{"full_name":"Divya Reddy","role":"student"}',
     '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '', false),

    -- Student 9
    (uid_stu9, '00000000-0000-0000-0000-000000000000',
     'vikram.joshi@sih2.edu', hashed_pw, now(),
     '{"full_name":"Vikram Joshi","role":"student"}',
     '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '', false),

    -- Student 10
    (uid_stu10, '00000000-0000-0000-0000-000000000000',
     'meera.das@sih2.edu', hashed_pw, now(),
     '{"full_name":"Meera Das","role":"student"}',
     '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '', false);


  -- ===========================================================================
  -- STEP 2 — auth.identities (required for email/password login to work)
  -- ===========================================================================
  INSERT INTO auth.identities (
    id, user_id, provider_id, provider, identity_data,
    last_sign_in_at, created_at, updated_at
  ) VALUES
    (uid_admin, uid_admin, 'admin@sih2.edu',        'email', json_build_object('sub', uid_admin::text,  'email', 'admin@sih2.edu'),        now(), now(), now()),
    (uid_fac1,  uid_fac1,  'rajesh.kumar@sih2.edu', 'email', json_build_object('sub', uid_fac1::text,   'email', 'rajesh.kumar@sih2.edu'), now(), now(), now()),
    (uid_fac2,  uid_fac2,  'priya.sharma@sih2.edu', 'email', json_build_object('sub', uid_fac2::text,   'email', 'priya.sharma@sih2.edu'), now(), now(), now()),
    (uid_stu1,  uid_stu1,  'aarav.patel@sih2.edu',  'email', json_build_object('sub', uid_stu1::text,   'email', 'aarav.patel@sih2.edu'),  now(), now(), now()),
    (uid_stu2,  uid_stu2,  'sneha.iyer@sih2.edu',   'email', json_build_object('sub', uid_stu2::text,   'email', 'sneha.iyer@sih2.edu'),   now(), now(), now()),
    (uid_stu3,  uid_stu3,  'rohan.mehta@sih2.edu',  'email', json_build_object('sub', uid_stu3::text,   'email', 'rohan.mehta@sih2.edu'),  now(), now(), now()),
    (uid_stu4,  uid_stu4,  'ananya.singh@sih2.edu', 'email', json_build_object('sub', uid_stu4::text,   'email', 'ananya.singh@sih2.edu'), now(), now(), now()),
    (uid_stu5,  uid_stu5,  'karan.verma@sih2.edu',  'email', json_build_object('sub', uid_stu5::text,   'email', 'karan.verma@sih2.edu'),  now(), now(), now()),
    (uid_stu6,  uid_stu6,  'neha.gupta@sih2.edu',   'email', json_build_object('sub', uid_stu6::text,   'email', 'neha.gupta@sih2.edu'),   now(), now(), now()),
    (uid_stu7,  uid_stu7,  'arjun.nair@sih2.edu',   'email', json_build_object('sub', uid_stu7::text,   'email', 'arjun.nair@sih2.edu'),   now(), now(), now()),
    (uid_stu8,  uid_stu8,  'divya.reddy@sih2.edu',  'email', json_build_object('sub', uid_stu8::text,   'email', 'divya.reddy@sih2.edu'),  now(), now(), now()),
    (uid_stu9,  uid_stu9,  'vikram.joshi@sih2.edu', 'email', json_build_object('sub', uid_stu9::text,   'email', 'vikram.joshi@sih2.edu'), now(), now(), now()),
    (uid_stu10, uid_stu10, 'meera.das@sih2.edu',    'email', json_build_object('sub', uid_stu10::text,  'email', 'meera.das@sih2.edu'),    now(), now(), now());


  -- ===========================================================================
  -- STEP 3 — public.profiles (one per user)
  -- ===========================================================================
  INSERT INTO public.profiles (
    id, user_id, full_name, email, role, faculty_level,
    faculty_id, department, phone, bio,
    created_at, updated_at
  ) VALUES
    -- Admin (role=faculty, faculty_level=admin)
    (pid_admin, uid_admin, 'Dr. Admin Singh', 'admin@sih2.edu',
     'faculty', 'admin', 'FAC-ADMIN-001', 'Administration',
     '+91-9000000001',
     'Head of Academic Systems and Administration.',
     now(), now()),

    -- Faculty 1 (CSE — handles students 1-5)
    (pid_fac1, uid_fac1, 'Prof. Rajesh Kumar', 'rajesh.kumar@sih2.edu',
     'faculty', 'senior', 'FAC-CSE-101', 'Computer Science & Engineering',
     '+91-9000000002',
     'Senior Professor specializing in Algorithms and Machine Learning.',
     now(), now()),

    -- Faculty 2 (IT — handles students 6-10)
    (pid_fac2, uid_fac2, 'Prof. Priya Sharma', 'priya.sharma@sih2.edu',
     'faculty', 'basic', 'FAC-IT-102', 'Information Technology',
     '+91-9000000003',
     'Assistant Professor specializing in Web Technologies and Cloud Computing.',
     now(), now())
  ON CONFLICT (user_id) DO NOTHING;

  -- Students (role=student)
  INSERT INTO public.profiles (
    id, user_id, full_name, email, role,
    student_id, department, phone, graduation_year,
    created_at, updated_at
  ) VALUES
    (pid_stu1,  uid_stu1,  'Aarav Patel',   'aarav.patel@sih2.edu',  'student', '2022-CSE-001', 'Computer Science & Engineering', '+91-9100000001', 2026, now(), now()),
    (pid_stu2,  uid_stu2,  'Sneha Iyer',    'sneha.iyer@sih2.edu',   'student', '2022-CSE-002', 'Computer Science & Engineering', '+91-9100000002', 2026, now(), now()),
    (pid_stu3,  uid_stu3,  'Rohan Mehta',   'rohan.mehta@sih2.edu',  'student', '2022-CSE-003', 'Computer Science & Engineering', '+91-9100000003', 2026, now(), now()),
    (pid_stu4,  uid_stu4,  'Ananya Singh',  'ananya.singh@sih2.edu', 'student', '2022-CSE-004', 'Computer Science & Engineering', '+91-9100000004', 2026, now(), now()),
    (pid_stu5,  uid_stu5,  'Karan Verma',   'karan.verma@sih2.edu',  'student', '2022-CSE-005', 'Computer Science & Engineering', '+91-9100000005', 2026, now(), now()),
    (pid_stu6,  uid_stu6,  'Neha Gupta',    'neha.gupta@sih2.edu',   'student', '2022-IT-001',  'Information Technology',         '+91-9100000006', 2026, now(), now()),
    (pid_stu7,  uid_stu7,  'Arjun Nair',    'arjun.nair@sih2.edu',   'student', '2022-IT-002',  'Information Technology',         '+91-9100000007', 2026, now(), now()),
    (pid_stu8,  uid_stu8,  'Divya Reddy',   'divya.reddy@sih2.edu',  'student', '2022-IT-003',  'Information Technology',         '+91-9100000008', 2026, now(), now()),
    (pid_stu9,  uid_stu9,  'Vikram Joshi',  'vikram.joshi@sih2.edu', 'student', '2022-IT-004',  'Information Technology',         '+91-9100000009', 2026, now(), now()),
    (pid_stu10, uid_stu10, 'Meera Das',     'meera.das@sih2.edu',    'student', '2022-IT-005',  'Information Technology',         '+91-9100000010', 2026, now(), now())
  ON CONFLICT (user_id) DO NOTHING;

  -- ===========================================================================
  -- STEP 3b — Re-read actual profile IDs from DB
  -- WHY: Supabase's on_auth_user_created trigger may have auto-created profile
  -- rows with random UUIDs before our INSERT ran. ON CONFLICT DO NOTHING means
  -- our fixed pid_* UUIDs were never saved. We must re-read what's actually there.
  -- ===========================================================================
  SELECT id INTO pid_admin  FROM public.profiles WHERE user_id = uid_admin;
  SELECT id INTO pid_fac1   FROM public.profiles WHERE user_id = uid_fac1;
  SELECT id INTO pid_fac2   FROM public.profiles WHERE user_id = uid_fac2;
  SELECT id INTO pid_stu1   FROM public.profiles WHERE user_id = uid_stu1;
  SELECT id INTO pid_stu2   FROM public.profiles WHERE user_id = uid_stu2;
  SELECT id INTO pid_stu3   FROM public.profiles WHERE user_id = uid_stu3;
  SELECT id INTO pid_stu4   FROM public.profiles WHERE user_id = uid_stu4;
  SELECT id INTO pid_stu5   FROM public.profiles WHERE user_id = uid_stu5;
  SELECT id INTO pid_stu6   FROM public.profiles WHERE user_id = uid_stu6;
  SELECT id INTO pid_stu7   FROM public.profiles WHERE user_id = uid_stu7;
  SELECT id INTO pid_stu8   FROM public.profiles WHERE user_id = uid_stu8;
  SELECT id INTO pid_stu9   FROM public.profiles WHERE user_id = uid_stu9;
  SELECT id INTO pid_stu10  FROM public.profiles WHERE user_id = uid_stu10;


  -- ===========================================================================
  -- STEP 4 — public.faculty (admin-managed faculty records)
  --          Needed for AdminFaculty, AdminAssignments, AdminDashboard pages
  -- ===========================================================================
  INSERT INTO public.faculty (
    id, profile_id, name, email, department,
    faculty_code, specialization, phone, designation,
    is_verified, joined_date, created_at, updated_at
  ) VALUES
    -- Admin faculty record
    (fid_admin, pid_admin, 'Dr. Admin Singh', 'admin@sih2.edu',
     'Administration', 'FAC-ADMIN-001', 'Academic Administration',
     '+91-9000000001', 'Head of Department',
     true, '2015-07-01', now(), now()),

    -- Faculty 1 record
    (fid_fac1, pid_fac1, 'Prof. Rajesh Kumar', 'rajesh.kumar@sih2.edu',
     'Computer Science & Engineering', 'FAC-CSE-101',
     'Algorithms, Machine Learning, Data Structures',
     '+91-9000000002', 'Senior Professor',
     true, '2018-08-01', now(), now()),

    -- Faculty 2 record
    (fid_fac2, pid_fac2, 'Prof. Priya Sharma', 'priya.sharma@sih2.edu',
     'Information Technology', 'FAC-IT-102',
     'Web Technologies, Cloud Computing, DevOps',
     '+91-9000000003', 'Assistant Professor',
     true, '2021-01-15', now(), now())
  ON CONFLICT (email) DO NOTHING;


  -- ===========================================================================
  -- STEP 5 — public.student_mentor_assignments
  --          (Admin-managed: Faculty 1 → Students 1-5, Faculty 2 → Students 6-10)
  -- ===========================================================================
  INSERT INTO public.student_mentor_assignments (
    student_id, mentor_id, assigned_by, notes, created_at, updated_at
  ) VALUES
    -- Faculty 1 (Prof. Rajesh Kumar) → Students 1–5
    (pid_stu1,  fid_fac1, pid_admin, 'Assigned by admin during initial setup', now(), now()),
    (pid_stu2,  fid_fac1, pid_admin, 'Assigned by admin during initial setup', now(), now()),
    (pid_stu3,  fid_fac1, pid_admin, 'Assigned by admin during initial setup', now(), now()),
    (pid_stu4,  fid_fac1, pid_admin, 'Assigned by admin during initial setup', now(), now()),
    (pid_stu5,  fid_fac1, pid_admin, 'Assigned by admin during initial setup', now(), now()),

    -- Faculty 2 (Prof. Priya Sharma) → Students 6–10
    (pid_stu6,  fid_fac2, pid_admin, 'Assigned by admin during initial setup', now(), now()),
    (pid_stu7,  fid_fac2, pid_admin, 'Assigned by admin during initial setup', now(), now()),
    (pid_stu8,  fid_fac2, pid_admin, 'Assigned by admin during initial setup', now(), now()),
    (pid_stu9,  fid_fac2, pid_admin, 'Assigned by admin during initial setup', now(), now()),
    (pid_stu10, fid_fac2, pid_admin, 'Assigned by admin during initial setup', now(), now())
  ON CONFLICT (student_id) DO NOTHING;


  -- ===========================================================================
  -- STEP 6 — public.faculty_assignments
  --          (Faculty-managed view: mirrors the mentor assignments above)
  -- ===========================================================================
  INSERT INTO public.faculty_assignments (faculty_id, student_id, assigned_at) VALUES
    -- Faculty 1 profile → Students 1–5
    (pid_fac1, pid_stu1,  now()),
    (pid_fac1, pid_stu2,  now()),
    (pid_fac1, pid_stu3,  now()),
    (pid_fac1, pid_stu4,  now()),
    (pid_fac1, pid_stu5,  now()),
    -- Faculty 2 profile → Students 6–10
    (pid_fac2, pid_stu6,  now()),
    (pid_fac2, pid_stu7,  now()),
    (pid_fac2, pid_stu8,  now()),
    (pid_fac2, pid_stu9,  now()),
    (pid_fac2, pid_stu10, now())
  ON CONFLICT (faculty_id, student_id) DO NOTHING;


  -- ===========================================================================
  -- STEP 7 — public.student_progress (initial blank progress rows)
  --          The trigger should auto-create these, but this ensures they exist.
  -- ===========================================================================
  INSERT INTO public.student_progress (student_id) VALUES
    (pid_stu1), (pid_stu2), (pid_stu3), (pid_stu4), (pid_stu5),
    (pid_stu6), (pid_stu7), (pid_stu8), (pid_stu9), (pid_stu10)
  ON CONFLICT (student_id) DO NOTHING;


  RAISE NOTICE '✅ Seed complete!';
  RAISE NOTICE '   Admin  : admin@sih2.edu          → password: Test@1234';
  RAISE NOTICE '   Faculty: rajesh.kumar@sih2.edu   → password: Test@1234  (students 1–5)';
  RAISE NOTICE '   Faculty: priya.sharma@sih2.edu   → password: Test@1234  (students 6–10)';
  RAISE NOTICE '   Student: aarav.patel@sih2.edu    → password: Test@1234';
  RAISE NOTICE '   Student: sneha.iyer@sih2.edu     → password: Test@1234';
  RAISE NOTICE '   Student: rohan.mehta@sih2.edu    → password: Test@1234';
  RAISE NOTICE '   Student: ananya.singh@sih2.edu   → password: Test@1234';
  RAISE NOTICE '   Student: karan.verma@sih2.edu    → password: Test@1234';
  RAISE NOTICE '   Student: neha.gupta@sih2.edu     → password: Test@1234';
  RAISE NOTICE '   Student: arjun.nair@sih2.edu     → password: Test@1234';
  RAISE NOTICE '   Student: divya.reddy@sih2.edu    → password: Test@1234';
  RAISE NOTICE '   Student: vikram.joshi@sih2.edu   → password: Test@1234';
  RAISE NOTICE '   Student: meera.das@sih2.edu      → password: Test@1234';

END $$;
