-- ============================================================
-- AccrediQ — RLS 통합 정비
-- 모든 테이블에 SECURITY DEFINER 헬퍼 함수 기반 정책 일괄 적용
-- ============================================================

-- ============================================================
-- 1. SECURITY DEFINER 헬퍼 함수 (순환참조 방지)
-- ============================================================

CREATE OR REPLACE FUNCTION is_hospital_member(p_hospital_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM hospital_members
    WHERE hospital_members.hospital_id = p_hospital_id
      AND hospital_members.user_id = auth.uid()
      AND hospital_members.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION is_hospital_admin(p_hospital_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM hospital_members
    WHERE hospital_members.hospital_id = p_hospital_id
      AND hospital_members.user_id = auth.uid()
      AND hospital_members.role = 'admin'
      AND hospital_members.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION is_hospital_manager(p_hospital_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM hospital_members
    WHERE hospital_members.hospital_id = p_hospital_id
      AND hospital_members.user_id = auth.uid()
      AND hospital_members.role IN ('admin', 'manager')
      AND hospital_members.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT is_platform_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- ============================================================
-- 2. 모든 기존 정책 삭제
-- ============================================================

DO $$ DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', rec.policyname, rec.schemaname, rec.tablename);
  END LOOP;
END $$;

-- ============================================================
-- 3. profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_self"
  ON profiles FOR ALL
  USING (auth.uid() = id);

-- ============================================================
-- 4. hospitals
-- ============================================================
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hospitals_select"
  ON hospitals FOR SELECT
  USING (is_platform_admin() OR is_hospital_member(id));

CREATE POLICY "hospitals_insert"
  ON hospitals FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "hospitals_update"
  ON hospitals FOR UPDATE
  USING (is_platform_admin() OR is_hospital_admin(id));

CREATE POLICY "hospitals_delete"
  ON hospitals FOR DELETE
  USING (is_platform_admin() OR is_hospital_admin(id));

-- ============================================================
-- 5. hospital_members
-- ============================================================
ALTER TABLE hospital_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hospital_members_select"
  ON hospital_members FOR SELECT
  USING (
    is_platform_admin()
    OR user_id = auth.uid()
    OR is_hospital_member(hospital_id)
  );

CREATE POLICY "hospital_members_insert"
  ON hospital_members FOR INSERT
  WITH CHECK (
    is_platform_admin()
    OR is_hospital_admin(hospital_id)
    OR (
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND status = 'invited'
    )
  );

CREATE POLICY "hospital_members_update"
  ON hospital_members FOR UPDATE
  USING (is_platform_admin() OR is_hospital_admin(hospital_id));

CREATE POLICY "hospital_members_delete"
  ON hospital_members FOR DELETE
  USING (is_platform_admin() OR is_hospital_admin(hospital_id));

-- ============================================================
-- 6. documents
-- ============================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select"
  ON documents FOR SELECT
  USING (is_platform_admin() OR is_hospital_member(hospital_id));

CREATE POLICY "documents_insert"
  ON documents FOR INSERT
  WITH CHECK (
    is_platform_admin()
    OR (is_hospital_member(hospital_id) AND auth.uid() = uploaded_by)
  );

CREATE POLICY "documents_update"
  ON documents FOR UPDATE
  USING (is_platform_admin() OR is_hospital_manager(hospital_id));

CREATE POLICY "documents_delete"
  ON documents FOR DELETE
  USING (is_platform_admin() OR is_hospital_admin(hospital_id));

-- ============================================================
-- 7. document_extractions
-- ============================================================
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "extractions_select"
  ON document_extractions FOR SELECT
  USING (is_platform_admin() OR is_hospital_member(hospital_id));

CREATE POLICY "extractions_insert"
  ON document_extractions FOR INSERT
  WITH CHECK (
    is_platform_admin()
    OR (is_hospital_member(hospital_id) AND extracted_by = auth.uid()::TEXT)
  );

-- ============================================================
-- 8. accreditation_criteria (시스템 기준 — 공개 읽기)
-- ============================================================
ALTER TABLE accreditation_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "criteria_select"
  ON accreditation_criteria FOR SELECT
  USING (true);

CREATE POLICY "criteria_write"
  ON accreditation_criteria FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- 9. analysis_runs
-- ============================================================
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analysis_runs_select"
  ON analysis_runs FOR SELECT
  USING (is_platform_admin() OR is_hospital_member(hospital_id));

CREATE POLICY "analysis_runs_insert"
  ON analysis_runs FOR INSERT
  WITH CHECK (
    is_platform_admin()
    OR is_hospital_manager(hospital_id)
  );

CREATE POLICY "analysis_runs_update"
  ON analysis_runs FOR UPDATE
  USING (is_platform_admin() OR is_hospital_member(hospital_id));

-- ============================================================
-- 10. criterion_results
-- ============================================================
ALTER TABLE criterion_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "criterion_results_select"
  ON criterion_results FOR SELECT
  USING (is_platform_admin() OR is_hospital_member(hospital_id));

CREATE POLICY "criterion_results_insert"
  ON criterion_results FOR INSERT
  WITH CHECK (
    is_platform_admin()
    OR is_hospital_member(hospital_id)
  );

-- ============================================================
-- 11. reports
-- ============================================================
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select"
  ON reports FOR SELECT
  USING (is_platform_admin() OR is_hospital_member(hospital_id));

CREATE POLICY "reports_insert"
  ON reports FOR INSERT
  WITH CHECK (
    is_platform_admin()
    OR is_hospital_manager(hospital_id)
  );

-- ============================================================
-- 12. audit_logs (서비스 롤 전용)
-- ============================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_service_role"
  ON audit_logs FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- 13. policy_drafts
-- ============================================================
ALTER TABLE policy_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policy_drafts_select"
  ON policy_drafts FOR SELECT
  USING (is_platform_admin() OR is_hospital_member(hospital_id));

CREATE POLICY "policy_drafts_insert"
  ON policy_drafts FOR INSERT
  WITH CHECK (
    is_platform_admin()
    OR is_hospital_manager(hospital_id)
  );

CREATE POLICY "policy_drafts_update"
  ON policy_drafts FOR UPDATE
  USING (is_platform_admin() OR is_hospital_manager(hospital_id));

CREATE POLICY "policy_drafts_delete"
  ON policy_drafts FOR DELETE
  USING (is_platform_admin() OR is_hospital_admin(hospital_id));

-- ============================================================
-- 14. managed_documents
-- ============================================================
ALTER TABLE managed_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "managed_docs_select"
  ON managed_documents FOR SELECT
  USING (is_platform_admin() OR is_hospital_member(hospital_id));

CREATE POLICY "managed_docs_insert"
  ON managed_documents FOR INSERT
  WITH CHECK (
    is_platform_admin()
    OR is_hospital_manager(hospital_id)
  );

CREATE POLICY "managed_docs_update"
  ON managed_documents FOR UPDATE
  USING (
    is_platform_admin()
    OR (is_hospital_member(hospital_id) AND (
      is_hospital_manager(hospital_id)
      OR created_by = auth.uid()
    ))
  );

CREATE POLICY "managed_docs_delete"
  ON managed_documents FOR DELETE
  USING (is_platform_admin() OR is_hospital_admin(hospital_id));

-- ============================================================
-- 15. managed_document_versions
-- ============================================================
ALTER TABLE managed_document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "managed_doc_versions_select"
  ON managed_document_versions FOR SELECT
  USING (is_platform_admin() OR is_hospital_member(hospital_id));

CREATE POLICY "managed_doc_versions_insert"
  ON managed_document_versions FOR INSERT
  WITH CHECK (
    is_platform_admin()
    OR is_hospital_manager(hospital_id)
  );

-- ============================================================
-- 16. Storage buckets RLS (경로: {bucket}/{hospitalId}/{file})
-- ============================================================

DO $$ BEGIN
  DROP POLICY IF EXISTS "documents storage: 병원 멤버 접근" ON storage.objects;
  DROP POLICY IF EXISTS "reports storage: 병원 멤버 접근" ON storage.objects;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "storage_documents"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'documents'
    AND (
      is_platform_admin()
      OR is_hospital_member((storage.foldername(name))[1]::UUID)
    )
  );

CREATE POLICY "storage_reports"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'reports'
    AND (
      is_platform_admin()
      OR is_hospital_member((storage.foldername(name))[1]::UUID)
    )
  );

-- ============================================================
-- 17. 최종 정책 현황 확인
-- ============================================================
SELECT schemaname, tablename, policyname, permissive, cmd, qual
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY tablename, policyname;
