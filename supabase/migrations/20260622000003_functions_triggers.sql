-- ============================================================
-- AccrediQ — 함수 & 트리거 마이그레이션
-- 생성일: 2026-06-22
-- ============================================================

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_profiles ON profiles;
CREATE TRIGGER touch_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS touch_hospitals ON hospitals;
CREATE TRIGGER touch_hospitals
  BEFORE UPDATE ON hospitals
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS touch_hospital_members ON hospital_members;
CREATE TRIGGER touch_hospital_members
  BEFORE UPDATE ON hospital_members
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS touch_documents ON documents;
CREATE TRIGGER touch_documents
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS touch_accreditation_criteria ON accreditation_criteria;
CREATE TRIGGER touch_accreditation_criteria
  BEFORE UPDATE ON accreditation_criteria
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- 신규 사용자 프로필 자동 생성
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 분석 점수 계산 함수
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_analysis_score(p_run_id UUID)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'overall_score',       ROUND(
      COALESCE(
        SUM(CASE cr.compliance_status
          WHEN 'compliant' THEN ac.weight * 1.0
          WHEN 'partial'   THEN ac.weight * 0.5
          ELSE 0
        END) / NULLIF(SUM(ac.weight), 0) * 100,
        0
      ), 2),
    'compliant_count',     COUNT(*) FILTER (WHERE cr.compliance_status = 'compliant'),
    'partial_count',       COUNT(*) FILTER (WHERE cr.compliance_status = 'partial'),
    'non_compliant_count', COUNT(*) FILTER (WHERE cr.compliance_status = 'non_compliant'),
    'not_reviewed_count',  COUNT(*) FILTER (WHERE cr.compliance_status = 'not_reviewed'),
    'critical_gap_count',  COUNT(*) FILTER (WHERE cr.severity = 'critical'),
    'major_gap_count',     COUNT(*) FILTER (WHERE cr.severity = 'major'),
    'minor_gap_count',     COUNT(*) FILTER (WHERE cr.severity = 'minor'),
    'total_criteria',      COUNT(*)
  ) INTO v_result
  FROM criterion_results cr
  JOIN accreditation_criteria ac ON ac.id = cr.criterion_id
  WHERE cr.analysis_run_id = p_run_id;

  RETURN v_result;
END;
$$;

-- ============================================================
-- 도메인별 점수 계산 함수
-- ============================================================
CREATE OR REPLACE FUNCTION get_domain_scores(p_run_id UUID)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_result JSONB := '{}';
  v_row    RECORD;
BEGIN
  FOR v_row IN
    SELECT
      ac.domain_code,
      ROUND(
        COALESCE(
          SUM(CASE cr.compliance_status
            WHEN 'compliant' THEN ac.weight * 1.0
            WHEN 'partial'   THEN ac.weight * 0.5
            ELSE 0
          END) / NULLIF(SUM(ac.weight), 0) * 100,
          0
        ), 2
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
