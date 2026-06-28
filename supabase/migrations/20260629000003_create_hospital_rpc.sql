-- ============================================================
-- 병원 생성 + 관리자 멤버 추가 원자적 RPC
-- SECURITY DEFINER: 함수 내부에서 auth.uid()로 호출자 확인 후 RLS 우회
-- ============================================================

CREATE OR REPLACE FUNCTION create_hospital_with_admin(
  p_name                 TEXT,
  p_license_number       TEXT DEFAULT NULL,
  p_type                 TEXT DEFAULT 'long_term_care',
  p_bed_count            INTEGER DEFAULT NULL,
  p_region               TEXT DEFAULT NULL,
  p_address              TEXT DEFAULT NULL,
  p_phone                TEXT DEFAULT NULL,
  p_accreditation_cycle  INTEGER DEFAULT 1,
  p_accreditation_start  DATE DEFAULT NULL,
  p_accreditation_target DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id     UUID;
  v_user_email  TEXT;
  v_hospital_id UUID;
  v_hospital    JSONB;
BEGIN
  -- 호출자 확인 (anon은 거부)
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: 로그인이 필요합니다';
  END IF;

  -- 이메일 조회
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  -- 병원 생성
  INSERT INTO hospitals (
    name, license_number, type, bed_count, region, address, phone,
    accreditation_cycle, accreditation_start, accreditation_target,
    created_by
  ) VALUES (
    p_name, p_license_number, p_type, p_bed_count, p_region, p_address, p_phone,
    p_accreditation_cycle, p_accreditation_start, p_accreditation_target,
    v_user_id
  )
  RETURNING id INTO v_hospital_id;

  -- 생성자를 admin으로 추가
  INSERT INTO hospital_members (
    hospital_id, user_id, email, role, status, joined_at
  ) VALUES (
    v_hospital_id, v_user_id, COALESCE(v_user_email, ''), 'admin', 'active', now()
  );

  -- 생성된 병원 반환
  SELECT row_to_json(h)::JSONB INTO v_hospital
  FROM hospitals h WHERE h.id = v_hospital_id;

  RETURN v_hospital;
END;
$$;

-- 인증된 사용자만 호출 가능
GRANT EXECUTE ON FUNCTION create_hospital_with_admin TO authenticated;
REVOKE EXECUTE ON FUNCTION create_hospital_with_admin FROM anon;
