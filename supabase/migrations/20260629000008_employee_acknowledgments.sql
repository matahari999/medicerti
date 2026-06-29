-- ============================================================
-- AccrediQ — 직원 교육·인지 확인 로그 (Acknowledgment Log)
-- 직원이 규정/교육 문서를 읽고 이해했음을 확인하는 로그
-- 조사위원 증빙: "직원들이 이 규정을 알고 있나요?"
-- ============================================================

-- ============================================================
-- employee_acknowledgments — 직원별 문서 확인 로그
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_acknowledgments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id       UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  document_id       UUID REFERENCES managed_documents(id) ON DELETE SET NULL,
  document_type     TEXT NOT NULL,             -- 'regulation', 'education', 'policy'
  document_title    TEXT NOT NULL,
  employee_name     TEXT NOT NULL,
  employee_department TEXT,
  employee_role     TEXT,
  acknowledged_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at        TIMESTAMPTZ,               -- null = 영구, 1년 후 = 재확인 필요
  expiration_months INTEGER DEFAULT 12,
  created_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employee_ack_hospital ON employee_acknowledgments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_employee_ack_doc ON employee_acknowledgments(document_id);
CREATE INDEX IF NOT EXISTS idx_employee_ack_employee ON employee_acknowledgments(hospital_id, employee_name);
CREATE INDEX IF NOT EXISTS idx_employee_ack_expires ON employee_acknowledgments(expires_at)
  WHERE expires_at IS NOT NULL;

-- ============================================================
-- employee_acknowledgment_logs — 추가 전용 변경 감사 로그
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_acknowledgment_logs (
  id                BIGSERIAL PRIMARY KEY,
  acknowledgment_id UUID NOT NULL,
  hospital_id       UUID NOT NULL,
  action            TEXT NOT NULL,              -- 'created', 'expired', 'renewed'
  old_data          JSONB,
  new_data          JSONB,
  changed_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE employee_acknowledgments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_acknowledgment_logs  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee_ack_select" ON employee_acknowledgments
  FOR SELECT USING (is_platform_admin() OR is_hospital_member(hospital_id));
CREATE POLICY "employee_ack_insert" ON employee_acknowledgments
  FOR INSERT WITH CHECK (is_platform_admin() OR is_hospital_admin(hospital_id) OR is_hospital_manager(hospital_id));
CREATE POLICY "employee_ack_delete" ON employee_acknowledgments
  FOR DELETE USING (is_platform_admin() OR is_hospital_admin(hospital_id));

CREATE POLICY "employee_ack_logs_select" ON employee_acknowledgment_logs
  FOR SELECT USING (is_platform_admin() OR is_hospital_member(hospital_id));

-- ============================================================
-- RPC: 부서별 인지율 통계
-- ============================================================
CREATE OR REPLACE FUNCTION get_acknowledgment_stats(p_hospital_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH stats AS (
    SELECT
      COALESCE(employee_department, '기타') AS department,
      COUNT(DISTINCT employee_name) AS total_employees,
      COUNT(DISTINCT document_id) AS total_documents,
      COUNT(*) AS total_acknowledgments,
      COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at < now()) AS expired_count
    FROM employee_acknowledgments
    WHERE hospital_id = p_hospital_id
    GROUP BY employee_department
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'department', department,
      'total_employees', total_employees,
      'total_documents', total_documents,
      'total_acknowledgments', total_acknowledgments,
      'expired_count', expired_count,
      'compliance_rate', CASE
        WHEN total_acknowledgments > 0
        THEN ROUND((1.0 - expired_count::NUMERIC / total_acknowledgments) * 100, 1)
        ELSE 0
      END
    )
  ) INTO v_result FROM stats;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

GRANT EXECUTE ON FUNCTION get_acknowledgment_stats TO authenticated;
