-- ============================================================
-- AccrediQ 데모 데이터 — 가상 병원 5개
-- ============================================================

-- 어드민 유저 ID 변수
DO $$
DECLARE
  admin_id UUID;
  h1 UUID := gen_random_uuid();
  h2 UUID := gen_random_uuid();
  h3 UUID := gen_random_uuid();
  h4 UUID := gen_random_uuid();
  h5 UUID := gen_random_uuid();
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'sinab7500@gmail.com' LIMIT 1;

  -- ① 병원 5개 삽입
  INSERT INTO hospitals (id, name, license_number, type, bed_count, region, address, phone, accreditation_cycle, accreditation_start, accreditation_target, status, created_by)
  VALUES
    (h1, '한빛요양병원',   'LTC-2024-001', 'long_term_care', 120, '서울', '서울시 강남구 테헤란로 123',  '02-1234-5678', 1, '2024-01-01', '2026-12-31', 'active',    admin_id),
    (h2, '푸른솔요양병원', 'LTC-2024-002', 'long_term_care',  80, '경기', '경기도 수원시 영통구 광교로 45', '031-234-5678', 1, '2024-03-01', '2027-02-28', 'active',    admin_id),
    (h3, '서울중앙요양병원','LTC-2024-003', 'long_term_care', 200, '서울', '서울시 종로구 율곡로 99',     '02-9876-5432', 2, '2023-06-01', '2026-05-31', 'active',    admin_id),
    (h4, '하늘빛요양병원', 'LTC-2024-004', 'long_term_care',  60, '부산', '부산시 해운대구 센텀로 77',   '051-111-2222', 1, '2025-01-01', '2027-12-31', 'suspended', admin_id),
    (h5, '온누리요양병원', 'LTC-2024-005', 'long_term_care', 150, '대구', '대구시 수성구 달구벌대로 200', '053-333-4444', 1, '2024-09-01', '2027-08-31', 'active',    admin_id);

  -- ② 어드민을 각 병원의 admin 멤버로 추가
  INSERT INTO hospital_members (hospital_id, user_id, email, role, status, joined_at)
  VALUES
    (h1, admin_id, 'sinab7500@gmail.com', 'admin', 'active', now()),
    (h2, admin_id, 'sinab7500@gmail.com', 'admin', 'active', now()),
    (h3, admin_id, 'sinab7500@gmail.com', 'admin', 'active', now()),
    (h4, admin_id, 'sinab7500@gmail.com', 'admin', 'active', now()),
    (h5, admin_id, 'sinab7500@gmail.com', 'admin', 'active', now());

  -- ③ 가상 문서 (각 병원 2~3개)
  INSERT INTO documents (hospital_id, uploaded_by, original_name, storage_path, file_size_bytes, mime_type, category, status)
  VALUES
    (h1, admin_id, '감염관리지침서_2024.pdf',    'documents/h1/doc1.pdf', 1240000, 'application/pdf', 'policy',    'extracted'),
    (h1, admin_id, '욕창예방프로토콜.pdf',        'documents/h1/doc2.pdf',  980000, 'application/pdf', 'procedure', 'extracted'),
    (h1, admin_id, '환자권리고지문.pdf',           'documents/h1/doc3.pdf',  450000, 'application/pdf', 'record',    'pending'),
    (h2, admin_id, '의약품관리규정.pdf',           'documents/h2/doc1.pdf', 1100000, 'application/pdf', 'policy',    'extracted'),
    (h2, admin_id, '낙상예방지침.pdf',             'documents/h2/doc2.pdf',  870000, 'application/pdf', 'procedure', 'extracted'),
    (h3, admin_id, '인증준비현황보고서_Q1.pdf',    'documents/h3/doc1.pdf', 3200000, 'application/pdf', 'evidence',  'extracted'),
    (h3, admin_id, '직원교육이수현황.pdf',         'documents/h3/doc2.pdf',  760000, 'application/pdf', 'record',    'extracted'),
    (h3, admin_id, '의료기관평가대비계획서.pdf',   'documents/h3/doc3.pdf', 2100000, 'application/pdf', 'policy',    'processing'),
    (h5, admin_id, '임상질지표모니터링보고서.pdf', 'documents/h5/doc1.pdf', 1580000, 'application/pdf', 'evidence',  'extracted'),
    (h5, admin_id, '환자안전사고보고서.pdf',       'documents/h5/doc2.pdf',  920000, 'application/pdf', 'record',    'extracted');

  -- ④ 가상 분석 결과 (완료된 병원 3개)
  INSERT INTO analysis_runs (hospital_id, triggered_by, status, overall_score, total_criteria, compliant_count, partial_count, non_compliant_count, not_reviewed_count, critical_gap_count, major_gap_count, minor_gap_count, documents_analyzed, completed_at, started_at)
  VALUES
    (h1, admin_id, 'complete', 72, 30, 18, 6, 4, 2, 1, 3, 4, 2, now() - interval '2 days', now() - interval '2 days' - interval '3 minutes'),
    (h2, admin_id, 'complete', 58, 30, 12, 8, 7, 3, 3, 4, 6, 2, now() - interval '5 days', now() - interval '5 days' - interval '4 minutes'),
    (h3, admin_id, 'complete', 91, 30, 26, 3, 1, 0, 0, 1, 3, 3, now() - interval '1 day',  now() - interval '1 day'  - interval '2 minutes');

END $$;

-- 확인
SELECT name, region, bed_count, status FROM hospitals ORDER BY created_at;
