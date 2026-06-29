-- ============================================================
-- AccrediQ — 라운딩/모의조사 체크리스트 + 추세 추적
-- 월 1회 라운딩 결과 기록 → 시간별 추세 그래프
-- ============================================================

-- ============================================================
-- rounding_categories — 라운딩 점검 항목 카테고리
-- ============================================================
CREATE TABLE IF NOT EXISTS rounding_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  hospital_type TEXT[] NOT NULL DEFAULT '{}',
  max_score     INTEGER NOT NULL DEFAULT 100,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rounding_cats_type ON rounding_categories USING GIN(hospital_type);

-- ============================================================
-- rounding_records — 월별 라운딩 세션
-- ============================================================
CREATE TABLE IF NOT EXISTS rounding_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id   UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT '',
  round_date    DATE NOT NULL,
  overall_score NUMERIC(5,1),                  -- 0~100
  notes         TEXT,
  created_by    UUID NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rounding_records_hospital ON rounding_records(hospital_id, round_date DESC);

-- ============================================================
-- rounding_results — 카테고리별 점수
-- ============================================================
CREATE TABLE IF NOT EXISTS rounding_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rounding_id     UUID NOT NULL REFERENCES rounding_records(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES rounding_categories(id),
  hospital_id     UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  score           NUMERIC(5,1) NOT NULL,        -- 0~100
  finding         TEXT,
  action_needed   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(rounding_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_rounding_results_rounding ON rounding_results(rounding_id);

-- ============================================================
-- rounding_metrics — 핵심 수치 지표 추적 (서명누락률 등)
-- ============================================================
CREATE TABLE IF NOT EXISTS rounding_metrics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id   UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  metric_name   TEXT NOT NULL,                   -- e.g., 'chart_sign_omission'
  metric_label  TEXT NOT NULL,                   -- e.g., '의무기록 서명 누락률'
  metric_value  NUMERIC(6,2) NOT NULL,           -- e.g., 12.5 (%)
  unit          TEXT NOT NULL DEFAULT '%',
  recorded_date DATE NOT NULL,
  notes         TEXT,
  recorded_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(hospital_id, metric_name, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_rounding_metrics_hospital ON rounding_metrics(hospital_id, metric_name, recorded_date DESC);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE rounding_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounding_records     ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounding_results     ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounding_metrics     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rounding_cats_select" ON rounding_categories FOR SELECT USING (true);
CREATE POLICY "rounding_records_select" ON rounding_records FOR SELECT USING (is_platform_admin() OR is_hospital_member(hospital_id));
CREATE POLICY "rounding_records_insert" ON rounding_records FOR INSERT WITH CHECK (is_platform_admin() OR is_hospital_manager(hospital_id));
CREATE POLICY "rounding_records_update" ON rounding_records FOR UPDATE USING (is_platform_admin() OR is_hospital_manager(hospital_id));
CREATE POLICY "rounding_records_delete" ON rounding_records FOR DELETE USING (is_platform_admin() OR is_hospital_admin(hospital_id));
CREATE POLICY "rounding_results_select" ON rounding_results FOR SELECT USING (is_platform_admin() OR is_hospital_member(hospital_id));
CREATE POLICY "rounding_results_insert" ON rounding_results FOR INSERT WITH CHECK (is_platform_admin() OR is_hospital_manager(hospital_id));
CREATE POLICY "rounding_results_update" ON rounding_results FOR UPDATE USING (is_platform_admin() OR is_hospital_manager(hospital_id));
CREATE POLICY "rounding_metrics_select" ON rounding_metrics FOR SELECT USING (is_platform_admin() OR is_hospital_member(hospital_id));
CREATE POLICY "rounding_metrics_insert" ON rounding_metrics FOR INSERT WITH CHECK (is_platform_admin() OR is_hospital_manager(hospital_id));
CREATE POLICY "rounding_metrics_update" ON rounding_metrics FOR UPDATE USING (is_platform_admin() OR is_hospital_manager(hospital_id));

-- ============================================================
-- RPC: 월별 추세 데이터 조회
-- ============================================================
CREATE OR REPLACE FUNCTION get_rounding_trends(
  p_hospital_id UUID,
  p_months INTEGER DEFAULT 12
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH monthly AS (
    SELECT
      rr.id,
      rr.round_date,
      rr.overall_score,
      rr.title,
      COALESCE(jsonb_agg(
        jsonb_build_object(
          'category', rc.name,
          'score', rres.score,
          'finding', rres.finding,
          'action_needed', rres.action_needed
        ) ORDER BY rc.sort_order
      ) FILTER (WHERE rres.id IS NOT NULL), '[]'::JSONB) AS categories
    FROM rounding_records rr
    LEFT JOIN rounding_results rres ON rres.rounding_id = rr.id
    LEFT JOIN rounding_categories rc ON rc.id = rres.category_id
    WHERE rr.hospital_id = p_hospital_id
      AND rr.round_date >= (CURRENT_DATE - (p_months || ' months')::INTERVAL)
    GROUP BY rr.id, rr.round_date, rr.overall_score, rr.title
    ORDER BY rr.round_date DESC
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', m.id,
      'date', m.round_date,
      'score', m.overall_score,
      'title', m.title,
      'categories', m.categories
    ) ORDER BY m.round_date ASC
  ) INTO v_result FROM monthly m;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

-- ============================================================
-- RPC: 핵심 지표 추세 조회
-- ============================================================
CREATE OR REPLACE FUNCTION get_metric_trends(
  p_hospital_id UUID,
  p_metric_name TEXT DEFAULT NULL,
  p_months INTEGER DEFAULT 12
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH data AS (
    SELECT
      metric_name,
      metric_label,
      metric_value,
      unit,
      recorded_date
    FROM rounding_metrics
    WHERE hospital_id = p_hospital_id
      AND (p_metric_name IS NULL OR metric_name = p_metric_name)
      AND recorded_date >= (CURRENT_DATE - (p_months || ' months')::INTERVAL)
    ORDER BY recorded_date ASC
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', d.metric_name,
      'label', d.metric_label,
      'value', d.metric_value,
      'unit', d.unit,
      'date', d.recorded_date
    )
  ) INTO v_result FROM data d;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

GRANT EXECUTE ON FUNCTION get_rounding_trends TO authenticated;
GRANT EXECUTE ON FUNCTION get_metric_trends TO authenticated;

-- ============================================================
-- updated_at 트리거
-- ============================================================
DROP TRIGGER IF EXISTS trg_rounding_records_updated_at ON rounding_records;
CREATE TRIGGER trg_rounding_records_updated_at
  BEFORE UPDATE ON rounding_records
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- 시드: 기본 라운딩 카테고리 (요양병원)
-- ============================================================
INSERT INTO rounding_categories (name, description, hospital_type, max_score, sort_order) VALUES
  ('병동 환경', '병동 청결, 안전, 소음, 온도 등 물리적 환경 점검', ARRAY['nursing'], 100, 1),
  ('차트 점검', '의무기록 완결성, 서명 누락, 기록 누락 등 점검', ARRAY['nursing'], 100, 2),
  ('환자 면담', '환자 만족도, 불만 사항, 권리 인지도 확인', ARRAY['nursing'], 100, 3),
  ('직원 면담', '인증 기준 인지도, 교육 이수 확인, 애로사항 청취', ARRAY['nursing'], 100, 4),
  ('시설 안전', '화재 안전, 응급 장비, 의료기기 점검 상태', ARRAY['nursing'], 100, 5),
  ('의약품 관리', '고위험약 보관, 투약 절차 준수, 마약류 관리', ARRAY['nursing'], 100, 6),
  ('감염 관리', '손위생 이행, 격리 준수, 멸균 관리', ARRAY['nursing'], 100, 7),
  ('AED/응급장비', 'AED 위치 및 작동 상태, 응급카트 비품 점검', ARRAY['nursing'], 100, 8)
ON CONFLICT DO NOTHING;
