-- ============================================================
-- AccrediQ — RLS 격리 테스트
-- 다른 병원 데이터가 차단되는지, 역할별 권한이 작동하는지 검증
-- 실행: supabase db test 또는 직접 psql
-- ============================================================
-- 주의: 데모 데이터(seed_demo.sql)가 적용된 상태에서 실행해야 함
-- ============================================================

-- ============================================================
-- 사전 준비: 테스트용 사용자 3명 생성 + 병원 2개 할당
-- ============================================================

-- 테스트 1: 사용자는 자신이 속한 병원만 조회 가능
-- 기대: user_a는 hospital_a는 보이지만 hospital_b는 보이지 않음
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claim.sub" TO 'user_a_id';  -- user_a

  SELECT 'TEST 1: user_a는 hospital_a 조회 가능' AS test_name;
  SELECT id, name FROM hospitals WHERE name LIKE '한빛요양병원%'
    AND is_hospital_member(id);  -- → 1 row

  SELECT 'TEST 2: user_a는 hospital_b 조회 차단' AS test_name;
  SELECT id, name FROM hospitals WHERE name LIKE '푸른솔요양병원%'
    AND is_hospital_member(id);  -- → 0 rows
ROLLBACK;

-- ============================================================
-- 테스트 2: viewer는 읽기만 가능, 생성/수정/삭제 불가
-- ============================================================
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claim.sub" TO 'viewer_user_id';

  SELECT 'TEST 3: viewer는 문서 조회 가능' AS test_name;
  SELECT count(*) FROM documents WHERE hospital_id = 'hospital_a_id';  -- → 정상

  SELECT 'TEST 4: viewer는 문서 생성 차단' AS test_name;
  INSERT INTO documents (hospital_id, uploaded_by, original_name, storage_path, file_size_bytes, mime_type)
  VALUES ('hospital_a_id', 'viewer_user_id', 'test.pdf', 'test.pdf', 100, 'application/pdf');
  -- → ERROR: new row violates row-level security policy
ROLLBACK;

-- ============================================================
-- 테스트 3: manager는 생성/수정 가능, 삭제 불가
-- ============================================================
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claim.sub" TO 'manager_user_id';

  SELECT 'TEST 5: manager는 문서 생성 가능' AS test_name;
  INSERT INTO documents (hospital_id, uploaded_by, original_name, storage_path, file_size_bytes, mime_type)
  VALUES ('hospital_a_id', 'manager_user_id', 'managedoc.pdf', 'managedoc.pdf', 200, 'application/pdf')
  RETURNING id;

  SELECT 'TEST 6: manager는 문서 삭제 차단' AS test_name;
  DELETE FROM documents WHERE hospital_id = 'hospital_a_id' AND uploaded_by = 'manager_user_id';
  -- → ERROR: violates row-level security
ROLLBACK;

-- ============================================================
-- 테스트 4: admin은 모든 권한 보유 (CRUD)
-- ============================================================
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claim.sub" TO 'admin_user_id';

  SELECT 'TEST 7: admin은 병원 내 모든 문서 조회 가능' AS test_name;
  SELECT count(*) FROM documents WHERE hospital_id = 'hospital_a_id';

  SELECT 'TEST 8: admin은 멤버 초대 가능' AS test_name;
  INSERT INTO hospital_members (hospital_id, email, role, status, invited_by)
  VALUES ('hospital_a_id', 'newuser@test.com', 'viewer', 'invited', 'admin_user_id')
  RETURNING id;

  SELECT 'TEST 9: admin은 멤버 삭제 가능' AS test_name;
  DELETE FROM hospital_members WHERE hospital_id = 'hospital_a_id' AND email = 'newuser@test.com';
ROLLBACK;

-- ============================================================
-- 테스트 5: platform admin은 모든 병원 접근 가능
-- ============================================================
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claim.sub" TO 'platform_admin_id';

  SELECT 'TEST 10: platform admin은 모든 병원 조회 가능' AS test_name;
  SELECT count(*) FROM hospitals;  -- → 모든 병원

  SELECT 'TEST 11: platform admin은 병원 A 문서 조회' AS test_name;
  SELECT count(*) FROM documents WHERE hospital_id = 'hospital_a_id';

  SELECT 'TEST 12: platform admin은 병원 B 문서 조회 (병원 소속 아님에도)' AS test_name;
  SELECT count(*) FROM documents WHERE hospital_id = 'hospital_b_id';
ROLLBACK;

-- ============================================================
-- 테스트 6: 크로스-테넌트 격리 (핵심)
-- user_a와 user_b가 서로 상대 병원 데이터에 접근 못하는지 검증
-- ============================================================

-- 시나리오: user_a는 hospital_a 소속, user_b는 hospital_b 소속
-- 각자 상대 병원 데이터에 접근 시도

BEGIN;
  -- user_a의 시점
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claim.sub" TO 'user_a_id';

  SELECT 'TEST 13: [격리] user_a는 hospital_b의 문서 접근 차단' AS test_name;
  SELECT count(*) FROM documents WHERE hospital_id = 'hospital_b_id';  -- → 0
ROLLBACK;

BEGIN;
  -- user_b의 시점
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claim.sub" TO 'user_b_id';

  SELECT 'TEST 14: [격리] user_b는 hospital_a의 문서 접근 차단' AS test_name;
  SELECT count(*) FROM documents WHERE hospital_id = 'hospital_a_id';  -- → 0
ROLLBACK;

BEGIN;
  -- user_b가 hospital_a의 criterion_results 조회 시도
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claim.sub" TO 'user_b_id';

  SELECT 'TEST 15: [격리] user_b는 hospital_a의 분석결과 접근 차단' AS test_name;
  SELECT count(*) FROM criterion_results WHERE hospital_id = 'hospital_a_id';  -- → 0
ROLLBACK;

-- ============================================================
-- 테스트 7: 미인증 사용자는 모든 접근 차단
-- ============================================================
BEGIN;
  SET LOCAL ROLE anon;

  SELECT 'TEST 16: 미인증 사용자는 병원 목록 접근 차단' AS test_name;
  SELECT count(*) FROM hospitals;  -- → 0 (RLS deny)

  SELECT 'TEST 17: 미인증 사용자는 기준만 조회 가능' AS test_name;
  SELECT count(*) FROM accreditation_criteria;  -- → 전체 (public read)
ROLLBACK;

-- ============================================================
-- 테스트 결과 요약
-- ============================================================
SELECT '모든 RLS 격리 테스트 완료' AS result;
SELECT
  CASE WHEN (SELECT count(*) = 0 FROM pg_policies WHERE schemaname = 'public') THEN '실패: 정책 없음'
       ELSE '성공: 정책 적용됨'
  END AS "RLS 정책 상태",
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public') AS "정책 수",
  (SELECT count(DISTINCT tablename) FROM pg_policies WHERE schemaname = 'public') AS "적용 테이블 수";
