DO $$
DECLARE
  stmt text;
BEGIN
-- 1
stmt := $SQL$CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);$SQL$;
EXECUTE stmt;

-- 2
stmt := $SQL$CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid()::uuid = user_id);$SQL$;
EXECUTE stmt;

-- 3
stmt := $SQL$CREATE POLICY "faculty_select_authenticated" ON public.faculty FOR SELECT USING (auth.role() = 'authenticated');$SQL$;
EXECUTE stmt;

-- 4
stmt := $SQL$CREATE POLICY "faculty_admin_all" ON public.faculty FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));$SQL$;
EXECUTE stmt;

-- 5
stmt := $SQL$CREATE POLICY "sma_admin_all" ON public.student_mentor_assignments FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));$SQL$;
EXECUTE stmt;

-- 6
stmt := $SQL$CREATE POLICY "sma_select_own" ON public.student_mentor_assignments FOR SELECT USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid) OR mentor_id IN (SELECT id FROM public.faculty WHERE user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 7
stmt := $SQL$CREATE POLICY "certs_student_select" ON public.certificates FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = certificates.student_id AND user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 8
stmt := $SQL$CREATE POLICY "certs_student_insert" ON public.certificates FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = certificates.student_id AND user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 9
stmt := $SQL$CREATE POLICY "certs_staff_select" ON public.certificates FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role IN ('faculty'::public.user_role, 'admin'::public.user_role)));$SQL$;
EXECUTE stmt;

-- 10
stmt := $SQL$CREATE POLICY "certs_staff_update" ON public.certificates FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role IN ('faculty'::public.user_role, 'admin'::public.user_role)));$SQL$;
EXECUTE stmt;

-- 11
stmt := $SQL$CREATE POLICY "messages_select_own" ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = messages.sender_id AND user_id = auth.uid()::uuid) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = messages.receiver_id AND user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 12
stmt := $SQL$CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = messages.sender_id AND user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 13
stmt := $SQL$CREATE POLICY "messages_update_own" ON public.messages FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = messages.receiver_id AND user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 14
stmt := $SQL$CREATE POLICY "notifs_select_own" ON public.notifications FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = notifications.user_id AND user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 15
stmt := $SQL$CREATE POLICY "notifs_update_own" ON public.notifications FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = notifications.user_id AND user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 16
stmt := $SQL$CREATE POLICY "notifs_insert_service" ON public.notifications FOR INSERT WITH CHECK (true);$SQL$;
EXECUTE stmt;

-- 17
stmt := $SQL$CREATE POLICY "courses_select_auth" ON public.courses FOR SELECT USING (auth.role() = 'authenticated');$SQL$;
EXECUTE stmt;

-- 18
stmt := $SQL$CREATE POLICY "courses_insert_faculty" ON public.courses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role IN ('faculty'::public.user_role, 'admin'::public.user_role)));$SQL$;
EXECUTE stmt;

-- 19
stmt := $SQL$CREATE POLICY "courses_update_faculty" ON public.courses FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid()::uuid AND p.role IN ('faculty'::public.user_role, 'admin'::public.user_role) AND p.id = faculty_id));$SQL$;
EXECUTE stmt;

-- 20
stmt := $SQL$CREATE POLICY "courses_delete_faculty" ON public.courses FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid()::uuid AND p.role IN ('faculty'::public.user_role, 'admin'::public.user_role) AND p.id = faculty_id));$SQL$;
EXECUTE stmt;

-- 21
stmt := $SQL$CREATE POLICY "schedule_select_auth" ON public.schedule FOR SELECT USING (auth.role() = 'authenticated');$SQL$;
EXECUTE stmt;

-- 22
stmt := $SQL$CREATE POLICY "schedule_modify_faculty" ON public.schedule FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role IN ('faculty'::public.user_role, 'admin'::public.user_role))) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role IN ('faculty'::public.user_role, 'admin'::public.user_role)));$SQL$;
EXECUTE stmt;

-- 23
stmt := $SQL$CREATE POLICY "cg_select_all" ON public.community_groups FOR SELECT USING (true);$SQL$;
EXECUTE stmt;

-- 24
stmt := $SQL$CREATE POLICY "cg_insert_authenticated" ON public.community_groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);$SQL$;
EXECUTE stmt;

-- 25
stmt := $SQL$CREATE POLICY "cg_update_creator" ON public.community_groups FOR UPDATE USING (created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 26
stmt := $SQL$CREATE POLICY "cg_delete_creator" ON public.community_groups FOR DELETE USING (created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 27
stmt := $SQL$CREATE POLICY "gm_select_auth" ON public.group_memberships FOR SELECT USING (auth.uid() IS NOT NULL);$SQL$;
EXECUTE stmt;

-- 28
stmt := $SQL$CREATE POLICY "gm_insert_auth" ON public.group_memberships FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);$SQL$;
EXECUTE stmt;

-- 29
stmt := $SQL$CREATE POLICY "gm_delete_own" ON public.group_memberships FOR DELETE USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 30
stmt := $SQL$CREATE POLICY "cp_select_all" ON public.community_posts FOR SELECT USING (NOT is_blocked);$SQL$;
EXECUTE stmt;

-- 31
stmt := $SQL$CREATE POLICY "cp_insert_auth" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);$SQL$;
EXECUTE stmt;

-- 32
stmt := $SQL$CREATE POLICY "cp_update_own" ON public.community_posts FOR UPDATE USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 33
stmt := $SQL$CREATE POLICY "cp_delete_own" ON public.community_posts FOR DELETE USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 34
stmt := $SQL$CREATE POLICY "pi_select_auth" ON public.post_interactions FOR SELECT USING (auth.uid() IS NOT NULL);$SQL$;
EXECUTE stmt;

-- 35
stmt := $SQL$CREATE POLICY "pi_insert_auth" ON public.post_interactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);$SQL$;
EXECUTE stmt;

-- 36
stmt := $SQL$CREATE POLICY "pi_delete_own" ON public.post_interactions FOR DELETE USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 37
stmt := $SQL$CREATE POLICY "pc_select_all" ON public.post_comments FOR SELECT USING (NOT is_blocked);$SQL$;
EXECUTE stmt;

-- 38
stmt := $SQL$CREATE POLICY "pc_insert_auth" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);$SQL$;
EXECUTE stmt;

-- 39
stmt := $SQL$CREATE POLICY "pc_update_own" ON public.post_comments FOR UPDATE USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 40
stmt := $SQL$CREATE POLICY "pc_delete_own" ON public.post_comments FOR DELETE USING (author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 41
stmt := $SQL$CREATE POLICY "ci_select_auth" ON public.comment_interactions FOR SELECT USING (auth.uid() IS NOT NULL);$SQL$;
EXECUTE stmt;

-- 42
stmt := $SQL$CREATE POLICY "ci_insert_auth" ON public.comment_interactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);$SQL$;
EXECUTE stmt;

-- 43
stmt := $SQL$CREATE POLICY "ci_delete_own" ON public.comment_interactions FOR DELETE USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 44
stmt := $SQL$CREATE POLICY "ub_select_own" ON public.user_bans FOR SELECT USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 45
stmt := $SQL$CREATE POLICY "ub_admin_all" ON public.user_bans FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));$SQL$;
EXECUTE stmt;

-- 46
stmt := $SQL$CREATE POLICY "issuers_admin_only" ON public.issuers FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));$SQL$;
EXECUTE stmt;

-- 47
stmt := $SQL$CREATE POLICY "vc_student_select" ON public.verifiable_credentials FOR SELECT USING (student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid));$SQL$;
EXECUTE stmt;

-- 48
stmt := $SQL$CREATE POLICY "vc_admin_select" ON public.verifiable_credentials FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));$SQL$;
EXECUTE stmt;

-- 49
stmt := $SQL$CREATE POLICY "vc_faculty_select" ON public.verifiable_credentials FOR SELECT USING (EXISTS (SELECT 1 FROM public.student_mentor_assignments sma JOIN public.faculty f ON f.id = sma.mentor_id WHERE f.user_id = auth.uid()::uuid AND sma.student_id = verifiable_credentials.student_id));$SQL$;
EXECUTE stmt;

-- 50
stmt := $SQL$CREATE POLICY "vc_faculty_insert" ON public.verifiable_credentials FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role IN ('faculty'::public.user_role, 'admin'::public.user_role)));$SQL$;
EXECUTE stmt;

-- 51
stmt := $SQL$CREATE POLICY "ef_select" ON public.evidence_files FOR SELECT USING (EXISTS (SELECT 1 FROM public.verifiable_credentials vc WHERE vc.id = evidence_files.vc_id AND (vc.student_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()::uuid) OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role IN ('admin'::public.user_role, 'faculty'::public.user_role)))));$SQL$;
EXECUTE stmt;

-- 52
stmt := $SQL$CREATE POLICY "al_staff_select" ON public.audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role IN ('admin'::public.user_role, 'faculty'::public.user_role)));$SQL$;
EXECUTE stmt;

-- 53
stmt := $SQL$CREATE POLICY "aj_admin_only" ON public.anchoring_jobs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));$SQL$;
EXECUTE stmt;

-- 54
stmt := $SQL$CREATE POLICY "mp_public_select" ON public.merkle_proofs FOR SELECT USING (true);$SQL$;
EXECUTE stmt;

-- 55
stmt := $SQL$CREATE POLICY "webhooks_admin" ON public.webhooks FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));$SQL$;
EXECUTE stmt;

-- 56
stmt := $SQL$CREATE POLICY "wl_admin" ON public.webhook_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));$SQL$;
EXECUTE stmt;

-- 57
stmt := $SQL$CREATE POLICY "ic_admin" ON public.integration_configs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));$SQL$;
EXECUTE stmt;

-- 58
stmt := $SQL$CREATE POLICY "ak_admin" ON public.api_keys FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));$SQL$;
EXECUTE stmt;

-- 59
stmt := $SQL$CREATE POLICY "dsl_admin" ON public.data_sync_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));$SQL$;
EXECUTE stmt;

-- 60
stmt := $SQL$CREATE POLICY "certs_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'certificates' AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'student'::public.user_role));$SQL$;
EXECUTE stmt;

-- 61
stmt := $SQL$CREATE POLICY "certs_view" ON storage.objects FOR SELECT USING (bucket_id = 'certificates' AND (auth.uid()::text = (storage.foldername(name))[1] OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role IN ('faculty'::public.user_role, 'admin'::public.user_role))));$SQL$;
EXECUTE stmt;

-- 62
stmt := $SQL$CREATE POLICY "thumbnails_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'course_thumbnails');$SQL$;
EXECUTE stmt;

-- 63
stmt := $SQL$CREATE POLICY "thumbnails_auth_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'course_thumbnails' AND auth.role() = 'authenticated');$SQL$;
EXECUTE stmt;

-- 64
stmt := $SQL$CREATE POLICY "faculty_docs_admin_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'faculty_documents' AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));$SQL$;
EXECUTE stmt;

-- 65
stmt := $SQL$CREATE POLICY "faculty_docs_admin_read" ON storage.objects FOR SELECT USING (bucket_id = 'faculty_documents' AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()::uuid AND role = 'admin'::public.user_role));$SQL$;
EXECUTE stmt;

RAISE NOTICE 'SUCCESS - All policies passed successfully!';

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'FAILED on statement: % === Error: %', stmt, SQLERRM;
END $$;
