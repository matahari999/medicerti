-- ============================================================
-- AccrediQ — 인증기준 계층 시드 데이터 v1
-- 요양병원 3주기 + 정신병원 + 급성기 + 치과 + 한방 + 재활
-- ============================================================

-- ============================================================
-- 1. 영역 (Areas)
-- ============================================================
INSERT INTO accreditation_areas (code, name, name_en, description, color, weight, sort_order) VALUES
  ('PS', '환자안전', 'Patient Safety', '환자 안전을 보장하기 위한 시스템과 절차', '#ef4444', 1.5, 1),
  ('PC', '환자중심', 'Patient-Centered Care', '환자 권리와 중심의 의료 서비스 제공', '#f59e0b', 1.2, 2),
  ('GL', '지도체계', 'Governance & Leadership', '기관 운영의 투명성과 책임성', '#3b82f6', 1.0, 3),
  ('QS', '안전/질향상', 'Quality & Safety', '지속적 질 향상과 환자안전 활동', '#10b981', 1.0, 4)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 2. 장 (Chapters) — 요양병원
-- ============================================================
INSERT INTO accreditation_chapters (area_id, code, title, description, hospital_types, sort_order)
SELECT a.id, 'CH-PS-01', '1장. 환자안전기준', '환자 식별, 낙상 예방, 억제대 관리 등 기본 환자 안전 활동', ARRAY['nursing'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-PS-02', '2장. 감염관리', '손위생, 격리, 감염 예방 및 관리 활동', ARRAY['nursing'], 2
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-PS-03', '3장. 의약품관리', '고위험의약품 관리, 투약 안전', ARRAY['nursing'], 3
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-PC-01', '4장. 환자권리와 책임', '환자 권리 보장, 설명 동의, 개인정보 보호', ARRAY['nursing'], 1
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-PC-02', '5장. 의무기록관리', '의무기록 작성, 보관, 관리 절차', ARRAY['nursing'], 2
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-GL-01', '6장. 조직 및 인력관리', '조직 체계, 인력 기준, 직원 교육', ARRAY['nursing'], 1
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-GL-02', '7장. 시설 및 안전관리', '시설 환경, 화재 안전, 응급 대비', ARRAY['nursing'], 2
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-QS-01', '8장. 질 향상 활동', 'QPS 활동, 환자안전 보고 체계', ARRAY['nursing'], 1
FROM accreditation_areas a WHERE a.code = 'QS'
UNION ALL
SELECT a.id, 'CH-QS-02', '9장. 영양 및 식사관리', '영양 평가, 식사 관리, 식이 교육', ARRAY['nursing'], 2
FROM accreditation_areas a WHERE a.code = 'QS';

-- 정신병원 장
INSERT INTO accreditation_chapters (area_id, code, title, description, hospital_types, sort_order)
SELECT a.id, 'CH-PS-P-01', '1장. 환자안전 및 위기관리', '정신과 환자의 자·타해 위험 관리, 폭력 예방', ARRAY['psychiatric'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-PS-P-02', '2장. 감염 및 약물관리', '정신과 병동 감염 관리, 정신약물 관리', ARRAY['psychiatric'], 2
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-PC-P-01', '3장. 환자권리 및 인권보호', '입원 환자 인권, 격리·강박 최소화', ARRAY['psychiatric'], 1
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-GL-P-01', '4장. 조직 및 치료환경', '정신건강의학과 조직, 치료 환경 조성', ARRAY['psychiatric'], 1
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-GL-P-02', '5장. 직원 교육 및 안전', '정신과 병동 직원 교육, 폭력 대응 훈련', ARRAY['psychiatric'], 2
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-QS-P-01', '6장. 질 향상 및 재활 프로그램', '정신 재활 프로그램, 질 향상 활동', ARRAY['psychiatric'], 1
FROM accreditation_areas a WHERE a.code = 'QS';

-- 급성기병원 장
INSERT INTO accreditation_chapters (area_id, code, title, description, hospital_types, sort_order)
SELECT a.id, 'CH-PS-A-01', '1장. 환자안전기준', '수술 안전, 응급 환자 관리, 중환자 안전', ARRAY['acute', 'tertiary', 'general', 'hospital'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-PS-A-02', '2장. 감염관리', '수술 부위 감염, 다제내성균 관리, 직원 감염 예방', ARRAY['acute', 'tertiary', 'general', 'hospital'], 2
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-PS-A-03', '3장. 수술 및 마취 안전', '수술 안전 확인, 마취 관리, 회복실 관리', ARRAY['acute', 'tertiary', 'general', 'hospital'], 3
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-PC-A-01', '4장. 환자권리 및 의사소통', '환자 권리, 진료 정보 공유, 의사소통', ARRAY['acute', 'tertiary', 'general', 'hospital'], 1
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-GL-A-01', '5장. 조직 및 인력 기준', '조직 체계, 전문 인력, 교육 훈련', ARRAY['acute', 'tertiary', 'general', 'hospital'], 1
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-QS-A-01', '6장. 질 향상 및 환자안전', 'QI 활동, 위해 사고 보고, 근거 기반 진료', ARRAY['acute', 'tertiary', 'general', 'hospital'], 1
FROM accreditation_areas a WHERE a.code = 'QS';

-- 치과병원 장
INSERT INTO accreditation_chapters (area_id, code, title, description, hospital_types, sort_order)
SELECT a.id, 'CH-PS-D-01', '1장. 감염 및 멸균관리', '치과 기구 멸균, 진료 환경 감염 관리, 방사선 안전', ARRAY['dental'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-PC-D-01', '2장. 환자권리 및 진료기록', '치과 진료 동의, 진료 기록 관리, 개인정보 보호', ARRAY['dental'], 1
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-QS-D-01', '3장. 질 향상 및 환자안전', '치과 진료 질 향상, 위해 사고 예방', ARRAY['dental'], 1
FROM accreditation_areas a WHERE a.code = 'QS';

-- 한방병원 장
INSERT INTO accreditation_chapters (area_id, code, title, description, hospital_types, sort_order)
SELECT a.id, 'CH-PS-K-01', '1장. 환자안전 및 감염관리', '침·뜸·부항 시술 안전, 한방 감염 관리', ARRAY['korean'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-PC-K-01', '2장. 환자권리 및 한약관리', '한약재 관리, 탕전 관리, 환자 권리', ARRAY['korean'], 1
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-QS-K-01', '3장. 질 향상 활동', '한방 의료 질 향상, 임상 성과 평가', ARRAY['korean'], 1
FROM accreditation_areas a WHERE a.code = 'QS';

-- 재활병원 장
INSERT INTO accreditation_chapters (area_id, code, title, description, hospital_types, sort_order)
SELECT a.id, 'CH-PS-R-01', '1장. 환자안전 및 낙상예방', '재활 환자 낙상 예방, 치료실 안전', ARRAY['rehabilitation'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-PC-R-01', '2장. 재활치료 및 환자중심', '다학제 재활 치료, 기능 평가, 환자 목표 설정', ARRAY['rehabilitation'], 1
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-GL-R-01', '3장. 조직 및 인력', '재활 팀 구성, 치료사 기준, 교육 훈련', ARRAY['rehabilitation'], 1
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-QS-R-01', '4장. 질 향상 및 성과 평가', '재활 성과 측정, 치료 질 향상', ARRAY['rehabilitation'], 1
FROM accreditation_areas a WHERE a.code = 'QS';

-- ============================================================
-- 3. 기준 (Entries) — 요양병원
-- ============================================================
INSERT INTO accreditation_entries (chapter_id, code, title, description, hospital_types, sort_order)
SELECT c.id, 'ENT-PS-01', '정확한 환자 식별', '모든 의료 행위 전 최소 2가지 식별 정보 확인', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-PS-01'
UNION ALL
SELECT c.id, 'ENT-PS-02', '낙상 예방 관리', '낙상 위험도 평가 및 예방 중재 수행', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-PS-01'
UNION ALL
SELECT c.id, 'ENT-PS-03', '신체억제대 사용 기준', '억제대 사용 시 의사 처방 및 보호자 동의', ARRAY['nursing'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-PS-01'
UNION ALL
SELECT c.id, 'ENT-PS-04', '욕창 예방 관리', '욕창 위험도 평가 및 예방 중재', ARRAY['nursing'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-PS-01'
UNION ALL
SELECT c.id, 'ENT-PS-05', '응급상황 대응', '심폐소생술, 응급 장비 및 약품 관리', ARRAY['nursing'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-PS-01'
UNION ALL
SELECT c.id, 'ENT-PS-06', '환자안전사고 보고', '위해 사건 보고 체계 및 분석', ARRAY['nursing'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-PS-01'
UNION ALL
SELECT c.id, 'ENT-IN-01', '손위생 관리', '손위생 5대 시점 준수 및 모니터링', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-PS-02'
UNION ALL
SELECT c.id, 'ENT-IN-02', '감염 예방 및 관리', '다제내성균 관리, 격리 지침, 의료폐기물 관리', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-PS-02'
UNION ALL
SELECT c.id, 'ENT-MD-01', '고위험의약품 관리', '고위험의약품 보관 및 보안, 라벨링', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-PS-03'
UNION ALL
SELECT c.id, 'ENT-MD-02', '투약 안전', '투약 5right 확인, 약물 이상반응 모니터링', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-PS-03'
UNION ALL
SELECT c.id, 'ENT-PC-01', '환자 권리 보장', '환자 권리 고지, 설명 동의, 개인정보 보호', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-PC-01'
UNION ALL
SELECT c.id, 'ENT-PC-02', '불만·고충 처리', '환자 불만 접수 및 처리 절차', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-PC-01'
UNION ALL
SELECT c.id, 'ENT-RD-01', '의무기록 작성 및 관리', '의무기록 작성 원칙, 보관, 열람 절차', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-PC-02'
UNION ALL
SELECT c.id, 'ENT-ORG-01', '조직 체계', '병원 조직 및 인력 기준 충족', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-GL-01'
UNION ALL
SELECT c.id, 'ENT-ORG-02', '직원 교육', '직원 교육 훈련 계획 및 수행', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-GL-01'
UNION ALL
SELECT c.id, 'ENT-FC-01', '시설 안전 관리', '화재 안전, 전기 안전, 의료기기 관리', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-GL-02'
UNION ALL
SELECT c.id, 'ENT-FC-02', '응급 대비 태세', '비상 연락망, 재해 대비 계획', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-GL-02'
UNION ALL
SELECT c.id, 'ENT-QI-01', 'QPS 활동', '질 향상 연간 계획 및 활동', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-QS-01'
UNION ALL
SELECT c.id, 'ENT-QI-02', '환자안전 보고 체계', '환자안전사고 보고 및 분석, 개선 활동', ARRAY['nursing'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-QS-01'
UNION ALL
SELECT c.id, 'ENT-NT-01', '영양 관리', '입원 환자 영양 평가 및 식사 관리', ARRAY['nursing'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-QS-02';

-- ============================================================
-- 4. 범주 (Categories) — 요양병원
-- ============================================================
INSERT INTO accreditation_categories (entry_id, name, sort_order)
SELECT e.id, '환자 식별 절차', 1
FROM accreditation_entries e WHERE e.code = 'ENT-PS-01'
UNION ALL
SELECT e.id, '낙상 위험도 평가', 1
FROM accreditation_entries e WHERE e.code = 'ENT-PS-02'
UNION ALL
SELECT e.id, '낙상 예방 중재', 2
FROM accreditation_entries e WHERE e.code = 'ENT-PS-02'
UNION ALL
SELECT e.id, '억제대 사용 지침', 1
FROM accreditation_entries e WHERE e.code = 'ENT-PS-03'
UNION ALL
SELECT e.id, '울창 위험도 평가', 1
FROM accreditation_entries e WHERE e.code = 'ENT-PS-04'
UNION ALL
SELECT e.id, '응급 장비 관리', 1
FROM accreditation_entries e WHERE e.code = 'ENT-PS-05'
UNION ALL
SELECT e.id, '사고 보고 체계', 1
FROM accreditation_entries e WHERE e.code = 'ENT-PS-06'
UNION ALL
SELECT e.id, '손위생 수행', 1
FROM accreditation_entries e WHERE e.code = 'ENT-IN-01'
UNION ALL
SELECT e.id, '격리 관리', 1
FROM accreditation_entries e WHERE e.code = 'ENT-IN-02'
UNION ALL
SELECT e.id, '고위험약 보관', 1
FROM accreditation_entries e WHERE e.code = 'ENT-MD-01'
UNION ALL
SELECT e.id, '투약 절차', 1
FROM accreditation_entries e WHERE e.code = 'ENT-MD-02'
UNION ALL
SELECT e.id, '환자 권리 고지', 1
FROM accreditation_entries e WHERE e.code = 'ENT-PC-01'
UNION ALL
SELECT e.id, '불만 접수 처리', 1
FROM accreditation_entries e WHERE e.code = 'ENT-PC-02'
UNION ALL
SELECT e.id, '기록 작성', 1
FROM accreditation_entries e WHERE e.code = 'ENT-RD-01'
UNION ALL
SELECT e.id, '조직 구성', 1
FROM accreditation_entries e WHERE e.code = 'ENT-ORG-01'
UNION ALL
SELECT e.id, '교육 계획', 1
FROM accreditation_entries e WHERE e.code = 'ENT-ORG-02'
UNION ALL
SELECT e.id, '화재 안전', 1
FROM accreditation_entries e WHERE e.code = 'ENT-FC-01'
UNION ALL
SELECT e.id, '비상 연락', 1
FROM accreditation_entries e WHERE e.code = 'ENT-FC-02'
UNION ALL
SELECT e.id, 'QI 활동', 1
FROM accreditation_entries e WHERE e.code = 'ENT-QI-01'
UNION ALL
SELECT e.id, '보고 분석', 1
FROM accreditation_entries e WHERE e.code = 'ENT-QI-02'
UNION ALL
SELECT e.id, '영양 평가', 1
FROM accreditation_entries e WHERE e.code = 'ENT-NT-01';

-- ============================================================
-- 5. 조사항목 (Survey Items) — 요양병원 ME 항목
-- ============================================================
INSERT INTO accreditation_survey_items (entry_id, category_id, code, title, description, assessment_method, sop_type, is_pilot, severity, hospital_types, sort_order)
-- PS-01 환자 식별
SELECT e.id, cat.id, 'ME 1.1', '정확한 환자 식별 수행', '모든 의료 행위(진료, 투약, 채혈, 검사 등) 직전에 최소 2가지 이상의 환자 식별 정보(이름, 생년월일 등)를 이용해 환자를 정확히 식별한다.', '서류 검토, 직원 면담, 병동 관찰', 'process', false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '환자 식별 절차' WHERE e.code = 'ENT-PS-01'
UNION ALL
SELECT e.id, cat.id, 'ME 1.2', '구어적·전화 처방 안전성 확보', '응급 상황이나 수술/시술 중 발생하는 구어적 혹은 전화 처방 시 받아적기(Write-down) 및 복창 확인(Read-back) 절차를 확실히 수행한다.', '지침서 검토, 간호사 면담', 'process', false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '환자 식별 절차' WHERE e.code = 'ENT-PS-01'
-- PS-02 낙상 예방
UNION ALL
SELECT e.id, cat.id, 'ME 2.1', '입원 시 낙상 위험도 평가', '입원 시 낙상 위험도를 초기 사정 도구(Morse Fall Scale)로 측정하고 기록한다.', '의무기록 검토', 'process', false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '낙상 위험도 평가' WHERE e.code = 'ENT-PS-02'
UNION ALL
SELECT e.id, cat.id, 'ME 2.2', '낙상 예방 중재 수행', '위험도에 따른 낙상 예방 중재와 낙상 주의 표식 부착을 수행한다.', '의료기록 검토, 환자 면담, 현장 관찰', 'process', false, 'critical', ARRAY['nursing'], 2
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '낙상 예방 중재' WHERE e.code = 'ENT-PS-02'
UNION ALL
SELECT e.id, cat.id, 'ME 2.3', '낙상 발생 시 사후 관리', '낙상 발생 시 원인 분석 및 재발 방지 대책을 수립하고 이행한다.', '의무기록 검토, 질향상 위원회 회의록', 'process', false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '낙상 예방 중재' WHERE e.code = 'ENT-PS-02'
-- PS-03 억제대
UNION ALL
SELECT e.id, cat.id, 'ME 3.1', '신체억제대 사용 기준 및 적법성', '신체억제대 사용 시 반드시 의사의 처방과 구체적인 대안책 적용 기록이 있어야 하며, 설명서 고지 후 보호자 동의서를 징구한다.', '동의서 대장 검토, 기록부 확인, 병동 관찰', 'process', false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '억제대 사용 지침' WHERE e.code = 'ENT-PS-03'
UNION ALL
SELECT e.id, cat.id, 'ME 3.2', '억제대 정기 평가 및 대안 적용', '억제대 사용 환자의 정기적 평가와 대안 중재 적용 기록을 유지한다.', '의무기록 검토', 'process', false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '억제대 사용 지침' WHERE e.code = 'ENT-PS-03'
-- PS-04 욕창
UNION ALL
SELECT e.id, cat.id, 'ME 4.1', '욕창 위험도 평가', '입원 시 욕창 위험도(Braden Scale)를 평가하고 기록한다.', '의무기록 검토', 'process', false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '울창 위험도 평가' WHERE e.code = 'ENT-PS-04'
UNION ALL
SELECT e.id, cat.id, 'ME 4.2', '욕창 예방 중재', '욕창 위험도에 따른 체위 변경, 영양 관리 등 예방 중재를 수행한다.', '의무기록 검토, 병동 관찰', 'process', false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '울창 위험도 평가' WHERE e.code = 'ENT-PS-04'
-- PS-05 응급상황
UNION ALL
SELECT e.id, cat.id, 'ME 5.1', '심폐소생술 교육 및 훈련', '전 직원 대상 연 1회 이상 심폐소생술 교육 및 훈련을 실시한다.', '교육 기록 검토', 'process', false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '응급 장비 관리' WHERE e.code = 'ENT-PS-05'
UNION ALL
SELECT e.id, cat.id, 'ME 5.2', '응급 장비 및 약품 관리', 'AED, 응급카트, 응급약품의 정기 점검 및 보관 상태를 유지한다.', '점검일지 검토, 현장 실사', 'structure', false, 'critical', ARRAY['nursing'], 2
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '응급 장비 관리' WHERE e.code = 'ENT-PS-05'
UNION ALL
SELECT e.id, cat.id, 'ME 5.3', '야간·휴일 응급대응 체계', '야간 및 휴일 시간의 응급상황 대응 체계와 비상 연락망을 운영한다.', '비상연락망 확인, 직원 면담', 'structure', false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '응급 장비 관리' WHERE e.code = 'ENT-PS-05'
-- PS-06 사고 보고
UNION ALL
SELECT e.id, cat.id, 'ME 6.1', '환자안전사고 보고 체계', '환자안전사고(적신호 사건 포함) 보고 체계를 운영하고 보고를 장려한다.', '보고 체계 확인, 관련 대장 검토', 'structure', false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '사고 보고 체계' WHERE e.code = 'ENT-PS-06'
UNION ALL
SELECT e.id, cat.id, 'ME 6.2', '사고 원인 분석 및 개선', '보고된 사고의 원인 분석(RCA) 및 개선 활동을 수행하고 환류한다.', '회의록, 분석 보고서 검토', 'process', false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '사고 보고 체계' WHERE e.code = 'ENT-PS-06'
-- IN-01 손위생
UNION ALL
SELECT e.id, cat.id, 'ME 7.1', '손위생 5대 시점 준수', 'WHO 손위생 5대 시점(Five Moments)에 근거해 전 직원의 손위생을 수행한다.', '현장 관찰, 분기 보고서 검토', 'process', false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '손위생 수행' WHERE e.code = 'ENT-IN-01'
UNION ALL
SELECT e.id, cat.id, 'ME 7.2', '손위생 모니터링 및 피드백', '손위생 이행률을 정기적으로 모니터링하고 결과를 피드백한다.', '모니터링 기록 검토', 'process', false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '손위생 수행' WHERE e.code = 'ENT-IN-01'
-- IN-02 감염
UNION ALL
SELECT e.id, cat.id, 'ME 8.1', '다제내성균 관리', 'CRE, VRE 등 다제내성균 감염 환자 관리 지침을 수립하고 이행한다.', '격리 지침 검토, 병동 실사', 'process', false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '격리 관리' WHERE e.code = 'ENT-IN-02'
UNION ALL
SELECT e.id, cat.id, 'ME 8.2', '의료폐기물 관리', '의료폐기물 분리 배출, 보관, 처리 절차를 준수한다.', '폐기물 관리 대장 검토, 현장 확인', 'process', false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '격리 관리' WHERE e.code = 'ENT-IN-02'
-- MD-01 고위험약
UNION ALL
SELECT e.id, cat.id, 'ME 9.1', '고위험의약품 보관 및 보안', '고농축 전해질, 인슐린, 헤파린 등 고위험의약품은 일반 약물과 혼동되지 않도록 경고 라벨링 부착 및 전용 보관 구역 시건장치를 유지한다.', '약제실 및 병동 캐비닛 현장 실사', 'structure', false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '고위험약 보관' WHERE e.code = 'ENT-MD-01'
UNION ALL
SELECT e.id, cat.id, 'ME 9.2', '고위험의약품 사용 절차', '고위험의약품 처방·조제·투약 시 이중 확인 절차를 수행한다.', '처방 검토, 투약 기록 확인', 'process', false, 'critical', ARRAY['nursing'], 2
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '고위험약 보관' WHERE e.code = 'ENT-MD-01'
-- MD-02 투약
UNION ALL
SELECT e.id, cat.id, 'ME 10.1', '투약 5RIGHT 확인', '투약 전 올바른 환자, 올바른 약물, 올바른 용량, 올바른 경로, 올바른 시간을 확인한다.', '투약 기록 검토, 간호사 면담', 'process', false, 'critical', ARRAY['nursing'], 1
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '투약 절차' WHERE e.code = 'ENT-MD-02'
UNION ALL
SELECT e.id, cat.id, 'ME 10.2', '약물 이상반응 모니터링', '약물 이상반응(ADR) 감시 체계를 운영하고 보고한다.', 'ADR 보고 기록 검토', 'process', false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '투약 절차' WHERE e.code = 'ENT-MD-02'
-- PC-01 권리
UNION ALL
SELECT e.id, cat.id, 'ME 11.1', '환자 권리 고지', '입원 시 환자 권리와 책임에 관한 안내문을 제공하고 설명한다.', '안내문 확인, 환자 면담', 'process', false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '환자 권리 고지' WHERE e.code = 'ENT-PC-01'
UNION ALL
SELECT e.id, cat.id, 'ME 11.2', '설명 동의 절차', '침습적 시술 등 법정 동의 항목에 대해 충분한 설명 후 서면 동의를 받는다.', '동의서 검토', 'process', false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '환자 권리 고지' WHERE e.code = 'ENT-PC-01'
UNION ALL
SELECT e.id, cat.id, 'ME 11.3', '개인정보 보호', '환자 개인정보 보호를 위한 물리적·관리적 조치를 수행한다.', '현장 확인, 관련 지침 검토', 'structure', false, 'major', ARRAY['nursing'], 3
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = '환자 권리 고지' WHERE e.code = 'ENT-PC-01'
-- QI-01 QPS
UNION ALL
SELECT e.id, cat.id, 'ME 12.1', 'QPS 연간 계획 수립', '매년 병원장 승인을 거친 QPS 연간 운영 계획서를 수립한다.', '계획서 검토', 'structure', false, 'major', ARRAY['nursing'], 1
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = 'QI 활동' WHERE e.code = 'ENT-QI-01'
UNION ALL
SELECT e.id, cat.id, 'ME 12.2', '부서별 QI 활동', '각 부서별 QI 주제 선정 및 활동을 진행하고 그 결과를 기록한다.', 'QI 활동 기록 검토', 'process', false, 'major', ARRAY['nursing'], 2
FROM accreditation_entries e LEFT JOIN accreditation_categories cat ON cat.entry_id = e.id AND cat.name = 'QI 활동' WHERE e.code = 'ENT-QI-01';
