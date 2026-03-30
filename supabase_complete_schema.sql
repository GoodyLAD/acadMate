-- =============================================================================
-- SIH2 COMPLETE DATABASE SCHEMA — FULL RESET + REBUILD
-- ⚠️  WARNING: Drops ALL existing tables and data, then rebuilds from scratch.
-- Run this entire script in the Supabase SQL Editor.
-- =============================================================================


-- =============================================================================
-- SECTION 0 — TEARDOWN (drops everything in reverse-dependency order)
-- =============================================================================

-- 0a. Drop functions (before tables, as they may be referenced by triggers)
DROP FUNCTION IF EXISTS public.handle_updated_at()      CASCADE;
DROP FUNCTION IF EXISTS public.create_student_progress() CASCADE;
DROP FUNCTION IF EXISTS public.auth_profile_id()         CASCADE;
DROP FUNCTION IF EXISTS public.is_faculty()              CASCADE;
DROP FUNCTION IF EXISTS public.is_admin()                CASCADE;

-- 0c. Drop tables in reverse FK dependency order
--     (children before parents)
DROP TABLE IF EXISTS public.audit_logs                  CASCADE;
DROP TABLE IF EXISTS public.evidence_files              CASCADE;
DROP TABLE IF EXISTS public.verifiable_credentials      CASCADE;
DROP TABLE IF EXISTS public.issuers                     CASCADE;
DROP TABLE IF EXISTS public.event_registrations         CASCADE;
DROP TABLE IF EXISTS public.events                      CASCADE;
DROP TABLE IF EXISTS public.comment_interactions        CASCADE;
DROP TABLE IF EXISTS public.post_interactions           CASCADE;
DROP TABLE IF EXISTS public.post_comments               CASCADE;
DROP TABLE IF EXISTS public.community_posts             CASCADE;
DROP TABLE IF EXISTS public.group_memberships           CASCADE;
DROP TABLE IF EXISTS public.community_groups            CASCADE;
DROP TABLE IF EXISTS public.messages                    CASCADE;
DROP TABLE IF EXISTS public.notifications               CASCADE;
DROP TABLE IF EXISTS public.learning_recommendations    CASCADE;
DROP TABLE IF EXISTS public.certificates                CASCADE;
DROP TABLE IF EXISTS public.student_course_enrollments  CASCADE;
DROP TABLE IF EXISTS public.student_monitoring          CASCADE;
DROP TABLE IF EXISTS public.student_milestones          CASCADE;
DROP TABLE IF EXISTS public.student_portfolio           CASCADE;
DROP TABLE IF EXISTS public.student_connections         CASCADE;
DROP TABLE IF EXISTS public.student_goals               CASCADE;
DROP TABLE IF EXISTS public.student_activities          CASCADE;
DROP TABLE IF EXISTS public.student_achievements        CASCADE;
DROP TABLE IF EXISTS public.student_progress            CASCADE;
DROP TABLE IF EXISTS public.courses                     CASCADE;
DROP TABLE IF EXISTS public.schedule                    CASCADE;
DROP TABLE IF EXISTS public.faculty_assignments         CASCADE;
DROP TABLE IF EXISTS public.lms_integrations            CASCADE;
DROP TABLE IF EXISTS public.student_mentor_assignments  CASCADE;
DROP TABLE IF EXISTS public.faculty                     CASCADE;
DROP TABLE IF EXISTS public.profiles                    CASCADE;

-- 0d. Drop ENUM types
DROP TYPE IF EXISTS public.user_role                CASCADE;
DROP TYPE IF EXISTS public.faculty_level            CASCADE;
DROP TYPE IF EXISTS public.certificate_status       CASCADE;
DROP TYPE IF EXISTS public.certificate_category     CASCADE;
DROP TYPE IF EXISTS public.goal_status              CASCADE;
DROP TYPE IF EXISTS public.goal_priority            CASCADE;
DROP TYPE IF EXISTS public.portfolio_visibility     CASCADE;
DROP TYPE IF EXISTS public.connection_status        CASCADE;
DROP TYPE IF EXISTS public.learning_path_status     CASCADE;
DROP TYPE IF EXISTS public.lms_integration_status   CASCADE;
DROP TYPE IF EXISTS public.event_category           CASCADE;

-- Teardown complete ✓
-- =============================================================================



-- =============================================================================
-- SECTION 1 — ENUM TYPES
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'faculty');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE faculty_level AS ENUM ('basic', 'senior', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE certificate_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE certificate_category AS ENUM ('academic', 'co_curricular');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE goal_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE portfolio_visibility AS ENUM ('public', 'private', 'connections_only');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'blocked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE learning_path_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lms_integration_status AS ENUM ('active', 'inactive', 'error', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE event_category AS ENUM ('academic', 'co_curricular', 'outside_university');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- =============================================================================
-- SECTION 2 — CORE IDENTITY TABLES
-- =============================================================================

-- 2a. profiles (base table for ALL users — students, faculty, admins)
CREATE TABLE IF NOT EXISTS public.profiles (
  id                    uuid        NOT NULL DEFAULT gen_random_uuid(),
  user_id               uuid        NOT NULL UNIQUE,               -- links to auth.users
  full_name             text        NOT NULL,
  email                 text        NOT NULL,
  role                  user_role   NOT NULL DEFAULT 'student',
  faculty_level         faculty_level,                             -- only for faculty
  student_id            text,                                      -- student roll number
  faculty_id            text,                                      -- faculty employee code
  assigned_faculty_id   uuid,                                      -- student's assigned faculty
  department            text,
  avatar_url            text,
  bio                   text,
  phone                 text,
  linkedin_url          text,
  github_url            text,
  website_url           text,
  location              text,
  graduation_year       integer,
  teaching_id           text,                                      -- faculty teaching credential
  teaching_id_verified  boolean     DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT fk_profiles_assigned_faculty
    FOREIGN KEY (assigned_faculty_id) REFERENCES public.profiles(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx          ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_department_idx    ON public.profiles(department);


-- 2b. faculty (separate admin-managed faculty records — linked to profiles)
--     This is the table used by ALL admin pages for faculty management.
--     A faculty member has BOTH a profiles row (for login) AND a faculty row (for admin).
CREATE TABLE IF NOT EXISTS public.faculty (
  id              uuid        NOT NULL DEFAULT gen_random_uuid(),
  profile_id      uuid,                                            -- links to profiles.id (nullable for manual creation)
  name            text        NOT NULL,
  email           text        NOT NULL UNIQUE,
  department      text        NOT NULL DEFAULT '',
  faculty_code    text,                                            -- employee/faculty code
  specialization  text,
  phone           text,
  designation     text,                                            -- e.g. "Associate Professor"
  is_verified     boolean     NOT NULL DEFAULT false,
  joined_date     date,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT faculty_pkey PRIMARY KEY (id),
  CONSTRAINT faculty_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS faculty_department_idx   ON public.faculty(department);
CREATE INDEX IF NOT EXISTS faculty_is_verified_idx  ON public.faculty(is_verified);
CREATE INDEX IF NOT EXISTS faculty_email_idx        ON public.faculty(email);


-- =============================================================================
-- SECTION 3 — ADMIN TABLES
-- =============================================================================

-- 3a. student_mentor_assignments (admin assigns a faculty mentor to each student)
--     mentor_id → faculty.id (NOT profiles.id — this is the admin-managed faculty record)
CREATE TABLE IF NOT EXISTS public.student_mentor_assignments (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  student_id  uuid        NOT NULL,                               -- FK → profiles(id)
  mentor_id   uuid        NOT NULL,                               -- FK → faculty(id)
  assigned_by uuid,                                               -- FK → profiles(id) — admin who assigned
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT student_mentor_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT student_mentor_assignments_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT student_mentor_assignments_mentor_id_fkey
    FOREIGN KEY (mentor_id)  REFERENCES public.faculty(id) ON DELETE CASCADE,
  CONSTRAINT student_mentor_assignments_assigned_by_fkey
    FOREIGN KEY (assigned_by) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT student_mentor_assignments_student_unique UNIQUE (student_id)  -- one mentor per student
);

CREATE INDEX IF NOT EXISTS sma_student_idx ON public.student_mentor_assignments(student_id);
CREATE INDEX IF NOT EXISTS sma_mentor_idx  ON public.student_mentor_assignments(mentor_id);


-- 3b. lms_integrations (admin connects external LMS/ERP systems)
CREATE TABLE IF NOT EXISTS public.lms_integrations (
  id          uuid                    NOT NULL DEFAULT gen_random_uuid(),
  name        text                    NOT NULL,
  type        text                    NOT NULL,               -- 'moodle' | 'canvas' | 'blackboard' | 'custom'
  api_url     text,
  api_key     text,
  status      lms_integration_status  NOT NULL DEFAULT 'inactive',
  config      jsonb                   DEFAULT '{}',
  created_by  uuid,                                           -- FK → profiles(id)
  created_at  timestamptz             NOT NULL DEFAULT now(),
  updated_at  timestamptz             NOT NULL DEFAULT now(),

  CONSTRAINT lms_integrations_pkey PRIMARY KEY (id),
  CONSTRAINT lms_integrations_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL
);


-- =============================================================================
-- SECTION 4 — FACULTY OPERATIONAL TABLES
-- =============================================================================

-- 4a. faculty_assignments (faculty manually assigns/monitors students — used in useFaculty.ts hook)
--     Note: Different from student_mentor_assignments (admin-managed).
--     faculty_id → profiles.id (faculty's profile, not the faculty table)
CREATE TABLE IF NOT EXISTS public.faculty_assignments (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  faculty_id  uuid        NOT NULL,                           -- FK → profiles(id) WHERE role='faculty'
  student_id  uuid        NOT NULL,                           -- FK → profiles(id) WHERE role='student'
  assigned_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT faculty_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT faculty_assignments_faculty_id_fkey
    FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT faculty_assignments_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT faculty_assignments_unique UNIQUE (faculty_id, student_id)
);

CREATE INDEX IF NOT EXISTS fa_faculty_idx ON public.faculty_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS fa_student_idx ON public.faculty_assignments(student_id);


-- 4b. schedule (faculty teaching timetable)
CREATE TABLE IF NOT EXISTS public.schedule (
  id             uuid        NOT NULL DEFAULT gen_random_uuid(),
  faculty_id     uuid,                                        -- FK → profiles(id), nullable for backward compat
  course_name    text        NOT NULL,
  start          timestamptz NOT NULL,
  "end"          timestamptz NOT NULL,
  room           text,
  tags           text[]      DEFAULT '{}',
  syllabus_url   text,
  students_count integer     DEFAULT 0,
  notes          text,
  color          text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),

  CONSTRAINT schedule_pkey PRIMARY KEY (id),
  CONSTRAINT schedule_faculty_id_fkey
    FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS schedule_faculty_idx ON public.schedule(faculty_id);
CREATE INDEX IF NOT EXISTS schedule_start_idx   ON public.schedule(start);


-- 4c. courses (faculty creates and assigns courses)
CREATE TABLE IF NOT EXISTS public.courses (
  id                   uuid        NOT NULL DEFAULT gen_random_uuid(),
  faculty_id           uuid,                                  -- FK → profiles(id) WHERE role='faculty'
  name                 text        NOT NULL,
  course_code          text        NOT NULL UNIQUE,
  title                text,                                  -- alias used by types.ts
  description          text,
  category             text        DEFAULT 'General',
  tags                 text[]      DEFAULT '{}',
  deadline             date,
  credit_hours         integer,
  duration_weeks       integer,
  max_students         integer,
  thumbnail_url        text,
  external_link        text,
  assigned_student_ids uuid[]      DEFAULT '{}',
  is_active            boolean     DEFAULT true,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now(),

  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_faculty_id_fkey
    FOREIGN KEY (faculty_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS courses_faculty_idx ON public.courses(faculty_id);
CREATE INDEX IF NOT EXISTS courses_code_idx    ON public.courses(course_code);


-- =============================================================================
-- SECTION 5 — STUDENT DATA TABLES
-- =============================================================================

-- 5a. student_progress (aggregate stats, one row per student)
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

  CONSTRAINT student_progress_pkey       PRIMARY KEY (id),
  CONSTRAINT student_progress_student_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);


-- 5b. student_achievements
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id               uuid        NOT NULL DEFAULT gen_random_uuid(),
  student_id       uuid        NOT NULL,
  achievement_type text        NOT NULL,   -- 'certificate' | 'course_completion' | 'streak' | 'milestone' | 'participation' | 'excellence'
  title            text        NOT NULL,
  description      text,
  icon_url         text,
  points           integer     DEFAULT 0,
  earned_at        timestamptz NOT NULL DEFAULT now(),
  metadata         jsonb       DEFAULT '{}',

  CONSTRAINT student_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT student_achievements_student_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ach_student_idx ON public.student_achievements(student_id);
CREATE INDEX IF NOT EXISTS ach_type_idx    ON public.student_achievements(achievement_type);


-- 5c. student_activities (activity feed/log)
CREATE TABLE IF NOT EXISTS public.student_activities (
  id            uuid        NOT NULL DEFAULT gen_random_uuid(),
  student_id    uuid        NOT NULL,
  activity_type text        NOT NULL,   -- 'certificate_upload' | 'course_enroll' | 'course_complete' | 'profile_update' | 'achievement_earned' | 'goal_set' | 'goal_achieved' | 'social_connection' | 'portfolio_update'
  title         text        NOT NULL,
  description   text,
  metadata      jsonb       DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT student_activities_pkey PRIMARY KEY (id),
  CONSTRAINT student_activities_student_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS act_student_idx    ON public.student_activities(student_id);
CREATE INDEX IF NOT EXISTS act_created_at_idx ON public.student_activities(created_at DESC);


-- 5d. student_goals
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
  CONSTRAINT student_goals_student_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS goal_student_idx ON public.student_goals(student_id);
CREATE INDEX IF NOT EXISTS goal_status_idx  ON public.student_goals(status);


-- 5e. student_connections (peer connections between students)
CREATE TABLE IF NOT EXISTS public.student_connections (
  id           uuid              NOT NULL DEFAULT gen_random_uuid(),
  requester_id uuid              NOT NULL,
  receiver_id  uuid              NOT NULL,
  status       connection_status NOT NULL DEFAULT 'pending',
  created_at   timestamptz       NOT NULL DEFAULT now(),
  updated_at   timestamptz       NOT NULL DEFAULT now(),

  CONSTRAINT student_connections_pkey PRIMARY KEY (id),
  CONSTRAINT student_connections_requester_fkey
    FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT student_connections_receiver_fkey
    FOREIGN KEY (receiver_id)  REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT student_connections_unique UNIQUE (requester_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS conn_requester_idx ON public.student_connections(requester_id);
CREATE INDEX IF NOT EXISTS conn_receiver_idx  ON public.student_connections(receiver_id);


-- 5f. student_portfolio
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
  CONSTRAINT student_portfolio_student_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS portfolio_student_idx ON public.student_portfolio(student_id);


-- 5g. student_milestones
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
  CONSTRAINT student_milestones_student_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS milestone_student_idx ON public.student_milestones(student_id);


-- 5h. student_monitoring (platform integration stats — managed by faculty)
CREATE TABLE IF NOT EXISTS public.student_monitoring (
  id              uuid        NOT NULL DEFAULT gen_random_uuid(),
  student_id      uuid        NOT NULL,
  platform        text        NOT NULL,   -- 'leetcode' | 'codeforces' | 'github' | 'hackerrank'
  platform_handle text        NOT NULL,
  solved_count    integer     DEFAULT 0,
  contest_count   integer     DEFAULT 0,
  rating          numeric     DEFAULT 0,
  last_updated    timestamptz DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT student_monitoring_pkey PRIMARY KEY (id),
  CONSTRAINT student_monitoring_student_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT student_monitoring_unique UNIQUE (student_id, platform, platform_handle)
);

CREATE INDEX IF NOT EXISTS monitoring_student_idx ON public.student_monitoring(student_id);


-- 5i. student_course_enrollments
CREATE TABLE IF NOT EXISTS public.student_course_enrollments (
  id                 uuid        NOT NULL DEFAULT gen_random_uuid(),
  student_id         uuid        NOT NULL,
  course_id          uuid        NOT NULL,
  enrolled_at        timestamptz NOT NULL DEFAULT now(),
  status             text        DEFAULT 'enrolled',   -- 'enrolled' | 'completed' | 'dropped'
  progress           integer     DEFAULT 0,            -- 0-100
  progress_percentage integer    DEFAULT 0,            -- alias used by schema
  completed_at       timestamptz,
  last_accessed_at   timestamptz,

  CONSTRAINT student_course_enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT sce_student_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT sce_course_fkey
    FOREIGN KEY (course_id)  REFERENCES public.courses(id) ON DELETE CASCADE,
  CONSTRAINT sce_unique UNIQUE (student_id, course_id)
);

CREATE INDEX IF NOT EXISTS sce_student_idx ON public.student_course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS sce_course_idx  ON public.student_course_enrollments(course_id);


-- =============================================================================
-- SECTION 6 — CERTIFICATES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.certificates (
  id               uuid                 NOT NULL DEFAULT gen_random_uuid(),
  student_id       uuid                 NOT NULL,
  title            text                 NOT NULL,
  description      text,
  category         certificate_category NOT NULL,
  status           certificate_status   NOT NULL DEFAULT 'pending',
  file_url         text                 NOT NULL,
  file_name        text                 NOT NULL,
  uploaded_at      timestamptz          NOT NULL DEFAULT now(),
  verified_at      timestamptz,
  verified_by      uuid,                                             -- FK → profiles(id) faculty/admin
  rejection_reason text,
  remark           text,
  updated_at       timestamptz          NOT NULL DEFAULT now(),

  CONSTRAINT certificates_pkey PRIMARY KEY (id),
  CONSTRAINT certificates_student_id_fkey
    FOREIGN KEY (student_id)  REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT certificates_verified_by_fkey
    FOREIGN KEY (verified_by) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS cert_student_idx ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS cert_status_idx  ON public.certificates(status);


-- =============================================================================
-- SECTION 7 — LEARNING RECOMMENDATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.learning_recommendations (
  id                 uuid                 NOT NULL DEFAULT gen_random_uuid(),
  student_id         uuid                 NOT NULL,
  title              text                 NOT NULL,
  description        text,
  category           text                 NOT NULL,
  difficulty         text                 NOT NULL,   -- 'beginner' | 'intermediate' | 'advanced'
  estimated_duration integer,                         -- minutes
  external_url       text,
  priority           integer              DEFAULT 1,
  status             learning_path_status NOT NULL DEFAULT 'not_started',
  created_at         timestamptz          NOT NULL DEFAULT now(),
  started_at         timestamptz,
  completed_at       timestamptz,

  CONSTRAINT learning_recommendations_pkey PRIMARY KEY (id),
  CONSTRAINT learning_recommendations_student_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS lr_student_idx ON public.learning_recommendations(student_id);


-- =============================================================================
-- SECTION 8 — COMMUNITY TABLES
-- =============================================================================

-- 8a. community_groups
CREATE TABLE IF NOT EXISTS public.community_groups (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  description text,
  category    text        DEFAULT 'General',
  created_by  uuid        NOT NULL,
  member_count integer    DEFAULT 0,
  is_private  boolean     DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT community_groups_pkey PRIMARY KEY (id),
  CONSTRAINT community_groups_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE
);


-- 8b. group_memberships
CREATE TABLE IF NOT EXISTS public.group_memberships (
  id       uuid        NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid        NOT NULL,
  user_id  uuid        NOT NULL,
  role     text        DEFAULT 'member',                  -- 'admin' | 'member'
  joined_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT group_memberships_pkey PRIMARY KEY (id),
  CONSTRAINT group_memberships_group_fkey
    FOREIGN KEY (group_id) REFERENCES public.community_groups(id) ON DELETE CASCADE,
  CONSTRAINT group_memberships_user_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT group_memberships_unique UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS gm_group_idx ON public.group_memberships(group_id);
CREATE INDEX IF NOT EXISTS gm_user_idx  ON public.group_memberships(user_id);


-- 8c. community_posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  author_id    uuid        NOT NULL,
  author_name  text,                                      -- denormalized for performance
  author_avatar text,
  title        text,                                      -- optional post title
  content      text        NOT NULL,
  category     text        NOT NULL DEFAULT 'General',    -- 'Academics' | 'Placements' | 'Clubs' | 'Events' | 'General'
  tags         text[]      DEFAULT '{}',
  group_id     uuid,
  upvotes      integer     DEFAULT 0,
  downvotes    integer     DEFAULT 0,
  bookmarks    integer     DEFAULT 0,
  is_pinned    boolean     DEFAULT false,
  is_blocked   boolean     DEFAULT false,
  reports_count integer    DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT community_posts_pkey PRIMARY KEY (id),
  CONSTRAINT community_posts_author_fkey
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT community_posts_group_fkey
    FOREIGN KEY (group_id) REFERENCES public.community_groups(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS posts_author_idx   ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS posts_category_idx ON public.community_posts(category);
CREATE INDEX IF NOT EXISTS posts_created_idx  ON public.community_posts(created_at DESC);


-- 8d. post_comments
CREATE TABLE IF NOT EXISTS public.post_comments (
  id                uuid        NOT NULL DEFAULT gen_random_uuid(),
  post_id           uuid        NOT NULL,
  author_id         uuid        NOT NULL,
  author_name       text,
  author_avatar     text,
  content           text        NOT NULL,
  upvotes           integer     DEFAULT 0,
  is_blocked        boolean     DEFAULT false,
  reports_count     integer     DEFAULT 0,
  parent_comment_id uuid,                                 -- for threaded replies
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT post_comments_post_fkey
    FOREIGN KEY (post_id)   REFERENCES public.community_posts(id) ON DELETE CASCADE,
  CONSTRAINT post_comments_author_fkey
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT post_comments_parent_fkey
    FOREIGN KEY (parent_comment_id) REFERENCES public.post_comments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS comments_post_idx ON public.post_comments(post_id);


-- 8e. post_interactions (upvote / downvote / bookmark per user per post)
CREATE TABLE IF NOT EXISTS public.post_interactions (
  id               uuid        NOT NULL DEFAULT gen_random_uuid(),
  post_id          uuid        NOT NULL,
  user_id          uuid        NOT NULL,
  interaction_type text        NOT NULL,   -- 'upvote' | 'downvote' | 'bookmark'
  created_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT post_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT post_interactions_post_fkey
    FOREIGN KEY (post_id)  REFERENCES public.community_posts(id) ON DELETE CASCADE,
  CONSTRAINT post_interactions_user_fkey
    FOREIGN KEY (user_id)  REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT post_interactions_unique UNIQUE (post_id, user_id, interaction_type),
  CONSTRAINT post_interactions_type_check
    CHECK (interaction_type IN ('upvote', 'downvote', 'bookmark'))
);

CREATE INDEX IF NOT EXISTS pi_post_idx ON public.post_interactions(post_id);
CREATE INDEX IF NOT EXISTS pi_user_idx ON public.post_interactions(user_id);


-- 8f. comment_interactions
CREATE TABLE IF NOT EXISTS public.comment_interactions (
  id               uuid        NOT NULL DEFAULT gen_random_uuid(),
  comment_id       uuid        NOT NULL,
  user_id          uuid        NOT NULL,
  interaction_type text        NOT NULL,   -- 'upvote' | 'downvote'
  created_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT comment_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT comment_interactions_comment_fkey
    FOREIGN KEY (comment_id) REFERENCES public.post_comments(id) ON DELETE CASCADE,
  CONSTRAINT comment_interactions_user_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT comment_interactions_unique UNIQUE (comment_id, user_id, interaction_type),
  CONSTRAINT comment_interactions_type_check
    CHECK (interaction_type IN ('upvote', 'downvote'))
);


-- =============================================================================
-- SECTION 9 — NOTIFICATIONS & MESSAGES
-- =============================================================================

-- 9a. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL,
  from_user_id uuid,
  title        text        NOT NULL,
  message      text        NOT NULL,
  type         text        NOT NULL,   -- 'info' | 'success' | 'warning' | 'error' | 'certificate' | 'goal' etc.
  data         jsonb       DEFAULT '{}',
  read_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_fkey
    FOREIGN KEY (user_id)      REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT notifications_from_user_fkey
    FOREIGN KEY (from_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS notif_user_idx     ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notif_created_idx  ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notif_read_idx     ON public.notifications(read_at) WHERE read_at IS NULL;


-- 9b. messages (direct messaging)
CREATE TABLE IF NOT EXISTS public.messages (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  sender_id   uuid        NOT NULL,
  receiver_id uuid        NOT NULL,
  content     text        NOT NULL,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_fkey
    FOREIGN KEY (sender_id)   REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT messages_receiver_fkey
    FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS msg_sender_idx   ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS msg_receiver_idx ON public.messages(receiver_id);


-- =============================================================================
-- SECTION 10 — EVENTS (replace localStorage)
-- =============================================================================

-- 10a. events
CREATE TABLE IF NOT EXISTS public.events (
  id          uuid           NOT NULL DEFAULT gen_random_uuid(),
  title       text           NOT NULL,
  description text,
  category    event_category NOT NULL DEFAULT 'academic',
  date        date           NOT NULL,
  time        text,                                          -- stored as 'HH:MM' string
  venue       text,
  organizer   text,
  image_url   text,
  external_url text,
  max_participants integer,
  is_published boolean       DEFAULT true,
  tags        text[]         DEFAULT '{}',
  created_by  uuid,                                         -- FK → profiles(id)
  created_at  timestamptz    NOT NULL DEFAULT now(),
  updated_at  timestamptz    NOT NULL DEFAULT now(),

  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS events_category_idx ON public.events(category);
CREATE INDEX IF NOT EXISTS events_date_idx     ON public.events(date);


-- 10b. event_registrations
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  event_id   uuid        NOT NULL,
  user_id    uuid,                                          -- nullable (guest registrations)
  name       text        NOT NULL,
  email      text        NOT NULL,
  student_id text,                                         -- roll number
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT event_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT event_registrations_event_fkey
    FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE,
  CONSTRAINT event_registrations_user_fkey
    FOREIGN KEY (user_id)  REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT event_registrations_unique UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS er_event_idx ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS er_user_idx  ON public.event_registrations(user_id);


-- =============================================================================
-- SECTION 11 — VERIFIABLE CREDENTIALS (Blockchain)
-- =============================================================================

-- 11a. issuers (faculty who can issue credentials)
CREATE TABLE IF NOT EXISTS public.issuers (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  faculty_id  uuid,                                         -- FK → faculty(id)
  name        text        NOT NULL,
  did         text        UNIQUE,                           -- decentralized identifier
  public_key  text,
  is_active   boolean     DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT issuers_pkey PRIMARY KEY (id),
  CONSTRAINT issuers_faculty_fkey
    FOREIGN KEY (faculty_id) REFERENCES public.faculty(id) ON DELETE SET NULL
);


-- 11b. verifiable_credentials
CREATE TABLE IF NOT EXISTS public.verifiable_credentials (
  id               uuid        NOT NULL DEFAULT gen_random_uuid(),
  student_id       uuid        NOT NULL,
  issuer_id        uuid,
  credential_type  text        NOT NULL,
  title            text        NOT NULL,
  description      text,
  data             jsonb       DEFAULT '{}',
  issued_at        timestamptz NOT NULL DEFAULT now(),
  expires_at       timestamptz,
  revoked_at       timestamptz,
  blockchain_hash  text        UNIQUE,
  verification_url text,

  CONSTRAINT verifiable_credentials_pkey PRIMARY KEY (id),
  CONSTRAINT vc_student_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT vc_issuer_fkey
    FOREIGN KEY (issuer_id)  REFERENCES public.issuers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS vc_student_idx ON public.verifiable_credentials(student_id);


-- 11c. evidence_files (files attached to verifiable credentials)
CREATE TABLE IF NOT EXISTS public.evidence_files (
  id             uuid        NOT NULL DEFAULT gen_random_uuid(),
  credential_id  uuid        NOT NULL,
  file_url       text        NOT NULL,
  file_name      text        NOT NULL,
  file_type      text,
  uploaded_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT evidence_files_pkey PRIMARY KEY (id),
  CONSTRAINT evidence_files_credential_fkey
    FOREIGN KEY (credential_id) REFERENCES public.verifiable_credentials(id) ON DELETE CASCADE
);


-- 11d. audit_logs (blockchain action log)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  action     text        NOT NULL,
  actor_id   uuid,
  target_id  uuid,
  target_type text,
  data       jsonb       DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_actor_fkey
    FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS audit_actor_idx   ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS audit_created_idx ON public.audit_logs(created_at DESC);


-- =============================================================================
-- SECTION 12 — ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mentor_assignments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_assignments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_integrations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_goals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_connections         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_portfolio           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_milestones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_monitoring          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_course_enrollments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_recommendations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_interactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifiable_credentials      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issuers                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_files              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs                  ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- SECTION 13 — RLS POLICIES
-- =============================================================================

-- Helper function: get current user's profile id
CREATE OR REPLACE FUNCTION auth_profile_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Helper function: is current user a faculty?
CREATE OR REPLACE FUNCTION is_faculty()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'faculty'
  );
$$;

-- Helper function: is current user an admin? (faculty with faculty_level = 'admin')
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND role = 'faculty'
      AND faculty_level = 'admin'
  );
$$;

-- ── profiles ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"    ON public.profiles;

CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());


-- ── faculty ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "faculty_select_all"  ON public.faculty;
DROP POLICY IF EXISTS "faculty_admin_write" ON public.faculty;

CREATE POLICY "faculty_select_all"  ON public.faculty FOR SELECT USING (true);
CREATE POLICY "faculty_admin_write" ON public.faculty FOR ALL   USING (is_admin());


-- ── student_mentor_assignments ────────────────────────────────────────────────
DROP POLICY IF EXISTS "sma_select_all"   ON public.student_mentor_assignments;
DROP POLICY IF EXISTS "sma_admin_write"  ON public.student_mentor_assignments;

CREATE POLICY "sma_select_all"   ON public.student_mentor_assignments FOR SELECT USING (true);
CREATE POLICY "sma_admin_write"  ON public.student_mentor_assignments FOR ALL   USING (is_admin());


-- ── faculty_assignments ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "fa_select_faculty" ON public.faculty_assignments;
DROP POLICY IF EXISTS "fa_write_faculty"  ON public.faculty_assignments;

CREATE POLICY "fa_select_faculty" ON public.faculty_assignments
  FOR SELECT USING (faculty_id = auth_profile_id() OR student_id = auth_profile_id());

CREATE POLICY "fa_write_faculty" ON public.faculty_assignments
  FOR ALL USING (is_faculty());


-- ── lms_integrations ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "lms_admin_all" ON public.lms_integrations;

CREATE POLICY "lms_admin_all" ON public.lms_integrations FOR ALL USING (is_admin());


-- ── courses ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "courses_select_all"    ON public.courses;
DROP POLICY IF EXISTS "courses_write_faculty" ON public.courses;

CREATE POLICY "courses_select_all"    ON public.courses FOR SELECT USING (true);
CREATE POLICY "courses_write_faculty" ON public.courses FOR ALL
  USING (faculty_id = auth_profile_id() OR is_admin());


-- ── schedule ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "schedule_select_all"    ON public.schedule;
DROP POLICY IF EXISTS "schedule_write_faculty" ON public.schedule;

CREATE POLICY "schedule_select_all"    ON public.schedule FOR SELECT USING (true);
CREATE POLICY "schedule_write_faculty" ON public.schedule FOR ALL   USING (is_faculty());


-- ── student tables (own-data only) ───────────────────────────────────────────
DO $$ DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'student_progress','student_achievements','student_activities',
    'student_goals','student_portfolio','student_milestones',
    'student_course_enrollments','learning_recommendations'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "own_data_select" ON public.%I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "own_data_all"    ON public.%I', tbl);
    EXECUTE format(
      'CREATE POLICY "own_data_select" ON public.%I FOR SELECT
         USING (student_id = auth_profile_id() OR is_faculty())', tbl);
    EXECUTE format(
      'CREATE POLICY "own_data_all" ON public.%I FOR ALL
         USING (student_id = auth_profile_id())', tbl);
  END LOOP;
END $$;


-- ── student_connections ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "connections_select" ON public.student_connections;
DROP POLICY IF EXISTS "connections_write"  ON public.student_connections;

CREATE POLICY "connections_select" ON public.student_connections
  FOR SELECT USING (requester_id = auth_profile_id() OR receiver_id = auth_profile_id());

CREATE POLICY "connections_write" ON public.student_connections
  FOR ALL USING (requester_id = auth_profile_id() OR receiver_id = auth_profile_id());


-- ── student_monitoring ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "monitoring_select" ON public.student_monitoring;
DROP POLICY IF EXISTS "monitoring_write"  ON public.student_monitoring;

CREATE POLICY "monitoring_select" ON public.student_monitoring
  FOR SELECT USING (student_id = auth_profile_id() OR is_faculty());

CREATE POLICY "monitoring_write" ON public.student_monitoring
  FOR ALL USING (student_id = auth_profile_id() OR is_faculty());


-- ── certificates ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cert_select" ON public.certificates;
DROP POLICY IF EXISTS "cert_write"  ON public.certificates;

CREATE POLICY "cert_select" ON public.certificates
  FOR SELECT USING (student_id = auth_profile_id() OR is_faculty());

CREATE POLICY "cert_write" ON public.certificates
  FOR ALL USING (student_id = auth_profile_id() OR is_faculty());


-- ── community (open to all logged-in users) ───────────────────────────────────
DROP POLICY IF EXISTS "community_open"  ON public.community_groups;
DROP POLICY IF EXISTS "community_open"  ON public.community_posts;
DROP POLICY IF EXISTS "community_open"  ON public.post_comments;
DROP POLICY IF EXISTS "community_open"  ON public.post_interactions;
DROP POLICY IF EXISTS "community_open"  ON public.comment_interactions;
DROP POLICY IF EXISTS "community_open"  ON public.group_memberships;

CREATE POLICY "community_open" ON public.community_groups     FOR SELECT USING (true);
CREATE POLICY "community_open" ON public.community_posts      FOR SELECT USING (true);
CREATE POLICY "community_open" ON public.post_comments        FOR SELECT USING (true);
CREATE POLICY "community_open" ON public.post_interactions    FOR SELECT USING (true);
CREATE POLICY "community_open" ON public.comment_interactions FOR SELECT USING (true);
CREATE POLICY "community_open" ON public.group_memberships    FOR SELECT USING (true);

CREATE POLICY "community_write" ON public.community_posts
  FOR ALL USING (author_id = auth_profile_id() OR is_faculty());

CREATE POLICY "comments_write" ON public.post_comments
  FOR ALL USING (author_id = auth_profile_id() OR is_faculty());

CREATE POLICY "interactions_write" ON public.post_interactions
  FOR ALL USING (user_id = auth_profile_id());

CREATE POLICY "comment_interactions_write" ON public.comment_interactions
  FOR ALL USING (user_id = auth_profile_id());

CREATE POLICY "groups_write" ON public.community_groups
  FOR ALL USING (created_by = auth_profile_id() OR is_faculty());

CREATE POLICY "memberships_write" ON public.group_memberships
  FOR ALL USING (user_id = auth_profile_id());


-- ── notifications ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "notif_own" ON public.notifications;

CREATE POLICY "notif_own" ON public.notifications
  FOR ALL USING (user_id = auth_profile_id());


-- ── messages ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "msg_own" ON public.messages;

CREATE POLICY "msg_own" ON public.messages
  FOR ALL USING (sender_id = auth_profile_id() OR receiver_id = auth_profile_id());


-- ── events ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "events_select_all"   ON public.events;
DROP POLICY IF EXISTS "events_write_faculty"ON public.events;
DROP POLICY IF EXISTS "er_select"           ON public.event_registrations;
DROP POLICY IF EXISTS "er_write"            ON public.event_registrations;

CREATE POLICY "events_select_all"    ON public.events FOR SELECT USING (true);
CREATE POLICY "events_write_faculty" ON public.events FOR ALL   USING (is_faculty());

CREATE POLICY "er_select" ON public.event_registrations
  FOR SELECT USING (user_id = auth_profile_id() OR is_faculty());

CREATE POLICY "er_write" ON public.event_registrations
  FOR ALL USING (user_id = auth_profile_id() OR is_faculty());


-- ── verifiable credentials ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "vc_select" ON public.verifiable_credentials;
DROP POLICY IF EXISTS "vc_write"  ON public.verifiable_credentials;

CREATE POLICY "vc_select" ON public.verifiable_credentials FOR SELECT USING (true);
CREATE POLICY "vc_write"  ON public.verifiable_credentials
  FOR ALL USING (student_id = auth_profile_id() OR is_faculty());

CREATE POLICY "issuers_select_all"   ON public.issuers FOR SELECT USING (true);
CREATE POLICY "issuers_write_faculty"ON public.issuers FOR ALL   USING (is_faculty());
CREATE POLICY "evidence_select_all"  ON public.evidence_files FOR SELECT USING (true);
CREATE POLICY "evidence_write"       ON public.evidence_files
  FOR ALL USING (is_faculty());

CREATE POLICY "audit_admin_all"      ON public.audit_logs FOR ALL USING (is_admin());


-- =============================================================================
-- SECTION 14 — AUTO-UPDATE updated_at TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'profiles','faculty','student_mentor_assignments','lms_integrations',
    'courses','schedule','student_goals','student_connections',
    'student_portfolio','student_course_enrollments','certificates',
    'community_groups','community_posts','post_comments','events'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
       CREATE TRIGGER set_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION handle_updated_at();', tbl, tbl);
  END LOOP;
END $$;


-- =============================================================================
-- SECTION 15 — AUTO-CREATE student_progress ROW ON NEW STUDENT PROFILE
-- =============================================================================

CREATE OR REPLACE FUNCTION create_student_progress()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.role = 'student' THEN
    INSERT INTO public.student_progress (student_id)
    VALUES (NEW.id)
    ON CONFLICT (student_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_student_profile_created ON public.profiles;
CREATE TRIGGER on_student_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION create_student_progress();


-- =============================================================================
-- DONE ✓
-- Tables created: 28
-- Enum types:     11
-- RLS policies:   fully configured per role
-- Triggers:       updated_at + student_progress auto-create
-- =============================================================================
