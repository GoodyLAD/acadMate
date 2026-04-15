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
      AND p.id = faculty_id));

CREATE POLICY "courses_delete_faculty" ON public.courses FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()::uuid
      AND p.role IN ('faculty'::public.user_role, 'admin'::public.user_role)
      AND p.id = faculty_id));

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
CREATE POLICY "certs_upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'certificates'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()::uuid AND role = 'student'::public.user_role));

CREATE POLICY "certs_view" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'certificates'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()::uuid
          AND role IN ('faculty'::public.user_role, 'admin'::public.user_role))));

CREATE POLICY "thumbnails_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'course_thumbnails');

CREATE POLICY "thumbnails_auth_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course_thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "faculty_docs_admin_write" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'faculty_documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));

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
