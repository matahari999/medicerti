-- ============================================================
-- AccrediQ — 관리 문서 시스템
-- 법정양식·점검표·교육기록·회의록·시정조치서 등 직접 작성/관리 문서
-- ============================================================

-- 문서 유형 ENUM
DO $$ BEGIN
  CREATE TYPE managed_doc_type AS ENUM (
    'regulation',       -- 규정집
    'criteria_book',    -- 기준집
    'legal_form',       -- 법정양식
    'checklist',        -- 점검표
    'education_record', -- 교육기록
    'meeting_minutes',  -- 회의록
    'corrective_action' -- 시정조치서
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 문서 상태 ENUM (워크플로우)
DO $$ BEGIN
  CREATE TYPE managed_doc_status AS ENUM (
    'draft',        -- 초안
    'under_review', -- 검토중
    'approved',     -- 승인완료
    'archived'      -- 보관
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- managed_documents — 직접 작성·관리하는 인증 문서
-- ============================================================
CREATE TABLE IF NOT EXISTS managed_documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id       UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  doc_type          managed_doc_type NOT NULL,
  title             TEXT NOT NULL,
  content           TEXT NOT NULL DEFAULT '',
  status            managed_doc_status NOT NULL DEFAULT 'draft',
  version_number    INTEGER NOT NULL DEFAULT 1,
  criterion_id      UUID REFERENCES accreditation_criteria(id) ON DELETE SET NULL,
  analysis_run_id   UUID REFERENCES analysis_runs(id) ON DELETE SET NULL,
  policy_draft_id   UUID,  -- policy_drafts 테이블 참조 (nullable)
  approved_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at       TIMESTAMPTZ,
  archived_at       TIMESTAMPTZ,
  created_by        UUID NOT NULL REFERENCES auth.users(id),
  updated_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_managed_docs_hospital ON managed_documents(hospital_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_managed_docs_type     ON managed_documents(hospital_id, doc_type);
CREATE INDEX IF NOT EXISTS idx_managed_docs_status   ON managed_documents(hospital_id, status);
CREATE INDEX IF NOT EXISTS idx_managed_docs_criterion ON managed_documents(criterion_id) WHERE criterion_id IS NOT NULL;

-- ============================================================
-- managed_document_versions — 개정 이력
-- ============================================================
CREATE TABLE IF NOT EXISTS managed_document_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES managed_documents(id) ON DELETE CASCADE,
  hospital_id     UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  status          managed_doc_status NOT NULL,
  change_summary  TEXT,
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (document_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_managed_doc_versions_doc      ON managed_document_versions(document_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_managed_doc_versions_hospital ON managed_document_versions(hospital_id);

-- ============================================================
-- RLS 정책
-- ============================================================
ALTER TABLE managed_documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE managed_document_versions ENABLE ROW LEVEL SECURITY;

-- managed_documents: 병원 멤버만 접근
CREATE POLICY managed_docs_select ON managed_documents
  FOR SELECT USING (
    hospital_id IN (
      SELECT hospital_id FROM hospital_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY managed_docs_insert ON managed_documents
  FOR INSERT WITH CHECK (
    hospital_id IN (
      SELECT hospital_id FROM hospital_members
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY managed_docs_update ON managed_documents
  FOR UPDATE USING (
    hospital_id IN (
      SELECT hospital_id FROM hospital_members
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY managed_docs_delete ON managed_documents
  FOR DELETE USING (
    hospital_id IN (
      SELECT hospital_id FROM hospital_members
      WHERE user_id = auth.uid() AND status = 'active' AND role = 'admin'
    )
  );

-- managed_document_versions: 병원 멤버만 접근
CREATE POLICY managed_doc_versions_select ON managed_document_versions
  FOR SELECT USING (
    hospital_id IN (
      SELECT hospital_id FROM hospital_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY managed_doc_versions_insert ON managed_document_versions
  FOR INSERT WITH CHECK (
    hospital_id IN (
      SELECT hospital_id FROM hospital_members
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('admin', 'manager')
    )
  );

-- ============================================================
-- 자동 updated_at 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION update_managed_doc_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_managed_docs_updated_at ON managed_documents;
CREATE TRIGGER trg_managed_docs_updated_at
  BEFORE UPDATE ON managed_documents
  FOR EACH ROW EXECUTE FUNCTION update_managed_doc_updated_at();
