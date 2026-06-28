-- ============================================================
-- AccrediQ — 인증 준비 진행상황 테이블
-- 각 병원이 각 인증 기준별로 진행 상태와 목표일을 관리
-- ============================================================

CREATE TABLE IF NOT EXISTS preparation_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id     UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  criterion_id    UUID NOT NULL REFERENCES accreditation_criteria(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'not_started'
                    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  target_date     DATE,
  notes           TEXT,
  assigned_to     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(hospital_id, criterion_id)
);

CREATE INDEX IF NOT EXISTS idx_prep_progress_hospital ON preparation_progress(hospital_id);
CREATE INDEX IF NOT EXISTS idx_prep_progress_status   ON preparation_progress(hospital_id, status);
CREATE INDEX IF NOT EXISTS idx_prep_progress_target    ON preparation_progress(hospital_id, target_date)
  WHERE target_date IS NOT NULL AND status != 'completed';

ALTER TABLE preparation_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prep_progress_select"
  ON preparation_progress FOR SELECT
  USING (is_platform_admin() OR is_hospital_member(hospital_id));

CREATE POLICY "prep_progress_insert"
  ON preparation_progress FOR INSERT
  WITH CHECK (is_platform_admin() OR is_hospital_manager(hospital_id));

CREATE POLICY "prep_progress_update"
  ON preparation_progress FOR UPDATE
  USING (is_platform_admin() OR is_hospital_member(hospital_id));

CREATE POLICY "prep_progress_delete"
  ON preparation_progress FOR DELETE
  USING (is_platform_admin() OR is_hospital_admin(hospital_id));

-- updated_at 트리거
DROP TRIGGER IF EXISTS touch_preparation_progress ON preparation_progress;
CREATE TRIGGER touch_preparation_progress
  BEFORE UPDATE ON preparation_progress
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
