-- ============================================================
-- AccrediQ — 플랫폼 관리자 권한 부여 (서비스 소유자)
-- 병원 맞춤 규정집 자동 커스터마이징(파일럿)을 관리자 전용으로 제한하면서
-- 서비스 소유자 본인은 계속 사용할 수 있도록 is_platform_admin 플래그를 부여한다.
-- ============================================================
UPDATE profiles
SET is_platform_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'sinab7500@gmail.com');
