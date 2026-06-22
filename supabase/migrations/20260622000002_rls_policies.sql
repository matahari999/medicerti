-- ============================================================
-- AccrediQ — RLS 정책 마이그레이션
-- 생성일: 2026-06-22
-- ============================================================

-- ============================================================
-- profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY "profiles: 본인만 접근"
  ON profiles FOR ALL
  USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- hospitals
-- ============================================================
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY "hospitals: 멤버 읽기"
  ON hospitals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = hospitals.id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "hospitals: 관리자 수정"
  ON hospitals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = hospitals.id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.role IN ('admin', 'manager')
        AND hospital_members.status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "hospitals: 생성자 삭제"
  ON hospitals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = hospitals.id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.role = 'admin'
        AND hospital_members.status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "hospitals: 인증 사용자 생성"
  ON hospitals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- hospital_members
-- ============================================================
ALTER TABLE hospital_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY "hospital_members: 멤버 읽기"
  ON hospital_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM hospital_members hm
      WHERE hm.hospital_id = hospital_members.hospital_id
        AND hm.user_id = auth.uid()
        AND hm.status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "hospital_members: 관리자 관리"
  ON hospital_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members hm
      WHERE hm.hospital_id = hospital_members.hospital_id
        AND hm.user_id = auth.uid()
        AND hm.role = 'admin'
        AND hm.status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- documents
-- ============================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY "documents: 병원 멤버 접근"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = documents.hospital_id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- document_extractions
-- ============================================================
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY "extractions: 병원 멤버 접근"
  ON document_extractions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = document_extractions.hospital_id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- accreditation_criteria — 공개 읽기 (시드 데이터)
-- ============================================================
ALTER TABLE accreditation_criteria ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY "criteria: 공개 읽기"
  ON accreditation_criteria FOR SELECT
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "criteria: 서비스 롤 쓰기"
  ON accreditation_criteria FOR ALL
  USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- analysis_runs
-- ============================================================
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY "analysis_runs: 병원 멤버 읽기"
  ON analysis_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = analysis_runs.hospital_id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "analysis_runs: 매니저 이상 생성"
  ON analysis_runs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = analysis_runs.hospital_id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.role IN ('admin', 'manager')
        AND hospital_members.status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- criterion_results
-- ============================================================
ALTER TABLE criterion_results ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY "criterion_results: 병원 멤버 읽기"
  ON criterion_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = criterion_results.hospital_id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- reports
-- ============================================================
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY "reports: 병원 멤버 접근"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = reports.hospital_id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- audit_logs — 서비스 롤만 쓰기/읽기
-- ============================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY "audit_logs: 서비스 롤 전용"
  ON audit_logs FOR ALL
  USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
