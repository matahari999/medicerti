-- ============================================================
-- AccrediQ — 초기 스키마 마이그레이션
-- 생성일: 2026-06-22
-- ============================================================

-- ENUM 타입 정의 (idempotent)
DO $$ BEGIN CREATE TYPE hospital_role      AS ENUM ('admin', 'manager', 'viewer');           EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE member_status      AS ENUM ('active', 'invited', 'removed');          EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE document_category  AS ENUM ('policy', 'procedure', 'record', 'evidence', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE document_status    AS ENUM ('pending', 'processing', 'extracted', 'failed', 'deleted'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE analysis_status    AS ENUM ('queued', 'running', 'complete', 'failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE compliance_status  AS ENUM ('compliant', 'partial', 'non_compliant', 'not_reviewed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE criterion_severity AS ENUM ('critical', 'major', 'minor');            EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- profiles — auth.users 확장
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  phone       TEXT,
  job_title   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- hospitals — 병원 테넌트
-- ============================================================
CREATE TABLE IF NOT EXISTS hospitals (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  license_number        TEXT UNIQUE,
  type                  TEXT NOT NULL DEFAULT 'long_term_care',
  bed_count             INTEGER,
  region                TEXT,
  address               TEXT,
  phone                 TEXT,
  accreditation_cycle   INTEGER DEFAULT 1,
  accreditation_start   DATE,
  accreditation_target  DATE,
  status                TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'suspended', 'archived')),
  logo_url              TEXT,
  created_by            UUID NOT NULL REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hospitals_created_by ON hospitals(created_by);
CREATE INDEX IF NOT EXISTS idx_hospitals_status     ON hospitals(status);

-- ============================================================
-- hospital_members — 병원-사용자 다대다 (역할 포함)
-- ============================================================
CREATE TABLE IF NOT EXISTS hospital_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id     UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email           TEXT NOT NULL,
  role            hospital_role NOT NULL DEFAULT 'viewer',
  status          member_status NOT NULL DEFAULT 'invited',
  invite_token    TEXT UNIQUE,
  invite_expires  TIMESTAMPTZ,
  invited_by      UUID REFERENCES auth.users(id),
  joined_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(hospital_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_hospital_members_hospital ON hospital_members(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_members_user     ON hospital_members(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_members_token    ON hospital_members(invite_token) WHERE invite_token IS NOT NULL;

-- ============================================================
-- documents — 업로드된 PDF 파일
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id         UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  uploaded_by         UUID NOT NULL REFERENCES auth.users(id),
  original_name       TEXT NOT NULL,
  storage_path        TEXT NOT NULL,
  file_size_bytes     BIGINT NOT NULL,
  mime_type           TEXT NOT NULL DEFAULT 'application/pdf',
  category            document_category NOT NULL DEFAULT 'other',
  tags                TEXT[] DEFAULT '{}',
  status              document_status NOT NULL DEFAULT 'pending',
  error_message       TEXT,
  extraction_attempts INTEGER NOT NULL DEFAULT 0,
  extracted_at        TIMESTAMPTZ,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_hospital ON documents(hospital_id);
CREATE INDEX IF NOT EXISTS idx_documents_status   ON documents(hospital_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_uploaded ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_tags     ON documents USING GIN(tags);

-- ============================================================
-- document_extractions — OCR 추출 결과 (1:1 with documents)
-- ============================================================
CREATE TABLE IF NOT EXISTS document_extractions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id    UUID NOT NULL UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
  hospital_id    UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  full_text      TEXT NOT NULL,
  page_data      JSONB NOT NULL DEFAULT '[]',
  total_pages    INTEGER NOT NULL DEFAULT 0,
  avg_confidence NUMERIC(4,3),
  word_count     INTEGER,
  extracted_by   TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_extractions_document  ON document_extractions(document_id);
CREATE INDEX IF NOT EXISTS idx_extractions_hospital  ON document_extractions(hospital_id);

-- ============================================================
-- accreditation_criteria — 인증 기준 정의 (시드 데이터)
-- ============================================================
CREATE TABLE IF NOT EXISTS accreditation_criteria (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT NOT NULL UNIQUE,
  domain           TEXT NOT NULL,
  domain_code      TEXT NOT NULL,
  category         TEXT,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  required_evidence TEXT,
  default_severity criterion_severity NOT NULL DEFAULT 'major',
  weight           NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  is_mandatory     BOOLEAN NOT NULL DEFAULT true,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  version          TEXT NOT NULL DEFAULT '2024',
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_criteria_domain  ON accreditation_criteria(domain_code);
CREATE INDEX IF NOT EXISTS idx_criteria_active  ON accreditation_criteria(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_criteria_version ON accreditation_criteria(version);

-- ============================================================
-- analysis_runs — 갭 분석 실행 기록
-- ============================================================
CREATE TABLE IF NOT EXISTS analysis_runs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id          UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  triggered_by         UUID NOT NULL REFERENCES auth.users(id),
  status               analysis_status NOT NULL DEFAULT 'queued',
  overall_score        NUMERIC(5,2),
  domain_scores        JSONB,
  total_criteria       INTEGER,
  compliant_count      INTEGER DEFAULT 0,
  partial_count        INTEGER DEFAULT 0,
  non_compliant_count  INTEGER DEFAULT 0,
  not_reviewed_count   INTEGER DEFAULT 0,
  critical_gap_count   INTEGER DEFAULT 0,
  major_gap_count      INTEGER DEFAULT 0,
  minor_gap_count      INTEGER DEFAULT 0,
  documents_analyzed   INTEGER DEFAULT 0,
  tokens_used          INTEGER,
  error_message        TEXT,
  started_at           TIMESTAMPTZ,
  completed_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analysis_runs_hospital ON analysis_runs(hospital_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_status   ON analysis_runs(status) WHERE status IN ('queued', 'running');

-- ============================================================
-- criterion_results — 기준별 분석 결과
-- ============================================================
CREATE TABLE IF NOT EXISTS criterion_results (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id       UUID NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
  hospital_id           UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  criterion_id          UUID NOT NULL REFERENCES accreditation_criteria(id),
  compliance_status     compliance_status NOT NULL DEFAULT 'not_reviewed',
  evidence_text         TEXT,
  evidence_document_hint TEXT,
  gap_description       TEXT,
  recommendation        TEXT,
  severity              criterion_severity,
  ai_confidence         NUMERIC(4,3),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_criterion_results_run      ON criterion_results(analysis_run_id);
CREATE INDEX IF NOT EXISTS idx_criterion_results_hospital ON criterion_results(hospital_id);
CREATE INDEX IF NOT EXISTS idx_criterion_results_status   ON criterion_results(analysis_run_id, compliance_status);
CREATE INDEX IF NOT EXISTS idx_criterion_results_severity ON criterion_results(analysis_run_id, severity)
  WHERE severity IS NOT NULL;

-- ============================================================
-- reports — 생성된 PDF 보고서
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id      UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  analysis_run_id  UUID NOT NULL UNIQUE REFERENCES analysis_runs(id) ON DELETE CASCADE,
  generated_by     UUID NOT NULL REFERENCES auth.users(id),
  storage_path     TEXT NOT NULL,
  file_size_bytes  BIGINT,
  page_count       INTEGER,
  title            TEXT NOT NULL,
  generated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_hospital     ON reports(hospital_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_analysis_run ON reports(analysis_run_id);

-- ============================================================
-- audit_logs — 감사 로그 (추가 전용)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  hospital_id   UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   UUID,
  metadata      JSONB DEFAULT '{}',
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user     ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_hospital ON audit_logs(hospital_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action   ON audit_logs(action, created_at DESC);
