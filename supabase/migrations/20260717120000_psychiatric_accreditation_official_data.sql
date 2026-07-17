-- ============================================================
-- 6주기 정신의료기관 평가기준(3영역·11장·44기준) 공식 데이터 반영
-- 출처: lib/standardCatalog.ts의 PSYCHIATRIC_CHAPTERS (문서생성 기능에서
-- 이미 사용 중인 실제 기준 데이터) — 기존 6장짜리 가상(fictional) 시드를
-- 실제 11장/44기준 구조로 전면 교체한다.
--
-- 조사항목(survey_items)은 기준(entry) 1개당 1개씩 생성하며, 설명은
-- standardCatalog.ts의 summary를 그대로 사용한다. 공식 ME(조사항목)
-- 195개 세부 문항의 원문은 코드베이스에 없으므로 지어내지 않고,
-- 이미 검증되어 사용 중인 기준 단위 요약만 반영한다.
-- ============================================================

-- 1) 기존 정신병원 가상 시드(장 6개, 하위 항목 없음) 삭제
DELETE FROM accreditation_survey_items WHERE 'psychiatric' = ANY(hospital_types);
DELETE FROM accreditation_categories WHERE entry_id IN (SELECT id FROM accreditation_entries WHERE 'psychiatric' = ANY(hospital_types));
DELETE FROM accreditation_entries WHERE 'psychiatric' = ANY(hospital_types);
DELETE FROM accreditation_chapters WHERE 'psychiatric' = ANY(hospital_types);

-- 2) 실제 11개 장 (Chapters) 삽입 — 3영역(기본가치체계/환자진료체계/조직관리체계)
INSERT INTO accreditation_chapters (area_id, code, title, hospital_types, sort_order)
SELECT a.id, 'CH-01-PSY', '1장. 환자안전보장활동', ARRAY['psychiatric'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-02-PSY', '2장. 진료전달체계와 평가', ARRAY['psychiatric'], 2
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-03-PSY', '3장. 환자진료', ARRAY['psychiatric'], 3
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-04-PSY', '4장. 의약품관리', ARRAY['psychiatric'], 4
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-05-PSY', '5장. 환자권리 존중 및 보호', ARRAY['psychiatric'], 5
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-06-PSY', '6장. 질 향상 및 환자안전 활동', ARRAY['psychiatric'], 6
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-07-PSY', '7장. 감염관리', ARRAY['psychiatric'], 7
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-08-PSY', '8장. 경영 및 조직운영', ARRAY['psychiatric'], 8
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-09-PSY', '9장. 인적자원관리', ARRAY['psychiatric'], 9
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-10-PSY', '10장. 시설 및 환경관리', ARRAY['psychiatric'], 10
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-11-PSY', '11장. 의료정보/의무기록 관리', ARRAY['psychiatric'], 11
FROM accreditation_areas a WHERE a.code = 'GL';

-- 3) 실제 44개 기준 (Entries) 삽입
INSERT INTO accreditation_entries (chapter_id, code, title, description, hospital_types, sort_order)
SELECT c.id, 'STD-PSY-1.1', '의료진간 정확한 의사소통', '환자확인(2가지 이상 지표), 필요시처방(p.r.n) 목록 관리·수행, 구두처방 수행, 혼동하기 쉬운 처방 대처 절차 수립·이행', ARRAY['psychiatric'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-01-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-1.2', '정신과적 치료환경 관리', '위해도구 보관·수량 확인, 반입 제한 물품 관리(입원시·귀원시·면회시 확인), 병동 내 안전사고 예방점검 수행', ARRAY['psychiatric'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-01-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-1.3', '정신과적 응급상황 관리', '자살·자해·폭언·폭행·기물파손 등 정신과적 응급상황 대처 절차, 고위험환자 식별·공유·모니터링', ARRAY['psychiatric'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-01-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-1.4', '낙상 예방활동', '신뢰도·타당도 검증된 낙상 위험 평가도구(Morse Fall Scale 등) 사용, 낙상 고위험환자 예방활동 및 정보 공유, 낙상 발생 가능 장소 예방활동 수행', ARRAY['psychiatric'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-01-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-1.5', '외출 및 외박 관리', '외출·외박 신청·주치의 처방·교육·귀원 확인 절차 수립, 미귀원자·무단이탈자 발생 시 대처 방안 이행', ARRAY['psychiatric'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-01-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-2.1', '입원 수속 및 유지 관리', '자의·동의·보호의무자에 의한·행정·응급 입원 유형별 수속 절차 이행, 계속입원 절차 준수, 비자의입원 심사 타 기관 직원 방문 시 적절한 응대', ARRAY['psychiatric'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-02-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-2.2', '환자진료의 일관성 및 연속성 유지', '담당 주치의 변경·전동·근무교대 시 표준화된 의사소통(인수인계)으로 환자 정보 공유', ARRAY['psychiatric'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-02-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-2.3', '퇴원 및 전원 관리', '퇴원 계획 수립·교육·정보 제공, 정신재활서비스(정신건강복지센터·보건소) 연계, 전원 절차 준수', ARRAY['psychiatric'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-02-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-2.4', '입원환자 초기평가', '의학적 초기평가(입원 후 24시간 이내, 최대 72시간·MSE·자살위험 평가 포함), 간호 초기평가(24시간 이내), 치료 담당 직원과 공유', ARRAY['psychiatric'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-02-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-2.5', '검체검사 및 영상검사 관리', '검체 획득·라벨링·결과보고(CVR 포함) 절차, 외부 의뢰기관 안전성 확인, 영상검사 준비·결과보고 체계', ARRAY['psychiatric'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-02-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-2.6', '검사실 안전관리', '검체검사실(보호구·폐기 절차·감염관리) 및 영상검사실(방사선 노출관리·방사선 측정 배지) 안전 관리 (시범항목)', ARRAY['psychiatric'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-02-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-3.1', '입원환자 치료계획', '의사의 개별 치료계획 수립, 경과 기록, 간호과정 기록, 관련 직원·환자·보호의무자 치료계획 공유, 계속입원 시 재수립', ARRAY['psychiatric'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-03-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-3.2', '동반질환 관리', '원내·외 협의진료 체계(의뢰서식·응급의뢰 기준·결과 확인), 동반질환 환자 영양관리(주치의 처방·영양상담)', ARRAY['psychiatric'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-03-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-3.3', '치료프로그램', '집단 치료 중심 치료프로그램(연 1회 이상 계획, 매뉴얼, 전용 공간), 시행 결과 공유·평가, 외부진행자 관리', ARRAY['psychiatric'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-03-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-3.4', '작업치료', '작업치료 평가·치료 계획 수립 및 시행, 기록 관리', ARRAY['psychiatric'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-03-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-3.5', '특수치료', '전기경련요법(ECT) 등 특수치료 적응증·사전 동의·시행·모니터링 절차 이행', ARRAY['psychiatric'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-03-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-3.6', '심폐소생술 관리', '심폐소생술 장비(응급카트) 정기 점검, 직원 CPR 교육·훈련 이행', ARRAY['psychiatric'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-03-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-3.7', '격리', '격리 적용 기준·처방·수행·모니터링 및 기록, 최소화 원칙 준수 (전 항목 필수)', ARRAY['psychiatric'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-03-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-3.8', '강박', '강박 적용 기준·처방·수행·모니터링 및 기록, 최소화 원칙 준수 (전 항목 필수)', ARRAY['psychiatric'], 8
FROM accreditation_chapters c WHERE c.code = 'CH-03-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-4.1', '의약품 보관', '의약품(향정신성·마약류 포함) 보관 조건·잠금·수량 확인, 구분 보관 기준 이행', ARRAY['psychiatric'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-04-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-4.2', '처방 및 조제', '의약품 처방 적정성 검토, 조제 정확성 확인, 처방·조제 오류 관리', ARRAY['psychiatric'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-04-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-4.3', '투약 및 모니터링', '5 Right 원칙 준수 투약, 투약 후 효과·부작용 모니터링 및 기록', ARRAY['psychiatric'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-04-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-5.1', '환자권리 존중', '정신과 입원 환자 권리(통신·면회·외출 등) 고지·이행, 인권 보호, 취약환자(아동·노인 등) 학대 예방 활동', ARRAY['psychiatric'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-05-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-5.2', '불만고충처리', '환자·보호의무자 불만·고충 접수·처리·피드백 체계 운영', ARRAY['psychiatric'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-05-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-5.3', '동의(서)', '입원 동의, 치료 동의(격리·강박·특수치료 등) 사전 설명 및 서면 동의 획득', ARRAY['psychiatric'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-05-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-6.1', '질 향상 및 환자안전 운영체계', '질 향상·환자안전 위원회 운영, QI 활동 계획·수행·평가, 결과 경영진 보고', ARRAY['psychiatric'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-06-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-6.2', '환자안전사고 관리', '환자안전사고 보고 체계, 근본원인 분석, 개선활동 수행 및 재발 방지', ARRAY['psychiatric'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-06-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-7.1', '감염관리체계', '감염관리위원회·담당자 운영, 감염감시 활동, 손위생 이행 관리 (ME4 손위생 필수)', ARRAY['psychiatric'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-07-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-7.2', '세척·소독·멸균 및 세탁물 관리', '의료기구 세척·소독·멸균 절차 및 멸균 모니터링, 세탁물 분리 수거·세탁·보관 관리', ARRAY['psychiatric'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-07-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-7.3', '병동 내 환경위생관리', '병동 내 환경 청소·소독 기준 이행, 환경 위생 관리 점검', ARRAY['psychiatric'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-07-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-7.4', '급식서비스 관리', '환자 급식 위생 관리(식재료 검수, 조리 위생, 배식 위생), 식중독 예방, 영양 적절성 관리', ARRAY['psychiatric'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-07-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-8.1', '합리적인 의사결정', '합리적인 의사결정 구조 운영, 법적 요구사항 준수 확인', ARRAY['psychiatric'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-08-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-9.1', '인사정보 관리', '직원 면허·자격 확인, 의료 인력 법적기준 준수(ME3 유/무 판정)', ARRAY['psychiatric'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-09-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-9.2', '직원교육', '신규 직원 교육, 정기 교육(인권교육 필수 포함), 교육 계획·이행·평가', ARRAY['psychiatric'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-09-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-9.3', '직원 안전관리 활동', '직원 건강 검진, 감염 예방 접종, 직업적 노출(혈액·체액) 관리 (전 항목 필수)', ARRAY['psychiatric'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-09-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-9.4', '폭력 예방 및 관리', '직원 대상 폭력 예방 교육, 폭력 발생 시 대응 절차, 사후 심리 지원 관리', ARRAY['psychiatric'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-09-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-10.1', '시설 및 환경 관리', '의료기관 시설 안전 점검, 환경 유지·관리', ARRAY['psychiatric'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-10-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-10.2', '설비시스템 관리', '전기·의료가스·급수·냉난방 등 설비시스템 정기 점검 및 비상 대응 절차', ARRAY['psychiatric'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-10-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-10.3', '설치시설 관리', '정신의료기관 설치시설(보호실·상담실 등) 법적기준 준수 (ME2~3 필수·유무 판정), 시설 관리', ARRAY['psychiatric'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-10-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-10.4', '위험물질 관리', '화학물질·의료폐기물 등 위험물질 목록 관리, MSDS 비치, 보관·취급·폐기 절차 이행', ARRAY['psychiatric'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-10-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-10.5', '의료기기 관리', '의료기기 등록·유지보수·사용 교육 및 이상 발생 시 보고 체계', ARRAY['psychiatric'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-10-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-10.6', '화재 안전관리 활동', '화재 예방 계획 수립, 소방 교육·훈련, 소방설비 점검, 화재 발생 시 대피 절차 이행 (필수 포함)', ARRAY['psychiatric'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-10-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-11.1', '의료정보/의무기록 관리', '의무기록 작성 기준·보관·접근 권한 관리, 의료정보 보안', ARRAY['psychiatric'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-11-PSY'
UNION ALL
SELECT c.id, 'STD-PSY-11.2', '퇴원환자 의무기록 완결도 관리', '퇴원 후 의무기록 완결도 모니터링(평가 전월로부터 6개월간 퇴원 기록 대상), 미완결 기록 개선 조치', ARRAY['psychiatric'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-11-PSY';

-- 4) 조사항목 (Survey Items) — 기준(entry) 1개당 1개, category 없이 entry 직속
--    설명은 standardCatalog.ts의 summary를 그대로 사용 (지어낸 세부 ME 문항 아님)
INSERT INTO accreditation_survey_items (entry_id, code, title, description, sop_type, is_mandatory, is_pilot, severity, hospital_types, required_evidence, sort_order)
SELECT e.id, 'ME-PSY-1.1', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '구두처방 이행 기록; 필요시처방 목록 관리 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-1.1'
UNION ALL
SELECT e.id, 'ME-PSY-1.2', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '위해도구 보관 점검 기록; 반입 제한 물품 확인 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-1.2'
UNION ALL
SELECT e.id, 'ME-PSY-1.3', e.title, e.description, 'process', true, false, 'critical', ARRAY['psychiatric'], '고위험환자 확인·공유 기록; 응급상황 대처 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-1.3'
UNION ALL
SELECT e.id, 'ME-PSY-1.4', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '낙상 위험 평가 기록; 고위험환자 예방활동 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-1.4'
UNION ALL
SELECT e.id, 'ME-PSY-1.5', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '외출·외박 허가 기록; 미귀원자 발생 및 조치 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-1.5'
UNION ALL
SELECT e.id, 'ME-PSY-2.1', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '입원 유형별 서류 보관 현황; 계속입원 서류 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-2.1'
UNION ALL
SELECT e.id, 'ME-PSY-2.2', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '근무교대 인수인계 기록; 전동 기록 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-2.2'
UNION ALL
SELECT e.id, 'ME-PSY-2.3', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '퇴원 교육 기록; 정신건강복지센터 통보 기록; 전원 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-2.3'
UNION ALL
SELECT e.id, 'ME-PSY-2.4', e.title, e.description, 'process', true, false, 'critical', ARRAY['psychiatric'], '의학적 초기평가 기록(24~72시간 이내); 간호 초기평가 기록(24시간 이내)', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-2.4'
UNION ALL
SELECT e.id, 'ME-PSY-2.5', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], 'CVR 보고 현황; 외부 의뢰기관 계약서 및 인증서', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-2.5'
UNION ALL
SELECT e.id, 'ME-PSY-2.6', e.title, e.description, 'structure', true, true, 'minor', ARRAY['psychiatric'], '보호구 착용 교육 기록; 방사선 측정 배지 착용 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-2.6'
UNION ALL
SELECT e.id, 'ME-PSY-3.1', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '치료계획 수립 기록; 환자·보호의무자 설명 기록; 계속입원 시 재수립 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-3.1'
UNION ALL
SELECT e.id, 'ME-PSY-3.2', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '협의진료 기록; 영양상담 제공 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-3.2'
UNION ALL
SELECT e.id, 'ME-PSY-3.3', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '프로그램 시행 기록; 결과 공유 기록; 외부진행자 자격 확인 서류', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-3.3'
UNION ALL
SELECT e.id, 'ME-PSY-3.4', e.title, e.description, 'process', true, false, 'minor', ARRAY['psychiatric'], '작업치료 시행 및 기록 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-3.4'
UNION ALL
SELECT e.id, 'ME-PSY-3.5', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '특수치료 동의서 보관 현황; 시행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-3.5'
UNION ALL
SELECT e.id, 'ME-PSY-3.6', e.title, e.description, 'process', true, false, 'critical', ARRAY['psychiatric'], '응급카트 정기 점검 현황; CPR 교육 이수 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-3.6'
UNION ALL
SELECT e.id, 'ME-PSY-3.7', e.title, e.description, 'process', true, false, 'critical', ARRAY['psychiatric'], '격리 적용·해제 기록; 격리 모니터링 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-3.7'
UNION ALL
SELECT e.id, 'ME-PSY-3.8', e.title, e.description, 'process', true, false, 'critical', ARRAY['psychiatric'], '강박 적용·해제 기록; 강박 모니터링 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-3.8'
UNION ALL
SELECT e.id, 'ME-PSY-4.1', e.title, e.description, 'structure', true, false, 'critical', ARRAY['psychiatric'], '의약품 재고 점검 현황; 향정신성·마약류 보관 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-4.1'
UNION ALL
SELECT e.id, 'ME-PSY-4.2', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '처방 오류 현황; 조제 확인 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-4.2'
UNION ALL
SELECT e.id, 'ME-PSY-4.3', e.title, e.description, 'process', true, false, 'critical', ARRAY['psychiatric'], '투약 기록; 부작용 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-4.3'
UNION ALL
SELECT e.id, 'ME-PSY-5.1', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '환자권리 고지 기록; 인권 교육 실적; 권리 제한 시 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-5.1'
UNION ALL
SELECT e.id, 'ME-PSY-5.2', e.title, e.description, 'process', true, false, 'minor', ARRAY['psychiatric'], '불만 접수·처리 현황; 피드백 제공 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-5.2'
UNION ALL
SELECT e.id, 'ME-PSY-5.3', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '동의서 보관 현황; 동의 획득 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-5.3'
UNION ALL
SELECT e.id, 'ME-PSY-6.1', e.title, e.description, 'structure', true, false, 'major', ARRAY['psychiatric'], '위원회 회의록; QI 활동 결과; 경영진 보고 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-6.1'
UNION ALL
SELECT e.id, 'ME-PSY-6.2', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '사고 보고 현황; 근본원인 분석 결과; 개선조치 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-6.2'
UNION ALL
SELECT e.id, 'ME-PSY-7.1', e.title, e.description, 'process', true, false, 'critical', ARRAY['psychiatric'], '손위생 수행률 현황; 감염감시 결과; 위원회 운영 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-7.1'
UNION ALL
SELECT e.id, 'ME-PSY-7.2', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '멸균 모니터링 결과; 세탁물 처리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-7.2'
UNION ALL
SELECT e.id, 'ME-PSY-7.3', e.title, e.description, 'process', true, false, 'minor', ARRAY['psychiatric'], '환경 청소 이행 기록; 소독 수행 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-7.3'
UNION ALL
SELECT e.id, 'ME-PSY-7.4', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '급식 위생 점검 결과; 식재료 검수 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-7.4'
UNION ALL
SELECT e.id, 'ME-PSY-8.1', e.title, e.description, 'structure', true, false, 'minor', ARRAY['psychiatric'], '위원회 운영 기록; 법적 요건 이행 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-8.1'
UNION ALL
SELECT e.id, 'ME-PSY-9.1', e.title, e.description, 'structure', true, false, 'major', ARRAY['psychiatric'], '면허 현황 목록; 자격 확인 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-9.1'
UNION ALL
SELECT e.id, 'ME-PSY-9.2', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '인권교육 이수 기록; 교육 계획 대비 이행 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-9.2'
UNION ALL
SELECT e.id, 'ME-PSY-9.3', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '건강 검진 이행 현황; 예방접종 기록; 직업적 노출 조치 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-9.3'
UNION ALL
SELECT e.id, 'ME-PSY-9.4', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '폭력 예방 교육 기록; 발생 현황 및 조치 기록; 사후 지원 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-9.4'
UNION ALL
SELECT e.id, 'ME-PSY-10.1', e.title, e.description, 'structure', true, false, 'minor', ARRAY['psychiatric'], '시설 점검 결과; 환경 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-10.1'
UNION ALL
SELECT e.id, 'ME-PSY-10.2', e.title, e.description, 'structure', true, false, 'major', ARRAY['psychiatric'], '설비 정기 점검 현황; 비상 대응 훈련 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-10.2'
UNION ALL
SELECT e.id, 'ME-PSY-10.3', e.title, e.description, 'structure', true, false, 'critical', ARRAY['psychiatric'], '보호실·상담실 시설 현황; 허가 서류', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-10.3'
UNION ALL
SELECT e.id, 'ME-PSY-10.4', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], 'MSDS 비치 현황; 의료폐기물 처리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-10.4'
UNION ALL
SELECT e.id, 'ME-PSY-10.5', e.title, e.description, 'process', true, false, 'minor', ARRAY['psychiatric'], '의료기기 등록 현황; 유지보수 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-10.5'
UNION ALL
SELECT e.id, 'ME-PSY-10.6', e.title, e.description, 'process', true, false, 'critical', ARRAY['psychiatric'], '소방 훈련 기록; 소방설비 점검 결과; 소방 교육 이수 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-10.6'
UNION ALL
SELECT e.id, 'ME-PSY-11.1', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '의무기록 접근 현황; 정보 보안 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-11.1'
UNION ALL
SELECT e.id, 'ME-PSY-11.2', e.title, e.description, 'process', true, false, 'major', ARRAY['psychiatric'], '의무기록 완결도 현황; 미완결 기록 조치 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-PSY-11.2';
