-- ============================================================
-- AccrediQ — 종별 교차 인증기준 자동 매핑
-- 서로 다른 평가체계 간 중복/연관 기준 매핑
-- (의료기관인증 ↔ 장기요양급여 제공기준 등)
-- ============================================================

-- ============================================================
-- accreditation_standards — 인증/평가 체계 종류
-- ============================================================
CREATE TABLE IF NOT EXISTS accreditation_standards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,          -- 'hospital_cert', 'long_term_care_eval'
  name          TEXT NOT NULL,                  -- '의료기관인증', '장기요양급여 제공기준'
  issuing_body  TEXT,                           -- '의료기관평가인증원', '건강보험심사평가원'
  description   TEXT,
  version       TEXT DEFAULT '2024',
  icon          TEXT DEFAULT '🏥',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- standard_mappings — 기준 간 교차 매핑
-- source → target 연결 (N:M)
-- ============================================================
CREATE TABLE IF NOT EXISTS standard_mappings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_standard_id  UUID NOT NULL REFERENCES accreditation_standards(id),
  target_standard_id  UUID NOT NULL REFERENCES accreditation_standards(id),
  source_code     TEXT NOT NULL,                -- ME 1.1 (source 쪽 코드)
  target_code     TEXT NOT NULL,                -- 장기요양 2.3 (target 쪽 코드)
  source_title    TEXT,
  target_title    TEXT,
  mapping_type    TEXT NOT NULL DEFAULT 'equivalent'
                  CHECK (mapping_type IN ('equivalent', 'related', 'subset', 'superset')),
  confidence      TEXT NOT NULL DEFAULT 'auto'
                  CHECK (confidence IN ('auto', 'manual', 'verified')),
  notes           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(source_standard_id, target_standard_id, source_code, target_code)
);

CREATE INDEX IF NOT EXISTS idx_std_mappings_source ON standard_mappings(source_standard_id);
CREATE INDEX IF NOT EXISTS idx_std_mappings_target ON standard_mappings(target_standard_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE accreditation_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_mappings      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "standards_select" ON accreditation_standards FOR SELECT USING (true);
CREATE POLICY "mappings_select"  ON standard_mappings      FOR SELECT USING (true);

-- service_role만 쓰기
CREATE POLICY "standards_write" ON accreditation_standards FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "mappings_write"  ON standard_mappings      FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 시드: 인증 체계
-- ============================================================
INSERT INTO accreditation_standards (code, name, issuing_body, description, icon, sort_order) VALUES
  ('hospital_cert', '의료기관인증', '의료기관평가인증원', '의료법에 따른 의료기관 인증 (요양병원/급성기/정신/치과/한방/재활)', '🏥', 1),
  ('long_term_care_eval', '장기요양급여 제공기준', '건강보험심사평가원', '장기요양기관 평가 — 요양병원 및 시설 대상', '🏠', 2),
  ('mental_health_eval', '정신건강복지시설 평가', '보건복지부', '정신건강복지법에 따른 정신병원 및 시설 평가', '🧠', 3)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 샘플 매핑 (의료기관인증 ↔ 장기요양급여)
-- ============================================================
INSERT INTO standard_mappings (source_standard_id, target_standard_id, source_code, target_code, mapping_type, confidence)
SELECT s1.id, s2.id, 'ME 1.1', 'LTC 2.1', 'equivalent', 'auto'
FROM accreditation_standards s1, accreditation_standards s2
WHERE s1.code = 'hospital_cert' AND s2.code = 'long_term_care_eval'
UNION ALL
SELECT s1.id, s2.id, 'ME 2.1', 'LTC 3.2', 'equivalent', 'auto'
FROM accreditation_standards s1, accreditation_standards s2
WHERE s1.code = 'hospital_cert' AND s2.code = 'long_term_care_eval'
UNION ALL
SELECT s1.id, s2.id, 'ME 4.1', 'LTC 4.1', 'equivalent', 'auto'
FROM accreditation_standards s1, accreditation_standards s2
WHERE s1.code = 'hospital_cert' AND s2.code = 'long_term_care_eval'
UNION ALL
SELECT s1.id, s2.id, 'ME 7.1', 'LTC 5.2', 'equivalent', 'auto'
FROM accreditation_standards s1, accreditation_standards s2
WHERE s1.code = 'hospital_cert' AND s2.code = 'long_term_care_eval'
UNION ALL
SELECT s1.id, s2.id, 'ME 9.1', 'LTC 6.1', 'related', 'auto'
FROM accreditation_standards s1, accreditation_standards s2
WHERE s1.code = 'hospital_cert' AND s2.code = 'long_term_care_eval';

-- ============================================================
-- RPC: 특정 병원의 교차 매핑 조회
-- ============================================================
CREATE OR REPLACE FUNCTION get_hospital_cross_mappings(p_hospital_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH relevant_standards AS (
    SELECT id, code, name, issuing_body, icon
    FROM accreditation_standards
    WHERE is_active = true
  ),
  mappings AS (
    SELECT
      rs1.code AS source_standard,
      rs1.name AS source_name,
      rs1.icon AS source_icon,
      rs2.code AS target_standard,
      rs2.name AS target_name,
      rs2.icon AS target_icon,
      sm.source_code,
      sm.target_code,
      sm.source_title,
      sm.target_title,
      sm.mapping_type,
      sm.confidence
    FROM standard_mappings sm
    JOIN relevant_standards rs1 ON rs1.id = sm.source_standard_id
    JOIN relevant_standards rs2 ON rs2.id = sm.target_standard_id
    WHERE sm.is_active = true
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'source_standard', m.source_standard,
      'source_name', m.source_name,
      'source_icon', m.source_icon,
      'target_standard', m.target_standard,
      'target_name', m.target_name,
      'target_icon', m.target_icon,
      'source_code', m.source_code,
      'target_code', m.target_code,
      'source_title', m.source_title,
      'target_title', m.target_title,
      'mapping_type', m.mapping_type,
      'confidence', m.confidence
    )
  ) INTO v_result FROM mappings m;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

GRANT EXECUTE ON FUNCTION get_hospital_cross_mappings TO authenticated;
