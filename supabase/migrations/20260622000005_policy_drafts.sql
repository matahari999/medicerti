-- ============================================================
-- AccrediQ — 규정집(정책 초안) 테이블
-- ============================================================

CREATE TABLE IF NOT EXISTS policy_drafts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id      UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  analysis_run_id  UUID NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
  criterion_id     UUID NOT NULL REFERENCES accreditation_criteria(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  content          TEXT NOT NULL,
  compliance_status TEXT NOT NULL,   -- 생성 당시 적합도 (partial / non_compliant)
  generated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_policy_drafts_hospital  ON policy_drafts(hospital_id);
CREATE INDEX IF NOT EXISTS idx_policy_drafts_analysis  ON policy_drafts(analysis_run_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_policy_drafts_run_criterion
  ON policy_drafts(analysis_run_id, criterion_id);

ALTER TABLE policy_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "policy_drafts: 병원 멤버 접근"
  ON policy_drafts FOR ALL
  USING (is_hospital_member(hospital_id));
