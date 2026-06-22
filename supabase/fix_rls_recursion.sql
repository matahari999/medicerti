-- ============================================================
-- RLS 순환참조 수정 + 어드민 정책 재정비
-- ============================================================

-- 1. 순환참조 없이 멤버십을 확인하는 security definer 함수 생성
CREATE OR REPLACE FUNCTION is_hospital_member(p_hospital_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM hospital_members
    WHERE hospital_members.hospital_id = p_hospital_id
      AND hospital_members.user_id = auth.uid()
      AND hospital_members.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_platform_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- 2. hospital_members 기존 정책 모두 삭제
DROP POLICY IF EXISTS "hospital_members: 멤버 읽기" ON hospital_members;
DROP POLICY IF EXISTS "hospital_members: 관리자 관리" ON hospital_members;
DROP POLICY IF EXISTS "admin: 전체 멤버 읽기" ON hospital_members;

-- 3. hospital_members 정책 재생성 (함수 사용 → 순환참조 없음)
CREATE POLICY "hospital_members: 멤버 읽기"
  ON hospital_members FOR SELECT
  USING (
    is_platform_admin()
    OR is_hospital_member(hospital_id)
  );

CREATE POLICY "hospital_members: 관리자 관리"
  ON hospital_members FOR ALL
  USING (
    is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM hospital_members hm
      WHERE hm.hospital_id = hospital_members.hospital_id
        AND hm.user_id = auth.uid()
        AND hm.role IN ('admin', 'manager')
        AND hm.status = 'active'
    )
  );

-- 4. hospitals 기존 정책 정비
DROP POLICY IF EXISTS "admin: 전체 병원 읽기" ON hospitals;
DROP POLICY IF EXISTS "admin: 전체 병원 수정" ON hospitals;
DROP POLICY IF EXISTS "hospitals: 멤버 읽기" ON hospitals;
DROP POLICY IF EXISTS "hospitals: 관리자 수정" ON hospitals;

CREATE POLICY "hospitals: 멤버 읽기"
  ON hospitals FOR SELECT
  USING (
    is_platform_admin()
    OR is_hospital_member(id)
  );

CREATE POLICY "hospitals: 관리자 수정"
  ON hospitals FOR UPDATE
  USING (
    is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM hospital_members hm
      WHERE hm.hospital_id = hospitals.id
        AND hm.user_id = auth.uid()
        AND hm.role = 'admin'
        AND hm.status = 'active'
    )
  );

-- 5. documents 정책 정비
DROP POLICY IF EXISTS "documents: 병원 멤버 접근" ON documents;
DROP POLICY IF EXISTS "admin: 전체 문서 읽기" ON documents;

CREATE POLICY "documents: 병원 멤버 접근"
  ON documents FOR ALL
  USING (
    is_platform_admin()
    OR is_hospital_member(hospital_id)
  );

-- 6. analysis_runs 정책 정비
DROP POLICY IF EXISTS "analysis_runs: 병원 멤버 읽기" ON analysis_runs;
DROP POLICY IF EXISTS "analysis_runs: 매니저 이상 생성" ON analysis_runs;
DROP POLICY IF EXISTS "admin: 전체 분석 읽기" ON analysis_runs;

CREATE POLICY "analysis_runs: 병원 멤버 읽기"
  ON analysis_runs FOR SELECT
  USING (
    is_platform_admin()
    OR is_hospital_member(hospital_id)
  );

CREATE POLICY "analysis_runs: 매니저 이상 생성"
  ON analysis_runs FOR INSERT
  WITH CHECK (
    is_hospital_member(hospital_id)
  );

-- 확인
SELECT schemaname, tablename, policyname FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
