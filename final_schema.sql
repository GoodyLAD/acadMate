-- =============================================================================
-- SIH2 (AcadMate) — FRESH INSTALL SCHEMA
--
-- HOW TO USE:
-- STEP 1 — Wipe existing schema (new query in SQL Editor):
--   DROP SCHEMA public CASCADE;
--   CREATE SCHEMA public;
--   GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
--   GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;
--
-- STEP 2 — Run this entire file.
-- =============================================================================


-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================================
-- ENUM TYPES
-- =============================================================================
CREATE TYPE public.user_role          AS ENUM ('student', 'faculty', 'admin');
CREATE TYPE public.faculty_level      AS ENUM ('basic', 'senior', 'admin');
CREATE TYPE public.certificate_category AS ENUM ('academic', 'co_curricular');
CREATE TYPE public.certificate_status AS ENUM ('pending', 'approved', 'rejected');


-- =============================================================================
-- CORE TABLES
-- =============================================================================

CREATE TABLE public.profiles (
  id                       UUID                      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID                      NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name                TEXT                      NOT NULL DEFAULT '',
  email                    TEXT                      NOT NULL DEFAULT '',
  role                     public.user_role          NOT NULL DEFAULT 'student',
  faculty_level            public.faculty_level      DEFAULT NULL,
  student_id               TEXT,
  faculty_id               TEXT,
  roll_number              VARCHAR(20),
  assigned_faculty_id      UUID                      REFERENCES public.profiles(id) ON DELETE SET NULL,
  interests                TEXT[]                    DEFAULT '{}',
  certifications           TEXT[]                    DEFAULT '{}',
  skills                   TEXT[]                    DEFAULT '{}',
  career_goals             TEXT[]                    DEFAULT '{}',
  experience_level         TEXT                      DEFAULT 'beginner'
                             CHECK (experience_level IN ('beginner','intermediate','advanced')),
  preferred_learning_style TEXT                      DEFAULT 'mixed'
                             CHECK (preferred_learning_style IN ('visual','hands-on','theoretical','mixed')),
  completed_courses        TEXT[]                    DEFAULT '{}',
  created_at               TIMESTAMPTZ               NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ               NOT NULL DEFAULT now()
);

CREATE TABLE public.faculty (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT         NOT NULL,
  email           TEXT         NOT NULL UNIQUE,
  department      TEXT,
  designation     TEXT,
  faculty_code    VARCHAR(10)  UNIQUE,
  phone           VARCHAR(15),
  specialization  TEXT,
  is_verified     BOOLEAN      NOT NULL DEFAULT FALSE,
  user_id         UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE public.student_mentor_assignments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id   UUID        NOT NULL REFERENCES public.faculty(id)  ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, mentor_id)
);

CREATE TABLE public.certificates (
  id               UUID                        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID                        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            TEXT                        NOT NULL,
  description      TEXT,
  category         public.certificate_category NOT NULL,
  file_url         TEXT                        NOT NULL,
  file_name        TEXT                        NOT NULL,
  status           public.certificate_status   NOT NULL DEFAULT 'pending',
  verified_by      UUID                        REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  uploaded_at      TIMESTAMPTZ                 NOT NULL DEFAULT now()
);

CREATE TABLE public.messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  read_at     TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_user_id UUID        REFERENCES public.profiles(id),
  title        TEXT        NOT NULL,
  message      TEXT        NOT NULL,
  type         TEXT        NOT NULL,
  data         JSONB,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.courses (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT        NOT NULL,
  course_code          TEXT        NOT NULL UNIQUE,
  faculty_id           UUID        REFERENCES public.profiles(id),
  tags                 TEXT[],
  description          TEXT,
  deadline             DATE,
  credit_hours         INTEGER,
  thumbnail_url        TEXT,
  external_link        TEXT,
  assigned_student_ids TEXT[],
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.schedule (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name    TEXT        NOT NULL,
  start          TIMESTAMPTZ NOT NULL,
  "end"          TIMESTAMPTZ NOT NULL,
  room           TEXT,
  tags           TEXT[],
  syllabus_url   TEXT,
  students_count INTEGER     DEFAULT 0,
  notes          TEXT,
  color          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- COMMUNITY TABLES
-- =============================================================================

CREATE TABLE public.community_groups (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  created_by  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.group_memberships (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id  UUID        NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role      TEXT        NOT NULL DEFAULT 'member' CHECK (role IN ('member','admin')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE TABLE public.community_posts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name   TEXT,
  author_avatar TEXT,
  content       TEXT        NOT NULL,
  category      TEXT        NOT NULL
                  CHECK (category IN ('Academics','Placements','Clubs','Events','General')),
  group_id      UUID        REFERENCES public.community_groups(id) ON DELETE SET NULL,
  is_blocked    BOOLEAN     NOT NULL DEFAULT FALSE,
  reports_count INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.post_interactions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id          UUID        NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interaction_type TEXT        NOT NULL CHECK (interaction_type IN ('upvote','downvote','bookmark')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, interaction_type)
);

CREATE TABLE public.post_comments (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       UUID        NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name   TEXT,
  author_avatar TEXT,
  content       TEXT        NOT NULL,
  is_blocked    BOOLEAN     NOT NULL DEFAULT FALSE,
  reports_count INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.comment_interactions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id       UUID        NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interaction_type TEXT        NOT NULL CHECK (interaction_type IN ('upvote','downvote')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id, interaction_type)
);

CREATE TABLE public.user_bans (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  banned_by  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason     TEXT        NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =============================================================================
-- VERIFIABLE CREDENTIALS TABLES
-- =============================================================================

CREATE TABLE public.issuers (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(255) NOT NULL,
  did            VARCHAR(255) UNIQUE,
  public_key_jwk JSONB        NOT NULL,
  sign_key_id    VARCHAR(100) NOT NULL,
  status         VARCHAR(20)  DEFAULT 'active' CHECK (status IN ('active','deprecated','revoked')),
  created_at     TIMESTAMPTZ  DEFAULT now(),
  updated_at     TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE public.verifiable_credentials (
  id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  vc_id             VARCHAR(255) NOT NULL UNIQUE,
  student_id        UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  issuer_id         UUID         NOT NULL REFERENCES public.issuers(id) ON DELETE RESTRICT,
  activity_id       UUID,
  credential_json   JSONB        NOT NULL,
  credential_hash   VARCHAR(64)  NOT NULL,
  proof             JSONB        NOT NULL,
  short_token       VARCHAR(50)  UNIQUE,
  issued_at         TIMESTAMPTZ  DEFAULT now(),
  expires_at        TIMESTAMPTZ,
  revoked_at        TIMESTAMPTZ,
  revocation_reason TEXT,
  created_at        TIMESTAMPTZ  DEFAULT now(),
  updated_at        TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE public.evidence_files (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  vc_id         UUID          NOT NULL REFERENCES public.verifiable_credentials(id) ON DELETE CASCADE,
  file_name     VARCHAR(255)  NOT NULL,
  file_type     VARCHAR(100)  NOT NULL,
  file_size     BIGINT        NOT NULL,
  storage_url   TEXT          NOT NULL,
  thumbnail_url TEXT,
  file_hash     VARCHAR(64)   NOT NULL,
  metadata      JSONB,
  created_at    TIMESTAMPTZ   DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  action     VARCHAR(50) NOT NULL,
  user_id    UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  vc_id      TEXT,       -- stores the vc_id URN string, not the UUID primary key
  issuer_id  UUID        REFERENCES public.issuers(id) ON DELETE SET NULL,
  details    JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.anchoring_jobs (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  merkle_root  VARCHAR(66) NOT NULL,
  tx_hash      VARCHAR(66),
  chain        VARCHAR(50) NOT NULL,
  block_number BIGINT,
  status       VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','failed')),
  vc_count     INTEGER     NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);

CREATE TABLE public.merkle_proofs (
  id               UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  vc_id            UUID    NOT NULL REFERENCES public.verifiable_credentials(id) ON DELETE CASCADE,
  anchoring_job_id UUID    NOT NULL REFERENCES public.anchoring_jobs(id) ON DELETE CASCADE,
  merkle_proof     JSONB   NOT NULL,
  leaf_index       INTEGER NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- LMS / ERP INTEGRATION TABLES
-- =============================================================================

CREATE TABLE public.webhooks (
  id             UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  url            TEXT      NOT NULL,
  events         TEXT[]    NOT NULL,
  secret         TEXT,
  is_active      BOOLEAN   DEFAULT true,
  retry_count    INTEGER   DEFAULT 0,
  last_triggered TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.webhook_logs (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id      UUID    REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type      TEXT    NOT NULL,
  resource_type   TEXT    NOT NULL,
  resource_id     TEXT    NOT NULL,
  payload         JSONB   NOT NULL,
  response_status INTEGER,
  response_body   TEXT,
  error_message   TEXT,
  triggered_at    TIMESTAMPTZ DEFAULT now(),
  processed_at    TIMESTAMPTZ
);

CREATE TABLE public.integration_configs (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT    NOT NULL,
  type          TEXT    NOT NULL CHECK (type IN ('moodle','canvas','blackboard','generic','sis','erp')),
  base_url      TEXT    NOT NULL,
  api_key       TEXT,
  client_id     TEXT,
  client_secret TEXT,
  webhook_url   TEXT,
  is_active     BOOLEAN DEFAULT true,
  settings      JSONB   DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.api_keys (
  id           UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT      NOT NULL,
  key_hash     TEXT      NOT NULL UNIQUE,
  permissions  TEXT[]    DEFAULT '{}',
  is_active    BOOLEAN   DEFAULT true,
  expires_at   TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now(),
  created_by   UUID      REFERENCES public.profiles(id)
);

CREATE TABLE public.data_sync_logs (
  id                 UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id     UUID    REFERENCES public.integration_configs(id),
  sync_type          TEXT    NOT NULL,
  direction          TEXT    NOT NULL CHECK (direction IN ('inbound','outbound')),
  status             TEXT    NOT NULL CHECK (status IN ('pending','success','failed','partial')),
  records_processed  INTEGER DEFAULT 0,
  records_successful INTEGER DEFAULT 0,
  records_failed     INTEGER DEFAULT 0,
  error_details      JSONB,
  started_at         TIMESTAMPTZ DEFAULT now(),
  completed_at       TIMESTAMPTZ
);


-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('certificates',      'certificates',      false),
  ('course_thumbnails', 'course_thumbnails',  true),
  ('faculty_documents', 'faculty_documents', false)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_profiles_experience_level    ON public.profiles (experience_level);
CREATE INDEX idx_profiles_roll_number         ON public.profiles (roll_number);
CREATE INDEX idx_profiles_interests           ON public.profiles USING GIN (interests);
CREATE INDEX idx_profiles_skills              ON public.profiles USING GIN (skills);
CREATE INDEX idx_profiles_certifications      ON public.profiles USING GIN (certifications);
CREATE INDEX idx_profiles_career_goals        ON public.profiles USING GIN (career_goals);
CREATE INDEX idx_profiles_completed_courses   ON public.profiles USING GIN (completed_courses);
CREATE INDEX idx_faculty_email                ON public.faculty (email);
CREATE INDEX idx_faculty_code                 ON public.faculty (faculty_code);
CREATE INDEX idx_faculty_department           ON public.faculty (department);
CREATE INDEX idx_faculty_is_verified          ON public.faculty (is_verified);
CREATE INDEX idx_faculty_user_id              ON public.faculty (user_id);
CREATE INDEX idx_sma_student_id               ON public.student_mentor_assignments (student_id);
CREATE INDEX idx_sma_mentor_id                ON public.student_mentor_assignments (mentor_id);
CREATE INDEX idx_community_posts_author       ON public.community_posts (author_id);
CREATE INDEX idx_community_posts_group        ON public.community_posts (group_id);
CREATE INDEX idx_community_posts_category     ON public.community_posts (category);
CREATE INDEX idx_community_posts_created_at   ON public.community_posts (created_at DESC);
CREATE INDEX idx_post_interactions_post       ON public.post_interactions (post_id);
CREATE INDEX idx_post_interactions_user       ON public.post_interactions (user_id);
CREATE INDEX idx_post_comments_post           ON public.post_comments (post_id);
CREATE INDEX idx_post_comments_author         ON public.post_comments (author_id);
CREATE INDEX idx_comment_interactions_comment ON public.comment_interactions (comment_id);
CREATE INDEX idx_group_memberships_group      ON public.group_memberships (group_id);
CREATE INDEX idx_group_memberships_user       ON public.group_memberships (user_id);
CREATE INDEX idx_vc_student                   ON public.verifiable_credentials (student_id);
CREATE INDEX idx_vc_issuer                    ON public.verifiable_credentials (issuer_id);
CREATE INDEX idx_vc_vc_id                     ON public.verifiable_credentials (vc_id);
CREATE INDEX idx_vc_short_token               ON public.verifiable_credentials (short_token);
CREATE INDEX idx_vc_issued_at                 ON public.verifiable_credentials (issued_at);
CREATE INDEX idx_vc_revoked_at                ON public.verifiable_credentials (revoked_at);
CREATE INDEX idx_evidence_vc                  ON public.evidence_files (vc_id);
CREATE INDEX idx_audit_action                 ON public.audit_logs (action);
CREATE INDEX idx_audit_timestamp              ON public.audit_logs (timestamp);
CREATE INDEX idx_merkle_vc                    ON public.merkle_proofs (vc_id);
CREATE INDEX idx_merkle_job                   ON public.merkle_proofs (anchoring_job_id);
CREATE INDEX idx_webhooks_events              ON public.webhooks USING GIN (events);
CREATE INDEX idx_webhooks_active              ON public.webhooks (is_active);
CREATE INDEX idx_webhook_logs_webhook         ON public.webhook_logs (webhook_id);
CREATE INDEX idx_webhook_logs_triggered       ON public.webhook_logs (triggered_at);
CREATE INDEX idx_integration_type             ON public.integration_configs (type);
CREATE INDEX idx_api_keys_active              ON public.api_keys (is_active);
CREATE INDEX idx_data_sync_integration        ON public.data_sync_logs (integration_id);


-- =============================================================================
-- FUNCTIONS
-- =============================================================================

CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Sign-up trigger: auto-inserts a profile row for every new auth user.
-- SET row_security = off ensures this function NEVER hits RLS policies,
-- avoiding the uuid=text operator error when auth.uid() has no JWT context.
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  SET row_security = off
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.user_role,
      'student'::public.user_role
    )
  );
  RETURN NEW;
END; $$;

CREATE FUNCTION public.notify_certificate_verification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status = 'pending'::public.certificate_status
     AND NEW.status IN ('approved'::public.certificate_status, 'rejected'::public.certificate_status)
  THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.student_id,
      'Certificate ' || NEW.status::text,
      'Your certificate "' || NEW.title || '" has been ' || NEW.status::text ||
        CASE WHEN NEW.status = 'rejected'::public.certificate_status AND NEW.rejection_reason IS NOT NULL
             THEN '. Reason: ' || NEW.rejection_reason ELSE '.' END,
      'certificate_' || NEW.status::text
    );
  END IF;
  RETURN NEW;
END; $$;

CREATE FUNCTION public.handle_message_realtime()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN RETURN NEW; END; $$;

CREATE FUNCTION public.generate_short_token()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN RETURN encode(gen_random_bytes(16), 'base64'); END; $$;

CREATE FUNCTION public.generate_vc_id()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN RETURN 'urn:uuid:' || uuid_generate_v4()::text; END; $$;

CREATE FUNCTION public.compute_credential_hash(credential_json JSONB)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN RETURN encode(digest(credential_json::text, 'sha256'), 'hex'); END; $$;

CREATE FUNCTION public.get_active_issuer()
RETURNS TABLE (id UUID, name VARCHAR, did VARCHAR, public_key_jwk JSONB,
               sign_key_id VARCHAR, status VARCHAR, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.name, i.did, i.public_key_jwk, i.sign_key_id, i.status, i.created_at, i.updated_at
  FROM public.issuers i WHERE i.status = 'active' LIMIT 1;
END; $$;

CREATE FUNCTION public.insert_verifiable_credential(
  p_vc_id VARCHAR, p_student_id UUID, p_issuer_id UUID, p_activity_id UUID,
  p_credential_json JSONB, p_credential_hash VARCHAR, p_proof JSONB,
  p_short_token VARCHAR, p_expires_at TIMESTAMPTZ)
RETURNS TABLE (id UUID, vc_id VARCHAR, student_id UUID, issuer_id UUID, activity_id UUID,
               credential_json JSONB, credential_hash VARCHAR, proof JSONB, short_token VARCHAR,
               issued_at TIMESTAMPTZ, expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql AS $$
DECLARE new_id UUID;
BEGIN
  new_id := uuid_generate_v4();
  INSERT INTO public.verifiable_credentials
    (id, vc_id, student_id, issuer_id, activity_id, credential_json, credential_hash, proof, short_token, expires_at)
  VALUES
    (new_id, p_vc_id, p_student_id, p_issuer_id, p_activity_id, p_credential_json, p_credential_hash, p_proof, p_short_token, p_expires_at);
  RETURN QUERY
  SELECT vc.id, vc.vc_id, vc.student_id, vc.issuer_id, vc.activity_id,
         vc.credential_json, vc.credential_hash, vc.proof, vc.short_token,
         vc.issued_at, vc.expires_at, vc.created_at, vc.updated_at
  FROM public.verifiable_credentials vc WHERE vc.id = new_id;
END; $$;

CREATE FUNCTION public.get_credential_by_token(p_short_token VARCHAR)
RETURNS TABLE (credential_json JSONB) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT vc.credential_json FROM public.verifiable_credentials vc
  WHERE vc.short_token = p_short_token;
END; $$;

CREATE FUNCTION public.get_credential_with_issuer(p_short_token VARCHAR)
RETURNS TABLE (vc_id VARCHAR, credential_json JSONB, issued_at TIMESTAMPTZ,
               revoked_at TIMESTAMPTZ, revocation_reason TEXT, issuer_did VARCHAR, issuer_name VARCHAR)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT vc.vc_id, vc.credential_json, vc.issued_at, vc.revoked_at, vc.revocation_reason,
         i.did, i.name
  FROM public.verifiable_credentials vc
  JOIN public.issuers i ON i.id = vc.issuer_id
  WHERE vc.short_token = p_short_token;
END; $$;

CREATE FUNCTION public.revoke_credential(p_vc_id VARCHAR, p_revoked_by VARCHAR, p_reason TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.verifiable_credentials
  SET revoked_at = now(), revocation_reason = p_reason
  WHERE vc_id = p_vc_id;
END; $$;

CREATE FUNCTION public.get_student_credentials(p_student_id UUID)
RETURNS TABLE (credential_json JSONB) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT vc.credential_json FROM public.verifiable_credentials vc
  WHERE vc.student_id = p_student_id ORDER BY vc.issued_at DESC;
END; $$;

CREATE FUNCTION public.log_audit_action(
  p_action VARCHAR, p_user_id UUID, p_vc_id VARCHAR, p_issuer_id UUID, p_details JSONB)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.audit_logs (action, user_id, vc_id, issuer_id, details)
  VALUES (p_action, p_user_id, p_vc_id, p_issuer_id, p_details);
END; $$;

CREATE FUNCTION public.trigger_webhook(
  p_event_type TEXT, p_resource_type TEXT, p_resource_id TEXT, p_data JSONB)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE wh RECORD; payload JSONB;
BEGIN
  FOR wh IN SELECT * FROM public.webhooks WHERE is_active = true AND p_event_type = ANY(events) LOOP
    payload := jsonb_build_object(
      'event_type', p_event_type, 'resource_type', p_resource_type,
      'resource_id', p_resource_id, 'data', p_data,
      'timestamp', now(), 'webhook_id', wh.id);
    INSERT INTO public.webhook_logs (webhook_id, event_type, resource_type, resource_id, payload)
    VALUES (wh.id, p_event_type, p_resource_type, p_resource_id, payload);
    UPDATE public.webhooks SET last_triggered = now(), updated_at = now() WHERE id = wh.id;
  END LOOP;
END; $$;

CREATE FUNCTION public.generate_api_key(
  p_name TEXT, p_permissions TEXT[] DEFAULT '{}',
  p_expires_at TIMESTAMPTZ DEFAULT NULL, p_created_by UUID DEFAULT NULL)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE api_key TEXT; key_hash TEXT;
BEGIN
  api_key  := encode(gen_random_bytes(32), 'hex');
  key_hash := encode(digest(api_key, 'sha256'), 'hex');
  INSERT INTO public.api_keys (name, key_hash, permissions, expires_at, created_by)
  VALUES (p_name, key_hash, p_permissions, p_expires_at, p_created_by);
  RETURN api_key;
END; $$;


-- Supabase Cloud protects the auth schema — wrap auth.users trigger
-- management in a DO block so any permission error is silently caught
-- and does NOT abort the transaction.
DO $$
BEGIN
  -- Drop old trigger if it exists (may be stale after DROP SCHEMA public CASCADE)
  BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  EXCEPTION WHEN OTHERS THEN
    -- Supabase may protect this; ignore and continue
    NULL;
  END;

  -- Recreate trigger pointing to our new handle_new_user()
  BEGIN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  EXCEPTION
    WHEN duplicate_object THEN NULL;  -- already exists, fine
    WHEN OTHERS THEN NULL;            -- Supabase protection, fine
  END;
END $$;


CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at
  BEFORE UPDATE ON public.faculty
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sma_updated_at
  BEFORE UPDATE ON public.student_mentor_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_message_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_message_realtime();

CREATE TRIGGER on_message_update
  AFTER UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_message_realtime();

CREATE TRIGGER on_certificate_status_change
  AFTER UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.notify_certificate_verification();

CREATE TRIGGER trg_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_schedule_updated_at
  BEFORE UPDATE ON public.schedule
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_community_groups_updated_at
  BEFORE UPDATE ON public.community_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issuers_updated_at
  BEFORE UPDATE ON public.issuers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vc_updated_at
  BEFORE UPDATE ON public.verifiable_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.profiles                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_interactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bans                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issuers                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifiable_credentials     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_files             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anchoring_jobs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merkle_proofs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sync_logs             ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- RLS POLICIES
-- auth.uid() is explicitly cast to ::uuid everywhere it is compared with a UUID
-- column, ensuring compatibility across all Supabase/PostgreSQL versions.
-- =============================================================================

-- profiles ────────────────────────────────────────────────────────────────────
-- INSERT is intentionally excluded: profiles are only created by the
-- handle_new_user() SECURITY DEFINER trigger (row_security = off).
-- Direct client inserts are blocked by the absence of an INSERT policy.
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (auth.uid()::uuid = user_id);

-- faculty ─────────────────────────────────────────────────────────────────────
CREATE POLICY "faculty_select_authenticated" ON public.faculty FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "faculty_admin_all" ON public.faculty FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));

-- student_mentor_assignments ──────────────────────────────────────────────────
CREATE POLICY "sma_admin_all" ON public.student_mentor_assignments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));

CREATE POLICY "sma_select_own" ON public.student_mentor_assignments FOR SELECT
  USING (
    student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid)
    OR
    mentor_id IN (SELECT id FROM public.faculty WHERE user_id = auth.uid()::uuid));

-- certificates ────────────────────────────────────────────────────────────────
CREATE POLICY "certs_student_select" ON public.certificates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = certificates.student_id AND user_id = auth.uid()::uuid));

CREATE POLICY "certs_student_insert" ON public.certificates FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = certificates.student_id AND user_id = auth.uid()::uuid));

CREATE POLICY "certs_staff_select" ON public.certificates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()::uuid
      AND role IN ('faculty'::public.user_role, 'admin'::public.user_role)));

CREATE POLICY "certs_staff_update" ON public.certificates FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()::uuid
      AND role IN ('faculty'::public.user_role, 'admin'::public.user_role)));

-- messages ────────────────────────────────────────────────────────────────────
CREATE POLICY "messages_select_own" ON public.messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = messages.sender_id   AND user_id = auth.uid()::uuid)
    OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = messages.receiver_id AND user_id = auth.uid()::uuid));

CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = messages.sender_id AND user_id = auth.uid()::uuid));

CREATE POLICY "messages_update_own" ON public.messages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = messages.receiver_id AND user_id = auth.uid()::uuid));

-- notifications ───────────────────────────────────────────────────────────────
CREATE POLICY "notifs_select_own" ON public.notifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = notifications.user_id AND user_id = auth.uid()::uuid));

CREATE POLICY "notifs_update_own" ON public.notifications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = notifications.user_id AND user_id = auth.uid()::uuid));

CREATE POLICY "notifs_insert_service" ON public.notifications FOR INSERT
  WITH CHECK (true);

-- courses ─────────────────────────────────────────────────────────────────────
CREATE POLICY "courses_select_auth" ON public.courses FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "courses_insert_faculty" ON public.courses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()::uuid
      AND role IN ('faculty'::public.user_role, 'admin'::public.user_role)));

CREATE POLICY "courses_update_faculty" ON public.courses FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()::uuid
      AND p.role IN ('faculty'::public.user_role, 'admin'::public.user_role)
      AND p.id = courses.faculty_id));

CREATE POLICY "courses_delete_faculty" ON public.courses FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()::uuid
      AND p.role IN ('faculty'::public.user_role, 'admin'::public.user_role)
      AND p.id = courses.faculty_id));

-- schedule ────────────────────────────────────────────────────────────────────
CREATE POLICY "schedule_select_auth" ON public.schedule FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "schedule_modify_faculty" ON public.schedule FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()::uuid
      AND role IN ('faculty'::public.user_role, 'admin'::public.user_role)))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()::uuid
      AND role IN ('faculty'::public.user_role, 'admin'::public.user_role)));

-- community_groups ────────────────────────────────────────────────────────────
CREATE POLICY "cg_select_all"          ON public.community_groups FOR SELECT USING (true);
CREATE POLICY "cg_insert_authenticated" ON public.community_groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "cg_update_creator"       ON public.community_groups FOR UPDATE
  USING (created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));
CREATE POLICY "cg_delete_creator"       ON public.community_groups FOR DELETE
  USING (created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));

-- group_memberships ───────────────────────────────────────────────────────────
CREATE POLICY "gm_select_auth" ON public.group_memberships FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "gm_insert_auth" ON public.group_memberships FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "gm_delete_own"  ON public.group_memberships FOR DELETE
  USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));

-- community_posts ─────────────────────────────────────────────────────────────
CREATE POLICY "cp_select_all"  ON public.community_posts FOR SELECT USING (NOT is_blocked);
CREATE POLICY "cp_insert_auth" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "cp_update_own"  ON public.community_posts FOR UPDATE
  USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));
CREATE POLICY "cp_delete_own"  ON public.community_posts FOR DELETE
  USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));

-- post_interactions ───────────────────────────────────────────────────────────
CREATE POLICY "pi_select_auth" ON public.post_interactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "pi_insert_auth" ON public.post_interactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "pi_delete_own"  ON public.post_interactions FOR DELETE
  USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));

-- post_comments ───────────────────────────────────────────────────────────────
CREATE POLICY "pc_select_all"  ON public.post_comments FOR SELECT USING (NOT is_blocked);
CREATE POLICY "pc_insert_auth" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "pc_update_own"  ON public.post_comments FOR UPDATE
  USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));
CREATE POLICY "pc_delete_own"  ON public.post_comments FOR DELETE
  USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));

-- comment_interactions ────────────────────────────────────────────────────────
CREATE POLICY "ci_select_auth" ON public.comment_interactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "ci_insert_auth" ON public.comment_interactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ci_delete_own"  ON public.comment_interactions FOR DELETE
  USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));

-- user_bans ───────────────────────────────────────────────────────────────────
CREATE POLICY "ub_select_own" ON public.user_bans FOR SELECT
  USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));
CREATE POLICY "ub_admin_all"  ON public.user_bans FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));

-- issuers ─────────────────────────────────────────────────────────────────────
CREATE POLICY "issuers_admin_only" ON public.issuers FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));

-- verifiable_credentials ──────────────────────────────────────────────────────
CREATE POLICY "vc_student_select" ON public.verifiable_credentials FOR SELECT
  USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));

CREATE POLICY "vc_admin_select" ON public.verifiable_credentials FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));

CREATE POLICY "vc_faculty_select" ON public.verifiable_credentials FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.student_mentor_assignments sma
    JOIN public.faculty f ON f.id = sma.mentor_id
    WHERE f.user_id = auth.uid()::uuid
      AND sma.student_id = verifiable_credentials.student_id));

CREATE POLICY "vc_faculty_insert" ON public.verifiable_credentials FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()::uuid
      AND role IN ('faculty'::public.user_role, 'admin'::public.user_role)));

-- evidence_files ──────────────────────────────────────────────────────────────
CREATE POLICY "ef_select" ON public.evidence_files FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.verifiable_credentials vc
    WHERE vc.id = evidence_files.vc_id
      AND (
        vc.student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid)
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE user_id = auth.uid()::uuid
            AND role IN ('admin'::public.user_role, 'faculty'::public.user_role)))));

-- audit_logs ──────────────────────────────────────────────────────────────────
CREATE POLICY "al_staff_select" ON public.audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()::uuid
      AND role IN ('admin'::public.user_role, 'faculty'::public.user_role)));

-- anchoring_jobs ──────────────────────────────────────────────────────────────
CREATE POLICY "aj_admin_only" ON public.anchoring_jobs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));

-- merkle_proofs ───────────────────────────────────────────────────────────────
CREATE POLICY "mp_public_select" ON public.merkle_proofs FOR SELECT USING (true);

-- LMS / ERP — admin only ──────────────────────────────────────────────────────
CREATE POLICY "webhooks_admin" ON public.webhooks FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));
CREATE POLICY "wl_admin" ON public.webhook_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));
CREATE POLICY "ic_admin" ON public.integration_configs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));
CREATE POLICY "ak_admin" ON public.api_keys FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));
CREATE POLICY "dsl_admin" ON public.data_sync_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));

-- storage ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "certs_upload" ON storage.objects;
CREATE POLICY "certs_upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'certificates'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()::uuid AND role = 'student'::public.user_role));

DROP POLICY IF EXISTS "certs_view" ON storage.objects;
CREATE POLICY "certs_view" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'certificates'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()::uuid
          AND role IN ('faculty'::public.user_role, 'admin'::public.user_role))));

DROP POLICY IF EXISTS "thumbnails_public_read" ON storage.objects;
CREATE POLICY "thumbnails_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'course_thumbnails');

DROP POLICY IF EXISTS "thumbnails_auth_upload" ON storage.objects;
CREATE POLICY "thumbnails_auth_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course_thumbnails' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "faculty_docs_admin_write" ON storage.objects;
CREATE POLICY "faculty_docs_admin_write" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'faculty_documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));

DROP POLICY IF EXISTS "faculty_docs_admin_read" ON storage.objects;
CREATE POLICY "faculty_docs_admin_read" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'faculty_documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));


-- =============================================================================
-- REALTIME PUBLICATIONS
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comment_interactions;


-- =============================================================================
-- GRANTS
-- =============================================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL   ON ALL TABLES    IN SCHEMA public TO postgres, service_role;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA public TO authenticated;
GRANT USAGE                          ON ALL SEQUENCES IN SCHEMA public TO authenticated;


-- =============================================================================
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
