-- ============================================================
-- 4주기 요양병원 인증기준(Ver. 4.1, 2025.12, 2026.2.1 시행) 공식 데이터 반영
-- 출처: 의료기관평가인증원 붙임2. 4주기 요양병원 인증기준(Ver. 4.1)
-- 기존 nursing 종별 가상(fictional) 시드 데이터를 실제 공식 4영역/12장/60기준/303조사항목으로 전면 교체
-- ============================================================

-- 1) 영역명을 공식 4대 체계 명칭으로 갱신 (코드는 유지 — 다른 병원종별 장(chapter)이 참조 중)
UPDATE accreditation_areas SET name = '기본가치체계', name_en = 'Basic Value System' WHERE code = 'PS';
UPDATE accreditation_areas SET name = '환자진료체계', name_en = 'Patient Care System' WHERE code = 'PC';
UPDATE accreditation_areas SET name = '조직관리체계', name_en = 'Organizational Management System' WHERE code = 'GL';
UPDATE accreditation_areas SET name = '성과관리체계', name_en = 'Performance Management System' WHERE code = 'QS';

-- 2) 기존 요양병원(nursing) 가상 데이터 삭제 (하위 -> 상위 순서)
DELETE FROM accreditation_survey_items WHERE 'nursing' = ANY(hospital_types);
DELETE FROM accreditation_categories WHERE entry_id IN (SELECT id FROM accreditation_entries WHERE 'nursing' = ANY(hospital_types));
DELETE FROM accreditation_entries WHERE 'nursing' = ANY(hospital_types);
DELETE FROM accreditation_chapters WHERE 'nursing' = ANY(hospital_types);

-- 3) 실제 12개 장 (Chapters) 삽입
INSERT INTO accreditation_chapters (area_id, code, title, hospital_types, sort_order)
SELECT a.id, 'CH-01-NURSING', '1장. 환자안전보장활동', ARRAY['nursing'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-02-NURSING', '2장. 진료전달체계와 평가', ARRAY['nursing'], 2
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-03-NURSING', '3장. 환자진료', ARRAY['nursing'], 3
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-04-NURSING', '4장. 의약품관리', ARRAY['nursing'], 4
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-05-NURSING', '5장. 환자권리존중 및 보호', ARRAY['nursing'], 5
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-06-NURSING', '6장. 질 향상 및 환자안전 활동', ARRAY['nursing'], 6
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-07-NURSING', '7장. 감염관리', ARRAY['nursing'], 7
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-08-NURSING', '8장. 경영 및 조직운영', ARRAY['nursing'], 8
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-09-NURSING', '9장. 인적자원관리', ARRAY['nursing'], 9
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-10-NURSING', '10장. 시설 및 환경관리', ARRAY['nursing'], 10
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-11-NURSING', '11장. 의료정보/의무기록 관리', ARRAY['nursing'], 11
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-12-NURSING', '12장. 성과관리', ARRAY['nursing'], 12
FROM accreditation_areas a WHERE a.code = 'QS';

-- 4) 실제 60개 기준 (Standards/Entries) 삽입
INSERT INTO accreditation_entries (chapter_id, code, title, hospital_types, sort_order)
SELECT c.id, 'STD-1.1', '환자를 정확하게 확인하고 의사소통한다.', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-01-NURSING'
UNION ALL
SELECT c.id, 'STD-1.2', '낙상 예방활동을 수행한다.', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-01-NURSING'
UNION ALL
SELECT c.id, 'STD-1.3', '손위생을 철저히 수행한다.', ARRAY['nursing'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-01-NURSING'
UNION ALL
SELECT c.id, 'STD-2.1.1', '외래환자 등록 절차가 있다.', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-02-NURSING'
UNION ALL
SELECT c.id, 'STD-2.1.2', '입원 절차가 있다.', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-02-NURSING'
UNION ALL
SELECT c.id, 'STD-2.1.3', '입원환자의 진료 책임자를 명확히 정하고 정보를 공유한다.', ARRAY['nursing'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-02-NURSING'
UNION ALL
SELECT c.id, 'STD-2.1.4', '퇴원, 의뢰 및 전원서비스를 제공한다.', ARRAY['nursing'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-02-NURSING'
UNION ALL
SELECT c.id, 'STD-2.2.1', '외래환자의 요구를 확인하고 초기평가를 수행한다.', ARRAY['nursing'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-02-NURSING'
UNION ALL
SELECT c.id, 'STD-2.2.2', '입원환자의 요구를 확인하고 초기평가 및 재평가를 수행한다.', ARRAY['nursing'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-02-NURSING'
UNION ALL
SELECT c.id, 'STD-2.3.1', '검체검사 운영과정을 관리한다.', ARRAY['nursing'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-02-NURSING'
UNION ALL
SELECT c.id, 'STD-2.3.2', '영상검사 운영과정을 관리한다.', ARRAY['nursing'], 8
FROM accreditation_chapters c WHERE c.code = 'CH-02-NURSING'
UNION ALL
SELECT c.id, 'STD-2.3.3', '검사실을 안전하게 관리한다.', ARRAY['nursing'], 9
FROM accreditation_chapters c WHERE c.code = 'CH-02-NURSING'
UNION ALL
SELECT c.id, 'STD-3.1.1', '적시에 치료계획(care plan)을 세우고 이를 수행한다.', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-03-NURSING'
UNION ALL
SELECT c.id, 'STD-3.1.2', '협의진료를 수행한다.', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-03-NURSING'
UNION ALL
SELECT c.id, 'STD-3.1.3', '통증을 적절하게 관리한다.', ARRAY['nursing'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-03-NURSING'
UNION ALL
SELECT c.id, 'STD-3.1.4', '환자에게 영양을 적절하게 공급하고 관리한다.', ARRAY['nursing'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-03-NURSING'
UNION ALL
SELECT c.id, 'STD-3.1.5', '욕창예방 및 관리활동을 수행한다.', ARRAY['nursing'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-03-NURSING'
UNION ALL
SELECT c.id, 'STD-3.1.6', '생애말기환자의 존엄성과 편안함을 유지하기 위한 의료서비스를 제공한다.', ARRAY['nursing'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-03-NURSING'
UNION ALL
SELECT c.id, 'STD-3.1.7', '결핵 발생을 예방하고 관리한다.', ARRAY['nursing'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-03-NURSING'
UNION ALL
SELECT c.id, 'STD-3.1.8', '한방 서비스를 안전하게 제공한다.', ARRAY['nursing'], 8
FROM accreditation_chapters c WHERE c.code = 'CH-03-NURSING'
UNION ALL
SELECT c.id, 'STD-3.2.1', '심폐소생술이 요구되는 환자에게 적절한 의료서비스를 제공한다.', ARRAY['nursing'], 9
FROM accreditation_chapters c WHERE c.code = 'CH-03-NURSING'
UNION ALL
SELECT c.id, 'STD-3.2.2', '수혈환자에게 양질의 의료서비스를 제공한다.', ARRAY['nursing'], 10
FROM accreditation_chapters c WHERE c.code = 'CH-03-NURSING'
UNION ALL
SELECT c.id, 'STD-3.2.3', '신체보호대를 적절하고 안전하게 사용한다.', ARRAY['nursing'], 11
FROM accreditation_chapters c WHERE c.code = 'CH-03-NURSING'
UNION ALL
SELECT c.id, 'STD-4.1', '의약품을 적절하게 선정하고 확보한다.', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-04-NURSING'
UNION ALL
SELECT c.id, 'STD-4.2', '의약품을 안전하게 보관한다.', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-04-NURSING'
UNION ALL
SELECT c.id, 'STD-4.3', '의약품을 안전하게 처방하고 조제한다.', ARRAY['nursing'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-04-NURSING'
UNION ALL
SELECT c.id, 'STD-4.4', '의약품을 안전하게 투여한다.', ARRAY['nursing'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-04-NURSING'
UNION ALL
SELECT c.id, 'STD-5.1', '환자의 권리를 존중하고, 안전을 보장한다.', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-05-NURSING'
UNION ALL
SELECT c.id, 'STD-5.2', '취약환자의 권리를 보호하고, 안전을 보장한다.', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-05-NURSING'
UNION ALL
SELECT c.id, 'STD-5.3', '환자의 불만 및 고충을 관리한다.', ARRAY['nursing'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-05-NURSING'
UNION ALL
SELECT c.id, 'STD-5.4', '의료사회복지체계를 수립하고 운영한다.', ARRAY['nursing'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-05-NURSING'
UNION ALL
SELECT c.id, 'STD-5.5', '환자 또는 보호자에게 동의서를 받는다.', ARRAY['nursing'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-05-NURSING'
UNION ALL
SELECT c.id, 'STD-5.6', '의료기관은 환자의 권리를 보호하기 위한 시설을 갖추고 운영한다.', ARRAY['nursing'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-05-NURSING'
UNION ALL
SELECT c.id, 'STD-6.1', '질 향상과 환자안전을 위한 운영체계가 있다.', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-06-NURSING'
UNION ALL
SELECT c.id, 'STD-6.2', '환자안전사건을 관리한다.', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-06-NURSING'
UNION ALL
SELECT c.id, 'STD-6.3', '의료기관의 질 향상 및 환자안전 활동을 수행한다.', ARRAY['nursing'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-06-NURSING'
UNION ALL
SELECT c.id, 'STD-7.1', '감염예방 및 관리체계를 운영한다.', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-07-NURSING'
UNION ALL
SELECT c.id, 'STD-7.2', '의료기구 관련 감염관리 활동을 수행한다.', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-07-NURSING'
UNION ALL
SELECT c.id, 'STD-7.3', '의료기구의 세척, 소독, 멸균과정과 세탁물을 적절히 관리한다.', ARRAY['nursing'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-07-NURSING'
UNION ALL
SELECT c.id, 'STD-7.4', '환자치료영역의 청소 및 소독을 수행하고, 환경을 관리한다.', ARRAY['nursing'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-07-NURSING'
UNION ALL
SELECT c.id, 'STD-7.5', '내시경실 및 인공신장실 감염관리 활동을 수행한다.', ARRAY['nursing'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-07-NURSING'
UNION ALL
SELECT c.id, 'STD-7.6', '급식서비스를 관리한다.', ARRAY['nursing'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-07-NURSING'
UNION ALL
SELECT c.id, 'STD-7.7', '감염성질환 환자를 관리한다.', ARRAY['nursing'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-07-NURSING'
UNION ALL
SELECT c.id, 'STD-8.1', '경영진은 합리적 의사결정을 하고, 체계적인 계획 하에 의료기관을 운영한다.', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-08-NURSING'
UNION ALL
SELECT c.id, 'STD-8.2', '의료기관의 운영방향을 공유한다.', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-08-NURSING'
UNION ALL
SELECT c.id, 'STD-8.3', '윤리적 갈등 해결 및 폭력 예방을 위한 지원체계를 갖추고 지원한다.', ARRAY['nursing'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-08-NURSING'
UNION ALL
SELECT c.id, 'STD-9.1', '직원의 인사정보를 관리한다.', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-09-NURSING'
UNION ALL
SELECT c.id, 'STD-9.2', '직원에게 지속적인 교육 및 훈련을 제공한다.', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-09-NURSING'
UNION ALL
SELECT c.id, 'STD-9.3', '보건의료인력의 법적기준을 준수한다.', ARRAY['nursing'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-09-NURSING'
UNION ALL
SELECT c.id, 'STD-9.4', '직원의 건강유지와 안전 관리활동을 수행한다.', ARRAY['nursing'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-09-NURSING'
UNION ALL
SELECT c.id, 'STD-10.1', '시설 및 환경안전 관리를 수행한다.', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-10-NURSING'
UNION ALL
SELECT c.id, 'STD-10.2', '설비시스템을 안전하게 관리한다.', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-10-NURSING'
UNION ALL
SELECT c.id, 'STD-10.3', '위험물질을 안전하게 관리한다.', ARRAY['nursing'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-10-NURSING'
UNION ALL
SELECT c.id, 'STD-10.4', '보안체계를 갖추고 운영한다.', ARRAY['nursing'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-10-NURSING'
UNION ALL
SELECT c.id, 'STD-10.5', '의료기기를 안전하게 관리한다.', ARRAY['nursing'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-10-NURSING'
UNION ALL
SELECT c.id, 'STD-10.6', '화재안전 관리활동을 수행한다.', ARRAY['nursing'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-10-NURSING'
UNION ALL
SELECT c.id, 'STD-11.1', '의료정보/의무기록을 관리한다.', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-11-NURSING'
UNION ALL
SELECT c.id, 'STD-11.2', '의무기록의 작성을 완결한다.', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-11-NURSING'
UNION ALL
SELECT c.id, 'STD-11.3', '개인정보를 보호하고 안전하게 관리한다.', ARRAY['nursing'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-11-NURSING'
UNION ALL
SELECT c.id, 'STD-12.1', '환자안전과 질 향상을 위한 지표를 관리한다.', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-12-NURSING';

-- 5) 실제 303개 조사항목 (Survey Items, ME) 삽입 — category 없이 entry 직속
INSERT INTO accreditation_survey_items (entry_id, code, title, description, sop_type, is_mandatory, is_pilot, severity, hospital_types, sort_order)
SELECT e.id, '1.1-1', '정확한 환자 확인 및 의사소통에 대한 규정이 있다.', '정확한 환자 확인 및 의사소통에 대한 규정이 있다.', 'structure', true, false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-1.1'
UNION ALL
SELECT e.id, '1.1-2', '환자를 정확하게 확인한다.', '환자를 정확하게 확인한다.', 'process', true, false, 'critical', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-1.1'
UNION ALL
SELECT e.id, '1.1-3', '구두처방을 수행한다.', '구두처방을 수행한다.', 'process', true, false, 'critical', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-1.1'
UNION ALL
SELECT e.id, '1.1-4', '필요시처방(p.r.n)을 관리한다.', '필요시처방(p.r.n)을 관리한다.', 'process', true, false, 'critical', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-1.1'
UNION ALL
SELECT e.id, '1.1-5', '필요시처방(p.r.n)을 안전하게 수행한다.', '필요시처방(p.r.n)을 안전하게 수행한다.', 'process', true, false, 'critical', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-1.1'
UNION ALL
SELECT e.id, '1.1-6', '혼동하기 쉬운 부정확한 처방 시 대처방안을 알고 수행한다.', '혼동하기 쉬운 부정확한 처방 시 대처방안을 알고 수행한다.', 'process', true, false, 'critical', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-1.1'
UNION ALL
SELECT e.id, '1.2-1', '낙상 예방에 대한 규정이 있다.', '낙상 예방에 대한 규정이 있다.', 'structure', true, false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-1.2'
UNION ALL
SELECT e.id, '1.2-2', '낙상 위험 평가도구를 이용하여 환자 입원 시 초기평가를 수행한다.', '낙상 위험 평가도구를 이용하여 환자 입원 시 초기평가를 수행한다.', 'process', true, false, 'critical', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-1.2'
UNION ALL
SELECT e.id, '1.2-3', '낙상 위험 평가결과에 따라 고위험환자에 대한 낙상 예방활동을 수행한다.', '낙상 위험 평가결과에 따라 고위험환자에 대한 낙상 예방활동을 수행한다.', 'process', true, false, 'critical', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-1.2'
UNION ALL
SELECT e.id, '1.2-4', '낙상 위험 평가도구를 이용하여 재평가를 수행한다.', '낙상 위험 평가도구를 이용하여 재평가를 수행한다.', 'process', true, false, 'critical', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-1.2'
UNION ALL
SELECT e.id, '1.2-5', '낙상 발생 가능한 장소 또는 부서에서 낙상 예방활동을 수행한다.', '낙상 발생 가능한 장소 또는 부서에서 낙상 예방활동을 수행한다.', 'process', true, false, 'critical', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-1.2'
UNION ALL
SELECT e.id, '1.3-1', '손위생 수행에 대한 규정이 있다.', '손위생 수행에 대한 규정이 있다.', 'structure', true, false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-1.3'
UNION ALL
SELECT e.id, '1.3-2', '손위생을 올바르게 수행한다.', '손위생을 올바르게 수행한다.', 'process', true, false, 'critical', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-1.3'
UNION ALL
SELECT e.id, '1.3-3', '손위생 수행을 돕기 위한 자원을 지원한다.', '손위생 수행을 돕기 위한 자원을 지원한다.', 'process', true, false, 'critical', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-1.3'
UNION ALL
SELECT e.id, '2.1.1-1', '외래환자 등록 절차가 있다.', '외래환자 등록 절차가 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-2.1.1'
UNION ALL
SELECT e.id, '2.1.1-2', '외래환자 등록을 관리한다.', '외래환자 등록을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-2.1.1'
UNION ALL
SELECT e.id, '2.1.1-3', '외래등록 및 의료기관 제공 서비스에 대한 정보를 제공한다.', '외래등록 및 의료기관 제공 서비스에 대한 정보를 제공한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-2.1.1'
UNION ALL
SELECT e.id, '2.1.2-1', '입원 절차가 있다.', '입원 절차가 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-2.1.2'
UNION ALL
SELECT e.id, '2.1.2-2', '입원환자 등록 절차를 준수한다.', '입원환자 등록 절차를 준수한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-2.1.2'
UNION ALL
SELECT e.id, '2.1.2-3', '입원 시 환자에게 필요한 정보를 제공한다.', '입원 시 환자에게 필요한 정보를 제공한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-2.1.2'
UNION ALL
SELECT e.id, '2.1.2-4', '진료의뢰를 통한 입원서비스를 관리한다.', '진료의뢰를 통한 입원서비스를 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-2.1.2'
UNION ALL
SELECT e.id, '2.1.3-1', '환자 책임의사 지정 및 담당 의료진 변경 시 정보공유에 대한 규정이 있다.', '환자 책임의사 지정 및 담당 의료진 변경 시 정보공유에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-2.1.3'
UNION ALL
SELECT e.id, '2.1.3-2', '전과 시 의무기록을 작성하여 환자 상태에 대한 정보를 공유한다.', '전과 시 의무기록을 작성하여 환자 상태에 대한 정보를 공유한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-2.1.3'
UNION ALL
SELECT e.id, '2.1.3-3', '전동 시 의무기록을 작성하여 환자 상태에 대한 정보를 공유한다.', '전동 시 의무기록을 작성하여 환자 상태에 대한 정보를 공유한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-2.1.3'
UNION ALL
SELECT e.id, '2.1.3-4', '근무교대 시 환자 상태에 대한 정보를 공유한다.', '근무교대 시 환자 상태에 대한 정보를 공유한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-2.1.3'
UNION ALL
SELECT e.id, '2.1.4-1', '퇴원 및 전원에 대한 규정이 있다.', '퇴원 및 전원에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-2.1.4'
UNION ALL
SELECT e.id, '2.1.4-2', '퇴원 전에 퇴원요약지를 작성한다.', '퇴원 전에 퇴원요약지를 작성한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-2.1.4'
UNION ALL
SELECT e.id, '2.1.4-3', '퇴원 시 필요한 정보를 제공한다.', '퇴원 시 필요한 정보를 제공한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-2.1.4'
UNION ALL
SELECT e.id, '2.1.4-4', '의뢰 및 전원서비스를 제공한다.', '의뢰 및 전원서비스를 제공한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-2.1.4'
UNION ALL
SELECT e.id, '2.2.1-1', '외래환자 초기평가에 대한 규정이 있다.', '외래환자 초기평가에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-2.2.1'
UNION ALL
SELECT e.id, '2.2.1-2', '타 의료기관에서 가져온 진료 정보를 확인한다.', '타 의료기관에서 가져온 진료 정보를 확인한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-2.2.1'
UNION ALL
SELECT e.id, '2.2.1-3', '의사는 외래환자 초기평가를 수행하고 기록한다.', '의사는 외래환자 초기평가를 수행하고 기록한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-2.2.1'
UNION ALL
SELECT e.id, '2.2.2-1', '입원환자 초기평가에 대한 규정이 있다.', '입원환자 초기평가에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-2.2.2'
UNION ALL
SELECT e.id, '2.2.2-2', '의학적 초기평가를 24시간 이내 수행하고 기록한다.', '의학적 초기평가를 24시간 이내 수행하고 기록한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-2.2.2'
UNION ALL
SELECT e.id, '2.2.2-3', '간호 초기평가를 24시간 이내 수행하고 기록한다.', '간호 초기평가를 24시간 이내 수행하고 기록한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-2.2.2'
UNION ALL
SELECT e.id, '2.2.2-4', '영양 초기평가를 수행하고 기록한다.', '영양 초기평가를 수행하고 기록한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-2.2.2'
UNION ALL
SELECT e.id, '2.2.2-5', '입원환자의 의학적 재평가에 대한 규정이 있다.', '입원환자의 의학적 재평가에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-2.2.2'
UNION ALL
SELECT e.id, '2.2.2-6', '입원환자의 의학적 재평가를 수행하고 기록한다.', '입원환자의 의학적 재평가를 수행하고 기록한다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-2.2.2'
UNION ALL
SELECT e.id, '2.2.2-7', '환자평가 기록을 환자 진료를 담당하는 직원과 공유한다.', '환자평가 기록을 환자 진료를 담당하는 직원과 공유한다.', 'process', true, false, 'major', ARRAY['nursing'], 7
FROM accreditation_entries e WHERE e.code = 'STD-2.2.2'
UNION ALL
SELECT e.id, '2.3.1-1', '검체검사 운영에 대한 규정이 있다.', '검체검사 운영에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-2.3.1'
UNION ALL
SELECT e.id, '2.3.1-2', '검체검사를 시행하는 적격한 자가 있다.', '검체검사를 시행하는 적격한 자가 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-2.3.1'
UNION ALL
SELECT e.id, '2.3.1-3', '검체를 안전하게 획득한다.', '검체를 안전하게 획득한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-2.3.1'
UNION ALL
SELECT e.id, '2.3.1-4', '정확한 검체검사를 위한 확인 절차를 준수한다.', '정확한 검체검사를 위한 확인 절차를 준수한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-2.3.1'
UNION ALL
SELECT e.id, '2.3.1-5', '검체검사 결과를 정확하고 신속하게 보고한다.', '검체검사 결과를 정확하고 신속하게 보고한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-2.3.1'
UNION ALL
SELECT e.id, '2.3.1-6', '검사결과 재확인을 위한 검체를 관리한다.', '검사결과 재확인을 위한 검체를 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-2.3.1'
UNION ALL
SELECT e.id, '2.3.1-7', '정도관리를 수행하고 관리한다.', '정도관리를 수행하고 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 7
FROM accreditation_entries e WHERE e.code = 'STD-2.3.1'
UNION ALL
SELECT e.id, '2.3.1-8', '검체검사 외부 의뢰체계를 적정하게 활용한다.', '검체검사 외부 의뢰체계를 적정하게 활용한다.', 'process', true, false, 'major', ARRAY['nursing'], 8
FROM accreditation_entries e WHERE e.code = 'STD-2.3.1'
UNION ALL
SELECT e.id, '2.3.2-1', '영상검사 운영에 대한 규정이 있다.', '영상검사 운영에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-2.3.2'
UNION ALL
SELECT e.id, '2.3.2-2', '영상검사를 시행하는 적격한 자가 있다.', '영상검사를 시행하는 적격한 자가 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-2.3.2'
UNION ALL
SELECT e.id, '2.3.2-3', '영상검사 결과를 판독하는 적격한 자가 있다.', '영상검사 결과를 판독하는 적격한 자가 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-2.3.2'
UNION ALL
SELECT e.id, '2.3.2-4', '영상검사 전 준비사항을 확인한다.', '영상검사 전 준비사항을 확인한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-2.3.2'
UNION ALL
SELECT e.id, '2.3.2-5', '정확한 영상검사를 위한 확인 절차를 준수한다.', '정확한 영상검사를 위한 확인 절차를 준수한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-2.3.2'
UNION ALL
SELECT e.id, '2.3.2-6', '영상검사 결과를 정확하고 신속하게 보고한다.', '영상검사 결과를 정확하고 신속하게 보고한다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-2.3.2'
UNION ALL
SELECT e.id, '2.3.2-7', '정도관리를 수행하고 관리한다.', '정도관리를 수행하고 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 7
FROM accreditation_entries e WHERE e.code = 'STD-2.3.2'
UNION ALL
SELECT e.id, '2.3.2-8', '영상검사 외부 의뢰체계를 적정하게 활용한다.', '영상검사 외부 의뢰체계를 적정하게 활용한다.', 'process', true, false, 'major', ARRAY['nursing'], 8
FROM accreditation_entries e WHERE e.code = 'STD-2.3.2'
UNION ALL
SELECT e.id, '2.3.3-1', '검사실 안전관리에 대한 규정이 있다.', '검사실 안전관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-2.3.3'
UNION ALL
SELECT e.id, '2.3.3-2', '검체검사실을 안전하게 관리한다.', '검체검사실을 안전하게 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-2.3.3'
UNION ALL
SELECT e.id, '2.3.3-3', '방사선을 안전하게 관리한다.', '방사선을 안전하게 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-2.3.3'
UNION ALL
SELECT e.id, '3.1.1-1', '의사는 환자의 치료계획을 수립한다.', '의사는 환자의 치료계획을 수립한다.', 'process', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-3.1.1'
UNION ALL
SELECT e.id, '3.1.1-2', '의사는 환자의 주요 상태변화 경과를 기록한다.', '의사는 환자의 주요 상태변화 경과를 기록한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-3.1.1'
UNION ALL
SELECT e.id, '3.1.1-3', '의사는 환자의 치료계획을 재수립한다.', '의사는 환자의 치료계획을 재수립한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-3.1.1'
UNION ALL
SELECT e.id, '3.1.1-4', '간호사는 환자의 주요 상태변화에 따라 간호과정을 기록한다.', '간호사는 환자의 주요 상태변화에 따라 간호과정을 기록한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-3.1.1'
UNION ALL
SELECT e.id, '3.1.1-5', '환자 치료계획 및 간호과정을 관련 직원과 공유한다.', '환자 치료계획 및 간호과정을 관련 직원과 공유한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-3.1.1'
UNION ALL
SELECT e.id, '3.1.1-6', '환자에게 치료계획을 설명한다.', '환자에게 치료계획을 설명한다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-3.1.1'
UNION ALL
SELECT e.id, '3.1.2-1', '협의진료에 대한 규정이 있다.', '협의진료에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-3.1.2'
UNION ALL
SELECT e.id, '3.1.2-2', '의료기관 내 타 진료과 협의진료 절차를 준수한다.', '의료기관 내 타 진료과 협의진료 절차를 준수한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-3.1.2'
UNION ALL
SELECT e.id, '3.1.2-3', '타 의료기관 협의진료 절차를 준수한다.', '타 의료기관 협의진료 절차를 준수한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-3.1.2'
UNION ALL
SELECT e.id, '3.1.3-1', '통증관리에 대한 규정이 있다.', '통증관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-3.1.3'
UNION ALL
SELECT e.id, '3.1.3-2', '외래환자 통증 초기평가를 수행한다.', '외래환자 통증 초기평가를 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-3.1.3'
UNION ALL
SELECT e.id, '3.1.3-3', '입원환자 통증 초기평가를 수행한다.', '입원환자 통증 초기평가를 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-3.1.3'
UNION ALL
SELECT e.id, '3.1.3-4', '통증평가 결과에 따라 통증을 관리한다.', '통증평가 결과에 따라 통증을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-3.1.3'
UNION ALL
SELECT e.id, '3.1.3-5', '입원환자 통증 재평가를 수행한다.', '입원환자 통증 재평가를 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-3.1.3'
UNION ALL
SELECT e.id, '3.1.4-1', '영양관리에 대한 규정이 있다.', '영양관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-3.1.4'
UNION ALL
SELECT e.id, '3.1.4-2', '환자의 치료목적에 맞게 식사를 제공한다.', '환자의 치료목적에 맞게 식사를 제공한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-3.1.4'
UNION ALL
SELECT e.id, '3.1.4-3', '환자에게 치료식에 대해 설명한다.', '환자에게 치료식에 대해 설명한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-3.1.4'
UNION ALL
SELECT e.id, '3.1.4-4', '환자에게 영양 상담을 제공한다.', '환자에게 영양 상담을 제공한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-3.1.4'
UNION ALL
SELECT e.id, '3.1.5-1', '욕창 예방관리에 대한 규정이 있다.', '욕창 예방관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-3.1.5'
UNION ALL
SELECT e.id, '3.1.5-2', '욕창 위험 평가도구를 이용하여 환자 입원 시 초기평가를 수행한다.', '욕창 위험 평가도구를 이용하여 환자 입원 시 초기평가를 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-3.1.5'
UNION ALL
SELECT e.id, '3.1.5-3', '욕창 위험 평가에 따라 고위험환자에 대한 욕창 예방활동을 수행한다.', '욕창 위험 평가에 따라 고위험환자에 대한 욕창 예방활동을 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-3.1.5'
UNION ALL
SELECT e.id, '3.1.5-4', '욕창 위험 평가도구를 이용하여 정기적인 재평가를 수행한다.', '욕창 위험 평가도구를 이용하여 정기적인 재평가를 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-3.1.5'
UNION ALL
SELECT e.id, '3.1.5-5', '욕창이 발생한 환자에게 욕창 관리활동을 수행한다.', '욕창이 발생한 환자에게 욕창 관리활동을 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-3.1.5'
UNION ALL
SELECT e.id, '3.1.6-1', '생애말기환자 진료에 대한 규정이 있다.', '생애말기환자 진료에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-3.1.6'
UNION ALL
SELECT e.id, '3.1.6-2', '직원은 생애말기환자 관리에 관한 교육을 받고, 그 내용을 이해한다.', '직원은 생애말기환자 관리에 관한 교육을 받고, 그 내용을 이해한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-3.1.6'
UNION ALL
SELECT e.id, '3.1.6-3', '생애말기환자의 희망을 고려하여 적절한 대증치료를 제공한다.', '생애말기환자의 희망을 고려하여 적절한 대증치료를 제공한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-3.1.6'
UNION ALL
SELECT e.id, '3.1.6-4', '생애말기환자에게 정신·사회적 지지를 제공한다.', '생애말기환자에게 정신·사회적 지지를 제공한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-3.1.6'
UNION ALL
SELECT e.id, '3.1.7-1', '결핵 예방·관리에 대한 규정이 있다.', '결핵 예방·관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-3.1.7'
UNION ALL
SELECT e.id, '3.1.7-2', '입원 시 결핵검진 결과를 확인한다.', '입원 시 결핵검진 결과를 확인한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-3.1.7'
UNION ALL
SELECT e.id, '3.1.7-3', '입원환자에 대해 결핵검진을 정기적으로 실시한다.', '입원환자에 대해 결핵검진을 정기적으로 실시한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-3.1.7'
UNION ALL
SELECT e.id, '3.1.7-4', '결핵환자 발생 시 적절하게 대응한다.', '결핵환자 발생 시 적절하게 대응한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-3.1.7'
UNION ALL
SELECT e.id, '3.1.8-1', '한방 서비스에 대한 규정이 있다.', '한방 서비스에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-3.1.8'
UNION ALL
SELECT e.id, '3.1.8-2', '한방 서비스를 안전하게 제공한다.', '한방 서비스를 안전하게 제공한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-3.1.8'
UNION ALL
SELECT e.id, '3.1.8-3', '탕전실을 안전하게 관리한다.', '탕전실을 안전하게 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-3.1.8'
UNION ALL
SELECT e.id, '3.1.8-4', '제환(산)시설을 안전하게 관리한다.', '제환(산)시설을 안전하게 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-3.1.8'
UNION ALL
SELECT e.id, '3.2.1-1', '심폐소생술에 대한 규정이 있다.', '심폐소생술에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-3.2.1'
UNION ALL
SELECT e.id, '3.2.1-2', '심폐소생술이 요구되는 환자 발생 시 적절하게 대처한다.', '심폐소생술이 요구되는 환자 발생 시 적절하게 대처한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-3.2.1'
UNION ALL
SELECT e.id, '3.2.1-3', '심폐소생술을 위한 필요물품 및 의약품을 관리한다.', '심폐소생술을 위한 필요물품 및 의약품을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-3.2.1'
UNION ALL
SELECT e.id, '3.2.1-4', '적시에 제세동기를 사용할 수 있다.', '적시에 제세동기를 사용할 수 있다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-3.2.1'
UNION ALL
SELECT e.id, '3.2.2-1', '수혈에 대한 규정이 있다.', '수혈에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-3.2.2'
UNION ALL
SELECT e.id, '3.2.2-2', '수혈 전 검사 및 혈액 검체를 관리한다.', '수혈 전 검사 및 혈액 검체를 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-3.2.2'
UNION ALL
SELECT e.id, '3.2.2-3', '혈액제제를 보관하고, 적절한 시간 내에 환자에게 수혈한다.', '혈액제제를 보관하고, 적절한 시간 내에 환자에게 수혈한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-3.2.2'
UNION ALL
SELECT e.id, '3.2.2-4', '수혈 직전 혈액제제 및 환자를 정확하게 확인한다.', '수혈 직전 혈액제제 및 환자를 정확하게 확인한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-3.2.2'
UNION ALL
SELECT e.id, '3.2.2-5', '수혈 시 모니터링 및 부작용 발생 시 대처방안을 알고 수행한다.', '수혈 시 모니터링 및 부작용 발생 시 대처방안을 알고 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-3.2.2'
UNION ALL
SELECT e.id, '3.2.2-6', '혈액제제의 입고/불출, 반납, 재고, 폐기를 관리한다.', '혈액제제의 입고/불출, 반납, 재고, 폐기를 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-3.2.2'
UNION ALL
SELECT e.id, '3.2.3-1', '신체보호대 사용에 대한 규정이 있다.', '신체보호대 사용에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-3.2.3'
UNION ALL
SELECT e.id, '3.2.3-2', '신체보호대 사용 전 절차를 준수한다.', '신체보호대 사용 전 절차를 준수한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-3.2.3'
UNION ALL
SELECT e.id, '3.2.3-3', '신체보호대 사용 중인 환자를 정기적으로 평가하고 기록한다.', '신체보호대 사용 중인 환자를 정기적으로 평가하고 기록한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-3.2.3'
UNION ALL
SELECT e.id, '3.2.3-4', '정기적 평가결과에 따라 신체보호대 사용을 중단한다.', '정기적 평가결과에 따라 신체보호대 사용을 중단한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-3.2.3'
UNION ALL
SELECT e.id, '3.2.3-5', '신체보호대 사용 환자에게 부작용 예방활동을 수행하고 기록한다.', '신체보호대 사용 환자에게 부작용 예방활동을 수행하고 기록한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-3.2.3'
UNION ALL
SELECT e.id, '3.2.3-6', '직원은 신체보호대 사용에 관한 교육을 받고, 그 내용을 이해한다.', '직원은 신체보호대 사용에 관한 교육을 받고, 그 내용을 이해한다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-3.2.3'
UNION ALL
SELECT e.id, '3.2.3-7', '신체보호대 사용을 줄이기 위한 활동을 수행한다.', '신체보호대 사용을 줄이기 위한 활동을 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 7
FROM accreditation_entries e WHERE e.code = 'STD-3.2.3'
UNION ALL
SELECT e.id, '4.1-1', '의약품 선정 및 확보에 대한 규정이 있다.', '의약품 선정 및 확보에 대한 규정이 있다.', 'structure', false, true, 'minor', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-4.1'
UNION ALL
SELECT e.id, '4.1-2', '의약품을 선정한다.', '의약품을 선정한다.', 'process', false, true, 'minor', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-4.1'
UNION ALL
SELECT e.id, '4.1-3', '의약품에 관한 정보를 제공한다.', '의약품에 관한 정보를 제공한다.', 'process', false, true, 'minor', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-4.1'
UNION ALL
SELECT e.id, '4.1-4', '의약품을 적절하게 확보한다.', '의약품을 적절하게 확보한다.', 'process', false, true, 'minor', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-4.1'
UNION ALL
SELECT e.id, '4.2-1', '의약품 보관에 대한 규정이 있다.', '의약품 보관에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-4.2'
UNION ALL
SELECT e.id, '4.2-2', '의약품을 안전하게 보관한다.', '의약품을 안전하게 보관한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-4.2'
UNION ALL
SELECT e.id, '4.2-3', '의약품의 보관 상태를 정기적으로 감사한다.', '의약품의 보관 상태를 정기적으로 감사한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-4.2'
UNION ALL
SELECT e.id, '4.2-4', '응급의약품을 안전하게 보관한다.', '응급의약품을 안전하게 보관한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-4.2'
UNION ALL
SELECT e.id, '4.2-5', '마약류를 안전하게 보관한다.', '마약류를 안전하게 보관한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-4.2'
UNION ALL
SELECT e.id, '4.2-6', '고위험의약품을 안전하게 보관한다.', '고위험의약품을 안전하게 보관한다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-4.2'
UNION ALL
SELECT e.id, '4.2-7', '주의를 요하는 의약품을 안전하게 보관한다.', '주의를 요하는 의약품을 안전하게 보관한다.', 'process', true, false, 'major', ARRAY['nursing'], 7
FROM accreditation_entries e WHERE e.code = 'STD-4.2'
UNION ALL
SELECT e.id, '4.2-8', '의약품을 안전하게 회수한다.', '의약품을 안전하게 회수한다.', 'process', true, false, 'major', ARRAY['nursing'], 8
FROM accreditation_entries e WHERE e.code = 'STD-4.2'
UNION ALL
SELECT e.id, '4.3-1', '의약품 처방 및 조제에 대한 규정이 있다.', '의약품 처방 및 조제에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-4.3'
UNION ALL
SELECT e.id, '4.3-2', '적격한 자가 의약품을 안전하게 처방한다.', '적격한 자가 의약품을 안전하게 처방한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-4.3'
UNION ALL
SELECT e.id, '4.3-3', '적격한 자가 의약품 조제 전에 처방을 감사한다.', '적격한 자가 의약품 조제 전에 처방을 감사한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-4.3'
UNION ALL
SELECT e.id, '4.3-4', '적격한 자가 의약품을 안전하고 청결하게 조제한다.', '적격한 자가 의약품을 안전하고 청결하게 조제한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-4.3'
UNION ALL
SELECT e.id, '4.3-5', '의약품 조제 환경을 안전하고 청결하게 관리한다.', '의약품 조제 환경을 안전하고 청결하게 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-4.3'
UNION ALL
SELECT e.id, '4.3-6', '주사용 의약품 취급의 감염 및 안전관리를 준수한다.', '주사용 의약품 취급의 감염 및 안전관리를 준수한다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-4.3'
UNION ALL
SELECT e.id, '4.3-7', '적격한 자가 의약품 조제 후 감사한다.', '적격한 자가 의약품 조제 후 감사한다.', 'process', true, false, 'major', ARRAY['nursing'], 7
FROM accreditation_entries e WHERE e.code = 'STD-4.3'
UNION ALL
SELECT e.id, '4.3-8', '의약품 조제 시 라벨링한다.', '의약품 조제 시 라벨링한다.', 'process', true, false, 'major', ARRAY['nursing'], 8
FROM accreditation_entries e WHERE e.code = 'STD-4.3'
UNION ALL
SELECT e.id, '4.3-9', '의약품을 안전하게 운반한다.', '의약품을 안전하게 운반한다.', 'process', true, false, 'major', ARRAY['nursing'], 9
FROM accreditation_entries e WHERE e.code = 'STD-4.3'
UNION ALL
SELECT e.id, '4.4-1', '의약품 투여에 대한 규정이 있다.', '의약품 투여에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-4.4'
UNION ALL
SELECT e.id, '4.4-2', '적격한 자가 의약품을 안전하게 투여한다.', '적격한 자가 의약품을 안전하게 투여한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-4.4'
UNION ALL
SELECT e.id, '4.4-3', '고위험의약품 투여 시 주의사항 및 부작용 발생 시 대처 방안을 알고 수행한다.', '고위험의약품 투여 시 주의사항 및 부작용 발생 시 대처 방안을 알고 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-4.4'
UNION ALL
SELECT e.id, '4.4-4', '적격한 자가 투약 설명을 수행한다.', '적격한 자가 투약 설명을 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-4.4'
UNION ALL
SELECT e.id, '4.4-5', '의약품 사용 후 안전하게 폐기한다.', '의약품 사용 후 안전하게 폐기한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-4.4'
UNION ALL
SELECT e.id, '4.4-6', '지참약을 관리한다.', '지참약을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-4.4'
UNION ALL
SELECT e.id, '4.4-7', '의약품 부작용 발생 시 보고한다.', '의약품 부작용 발생 시 보고한다.', 'process', false, true, 'minor', ARRAY['nursing'], 7
FROM accreditation_entries e WHERE e.code = 'STD-4.4'
UNION ALL
SELECT e.id, '5.1-1', '환자의 권리와 의무에 대한 규정이 있다.', '환자의 권리와 의무에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-5.1'
UNION ALL
SELECT e.id, '5.1-2', '직원은 환자의 권리와 의무를 알고 있다.', '직원은 환자의 권리와 의무를 알고 있다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-5.1'
UNION ALL
SELECT e.id, '5.1-3', '환자에게 환자의 권리와 의무에 대한 정보를 제공한다.', '환자에게 환자의 권리와 의무에 대한 정보를 제공한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-5.1'
UNION ALL
SELECT e.id, '5.1-4', '진료과정에 환자가 참여한다.', '진료과정에 환자가 참여한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-5.1'
UNION ALL
SELECT e.id, '5.1-5', '환자의 사생활보호 요구를 확인한다.', '환자의 사생활보호 요구를 확인한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-5.1'
UNION ALL
SELECT e.id, '5.1-6', '환자의 신체노출을 보호한다.', '환자의 신체노출을 보호한다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-5.1'
UNION ALL
SELECT e.id, '5.1-7', '환자의 개인정보를 보호한다.', '환자의 개인정보를 보호한다.', 'process', true, false, 'major', ARRAY['nursing'], 7
FROM accreditation_entries e WHERE e.code = 'STD-5.1'
UNION ALL
SELECT e.id, '5.2-1', '취약환자의 권리보호에 대한 규정이 있다.', '취약환자의 권리보호에 대한 규정이 있다.', 'structure', true, false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-5.2'
UNION ALL
SELECT e.id, '5.2-2', '직원은 의사소통이 어려운 환자를 위한 지원체계를 알고 있다.', '직원은 의사소통이 어려운 환자를 위한 지원체계를 알고 있다.', 'process', true, false, 'critical', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-5.2'
UNION ALL
SELECT e.id, '5.2-3', '직원은 학대 및 폭력피해자 발생 시 절차를 준수한다.', '직원은 학대 및 폭력피해자 발생 시 절차를 준수한다.', 'process', true, false, 'critical', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-5.2'
UNION ALL
SELECT e.id, '5.2-4', '학대 및 폭력피해자 발생 시 경영진에게 보고하고 개선활동을 수행한다.', '학대 및 폭력피해자 발생 시 경영진에게 보고하고 개선활동을 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-5.2'
UNION ALL
SELECT e.id, '5.2-5', '학대 및 폭력 예방활동을 수행한다.', '학대 및 폭력 예방활동을 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-5.2'
UNION ALL
SELECT e.id, '5.2-6', '직원은 학대 및 폭력 대응체계, 예방활동에 관한 교육을 받고, 그 내용을 이해한다.', '직원은 학대 및 폭력 대응체계, 예방활동에 관한 교육을 받고, 그 내용을 이해한다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-5.2'
UNION ALL
SELECT e.id, '5.2-7', '학대 및 폭력 신고절차에 대해 안내한다.', '학대 및 폭력 신고절차에 대해 안내한다.', 'process', true, false, 'major', ARRAY['nursing'], 7
FROM accreditation_entries e WHERE e.code = 'STD-5.2'
UNION ALL
SELECT e.id, '5.2-8', '거동이 불편한 환자의 편의를 위한 시설을 구비하고, 직원은 이를 알고 있다.', '거동이 불편한 환자의 편의를 위한 시설을 구비하고, 직원은 이를 알고 있다.', 'process', true, false, 'major', ARRAY['nursing'], 8
FROM accreditation_entries e WHERE e.code = 'STD-5.2'
UNION ALL
SELECT e.id, '5.3-1', '환자의 불만 및 고충 관리에 대한 규정이 있다.', '환자의 불만 및 고충 관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-5.3'
UNION ALL
SELECT e.id, '5.3-2', '환자에게 불만 및 고충 처리 절차에 대한 정보를 제공한다.', '환자에게 불만 및 고충 처리 절차에 대한 정보를 제공한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-5.3'
UNION ALL
SELECT e.id, '5.3-3', '불만 및 고충사항을 처리한다.', '불만 및 고충사항을 처리한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-5.3'
UNION ALL
SELECT e.id, '5.3-4', '환자의 불만 및 고충사항을 정기적으로 분석하여 개선활동을 수행한다.', '환자의 불만 및 고충사항을 정기적으로 분석하여 개선활동을 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-5.3'
UNION ALL
SELECT e.id, '5.3-5', '환자의 불만 및 고충사항의 분석 결과와 개선 결과를 경영진에게 보고하고 관련 직원과 공유한다.', '환자의 불만 및 고충사항의 분석 결과와 개선 결과를 경영진에게 보고하고 관련 직원과 공유한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-5.3'
UNION ALL
SELECT e.id, '5.4-1', '의료사회복지체계가 있다.', '의료사회복지체계가 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-5.4'
UNION ALL
SELECT e.id, '5.4-2', '직원은 의료사회복지 서비스 의뢰 가능 대상 및 의뢰절차를 알고 있다.', '직원은 의료사회복지 서비스 의뢰 가능 대상 및 의뢰절차를 알고 있다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-5.4'
UNION ALL
SELECT e.id, '5.4-3', '의료사회복지 서비스를 제공한다.', '의료사회복지 서비스를 제공한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-5.4'
UNION ALL
SELECT e.id, '5.5-1', '진료동의서에 대한 규정이 있다.', '진료동의서에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-5.5'
UNION ALL
SELECT e.id, '5.5-2', '시술 동의서를 받는다.', '시술 동의서를 받는다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-5.5'
UNION ALL
SELECT e.id, '5.5-3', '혈액제제 사용동의서를 받는다.', '혈액제제 사용동의서를 받는다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-5.5'
UNION ALL
SELECT e.id, '5.5-4', '고위험의약품 사용동의서를 받는다.', '고위험의약품 사용동의서를 받는다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-5.5'
UNION ALL
SELECT e.id, '5.6-1', '입원실 적정면적 및 병상 수를 준수한다.', '입원실 적정면적 및 병상 수를 준수한다.', 'structure', true, false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-5.6'
UNION ALL
SELECT e.id, '5.6-2', '환자 편의 및 안전을 위한 시설을 구비한다.', '환자 편의 및 안전을 위한 시설을 구비한다.', 'structure', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-5.6'
UNION ALL
SELECT e.id, '5.6-3', '병원용 엘리베이터를 설치한다.', '병원용 엘리베이터를 설치한다.', 'structure', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-5.6'
UNION ALL
SELECT e.id, '5.6-4', '휠체어 및 병상 이동 공간을 확보한다.', '휠체어 및 병상 이동 공간을 확보한다.', 'structure', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-5.6'
UNION ALL
SELECT e.id, '6.1-1', '질 향상과 환자안전에 대한 규정이 있다.', '질 향상과 환자안전에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-6.1'
UNION ALL
SELECT e.id, '6.1-2', '질 향상과 환자안전을 위한 위원회를 운영한다.', '질 향상과 환자안전을 위한 위원회를 운영한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-6.1'
UNION ALL
SELECT e.id, '6.1-3', '질 향상과 환자안전 활동을 수행하는 부서 및 적격한 자가 있다.', '질 향상과 환자안전 활동을 수행하는 부서 및 적격한 자가 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-6.1'
UNION ALL
SELECT e.id, '6.1-4', '질 향상과 환자안전 활동 계획이 있다.', '질 향상과 환자안전 활동 계획이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-6.1'
UNION ALL
SELECT e.id, '6.1-5', '질 향상과 환자안전 활동을 위해 필요한 자원을 지원한다.', '질 향상과 환자안전 활동을 위해 필요한 자원을 지원한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-6.1'
UNION ALL
SELECT e.id, '6.2-1', '환자안전사건 관리 절차가 있다.', '환자안전사건 관리 절차가 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-6.2'
UNION ALL
SELECT e.id, '6.2-2', '직원은 환자안전사건의 정의를 알고 발생 시 보고한다.', '직원은 환자안전사건의 정의를 알고 발생 시 보고한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-6.2'
UNION ALL
SELECT e.id, '6.2-3', '보고된 환자안전사건을 분류하고 분석한다.', '보고된 환자안전사건을 분류하고 분석한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-6.2'
UNION ALL
SELECT e.id, '6.2-4', '환자안전사건 분석결과에 따라 개선활동을 수행한다.', '환자안전사건 분석결과에 따라 개선활동을 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-6.2'
UNION ALL
SELECT e.id, '6.2-5', '환자안전사건에 대한 결과를 경영진에게 보고하고 관련 직원과 공유한다.', '환자안전사건에 대한 결과를 경영진에게 보고하고 관련 직원과 공유한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-6.2'
UNION ALL
SELECT e.id, '6.2-6', '적신호사건 발생 시 환자와 보호자에게 관련 정보를 제공한다.', '적신호사건 발생 시 환자와 보호자에게 관련 정보를 제공한다.', 'process', false, true, 'minor', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-6.2'
UNION ALL
SELECT e.id, '6.2-7', '환자안전 주의경보 발령 시 관련 직원과 공유한다.', '환자안전 주의경보 발령 시 관련 직원과 공유한다.', 'process', true, false, 'major', ARRAY['nursing'], 7
FROM accreditation_entries e WHERE e.code = 'STD-6.2'
UNION ALL
SELECT e.id, '6.3-1', '우선순위에 따른 질 향상 및 환자안전 활동 주제를 선정한다.', '우선순위에 따른 질 향상 및 환자안전 활동 주제를 선정한다.', 'process', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-6.3'
UNION ALL
SELECT e.id, '6.3-2', '의료기관에서 선정한 질 향상 및 환자안전 활동방법을 사용한다.', '의료기관에서 선정한 질 향상 및 환자안전 활동방법을 사용한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-6.3'
UNION ALL
SELECT e.id, '6.3-3', '선정된 주제에 따른 통계적 기법과 도구를 사용하여 자료를 분석한다.', '선정된 주제에 따른 통계적 기법과 도구를 사용하여 자료를 분석한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-6.3'
UNION ALL
SELECT e.id, '6.3-4', '질 향상 및 환자안전 활동을 통해 얻은 성과를 지속적으로 관리한다.', '질 향상 및 환자안전 활동을 통해 얻은 성과를 지속적으로 관리한다.', 'outcome', false, true, 'minor', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-6.3'
UNION ALL
SELECT e.id, '6.3-5', '질 향상 및 환자안전 활동성과를 경영진에게 보고하고 관련 직원과 공유한다.', '질 향상 및 환자안전 활동성과를 경영진에게 보고하고 관련 직원과 공유한다.', 'process', false, true, 'minor', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-6.3'
UNION ALL
SELECT e.id, '7.1-1', '감염예방 및 관리에 대한 규정이 있다.', '감염예방 및 관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-7.1'
UNION ALL
SELECT e.id, '7.1-2', '감염예방 및 관리를 위한 위원회를 운영한다.', '감염예방 및 관리를 위한 위원회를 운영한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-7.1'
UNION ALL
SELECT e.id, '7.1-3', '감염예방 및 관리활동을 수행하는 부서 및 적격한 자가 있다.', '감염예방 및 관리활동을 수행하는 부서 및 적격한 자가 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-7.1'
UNION ALL
SELECT e.id, '7.2-1', '의료기구 관련 감염관리에 대한 규정이 있다.', '의료기구 관련 감염관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-7.2'
UNION ALL
SELECT e.id, '7.2-2', '호흡기 치료기구 관련 감염관리를 수행한다.', '호흡기 치료기구 관련 감염관리를 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-7.2'
UNION ALL
SELECT e.id, '7.2-3', '유치도뇨관 관련 감염관리를 수행한다.', '유치도뇨관 관련 감염관리를 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-7.2'
UNION ALL
SELECT e.id, '7.2-4', '혈관 내 카테터 관련 감염관리를 수행한다.', '혈관 내 카테터 관련 감염관리를 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-7.2'
UNION ALL
SELECT e.id, '7.3-1', '의료기구의 세척, 소독, 멸균과정에 대한 규정이 있다.', '의료기구의 세척, 소독, 멸균과정에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-7.3'
UNION ALL
SELECT e.id, '7.3-2', '세척, 소독, 멸균 수행에 적절한 소독시설을 갖추고 관리한다.', '세척, 소독, 멸균 수행에 적절한 소독시설을 갖추고 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-7.3'
UNION ALL
SELECT e.id, '7.3-3', '사용한 의료기구의 세척, 소독, 멸균을 수행한다.', '사용한 의료기구의 세척, 소독, 멸균을 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-7.3'
UNION ALL
SELECT e.id, '7.3-4', '멸균기를 정기적으로 관리한다.', '멸균기를 정기적으로 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-7.3'
UNION ALL
SELECT e.id, '7.3-5', '멸균물품을 관리한다.', '멸균물품을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-7.3'
UNION ALL
SELECT e.id, '7.3-6', '세탁물 관리에 대한 규정이 있다.', '세탁물 관리에 대한 규정이 있다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-7.3'
UNION ALL
SELECT e.id, '7.3-7', '세탁물을 적절하게 관리한다.', '세탁물을 적절하게 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 7
FROM accreditation_entries e WHERE e.code = 'STD-7.3'
UNION ALL
SELECT e.id, '7.4-1', '환자치료영역의 환경관리에 대한 규정이 있다.', '환자치료영역의 환경관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-7.4'
UNION ALL
SELECT e.id, '7.4-2', '환자치료영역의 청소 및 소독을 수행한다.', '환자치료영역의 청소 및 소독을 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-7.4'
UNION ALL
SELECT e.id, '7.4-3', '의료기관 내 음용수를 적절하게 관리한다.', '의료기관 내 음용수를 적절하게 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-7.4'
UNION ALL
SELECT e.id, '7.5-1', '내시경실의 감염관리에 대한 규정이 있다.', '내시경실의 감염관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-7.5'
UNION ALL
SELECT e.id, '7.5-2', '내시경과 내시경 부속기구의 세척, 소독, 멸균을 수행한다.', '내시경과 내시경 부속기구의 세척, 소독, 멸균을 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-7.5'
UNION ALL
SELECT e.id, '7.5-3', '내시경 및 내시경 부속기구를 적절하게 보관한다.', '내시경 및 내시경 부속기구를 적절하게 보관한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-7.5'
UNION ALL
SELECT e.id, '7.5-4', '인공신장실의 감염관리에 대한 규정이 있다.', '인공신장실의 감염관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-7.5'
UNION ALL
SELECT e.id, '7.5-5', '투석기 및 환경을 관리한다.', '투석기 및 환경을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-7.5'
UNION ALL
SELECT e.id, '7.5-6', '투석용수 및 투석액을 관리한다.', '투석용수 및 투석액을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-7.5'
UNION ALL
SELECT e.id, '7.6-1', '입원환자 급식서비스 관리에 대한 규정이 있다.', '입원환자 급식서비스 관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-7.6'
UNION ALL
SELECT e.id, '7.6-2', '식재료를 관리한다.', '식재료를 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-7.6'
UNION ALL
SELECT e.id, '7.6-3', '조리기구 및 장비를 관리한다.', '조리기구 및 장비를 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-7.6'
UNION ALL
SELECT e.id, '7.6-4', '조리장 환경을 관리한다.', '조리장 환경을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-7.6'
UNION ALL
SELECT e.id, '7.6-5', '직원의 개인위생을 관리한다.', '직원의 개인위생을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-7.6'
UNION ALL
SELECT e.id, '7.7-1', '감염성질환 관리에 대한 규정이 있다.', '감염성질환 관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-7.7'
UNION ALL
SELECT e.id, '7.7-2', '유행성 감염병 위기 상황 시 관리 절차를 준수한다.', '유행성 감염병 위기 상황 시 관리 절차를 준수한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-7.7'
UNION ALL
SELECT e.id, '7.7-3', '감염병 전파경로에 따른 절차를 준수하여 환자를 관리한다.', '감염병 전파경로에 따른 절차를 준수하여 환자를 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-7.7'
UNION ALL
SELECT e.id, '8.1-1', '의료기관 운영에 대한 규정이 있다.', '의료기관 운영에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-8.1'
UNION ALL
SELECT e.id, '8.1-2', '의사결정조직(회의체)을 운영한다.', '의사결정조직(회의체)을 운영한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-8.1'
UNION ALL
SELECT e.id, '8.1-3', '규정(정책과 절차)을 관리한다.', '규정(정책과 절차)을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-8.1'
UNION ALL
SELECT e.id, '8.1-4', '경영진은 위탁서비스를 관리한다.', '경영진은 위탁서비스를 관리한다.', 'process', false, true, 'minor', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-8.1'
UNION ALL
SELECT e.id, '8.2-1', '미션이 있다.', '미션이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-8.2'
UNION ALL
SELECT e.id, '8.2-2', '미션을 공지한다.', '미션을 공지한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-8.2'
UNION ALL
SELECT e.id, '8.2-3', '미션을 이행하기 위한 활동을 수행한다.', '미션을 이행하기 위한 활동을 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-8.2'
UNION ALL
SELECT e.id, '8.2-4', '직원은 미션을 알고 있다.', '직원은 미션을 알고 있다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-8.2'
UNION ALL
SELECT e.id, '8.3-1', '윤리적 갈등 해결 및 폭력 예방에 대한 지원체계가 있다.', '윤리적 갈등 해결 및 폭력 예방에 대한 지원체계가 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-8.3'
UNION ALL
SELECT e.id, '8.3-2', '진료와 관련된 윤리적 갈등 해결을 지원한다.', '진료와 관련된 윤리적 갈등 해결을 지원한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-8.3'
UNION ALL
SELECT e.id, '8.3-3', '의료기관 내 폭력과 관련된 갈등 해결을 지원한다.', '의료기관 내 폭력과 관련된 갈등 해결을 지원한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-8.3'
UNION ALL
SELECT e.id, '9.1-1', '인사정보 관리체계가 있다.', '인사정보 관리체계가 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-9.1'
UNION ALL
SELECT e.id, '9.1-2', '의사인력의 인사정보를 관리한다.', '의사인력의 인사정보를 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-9.1'
UNION ALL
SELECT e.id, '9.1-3', '간호인력의 인사정보를 관리한다.', '간호인력의 인사정보를 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-9.1'
UNION ALL
SELECT e.id, '9.1-4', '기타 인력의 인사정보를 관리한다.', '기타 인력의 인사정보를 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-9.1'
UNION ALL
SELECT e.id, '9.2-1', '직원 교육체계가 있다.', '직원 교육체계가 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-9.2'
UNION ALL
SELECT e.id, '9.2-2', '교육계획이 있다.', '교육계획이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-9.2'
UNION ALL
SELECT e.id, '9.2-3', '신규 직원 필수교육을 시행한다.', '신규 직원 필수교육을 시행한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-9.2'
UNION ALL
SELECT e.id, '9.2-4', '재직 직원 필수교육을 시행한다.', '재직 직원 필수교육을 시행한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-9.2'
UNION ALL
SELECT e.id, '9.2-5', '특성화교육을 시행한다.', '특성화교육을 시행한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-9.2'
UNION ALL
SELECT e.id, '9.3-1', '의사인력 법적기준을 준수한다.', '의사인력 법적기준을 준수한다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-9.3'
UNION ALL
SELECT e.id, '9.3-2', '간호인력 법적기준을 준수한다.', '간호인력 법적기준을 준수한다.', 'structure', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-9.3'
UNION ALL
SELECT e.id, '9.3-3', '기타 보건의료인력 법적기준을 준수한다.', '기타 보건의료인력 법적기준을 준수한다.', 'structure', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-9.3'
UNION ALL
SELECT e.id, '9.3-4', '당직 의료인력 법적기준을 준수한다.', '당직 의료인력 법적기준을 준수한다.', 'structure', true, false, 'critical', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-9.3'
UNION ALL
SELECT e.id, '9.3-5', '시설 안전관리를 담당하는 당직근무자 법적기준을 준수한다.', '시설 안전관리를 담당하는 당직근무자 법적기준을 준수한다.', 'structure', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-9.3'
UNION ALL
SELECT e.id, '9.4-1', '직원 건강유지 및 안전 관리활동에 대한 규정이 있다.', '직원 건강유지 및 안전 관리활동에 대한 규정이 있다.', 'structure', true, false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-9.4'
UNION ALL
SELECT e.id, '9.4-2', '직원 건강유지 및 안전 관리활동 계획이 있다.', '직원 건강유지 및 안전 관리활동 계획이 있다.', 'structure', true, false, 'critical', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-9.4'
UNION ALL
SELECT e.id, '9.4-3', '직원 건강유지 및 안전 관리활동을 수행한다.', '직원 건강유지 및 안전 관리활동을 수행한다.', 'process', true, false, 'critical', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-9.4'
UNION ALL
SELECT e.id, '9.4-4', '직원 안전사고 관리에 대한 규정이 있다.', '직원 안전사고 관리에 대한 규정이 있다.', 'structure', true, false, 'critical', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-9.4'
UNION ALL
SELECT e.id, '9.4-5', '직원 안전사고 발생 시 보고하고 치료 및 관리한다.', '직원 안전사고 발생 시 보고하고 치료 및 관리한다.', 'process', true, false, 'critical', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-9.4'
UNION ALL
SELECT e.id, '9.4-6', '직원 안전사고 처리결과를 경영진에게 보고한다.', '직원 안전사고 처리결과를 경영진에게 보고한다.', 'process', true, false, 'critical', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-9.4'
UNION ALL
SELECT e.id, '10.1-1', '시설 및 환경안전 관리에 대한 규정이 있다.', '시설 및 환경안전 관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-10.1'
UNION ALL
SELECT e.id, '10.1-2', '시설 및 환경안전 관리 업무 구분 및 담당자가 있다.', '시설 및 환경안전 관리 업무 구분 및 담당자가 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-10.1'
UNION ALL
SELECT e.id, '10.1-3', '시설 및 환경안전 관리에 대한 교육을 시행한다.', '시설 및 환경안전 관리에 대한 교육을 시행한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-10.1'
UNION ALL
SELECT e.id, '10.1-4', '직원은 시설 및 환경안전 사고 발생 시 보고절차를 알고 있다.', '직원은 시설 및 환경안전 사고 발생 시 보고절차를 알고 있다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-10.1'
UNION ALL
SELECT e.id, '10.1-5', '시설 및 환경안전 사고 발생 시 처리하고, 처리결과를 경영진에게 보고한다.', '시설 및 환경안전 사고 발생 시 처리하고, 처리결과를 경영진에게 보고한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-10.1'
UNION ALL
SELECT e.id, '10.1-6', '시설 및 환경안전에 대한 계획이 있다.', '시설 및 환경안전에 대한 계획이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-10.1'
UNION ALL
SELECT e.id, '10.1-7', '시설 및 환경을 안전하게 관리한다.', '시설 및 환경을 안전하게 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 7
FROM accreditation_entries e WHERE e.code = 'STD-10.1'
UNION ALL
SELECT e.id, '10.2-1', '설비시스템 관리에 대한 규정이 있다.', '설비시스템 관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-10.2'
UNION ALL
SELECT e.id, '10.2-2', '전기설비를 안전하게 관리한다.', '전기설비를 안전하게 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-10.2'
UNION ALL
SELECT e.id, '10.2-3', '급수설비 및 수질을 안전하게 관리한다.', '급수설비 및 수질을 안전하게 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-10.2'
UNION ALL
SELECT e.id, '10.2-4', '의료가스 및 진공설비를 안전하게 관리한다.', '의료가스 및 진공설비를 안전하게 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-10.2'
UNION ALL
SELECT e.id, '10.2-5', '실내공기질을 안전하게 관리한다.', '실내공기질을 안전하게 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-10.2'
UNION ALL
SELECT e.id, '10.3-1', '유해화학물질 관리에 대한 규정이 있다.', '유해화학물질 관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-10.3'
UNION ALL
SELECT e.id, '10.3-2', '유해화학물질을 안전하게 관리한다.', '유해화학물질을 안전하게 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-10.3'
UNION ALL
SELECT e.id, '10.3-3', '의료폐기물 관리에 대한 규정이 있다.', '의료폐기물 관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-10.3'
UNION ALL
SELECT e.id, '10.3-4', '의료폐기물을 안전하게 관리한다.', '의료폐기물을 안전하게 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-10.3'
UNION ALL
SELECT e.id, '10.4-1', '환자안전 보안체계가 있다.', '환자안전 보안체계가 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-10.4'
UNION ALL
SELECT e.id, '10.4-2', '보안사고 발생을 예방한다.', '보안사고 발생을 예방한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-10.4'
UNION ALL
SELECT e.id, '10.4-3', '보안사고 발생 시 보고한다.', '보안사고 발생 시 보고한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-10.4'
UNION ALL
SELECT e.id, '10.4-4', '병문안객을 관리한다.', '병문안객을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-10.4'
UNION ALL
SELECT e.id, '10.5-1', '의료기기 관리에 대한 규정이 있다.', '의료기기 관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-10.5'
UNION ALL
SELECT e.id, '10.5-2', '의료기기 목록을 관리한다.', '의료기기 목록을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-10.5'
UNION ALL
SELECT e.id, '10.5-3', '의료기기 예방점검을 수행한다.', '의료기기 예방점검을 수행한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-10.5'
UNION ALL
SELECT e.id, '10.5-4', '의료기기를 안전하게 회수한다.', '의료기기를 안전하게 회수한다.', 'process', false, true, 'minor', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-10.5'
UNION ALL
SELECT e.id, '10.5-5', '의료기기 오작동 및 안전사고 발생 시 대처방안을 알고 수행한다.', '의료기기 오작동 및 안전사고 발생 시 대처방안을 알고 수행한다.', 'process', false, true, 'minor', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-10.5'
UNION ALL
SELECT e.id, '10.6-1', '화재안전 관리에 대한 규정이 있다.', '화재안전 관리에 대한 규정이 있다.', 'structure', true, false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-10.6'
UNION ALL
SELECT e.id, '10.6-2', '화재안전 관리 계획이 있다.', '화재안전 관리 계획이 있다.', 'structure', true, false, 'critical', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-10.6'
UNION ALL
SELECT e.id, '10.6-3', '화재예방점검을 수행하고 안전하게 관리한다.', '화재예방점검을 수행하고 안전하게 관리한다.', 'process', true, false, 'critical', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-10.6'
UNION ALL
SELECT e.id, '10.6-4', '소방훈련을 실시한다.', '소방훈련을 실시한다.', 'process', true, false, 'critical', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-10.6'
UNION ALL
SELECT e.id, '10.6-5', '소방안전 교육을 시행한다.', '소방안전 교육을 시행한다.', 'process', true, false, 'critical', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-10.6'
UNION ALL
SELECT e.id, '10.6-6', '직원은 화재 발생 시 대응체계를 알고 있다.', '직원은 화재 발생 시 대응체계를 알고 있다.', 'process', true, false, 'critical', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-10.6'
UNION ALL
SELECT e.id, '10.6-7', '금연관리에 대한 규정이 있다.', '금연관리에 대한 규정이 있다.', 'structure', true, false, 'critical', ARRAY['nursing'], 7
FROM accreditation_entries e WHERE e.code = 'STD-10.6'
UNION ALL
SELECT e.id, '10.6-8', '금연관리를 수행한다.', '금연관리를 수행한다.', 'process', true, false, 'critical', ARRAY['nursing'], 8
FROM accreditation_entries e WHERE e.code = 'STD-10.6'
UNION ALL
SELECT e.id, '11.1-1', '의료정보/의무기록 관리에 대한 규정이 있다.', '의료정보/의무기록 관리에 대한 규정이 있다.', 'structure', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-11.1'
UNION ALL
SELECT e.id, '11.1-2', '의료정보/의무기록의 접근 권한을 관리한다.', '의료정보/의무기록의 접근 권한을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-11.1'
UNION ALL
SELECT e.id, '11.1-3', '의무기록 사본 발급을 관리한다.', '의무기록 사본 발급을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-11.1'
UNION ALL
SELECT e.id, '11.1-4', '의무기록 대출, 열람 및 반납을 관리한다.', '의무기록 대출, 열람 및 반납을 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-11.1'
UNION ALL
SELECT e.id, '11.1-5', '금기약어 및 금기기호를 관리한다.', '금기약어 및 금기기호를 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-11.1'
UNION ALL
SELECT e.id, '11.1-6', '의무기록을 보관하고 관리한다.', '의무기록을 보관하고 관리한다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-11.1'
UNION ALL
SELECT e.id, '11.2-1', '의학적 초기평가 기록을 작성한다.', '의학적 초기평가 기록을 작성한다.', 'process', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-11.2'
UNION ALL
SELECT e.id, '11.2-2', '간호 초기평가 기록을 작성한다.', '간호 초기평가 기록을 작성한다.', 'process', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-11.2'
UNION ALL
SELECT e.id, '11.2-3', '경과기록을 작성한다.', '경과기록을 작성한다.', 'process', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-11.2'
UNION ALL
SELECT e.id, '11.2-4', '간호기록을 작성한다.', '간호기록을 작성한다.', 'process', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-11.2'
UNION ALL
SELECT e.id, '11.2-5', '퇴원요약을 작성한다.', '퇴원요약을 작성한다.', 'process', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-11.2'
UNION ALL
SELECT e.id, '11.2-6', '표준화된 진단코드를 사용한다.', '표준화된 진단코드를 사용한다.', 'process', true, false, 'major', ARRAY['nursing'], 6
FROM accreditation_entries e WHERE e.code = 'STD-11.2'
UNION ALL
SELECT e.id, '11.3-1', '개인정보 보호 및 보안에 대한 규정이 있다.', '개인정보 보호 및 보안에 대한 규정이 있다.', 'structure', false, true, 'minor', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-11.3'
UNION ALL
SELECT e.id, '11.3-2', '개인정보 보호 및 정보시스템 보안을 관리하는 적격한 자가 있다.', '개인정보 보호 및 정보시스템 보안을 관리하는 적격한 자가 있다.', 'structure', false, true, 'minor', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-11.3'
UNION ALL
SELECT e.id, '11.3-3', '접근통제구역의 출입을 관리한다.', '접근통제구역의 출입을 관리한다.', 'process', false, true, 'minor', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-11.3'
UNION ALL
SELECT e.id, '11.3-4', '정보시스템 접근통제 및 접근 권한을 관리한다.', '정보시스템 접근통제 및 접근 권한을 관리한다.', 'process', false, true, 'minor', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-11.3'
UNION ALL
SELECT e.id, '11.3-5', '정보시스템 접속기록을 보관하고 관리한다.', '정보시스템 접속기록을 보관하고 관리한다.', 'process', false, true, 'minor', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-11.3'
UNION ALL
SELECT e.id, '12.1-1', '낙상 관련 지표를 관리한다.', '낙상 관련 지표를 관리한다.', 'outcome', true, false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e WHERE e.code = 'STD-12.1'
UNION ALL
SELECT e.id, '12.1-2', '손위생 수행 관련 지표를 관리한다.', '손위생 수행 관련 지표를 관리한다.', 'outcome', true, false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e WHERE e.code = 'STD-12.1'
UNION ALL
SELECT e.id, '12.1-3', '욕창 관련 지표를 관리한다.', '욕창 관련 지표를 관리한다.', 'outcome', true, false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e WHERE e.code = 'STD-12.1'
UNION ALL
SELECT e.id, '12.1-4', '환자만족도 관련 지표를 관리한다.', '환자만족도 관련 지표를 관리한다.', 'outcome', true, false, 'major', ARRAY['nursing'], 4
FROM accreditation_entries e WHERE e.code = 'STD-12.1'
UNION ALL
SELECT e.id, '12.1-5', '직원안전 관련 지표를 관리한다.', '직원안전 관련 지표를 관리한다.', 'outcome', true, false, 'major', ARRAY['nursing'], 5
FROM accreditation_entries e WHERE e.code = 'STD-12.1';

-- 검증: 장 12개 / 기준 60개 / 조사항목 303개 (공식: 12장/60기준/303항목)