-- ============================================================
-- AccrediQ — 플랫폼 관리자(어드민) 기능 추가 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- 1. profiles 테이블에 is_platform_admin 컬럼 추가
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. 본인 계정을 어드민으로 설정 (이메일 주소를 본인 이메일로 변경하세요)
UPDATE profiles
SET is_platform_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'sinab7500@gmail.com' LIMIT 1
);

-- 3. 어드민 전체 병원 읽기 권한
CREATE POLICY IF NOT EXISTS "admin: 전체 병원 읽기"
  ON hospitals FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_platform_admin = true)
  );

-- 4. 어드민 전체 병원 수정 권한
CREATE POLICY IF NOT EXISTS "admin: 전체 병원 수정"
  ON hospitals FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_platform_admin = true)
  );

-- 5. 어드민 전체 멤버 읽기
CREATE POLICY IF NOT EXISTS "admin: 전체 멤버 읽기"
  ON hospital_members FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_platform_admin = true)
  );

-- 6. 어드민 전체 문서 읽기
CREATE POLICY IF NOT EXISTS "admin: 전체 문서 읽기"
  ON documents FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_platform_admin = true)
  );

-- 7. 어드민 전체 분석 읽기
CREATE POLICY IF NOT EXISTS "admin: 전체 분석 읽기"
  ON analysis_runs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_platform_admin = true)
  );

-- 확인 쿼리
SELECT id, full_name, is_platform_admin
FROM profiles
WHERE is_platform_admin = true;
