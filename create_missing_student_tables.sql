-- =============================================================================
-- MIGRATION: create missing student tables from the complete schema
-- Run this in your Supabase SQL Editor if you want to persist the student details
-- =============================================================================

DO $$ BEGIN CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE goal_priority AS ENUM ('low', 'medium', 'high', 'urgent'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE portfolio_visibility AS ENUM ('public', 'private', 'connections_only'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'blocked'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE learning_path_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. student_progress
CREATE TABLE IF NOT EXISTS public.student_progress (
  id                    uuid        NOT NULL DEFAULT gen_random_uuid(),
  student_id            uuid        NOT NULL UNIQUE,
  total_certificates    integer     DEFAULT 0,
  approved_certificates integer     DEFAULT 0,
  pending_certificates  integer     DEFAULT 0,
  rejected_certificates integer     DEFAULT 0,
  courses_enrolled      integer     DEFAULT 0,
  courses_completed     integer     DEFAULT 0,
  current_streak_days   integer     DEFAULT 0,
  longest_streak_days   integer     DEFAULT 0,
  total_activities      integer     DEFAULT 0,
  last_activity_date    timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_progress_pkey PRIMARY KEY (id),
  CONSTRAINT student_progress_student_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 2. student_achievements
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id               uuid        NOT NULL DEFAULT gen_random_uuid(),
  student_id       uuid        NOT NULL,
  achievement_type text        NOT NULL,   
  title            text        NOT NULL,
  description      text,
  icon_url         text,
  points           integer     DEFAULT 0,
  earned_at        timestamptz NOT NULL DEFAULT now(),
  metadata         jsonb       DEFAULT '{}',
  CONSTRAINT student_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT student_achievements_student_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 3. student_activities
CREATE TABLE IF NOT EXISTS public.student_activities (
  id            uuid        NOT NULL DEFAULT gen_random_uuid(),
  student_id    uuid        NOT NULL,
  activity_type text        NOT NULL,
  title         text        NOT NULL,
  description   text,
  metadata      jsonb       DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_activities_pkey PRIMARY KEY (id),
  CONSTRAINT student_activities_student_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 4. student_goals
CREATE TABLE IF NOT EXISTS public.student_goals (
  id           uuid          NOT NULL DEFAULT gen_random_uuid(),
  student_id   uuid          NOT NULL,
  title        text          NOT NULL,
  description  text,
  goal_type    text          NOT NULL,
  target_value integer,
  current_value integer      DEFAULT 0,
  status       goal_status   NOT NULL DEFAULT 'active',
  priority     goal_priority NOT NULL DEFAULT 'medium',
  target_date  date,
  created_at   timestamptz   NOT NULL DEFAULT now(),
  updated_at   timestamptz   NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT student_goals_pkey PRIMARY KEY (id),
  CONSTRAINT student_goals_student_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 5. student_connections
CREATE TABLE IF NOT EXISTS public.student_connections (
  id           uuid              NOT NULL DEFAULT gen_random_uuid(),
  requester_id uuid              NOT NULL,
  receiver_id  uuid              NOT NULL,
  status       connection_status NOT NULL DEFAULT 'pending',
  created_at   timestamptz       NOT NULL DEFAULT now(),
  updated_at   timestamptz       NOT NULL DEFAULT now(),
  CONSTRAINT student_connections_pkey PRIMARY KEY (id),
  CONSTRAINT student_connections_requester_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT student_connections_receiver_fkey FOREIGN KEY (receiver_id)  REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT student_connections_unique UNIQUE (requester_id, receiver_id)
);

-- 6. student_portfolio
CREATE TABLE IF NOT EXISTS public.student_portfolio (
  id           uuid                 NOT NULL DEFAULT gen_random_uuid(),
  student_id   uuid                 NOT NULL,
  title        text                 NOT NULL,
  description  text,
  category     text                 NOT NULL,
  image_url    text,
  external_url text,
  visibility   portfolio_visibility NOT NULL DEFAULT 'public',
  featured     boolean              DEFAULT false,
  created_at   timestamptz          NOT NULL DEFAULT now(),
  updated_at   timestamptz          NOT NULL DEFAULT now(),
  CONSTRAINT student_portfolio_pkey PRIMARY KEY (id),
  CONSTRAINT student_portfolio_student_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 7. student_milestones
CREATE TABLE IF NOT EXISTS public.student_milestones (
  id             uuid        NOT NULL DEFAULT gen_random_uuid(),
  student_id     uuid        NOT NULL,
  milestone_type text        NOT NULL,
  target_value   integer     NOT NULL,
  current_value  integer     DEFAULT 0,
  title          text        NOT NULL,
  description    text,
  reward_points  integer     DEFAULT 0,
  achieved_at    timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_milestones_pkey PRIMARY KEY (id),
  CONSTRAINT student_milestones_student_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 8. learning_recommendations
CREATE TABLE IF NOT EXISTS public.learning_recommendations (
  id                 uuid                 NOT NULL DEFAULT gen_random_uuid(),
  student_id         uuid                 NOT NULL,
  title              text                 NOT NULL,
  description        text,
  category           text                 NOT NULL,
  difficulty         text                 NOT NULL, 
  estimated_duration integer,
  external_url       text,
  priority           integer              DEFAULT 1,
  status             learning_path_status NOT NULL DEFAULT 'not_started',
  created_at         timestamptz          NOT NULL DEFAULT now(),
  started_at         timestamptz,
  completed_at       timestamptz,
  CONSTRAINT learning_recommendations_pkey PRIMARY KEY (id),
  CONSTRAINT learning_recommendations_student_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);
