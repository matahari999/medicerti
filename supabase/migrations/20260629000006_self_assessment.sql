-- ============================================================
-- AccrediQ — 자가 갭분석(Self Gap-Assessment) 체크리스트
-- 병원 스스로 각 ME 조사항목의 충족 상태를 평가하고
-- 우선순위 자동 매기기 + 전체 준비도 점수 계산
-- ============================================================

-- ============================================================
-- self_assessments — 평가 세션 (병원별 1회 측정)
-- ============================================================
CREATE TABLE IF NOT EXISTS self_assessments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id     UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  title           TEXT NOT NULL DEFAULT '',
  overall_score   NUMERIC(5,2),               -- 전체 준비도 (%)
  total_items     INTEGER NOT NULL DEFAULT 0,
  compliant_count INTEGER NOT NULL DEFAULT 0,
  partial_count   INTEGER NOT NULL DEFAULT 0,
  non_compliant_count INTEGER NOT NULL DEFAULT 0,
  not_reviewed_count INTEGER NOT NULL DEFAULT 0,
  critical_gap_count INTEGER NOT NULL DEFAULT 0,
  priority_score  NUMERIC(5,2),               -- 환자안전 가중 점수
  created_by      UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_self_assessments_hospital ON self_assessments(hospital_id, created_at DESC);

-- ============================================================
-- self_assessment_results — 항목별 평가 결과
-- ============================================================
CREATE TABLE IF NOT EXISTS self_assessment_results (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id     UUID NOT NULL REFERENCES self_assessments(id) ON DELETE CASCADE,
  hospital_id       UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  survey_item_id    UUID NOT NULL REFERENCES accreditation_survey_items(id),
  compliance_status TEXT NOT NULL DEFAULT 'not_reviewed'
                    CHECK (compliance_status IN ('compliant', 'partial', 'non_compliant', 'not_reviewed')),
  notes             TEXT,
  evidence_hint     TEXT,
  priority_score    NUMERIC(4,2) DEFAULT 0.00,  -- 항목별 우선순위 점수
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(assessment_id, survey_item_id)
);

CREATE INDEX IF NOT EXISTS idx_self_results_assessment ON self_assessment_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_self_results_status ON self_assessment_results(assessment_id, compliance_status);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE self_assessments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "self_assessments_select" ON self_assessments
  FOR SELECT USING (is_platform_admin() OR is_hospital_member(hospital_id));
CREATE POLICY "self_assessments_insert" ON self_assessments
  FOR INSERT WITH CHECK (is_platform_admin() OR is_hospital_manager(hospital_id));
CREATE POLICY "self_assessments_update" ON self_assessments
  FOR UPDATE USING (is_platform_admin() OR is_hospital_manager(hospital_id));
CREATE POLICY "self_assessments_delete" ON self_assessments
  FOR DELETE USING (is_platform_admin() OR is_hospital_admin(hospital_id));

CREATE POLICY "self_results_select" ON self_assessment_results
  FOR SELECT USING (is_platform_admin() OR is_hospital_member(hospital_id));
CREATE POLICY "self_results_insert" ON self_assessment_results
  FOR INSERT WITH CHECK (is_platform_admin() OR is_hospital_manager(hospital_id));
CREATE POLICY "self_results_update" ON self_assessment_results
  FOR UPDATE USING (is_platform_admin() OR is_hospital_manager(hospital_id));
CREATE POLICY "self_results_delete" ON self_assessment_results
  FOR DELETE USING (is_platform_admin() OR is_hospital_admin(hospital_id));

-- ============================================================
-- updated_at 트리거
-- ============================================================
DROP TRIGGER IF EXISTS trg_self_assessments_updated_at ON self_assessments;
CREATE TRIGGER trg_self_assessments_updated_at
  BEFORE UPDATE ON self_assessments
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_self_results_updated_at ON self_assessment_results;
CREATE TRIGGER trg_self_results_updated_at
  BEFORE UPDATE ON self_assessment_results
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- RPC: 항목별 우선순위 점수 계산 함수
-- severity + domain_weight + is_mandatory 조합
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_item_priority(
  p_severity        TEXT,
  p_domain_code     TEXT,
  p_is_mandatory    BOOLEAN,
  p_sop_type        TEXT
) RETURNS NUMERIC(4,2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_score NUMERIC(4,2) := 0;
BEGIN
  -- severity 점수 (critical=50, major=30, minor=10)
  v_score := CASE p_severity
    WHEN 'critical' THEN 50
    WHEN 'major' THEN 30
    WHEN 'minor' THEN 10
    ELSE 0
  END;

  -- 환자안전(PS) 가중 (환자안전 직결 항목 우선)
  IF p_domain_code = 'PS' THEN
    v_score := v_score + 20;
  END IF;

  -- 필수 항목 가중
  IF p_is_mandatory THEN
    v_score := v_score + 15;
  END IF;

  -- 구조(Structure) 항목은 기반이므로 우선
  IF p_sop_type = 'structure' THEN
    v_score := v_score + 10;
  END IF;

  -- 과정(Process) 항목
  IF p_sop_type = 'process' THEN
    v_score := v_score + 5;
  END IF;

  RETURN LEAST(v_score, 100);
END;
$$;

-- ============================================================
-- RPC: 새 평가 세션 생성 + 전체 항목 자동 초기화
-- ============================================================
CREATE OR REPLACE FUNCTION create_self_assessment(
  p_hospital_id UUID,
  p_title TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_assessment_id UUID;
  v_item_count INTEGER;
  v_assessment JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  -- 새 assessment 생성
  INSERT INTO self_assessments (hospital_id, title, created_by)
  VALUES (p_hospital_id, p_title, v_user_id)
  RETURNING id INTO v_assessment_id;

  -- 모든 활성 survey_item 복사 (해당 병원용)
  INSERT INTO self_assessment_results (assessment_id, hospital_id, survey_item_id, compliance_status, priority_score)
  SELECT
    v_assessment_id,
    p_hospital_id,
    si.id,
    'not_reviewed',
    calculate_item_priority(si.severity, a.code, si.is_mandatory, si.sop_type)
  FROM accreditation_survey_items si
  JOIN accreditation_entries e ON e.id = si.entry_id
  JOIN accreditation_chapters ch ON ch.id = e.chapter_id
  JOIN accreditation_areas a ON a.id = ch.area_id
  WHERE si.is_active = true;

  GET DIAGNOSTICS v_item_count = ROW_COUNT;

  UPDATE self_assessments
  SET total_items = v_item_count
  WHERE id = v_assessment_id;

  SELECT row_to_json(s)::JSONB INTO v_assessment
  FROM self_assessments s WHERE s.id = v_assessment_id;

  RETURN v_assessment;
END;
$$;

GRANT EXECUTE ON FUNCTION create_self_assessment TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_item_priority TO authenticated;
