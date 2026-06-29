CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'rounding_due', 'rounding_overdue',
    'accreditation_expiring', 'accreditation_expired',
    'education_retrain',
    'assessment_incomplete',
    'acknowledgment_due',
    'kpi_alert',
    'system'
  )),
  title TEXT NOT NULL,
  message TEXT,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_hospital_id ON notifications(hospital_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(hospital_id, user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR user_id IS NULL
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hospital_members
      WHERE hospital_id = notifications.hospital_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

CREATE OR REPLACE FUNCTION check_rounding_reminders()
RETURNS TABLE(hospital_id UUID, days_since_last INT)
LANGUAGE sql STABLE
AS $$
  SELECT
    h.id AS hospital_id,
    COALESCE(
      EXTRACT(DAY FROM NOW() - (
        SELECT MAX(round_date) FROM rounding_records WHERE hospital_id = h.id
      ))::INT,
      999
    ) AS days_since_last
  FROM hospitals h
  WHERE h.accreditation_target IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION generate_rounding_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT * FROM check_rounding_reminders() LOOP
    IF rec.days_since_last > 45 THEN
      INSERT INTO notifications (hospital_id, user_id, type, title, message, severity, link)
      VALUES (
        rec.hospital_id, NULL, 'rounding_overdue',
        '라운딩 미실시 알림',
        format('마지막 라운딩 후 %s일이 지났습니다. 월 1회 정기 라운딩을 실시해주세요.', rec.days_since_last),
        'critical',
        format('/hospitals/%s/rounding', rec.hospital_id)
      )
      ON CONFLICT DO NOTHING;
    ELSIF rec.days_since_last > 30 THEN
      INSERT INTO notifications (hospital_id, user_id, type, title, message, severity, link)
      VALUES (
        rec.hospital_id, NULL, 'rounding_due',
        '라운딩 예정 알림',
        format('마지막 라운딩 후 %s일이 지났습니다. 이번 주 내로 라운딩을 실시해주세요.', rec.days_since_last),
        'warning',
        format('/hospitals/%s/rounding', rec.hospital_id)
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION check_accreditation_deadlines()
RETURNS TABLE(hospital_id UUID, hospital_name TEXT, days_left INT)
LANGUAGE sql STABLE
AS $$
  SELECT
    h.id, h.name,
    EXTRACT(DAY FROM h.accreditation_target - NOW())::INT
  FROM hospitals h
  WHERE h.accreditation_target IS NOT NULL
    AND h.accreditation_target >= NOW();
$$;

CREATE OR REPLACE FUNCTION generate_accreditation_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT * FROM check_accreditation_deadlines() LOOP
    IF rec.days_left < 0 THEN
      INSERT INTO notifications (hospital_id, user_id, type, title, message, severity, link)
      VALUES (
        rec.hospital_id, NULL, 'accreditation_expired',
        '인증 목일 기한 초과',
        format('"%s"의 인증 목표일이 지났습니다. 인증 일정을 조정해주세요.', rec.hospital_name),
        'critical',
        format('/hospitals/%s/settings', rec.hospital_id)
      )
      ON CONFLICT DO NOTHING;
    ELSIF rec.days_left <= 30 THEN
      INSERT INTO notifications (hospital_id, user_id, type, title, message, severity, link)
      VALUES (
        rec.hospital_id, NULL, 'accreditation_expiring',
        '인증 목표일 임박',
        format('"%s"의 인증까지 %s일 남았습니다. 준비 상태를 점검해주세요.', rec.hospital_name, rec.days_left),
        'critical',
        format('/hospitals/%s', rec.hospital_id)
      )
      ON CONFLICT DO NOTHING;
    ELSIF rec.days_left <= 90 THEN
      INSERT INTO notifications (hospital_id, user_id, type, title, message, severity, link)
      VALUES (
        rec.hospital_id, NULL, 'accreditation_expiring',
        '인증 준비 리마인더',
        format('"%s"의 인증까지 %s일 남았습니다. 갭분석을 완료해주세요.', rec.hospital_name, rec.days_left),
        'warning',
        format('/hospitals/%s/self-assessment', rec.hospital_id)
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$;
