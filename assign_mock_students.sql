-- SQL Script to perfectly assign our 10 mock students to our 2 mock teachers
-- Run this in your Supabase SQL Editor after running add_mock_users.sql

DO $$
DECLARE
  t1_id uuid;
  t2_id uuid;
  s_id uuid;
  i integer;
BEGIN
  -- 1. Find the two mock teachers we created using their emails
  SELECT id INTO t1_id FROM public.faculty WHERE email = 'teacher1@university.edu' LIMIT 1;
  SELECT id INTO t2_id FROM public.faculty WHERE email = 'teacher2@university.edu' LIMIT 1;

  -- Verify faculty were found
  IF t1_id IS NULL OR t2_id IS NULL THEN
    RAISE NOTICE 'Could not find one or both mock teachers. Did you run add_mock_users.sql first?';
    RETURN;
  END IF;

  -- 2. Assign the first 5 students (1-5) to Teacher 1
  FOR i IN 1..5 LOOP
    SELECT id INTO s_id FROM public.profiles WHERE email = 'student' || i || '@university.edu' LIMIT 1;
    
    IF s_id IS NOT NULL THEN
      -- Upsert so we don't accidentally duplicate
      INSERT INTO public.student_mentor_assignments (student_id, mentor_id)
      VALUES (s_id, t1_id)
      ON CONFLICT (student_id, mentor_id) DO NOTHING;
    END IF;
  END LOOP;

  -- 3. Assign the last 5 students (6-10) to Teacher 2
  FOR i IN 6..10 LOOP
    SELECT id INTO s_id FROM public.profiles WHERE email = 'student' || i || '@university.edu' LIMIT 1;
    
    IF s_id IS NOT NULL THEN
      INSERT INTO public.student_mentor_assignments (student_id, mentor_id)
      VALUES (s_id, t2_id)
      ON CONFLICT (student_id, mentor_id) DO NOTHING;
    END IF;
  END LOOP;

  RAISE NOTICE 'Successfully assigned 5 students to Teacher 1 and 5 students to Teacher 2.';

END $$;
