# AccrediQ — Database Schema
**Version:** 1.0.0 | **Date:** 2026-06-22 | **Database:** PostgreSQL 15 (Supabase)

---

## 1. Entity Relationship Overview

```
auth.users (Supabase managed)
    │
    ├──▶ profiles (1:1)
    │
    └──▶ hospital_members (M:M via)
              │
              └──▶ hospitals
                       │
                       ├──▶ documents
                       │        │
                       │        └──▶ document_extractions (1:1)
                       │
                       ├──▶ analysis_runs
                       │        │
                       │        └──▶ criterion_results (1:N)
                       │                  │
                       │                  └──▶ accreditation_criteria (ref)
                       │
                       └──▶ reports (1:1 → analysis_runs)

audit_logs (append-only, all entities)
```

---

## 2. Tables

### 2.1 `profiles`

Extends `auth.users` with application-level user data.

```sql
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  avatar_url      TEXT,
  phone           TEXT,
  job_title       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**RLS:**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles: self access only"
  ON profiles FOR ALL
  USING (auth.uid() = id);
```

---

### 2.2 `hospitals`

Core tenant entity. Each hospital is an isolated workspace.

```sql
CREATE TABLE hospitals (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  license_number        TEXT UNIQUE,           -- 요양기관번호
  type                  TEXT NOT NULL DEFAULT 'long_term_care',
  bed_count             INTEGER,
  region                TEXT,                  -- 시/도
  address               TEXT,
  phone                 TEXT,
  accreditation_cycle   INTEGER DEFAULT 1,     -- cycle number (1st, 2nd...)
  accreditation_start   DATE,
  accreditation_target  DATE,                  -- submission deadline
  status                TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'suspended', 'archived')),
  logo_url              TEXT,
  created_by            UUID NOT NULL REFERENCES auth.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hospitals_created_by ON hospitals(created_by);
CREATE INDEX idx_hospitals_status ON hospitals(status);
```

**RLS:**
```sql
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hospitals: member read"
  ON hospitals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = hospitals.id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.status = 'active'
    )
  );

CREATE POLICY "hospitals: admin write"
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

CREATE POLICY "hospitals: admin delete"
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
```

---

### 2.3 `hospital_members`

Joins users to hospitals with role-based access.

```sql
CREATE TYPE hospital_role AS ENUM ('admin', 'manager', 'viewer');
CREATE TYPE member_status AS ENUM ('active', 'invited', 'removed');

CREATE TABLE hospital_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id     UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email           TEXT NOT NULL,               -- for invites before signup
  role            hospital_role NOT NULL DEFAULT 'viewer',
  status          member_status NOT NULL DEFAULT 'invited',
  invite_token    TEXT UNIQUE,                 -- hashed, null after accepted
  invite_expires  TIMESTAMPTZ,
  invited_by      UUID REFERENCES auth.users(id),
  joined_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(hospital_id, user_id)
);

CREATE INDEX idx_hospital_members_hospital ON hospital_members(hospital_id);
CREATE INDEX idx_hospital_members_user    ON hospital_members(user_id);
CREATE INDEX idx_hospital_members_token   ON hospital_members(invite_token) WHERE invite_token IS NOT NULL;
```

**RLS:**
```sql
ALTER TABLE hospital_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hospital_members: member read"
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

CREATE POLICY "hospital_members: admin manage"
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
```

---

### 2.4 `documents`

Uploaded PDF files associated with a hospital.

```sql
CREATE TYPE document_category AS ENUM ('policy', 'procedure', 'record', 'evidence', 'other');
CREATE TYPE document_status   AS ENUM ('pending', 'processing', 'extracted', 'failed', 'deleted');

CREATE TABLE documents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id      UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  uploaded_by      UUID NOT NULL REFERENCES auth.users(id),
  original_name    TEXT NOT NULL,
  storage_path     TEXT NOT NULL,              -- Supabase Storage path
  file_size_bytes  BIGINT NOT NULL,
  mime_type        TEXT NOT NULL DEFAULT 'application/pdf',
  category         document_category NOT NULL DEFAULT 'other',
  tags             TEXT[] DEFAULT '{}',
  status           document_status NOT NULL DEFAULT 'pending',
  error_message    TEXT,                       -- populated on failure
  extraction_attempts INTEGER NOT NULL DEFAULT 0,
  extracted_at     TIMESTAMPTZ,
  deleted_at       TIMESTAMPTZ,               -- soft delete
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_hospital   ON documents(hospital_id);
CREATE INDEX idx_documents_status     ON documents(hospital_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_uploaded   ON documents(uploaded_by);
CREATE INDEX idx_documents_tags       ON documents USING GIN(tags);
```

**RLS:**
```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents: hospital member access"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = documents.hospital_id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.status = 'active'
    )
  );
```

---

### 2.5 `document_extractions`

Stores OCR output for each document (1:1 with documents).

```sql
CREATE TABLE document_extractions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id      UUID NOT NULL UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
  hospital_id      UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  full_text        TEXT NOT NULL,              -- concatenated text from all pages
  page_data        JSONB NOT NULL DEFAULT '[]', -- [{page, text, tables, confidence}]
  total_pages      INTEGER NOT NULL DEFAULT 0,
  avg_confidence   NUMERIC(4,3),              -- 0.000 - 1.000
  word_count       INTEGER,
  extracted_by     TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_extractions_document   ON document_extractions(document_id);
CREATE INDEX idx_extractions_hospital   ON document_extractions(hospital_id);
-- Full-text search on extracted content
CREATE INDEX idx_extractions_fulltext
  ON document_extractions
  USING GIN(to_tsvector('korean', full_text));
```

**RLS:**
```sql
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "extractions: hospital member access"
  ON document_extractions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = document_extractions.hospital_id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.status = 'active'
    )
  );
```

---

### 2.6 `accreditation_criteria`

Seed data: the full criteria definition for Korean Long-term Care Hospital accreditation.

```sql
CREATE TYPE criterion_severity AS ENUM ('critical', 'major', 'minor');

CREATE TABLE accreditation_criteria (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT NOT NULL UNIQUE,       -- e.g., "PS-01", "PC-12"
  domain           TEXT NOT NULL,              -- '환자안전' | '환자중심' | '지도체계' | '안전/질향상'
  domain_code      TEXT NOT NULL,              -- 'PS' | 'PC' | 'GL' | 'QS'
  category         TEXT,                       -- sub-category within domain
  title            TEXT NOT NULL,              -- criterion title (Korean)
  description      TEXT NOT NULL,              -- full criterion text (Korean)
  required_evidence TEXT,                      -- what documentation is expected
  default_severity criterion_severity NOT NULL DEFAULT 'major',
  weight           NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  is_mandatory     BOOLEAN NOT NULL DEFAULT true,  -- cannot be skipped
  is_active        BOOLEAN NOT NULL DEFAULT true,
  version          TEXT NOT NULL DEFAULT '2024',   -- accreditation version year
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_criteria_domain   ON accreditation_criteria(domain_code);
CREATE INDEX idx_criteria_active   ON accreditation_criteria(is_active) WHERE is_active = true;
CREATE INDEX idx_criteria_version  ON accreditation_criteria(version);
```

*No RLS on this table — publicly readable seed data.*

```sql
ALTER TABLE accreditation_criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "criteria: public read"
  ON accreditation_criteria FOR SELECT
  USING (true);

-- Only service role can modify criteria
CREATE POLICY "criteria: service role write"
  ON accreditation_criteria FOR ALL
  USING (auth.role() = 'service_role');
```

---

### 2.7 `analysis_runs`

Each gap analysis run for a hospital.

```sql
CREATE TYPE analysis_status AS ENUM ('queued', 'running', 'complete', 'failed');

CREATE TABLE analysis_runs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id           UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  triggered_by          UUID NOT NULL REFERENCES auth.users(id),
  status                analysis_status NOT NULL DEFAULT 'queued',
  overall_score         NUMERIC(5,2),          -- 0.00 - 100.00
  domain_scores         JSONB,                 -- {PS: 72.5, PC: 68.0, GL: 90.0, QS: 55.0}
  total_criteria        INTEGER,
  compliant_count       INTEGER DEFAULT 0,
  partial_count         INTEGER DEFAULT 0,
  non_compliant_count   INTEGER DEFAULT 0,
  not_reviewed_count    INTEGER DEFAULT 0,
  critical_gap_count    INTEGER DEFAULT 0,
  major_gap_count       INTEGER DEFAULT 0,
  minor_gap_count       INTEGER DEFAULT 0,
  documents_analyzed    INTEGER DEFAULT 0,
  tokens_used           INTEGER,               -- for cost tracking
  error_message         TEXT,
  started_at            TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analysis_runs_hospital ON analysis_runs(hospital_id, created_at DESC);
CREATE INDEX idx_analysis_runs_status   ON analysis_runs(status) WHERE status IN ('queued', 'running');
```

**RLS:**
```sql
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analysis_runs: hospital member access"
  ON analysis_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = analysis_runs.hospital_id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.status = 'active'
    )
  );

CREATE POLICY "analysis_runs: manager insert"
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
```

---

### 2.8 `criterion_results`

Per-criterion results for each analysis run.

```sql
CREATE TYPE compliance_status AS ENUM ('compliant', 'partial', 'non_compliant', 'not_reviewed');

CREATE TABLE criterion_results (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id       UUID NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
  hospital_id           UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  criterion_id          UUID NOT NULL REFERENCES accreditation_criteria(id),
  compliance_status     compliance_status NOT NULL DEFAULT 'not_reviewed',
  evidence_text         TEXT,                  -- quoted text from documents
  evidence_document_hint TEXT,                 -- document name hint from AI
  gap_description       TEXT,                  -- what is missing
  recommendation        TEXT,                  -- Korean-language recommendation
  severity              criterion_severity,    -- null if compliant
  ai_confidence         NUMERIC(4,3),          -- model confidence 0-1
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_criterion_results_run      ON criterion_results(analysis_run_id);
CREATE INDEX idx_criterion_results_hospital ON criterion_results(hospital_id);
CREATE INDEX idx_criterion_results_status   ON criterion_results(analysis_run_id, compliance_status);
CREATE INDEX idx_criterion_results_severity ON criterion_results(analysis_run_id, severity)
  WHERE severity IS NOT NULL;
```

**RLS:**
```sql
ALTER TABLE criterion_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "criterion_results: hospital member read"
  ON criterion_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = criterion_results.hospital_id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.status = 'active'
    )
  );
```

---

### 2.9 `reports`

Generated PDF report records.

```sql
CREATE TABLE reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id      UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  analysis_run_id  UUID NOT NULL UNIQUE REFERENCES analysis_runs(id) ON DELETE CASCADE,
  generated_by     UUID NOT NULL REFERENCES auth.users(id),
  storage_path     TEXT NOT NULL,              -- Supabase Storage path
  file_size_bytes  BIGINT,
  page_count       INTEGER,
  title            TEXT NOT NULL,
  generated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_hospital      ON reports(hospital_id, generated_at DESC);
CREATE INDEX idx_reports_analysis_run  ON reports(analysis_run_id);
```

**RLS:**
```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports: hospital member access"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_members.hospital_id = reports.hospital_id
        AND hospital_members.user_id = auth.uid()
        AND hospital_members.status = 'active'
    )
  );
```

---

### 2.10 `audit_logs`

Append-only activity log for compliance and debugging.

```sql
CREATE TABLE audit_logs (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  hospital_id   UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,                -- e.g., 'document.upload', 'analysis.run'
  resource_type TEXT,                         -- e.g., 'document', 'analysis_run'
  resource_id   UUID,
  metadata      JSONB DEFAULT '{}',           -- action-specific context
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user      ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_hospital  ON audit_logs(hospital_id, created_at DESC);
CREATE INDEX idx_audit_logs_action    ON audit_logs(action, created_at DESC);

-- Partition by month for performance (optional, implement when volume > 1M rows)
-- CREATE TABLE audit_logs PARTITION BY RANGE (created_at);
```

**RLS:** Audit logs are write-only from the application (via service role). Admins can read via a separate secure API endpoint.

```sql
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- Only service_role can write; no direct user reads via PostgREST
CREATE POLICY "audit_logs: service role only"
  ON audit_logs FOR ALL
  USING (auth.role() = 'service_role');
```

---

## 3. Supabase Storage Buckets

```sql
-- Private document storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,                                -- private
  52428800,                             -- 50MB
  ARRAY['application/pdf']
);

-- Private report storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,                                -- private
  20971520,                             -- 20MB
  ARRAY['application/pdf']
);

-- Storage RLS: users can only access their hospital's files
CREATE POLICY "documents: hospital member access"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT hospital_id::TEXT FROM hospital_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "reports: hospital member access"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'reports'
    AND (storage.foldername(name))[1] IN (
      SELECT hospital_id::TEXT FROM hospital_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
```

---

## 4. Database Functions & Triggers

### 4.1 Update `updated_at` Trigger

```sql
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to all mutable tables
CREATE TRIGGER touch_hospitals      BEFORE UPDATE ON hospitals      FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER touch_profiles       BEFORE UPDATE ON profiles       FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER touch_hospital_members BEFORE UPDATE ON hospital_members FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER touch_documents      BEFORE UPDATE ON documents      FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
```

### 4.2 Analysis Score Aggregation Function

```sql
CREATE OR REPLACE FUNCTION calculate_analysis_score(p_run_id UUID)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'overall_score',       ROUND(
      SUM(
        CASE cr.compliance_status
          WHEN 'compliant'     THEN ac.weight * 1.0
          WHEN 'partial'       THEN ac.weight * 0.5
          ELSE                      0
        END
      ) / NULLIF(SUM(ac.weight), 0) * 100, 2),
    'compliant_count',     COUNT(*) FILTER (WHERE cr.compliance_status = 'compliant'),
    'partial_count',       COUNT(*) FILTER (WHERE cr.compliance_status = 'partial'),
    'non_compliant_count', COUNT(*) FILTER (WHERE cr.compliance_status = 'non_compliant'),
    'not_reviewed_count',  COUNT(*) FILTER (WHERE cr.compliance_status = 'not_reviewed'),
    'critical_gap_count',  COUNT(*) FILTER (WHERE cr.severity = 'critical'),
    'major_gap_count',     COUNT(*) FILTER (WHERE cr.severity = 'major'),
    'minor_gap_count',     COUNT(*) FILTER (WHERE cr.severity = 'minor')
  ) INTO v_result
  FROM criterion_results cr
  JOIN accreditation_criteria ac ON ac.id = cr.criterion_id
  WHERE cr.analysis_run_id = p_run_id;

  RETURN v_result;
END;
$$;
```

### 4.3 Domain Score Breakdown

```sql
CREATE OR REPLACE FUNCTION get_domain_scores(p_run_id UUID)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_result JSONB := '{}';
  v_row RECORD;
BEGIN
  FOR v_row IN
    SELECT
      ac.domain_code,
      ROUND(
        SUM(CASE cr.compliance_status
          WHEN 'compliant' THEN ac.weight * 1.0
          WHEN 'partial'   THEN ac.weight * 0.5
          ELSE 0
        END) / NULLIF(SUM(ac.weight), 0) * 100, 2
      ) AS score
    FROM criterion_results cr
    JOIN accreditation_criteria ac ON ac.id = cr.criterion_id
    WHERE cr.analysis_run_id = p_run_id
    GROUP BY ac.domain_code
  LOOP
    v_result := v_result || jsonb_build_object(v_row.domain_code, v_row.score);
  END LOOP;
  RETURN v_result;
END;
$$;
```

---

## 5. Seed Data Structure

```sql
-- Sample accreditation criteria (abbreviated — full seed has 230 criteria)
INSERT INTO accreditation_criteria (code, domain, domain_code, category, title, description, required_evidence, default_severity, weight, is_mandatory, version, sort_order)
VALUES
  -- Patient Safety Domain
  ('PS-01', '환자안전', 'PS', '환자확인', '환자 확인 절차',
   '의료진은 처치 전 환자 신원을 2가지 이상의 방법으로 확인해야 한다.',
   '환자확인 정책, 직원 교육 기록, 감사 결과',
   'critical', 1.50, true, '2024', 10),

  ('PS-02', '환자안전', 'PS', '낙상예방', '낙상 예방 프로그램',
   '병원은 낙상 위험 환자를 선별하고 예방 조치를 문서화해야 한다.',
   '낙상 예방 정책, 위험 평가 도구, 사고 보고서',
   'major', 1.20, true, '2024', 20),

  -- Patient-Centered Care Domain
  ('PC-01', '환자중심', 'PC', '권리보호', '환자 권리 보호',
   '환자는 자신의 권리와 책임에 대한 정보를 입원 시 제공받아야 한다.',
   '환자 권리 안내문, 배포 기록, 서명 동의서',
   'major', 1.00, true, '2024', 110),

  -- Governance & Leadership Domain
  ('GL-01', '지도체계', 'GL', '리더십', '의료기관 리더십',
   '경영진은 환자안전 목표를 명문화하고 연간 검토해야 한다.',
   '환자안전 목표 문서, 이사회 회의록, 연간 검토 기록',
   'major', 1.00, true, '2024', 200),

  -- Quality & Safety Domain
  ('QS-01', '안전/질향상', 'QS', '질향상', '질 향상 프로그램',
   '병원은 연간 질향상 계획을 수립하고 성과 지표를 모니터링해야 한다.',
   '질향상 계획서, 성과 지표 보고서, 개선 활동 기록',
   'major', 1.00, true, '2024', 310);
```

---

## 6. Migration Strategy

All schema changes managed via numbered migration files:

```
supabase/migrations/
  20260622000001_initial_schema.sql          ← All tables, indexes
  20260622000002_rls_policies.sql            ← All RLS policies
  20260622000003_functions_triggers.sql      ← Functions and triggers
  20260622000004_storage_buckets.sql         ← Storage bucket config
  20260622000005_seed_criteria.sql           ← Accreditation criteria seed
```

Apply with: `supabase db push` (local dev) or `supabase db push --linked` (production).

---

*AccrediQ Database Schema v1.0 — For architecture review*
