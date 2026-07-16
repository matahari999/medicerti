-- ============================================================
-- AccrediQ — 병원별 규정집 자동 커스터마이징
-- 병원 프로필 확장 + 마스터 규정 템플릿(파일럿 30종) + managed_documents 연결
-- ============================================================

-- ============================================================
-- hospitals — 규정집 커스터마이징에 필요한 병원 프로필 필드 확장
-- ============================================================
ALTER TABLE hospitals
  ADD COLUMN IF NOT EXISTS departments        TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS staff_composition  JSONB   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS operating_hours    JSONB   NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS special_units      TEXT[]  NOT NULL DEFAULT '{}';

-- ============================================================
-- regulation_templates — 마스터 규정 템플릿 ({{변수}} 포함 원문)
-- 병원종별(long_term_care/psychiatric) 파일럿 15개씩, 총 30개
-- ============================================================
CREATE TABLE IF NOT EXISTS regulation_templates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_code    TEXT NOT NULL UNIQUE,
  hospital_type    TEXT NOT NULL CHECK (hospital_type IN ('long_term_care', 'psychiatric')),
  title            TEXT NOT NULL,
  entry_code       TEXT,
  template_content TEXT NOT NULL,
  variable_schema  JSONB NOT NULL DEFAULT '{}',
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_regulation_templates_type ON regulation_templates(hospital_type);

ALTER TABLE regulation_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "regulation_templates_select_all" ON regulation_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "regulation_templates_write_service" ON regulation_templates
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- managed_documents — 템플릿 기반 생성 문서 연결
-- 병원당 템플릿 1건 제약 (재생성은 애플리케이션 레벨에서 명시적으로만 허용)
-- ============================================================
ALTER TABLE managed_documents
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES regulation_templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_managed_docs_template
  ON managed_documents(template_id) WHERE template_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_managed_docs_hospital_template
  ON managed_documents(hospital_id, template_id) WHERE template_id IS NOT NULL;
