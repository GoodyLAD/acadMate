-- =============================================================================
-- Smart Student Hub - Clean Database Schema
-- Run this ONCE in your Supabase SQL Editor on a fresh project.
-- All tables are ordered by dependency, all types are properly cast.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. Custom ENUM Types
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('student', 'faculty');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.faculty_level AS ENUM ('basic', 'senior', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.certificate_category AS ENUM ('academic', 'co_curricular');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.certificate_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.achievement_type AS ENUM ('certificate', 'course_completion', 'streak', 'milestone', 'participation', 'excellence');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.activity_type AS ENUM ('certificate_upload', 'course_enroll', 'course_complete', 'profile_update', 'achievement_earned', 'goal_set', 'goal_achieved', 'social_connection', 'portfolio_update');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.goal_status AS ENUM ('active', 'completed', 'paused', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.goal_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.connection_status AS ENUM ('pending', 'accepted', 'blocked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.portfolio_visibility AS ENUM ('public', 'private', 'connections_only');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.learning_path_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- 2. Core Tables (no foreign dependencies)
-- ---------------------------------------------------------------------------

-- Profiles (central user table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE,
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  role             public.user_role NOT NULL DEFAULT 'student',
  faculty_level    public.faculty_level,
  student_id       TEXT,
  faculty_id       TEXT,
  assigned_faculty_id UUID,  -- self-ref added below
  department       TEXT,
  avatar_url       TEXT,
  bio              TEXT,
  linkedin_url     TEXT,
  github_url       TEXT,
  website_url      TEXT,
  location         TEXT,
  graduation_year  INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Self-referential FK for assigned_faculty_id
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_assigned_faculty
  FOREIGN KEY (assigned_faculty_id) REFERENCES public.profiles(id)
  ON DELETE SET NULL
  NOT VALID;

-- Unique email index (required for ON CONFLICT (email))
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_faculty ON public.profiles(assigned_faculty_id);

-- Schedule (standalone, no FK to other custom tables)
CREATE TABLE IF NOT EXISTS public.schedule (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name    TEXT NOT NULL,
  start          TIMESTAMPTZ NOT NULL,
  "end"          TIMESTAMPTZ NOT NULL,
  room           TEXT,
  tags           TEXT[],
  syllabus_url   TEXT,
  students_count INTEGER DEFAULT 0,
  notes          TEXT,
  color          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedule_start       ON public.schedule(start);
CREATE INDEX IF NOT EXISTS idx_schedule_course_name ON public.schedule(course_name);

-- Courses (depends only on profiles)
CREATE TABLE IF NOT EXISTS public.courses (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  course_code          TEXT UNIQUE NOT NULL,
  faculty_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tags                 TEXT[],
  description          TEXT,
  deadline             DATE,
  credit_hours         INTEGER,
  thumbnail_url        TEXT,
  external_link        TEXT,
  assigned_student_ids TEXT[],   -- stored as text UUIDs for flexibility
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_faculty_id ON public.courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_courses_deadline    ON public.courses(deadline);

-- ---------------------------------------------------------------------------
-- 3. Tables depending on profiles
-- ---------------------------------------------------------------------------

-- Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  category         public.certificate_category NOT NULL,
  status           public.certificate_status NOT NULL DEFAULT 'pending',
  file_url         TEXT NOT NULL,
  file_name        TEXT NOT NULL,
  uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at      TIMESTAMPTZ,
  verified_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  remark           TEXT,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificates_student_id  ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status      ON public.certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_verified_by ON public.certificates(verified_by);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  type         TEXT NOT NULL,
  data         JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);

-- Student Monitoring (coding platforms)
CREATE TABLE IF NOT EXISTS public.student_monitoring (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL,
  platform_handle TEXT NOT NULL,
  solved_count    INTEGER DEFAULT 0,
  contest_count   INTEGER DEFAULT 0,
  rating          DECIMAL(10,2) DEFAULT 0,
  last_updated    TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, platform, platform_handle)
);

CREATE INDEX IF NOT EXISTS idx_student_monitoring_student_platform ON public.student_monitoring(student_id, platform);

-- Faculty Assignments
CREATE TABLE IF NOT EXISTS public.faculty_assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(faculty_id, student_id)
);

-- Student Progress
CREATE TABLE IF NOT EXISTS public.student_progress (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_certificates      INTEGER DEFAULT 0,
  approved_certificates   INTEGER DEFAULT 0,
  pending_certificates    INTEGER DEFAULT 0,
  rejected_certificates   INTEGER DEFAULT 0,
  courses_enrolled        INTEGER DEFAULT 0,
  courses_completed       INTEGER DEFAULT 0,
  current_streak_days     INTEGER DEFAULT 0,
  longest_streak_days     INTEGER DEFAULT 0,
  total_activities        INTEGER DEFAULT 0,
  last_activity_date      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON public.student_progress(student_id);

-- Student Achievements
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_type public.achievement_type NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  icon_url         TEXT,
  points           INTEGER DEFAULT 0,
  earned_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata         JSONB
);

CREATE INDEX IF NOT EXISTS idx_student_achievements_student_id ON public.student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_type       ON public.student_achievements(achievement_type);

-- Student Activities
CREATE TABLE IF NOT EXISTS public.student_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type public.activity_type NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_activities_student_id ON public.student_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_type       ON public.student_activities(activity_type);

-- Student Goals
CREATE TABLE IF NOT EXISTS public.student_goals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  goal_type    TEXT NOT NULL,
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  status       public.goal_status NOT NULL DEFAULT 'active',
  priority     public.goal_priority NOT NULL DEFAULT 'medium',
  target_date  DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_student_goals_student_id ON public.student_goals(student_id);
CREATE INDEX IF NOT EXISTS idx_student_goals_status     ON public.student_goals(status);

-- Student Course Enrollments (depends on both profiles AND courses)
CREATE TABLE IF NOT EXISTS public.student_course_enrollments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id           UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  progress_percentage INTEGER DEFAULT 0,
  completed_at        TIMESTAMPTZ,
  last_accessed_at    TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_student_course_enrollments_student_id ON public.student_course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_course_enrollments_course_id  ON public.student_course_enrollments(course_id);

-- Student Connections
CREATE TABLE IF NOT EXISTS public.student_connections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       public.connection_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, receiver_id),
  CHECK (requester_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_student_connections_requester ON public.student_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_student_connections_receiver  ON public.student_connections(receiver_id);

-- Student Portfolio
CREATE TABLE IF NOT EXISTS public.student_portfolio (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL,
  image_url   TEXT,
  external_url TEXT,
  visibility  public.portfolio_visibility NOT NULL DEFAULT 'public',
  featured    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_portfolio_student_id ON public.student_portfolio(student_id);
CREATE INDEX IF NOT EXISTS idx_student_portfolio_visibility ON public.student_portfolio(visibility);

-- Learning Recommendations
CREATE TABLE IF NOT EXISTS public.learning_recommendations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title              TEXT NOT NULL,
  description        TEXT,
  category           TEXT NOT NULL,
  difficulty         TEXT NOT NULL,
  estimated_duration INTEGER,
  external_url       TEXT,
  priority           INTEGER DEFAULT 1,
  status             public.learning_path_status NOT NULL DEFAULT 'not_started',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at         TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_learning_recommendations_student_id ON public.learning_recommendations(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_status     ON public.learning_recommendations(status);

-- Student Milestones
CREATE TABLE IF NOT EXISTS public.student_milestones (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  target_value   INTEGER NOT NULL,
  current_value  INTEGER DEFAULT 0,
  title          TEXT NOT NULL,
  description    TEXT,
  reward_points  INTEGER DEFAULT 0,
  achieved_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_milestones_student_id ON public.student_milestones(student_id);

-- ---------------------------------------------------------------------------
-- 4. Community Tables
-- ---------------------------------------------------------------------------

-- Community Groups (must come before community_posts for FK)
CREATE TABLE IF NOT EXISTS public.community_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  created_by  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community Posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name   TEXT,
  author_avatar TEXT,
  content       TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('Academics', 'Placements', 'Clubs', 'Events', 'General')),
  group_id      UUID REFERENCES public.community_groups(id) ON DELETE SET NULL,
  is_blocked    BOOLEAN DEFAULT false,
  reports_count INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Post Comments
CREATE TABLE IF NOT EXISTS public.post_comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name   TEXT,
  author_avatar TEXT,
  content       TEXT NOT NULL,
  is_blocked    BOOLEAN DEFAULT false,
  reports_count INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Group Memberships
CREATE TABLE IF NOT EXISTS public.group_memberships (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id  UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_admin  BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Post Interactions
CREATE TABLE IF NOT EXISTS public.post_interactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id          UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('upvote', 'downvote', 'bookmark')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, interaction_type)
);

-- Comment Interactions
CREATE TABLE IF NOT EXISTS public.comment_interactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id       UUID NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('upvote', 'downvote')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id, interaction_type)
);

-- Community indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id    ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category     ON public.community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_group_id     ON public.community_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at   ON public.community_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id        ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_author_id      ON public.post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id   ON public.group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id    ON public.group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id    ON public.post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_user_id    ON public.post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_interactions_comment_id ON public.comment_interactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_interactions_user_id    ON public.comment_interactions(user_id);

-- ---------------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_monitoring    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_assignments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_goals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_connections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_portfolio     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_milestones    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_interactions  ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "profiles_faculty_read_all" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id::text = auth.uid()::text AND p.role = 'faculty'
    )
  );

-- Certificates policies
CREATE POLICY "certificates_owner_select" ON public.certificates
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "certificates_owner_insert" ON public.certificates
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "certificates_owner_update" ON public.certificates
  FOR UPDATE USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "certificates_faculty_read_all" ON public.certificates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id::text = auth.uid()::text AND p.role = 'faculty')
  );

CREATE POLICY "certificates_faculty_update" ON public.certificates
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id::text = auth.uid()::text AND p.role = 'faculty')
  );

-- Notifications policies
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (
    user_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "notifications_insert_system" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Messages policies
CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT USING (
    sender_id   IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text) OR
    receiver_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

-- Student monitoring policies
CREATE POLICY "student_monitoring_select_own" ON public.student_monitoring
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_monitoring_faculty_read" ON public.student_monitoring
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id::text = auth.uid()::text AND p.role = 'faculty')
  );

-- Faculty assignments policies
CREATE POLICY "faculty_assignments_faculty_read" ON public.faculty_assignments
  FOR SELECT USING (
    faculty_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "faculty_assignments_student_read" ON public.faculty_assignments
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

-- Student progress policies
CREATE POLICY "student_progress_select_own" ON public.student_progress
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_progress_insert_own" ON public.student_progress
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_progress_update_own" ON public.student_progress
  FOR UPDATE USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

-- Student achievements policies
CREATE POLICY "student_achievements_select_own" ON public.student_achievements
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_achievements_insert_own" ON public.student_achievements
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

-- Student activities policies
CREATE POLICY "student_activities_select_own" ON public.student_activities
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_activities_insert_own" ON public.student_activities
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

-- Student goals policies
CREATE POLICY "student_goals_select_own" ON public.student_goals
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_goals_insert_own" ON public.student_goals
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_goals_update_own" ON public.student_goals
  FOR UPDATE USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

-- Student course enrollments policies
CREATE POLICY "student_course_enrollments_select_own" ON public.student_course_enrollments
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_course_enrollments_insert_own" ON public.student_course_enrollments
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_course_enrollments_update_own" ON public.student_course_enrollments
  FOR UPDATE USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

-- Student connections policies
CREATE POLICY "student_connections_select_own" ON public.student_connections
  FOR SELECT USING (
    requester_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text) OR
    receiver_id  IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_connections_insert_own" ON public.student_connections
  FOR INSERT WITH CHECK (
    requester_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_connections_update_own" ON public.student_connections
  FOR UPDATE USING (
    requester_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text) OR
    receiver_id  IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

-- Student portfolio policies
CREATE POLICY "student_portfolio_select_own" ON public.student_portfolio
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_portfolio_select_public" ON public.student_portfolio
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "student_portfolio_insert_own" ON public.student_portfolio
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_portfolio_update_own" ON public.student_portfolio
  FOR UPDATE USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

-- Learning recommendations policies
CREATE POLICY "learning_recommendations_select_own" ON public.learning_recommendations
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "learning_recommendations_insert_own" ON public.learning_recommendations
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "learning_recommendations_update_own" ON public.learning_recommendations
  FOR UPDATE USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

-- Student milestones policies
CREATE POLICY "student_milestones_select_own" ON public.student_milestones
  FOR SELECT USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_milestones_insert_own" ON public.student_milestones
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "student_milestones_update_own" ON public.student_milestones
  FOR UPDATE USING (
    student_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text)
  );

-- Courses policies
CREATE POLICY "courses_read_all_authenticated" ON public.courses
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "courses_insert_by_faculty" ON public.courses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id::text = auth.uid()::text AND p.role = 'faculty' AND p.id = faculty_id
    )
  );

CREATE POLICY "courses_update_by_faculty" ON public.courses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id::text = auth.uid()::text AND p.role = 'faculty' AND p.id = faculty_id
    )
  );

-- Schedule policies
CREATE POLICY "schedule_read_all_authenticated" ON public.schedule
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "schedule_insert_faculty" ON public.schedule
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id::text = auth.uid()::text AND p.role = 'faculty')
  );

CREATE POLICY "schedule_update_faculty" ON public.schedule
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id::text = auth.uid()::text AND p.role = 'faculty')
  );

CREATE POLICY "schedule_delete_faculty" ON public.schedule
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id::text = auth.uid()::text AND p.role = 'faculty')
  );

-- Community policies
CREATE POLICY "community_posts_select_all" ON public.community_posts
  FOR SELECT USING (NOT is_blocked);

CREATE POLICY "community_posts_insert_authenticated" ON public.community_posts
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "community_posts_update_own" ON public.community_posts
  FOR UPDATE USING (author_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text));

CREATE POLICY "community_posts_delete_own" ON public.community_posts
  FOR DELETE USING (author_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text));

CREATE POLICY "post_comments_select_all" ON public.post_comments
  FOR SELECT USING (NOT is_blocked);

CREATE POLICY "post_comments_insert_authenticated" ON public.post_comments
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "post_comments_update_own" ON public.post_comments
  FOR UPDATE USING (author_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text));

CREATE POLICY "post_comments_delete_own" ON public.post_comments
  FOR DELETE USING (author_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text));

CREATE POLICY "community_groups_select_all" ON public.community_groups
  FOR SELECT USING (true);

CREATE POLICY "community_groups_insert_authenticated" ON public.community_groups
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "community_groups_update_creator" ON public.community_groups
  FOR UPDATE USING (created_by IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text));

CREATE POLICY "group_memberships_select_authenticated" ON public.group_memberships
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "group_memberships_insert_authenticated" ON public.group_memberships
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "group_memberships_delete_own" ON public.group_memberships
  FOR DELETE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text));

CREATE POLICY "post_interactions_select_authenticated" ON public.post_interactions
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "post_interactions_insert_authenticated" ON public.post_interactions
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "post_interactions_delete_own" ON public.post_interactions
  FOR DELETE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text));

CREATE POLICY "comment_interactions_select_authenticated" ON public.comment_interactions
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "comment_interactions_insert_authenticated" ON public.comment_interactions
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "comment_interactions_delete_own" ON public.comment_interactions
  FOR DELETE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id::text = auth.uid()::text));

-- ---------------------------------------------------------------------------
-- 6. Functions and Triggers
-- ---------------------------------------------------------------------------

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Notify student when certificate status changes
CREATE OR REPLACE FUNCTION public.create_certificate_notification()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.student_id,
      CASE
        WHEN NEW.status = 'approved' THEN 'Certificate Approved'
        WHEN NEW.status = 'rejected' THEN 'Certificate Rejected'
        ELSE 'Certificate Status Updated'
      END,
      CASE
        WHEN NEW.status = 'approved' THEN 'Your certificate "' || NEW.title || '" has been approved.'
        WHEN NEW.status = 'rejected' THEN 'Your certificate "' || NEW.title || '" has been rejected. Reason: ' || COALESCE(NEW.rejection_reason, 'No reason provided')
        ELSE 'Your certificate "' || NEW.title || '" status has been updated.'
      END,
      CASE
        WHEN NEW.status = 'approved' THEN 'certificate_approved'
        WHEN NEW.status = 'rejected' THEN 'certificate_rejected'
        ELSE 'certificate_updated'
      END
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_certificate_status_change ON public.certificates;
CREATE TRIGGER on_certificate_status_change
  AFTER UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.create_certificate_notification();

-- Update student progress counters on certificate changes
CREATE OR REPLACE FUNCTION public.update_student_progress_on_certificate()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.student_progress (
    student_id, total_certificates, approved_certificates,
    pending_certificates, rejected_certificates
  )
  VALUES (
    NEW.student_id, 1,
    CASE WHEN NEW.status = 'approved' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'pending'  THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'rejected' THEN 1 ELSE 0 END
  )
  ON CONFLICT (student_id) DO UPDATE SET
    total_certificates      = student_progress.total_certificates      + CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END,
    approved_certificates   = student_progress.approved_certificates   +
      CASE WHEN NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status <> 'approved') THEN 1 ELSE 0 END -
      CASE WHEN OLD.status = 'approved' AND NEW.status <> 'approved' THEN 1 ELSE 0 END,
    pending_certificates    = student_progress.pending_certificates    +
      CASE WHEN NEW.status = 'pending'  AND (OLD.status IS NULL OR OLD.status <> 'pending')  THEN 1 ELSE 0 END -
      CASE WHEN OLD.status = 'pending'  AND NEW.status <> 'pending'  THEN 1 ELSE 0 END,
    rejected_certificates   = student_progress.rejected_certificates   +
      CASE WHEN NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status <> 'rejected') THEN 1 ELSE 0 END -
      CASE WHEN OLD.status = 'rejected' AND NEW.status <> 'rejected' THEN 1 ELSE 0 END,
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_certificate_progress_update ON public.certificates;
CREATE TRIGGER on_certificate_progress_update
  AFTER INSERT OR UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_student_progress_on_certificate();

-- Award achievements based on approved certificate milestones
CREATE OR REPLACE FUNCTION public.check_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  achievement_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO achievement_count
  FROM public.certificates
  WHERE student_id = NEW.student_id AND status = 'approved';

  IF achievement_count = 1 AND NOT EXISTS (
    SELECT 1 FROM public.student_achievements
    WHERE student_id = NEW.student_id AND title = 'First Certificate'
  ) THEN
    INSERT INTO public.student_achievements (student_id, achievement_type, title, description, points)
    VALUES (NEW.student_id, 'certificate', 'First Certificate', 'Uploaded your first certificate', 10);
  END IF;

  IF achievement_count = 5 AND NOT EXISTS (
    SELECT 1 FROM public.student_achievements
    WHERE student_id = NEW.student_id AND title = 'Certificate Collector'
  ) THEN
    INSERT INTO public.student_achievements (student_id, achievement_type, title, description, points)
    VALUES (NEW.student_id, 'certificate', 'Certificate Collector', 'Earned 5 approved certificates', 50);
  END IF;

  IF achievement_count = 10 AND NOT EXISTS (
    SELECT 1 FROM public.student_achievements
    WHERE student_id = NEW.student_id AND title = 'Certificate Master'
  ) THEN
    INSERT INTO public.student_achievements (student_id, achievement_type, title, description, points)
    VALUES (NEW.student_id, 'certificate', 'Certificate Master', 'Earned 10 approved certificates', 100);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_achievement_check ON public.student_progress;
CREATE TRIGGER on_achievement_check
  AFTER UPDATE ON public.student_progress
  FOR EACH ROW EXECUTE FUNCTION public.check_achievements();

-- ---------------------------------------------------------------------------
-- 7. Storage Bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "certificates_upload_policy" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates' AND
    (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "certificates_download_policy" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates');

-- ---------------------------------------------------------------------------
-- 8. Permissions
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES    IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 9. Sample Data (safe to re-run due to ON CONFLICT)
-- ---------------------------------------------------------------------------
INSERT INTO public.profiles (user_id, full_name, email, role, faculty_level, department)
VALUES
  (gen_random_uuid(), 'Dr. Sarah Johnson',  'sarah.johnson@univ.edu',  'faculty', 'senior', 'Computer Science'),
  (gen_random_uuid(), 'Prof. Michael Chen', 'michael.chen@univ.edu',   'faculty', 'admin',  'Engineering'),
  (gen_random_uuid(), 'Karan Sharma',       'karan.sharma@univ.edu',   'faculty', 'senior', 'Computer Science')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.profiles (user_id, full_name, email, role, student_id, department)
VALUES
  (gen_random_uuid(), 'Alice Smith', 'alice.smith@student.edu', 'student', '2024-CSE-001', 'Computer Science'),
  (gen_random_uuid(), 'Bob Wilson',  'bob.wilson@student.edu',  'student', '2024-CSE-002', 'Computer Science'),
  (gen_random_uuid(), 'Carol Davis', 'carol.davis@student.edu', 'student', '2024-ECE-001', 'Electronics')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.schedule (course_name, start, "end", room, tags, syllabus_url, students_count, notes, color)
VALUES
  ('Data Structures & Algorithms', '2025-01-15 09:00:00+00', '2025-01-15 10:30:00+00', 'Room 101', ARRAY['Core','Programming'],  'https://example.com/syllabus/dsa.pdf',     45, 'Introduction to arrays and linked lists', '#3B82F6'),
  ('Web Development',               '2025-01-15 11:00:00+00', '2025-01-15 12:30:00+00', 'Lab 205',  ARRAY['Practical','Frontend'], 'https://example.com/syllabus/webdev.pdf', 32, 'React and modern JavaScript',             '#10B981'),
  ('Database Systems',              '2025-01-16 10:00:00+00', '2025-01-16 11:30:00+00', 'Room 102', ARRAY['Core','Backend'],      'https://example.com/syllabus/db.pdf',      38, 'SQL and database design',                 '#F59E0B'),
  ('Machine Learning',              '2025-01-16 14:00:00+00', '2025-01-16 15:30:00+00', 'Room 103', ARRAY['Advanced','AI'],       'https://example.com/syllabus/ml.pdf',      28, 'Supervised learning algorithms',           '#8B5CF6'),
  ('Software Engineering',          '2025-01-17 09:00:00+00', '2025-01-17 10:30:00+00', 'Room 201', ARRAY['Core','Methodology'],  'https://example.com/syllabus/se.pdf',      42, 'Agile development practices',             '#EF4444'),
  ('Computer Networks',             '2025-01-17 11:00:00+00', '2025-01-17 12:30:00+00', 'Lab 206',  ARRAY['Core','Networking'],   'https://example.com/syllabus/networks.pdf',35, 'TCP/IP and network protocols',            '#06B6D4'),
  ('Operating Systems',             '2025-01-18 10:00:00+00', '2025-01-18 11:30:00+00', 'Room 104', ARRAY['Core','Systems'],      'https://example.com/syllabus/os.pdf',      40, 'Process management and memory',           '#84CC16'),
  ('Cybersecurity',                 '2025-01-18 14:00:00+00', '2025-01-18 15:30:00+00', 'Room 105', ARRAY['Elective','Security'], 'https://example.com/syllabus/cyber.pdf',   25, 'Threat analysis and prevention',          '#F97316')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
