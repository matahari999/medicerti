-- ============================================================
-- 급성기/상급종합/종합/병원/치과/한방/재활 인증기준 공식 데이터 반영
-- 출처: lib/standardCatalog.ts (문서생성 기능에서 이미 사용 중인 실제 기준).
-- 인증 기준집 탐색 화면의 빈 껍데기 장(chapter)을 실제 기준/조사항목으로 채운다.
-- 조사항목은 기준 1개당 1개, 설명은 카탈로그 summary를 그대로 사용(세부 ME 미창작).
-- ============================================================

-- ==================== acute ====================
DELETE FROM accreditation_survey_items WHERE 'acute' = ANY(hospital_types);
DELETE FROM accreditation_categories WHERE entry_id IN (SELECT id FROM accreditation_entries WHERE 'acute' = ANY(hospital_types));
DELETE FROM accreditation_entries WHERE 'acute' = ANY(hospital_types);
DELETE FROM accreditation_chapters WHERE 'acute' = ANY(hospital_types);

INSERT INTO accreditation_chapters (area_id, code, title, hospital_types, sort_order)
SELECT a.id, 'CH-01-ACUTE', '1장. 환자안전보장활동', ARRAY['acute'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-02-ACUTE', '2장. 진료전달체계와 평가', ARRAY['acute'], 2
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-03-ACUTE', '3장. 환자진료', ARRAY['acute'], 3
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-04-ACUTE', '4장. 의약품관리', ARRAY['acute'], 4
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-05-ACUTE', '5장. 수술 및 마취진정관리', ARRAY['acute'], 5
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-06-ACUTE', '6장. 환자권리존중 및 보호', ARRAY['acute'], 6
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-07-ACUTE', '7장. 환자안전 및 의료 질 향상 활동', ARRAY['acute'], 7
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-08-ACUTE', '8장. 감염관리', ARRAY['acute'], 8
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-09-ACUTE', '9장. 경영 및 조직운영', ARRAY['acute'], 9
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-10-ACUTE', '10장. 인적자원관리', ARRAY['acute'], 10
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-11-ACUTE', '11장. 시설 및 환경관리', ARRAY['acute'], 11
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-12-ACUTE', '12장. 의료정보/의무기록 관리', ARRAY['acute'], 12
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-13-ACUTE', '13장. 성과관리', ARRAY['acute'], 13
FROM accreditation_areas a WHERE a.code = 'QS';

INSERT INTO accreditation_entries (chapter_id, code, title, description, hospital_types, sort_order)
SELECT c.id, 'STD-ACUTE-1.1', '정확한 환자 확인', '환자 확인 규정, 의약품 투여·수혈·검사·진료·처치·시술 전 정확한 환자 확인', ARRAY['acute'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-01-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-1.2', '의료진간 정확한 의사소통', '의료진 의사소통 규정, 구두처방·필요시처방(p.r.n) 관리·수행, 혼동 처방 대처', ARRAY['acute'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-01-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-1.3', '수술/시술의 정확한 수행', '환자확인·수술명·수술부위 확인 규정, 수술부위 표시(환자 참여), 수술/시술 전 확인, Sign-In, Time-Out 수행', ARRAY['acute'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-01-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-1.4', '낙상 예방활동', '낙상 예방 규정, 낙상 위험 평가(초기·상태변화 시 재평가), 고위험 예방활동, 낙상 발생 가능 장소 예방활동', ARRAY['acute'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-01-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-1.5', '손위생 수행', '손위생 수행 규정, 올바른 손위생 수행, 손위생 자원 지원', ARRAY['acute'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-01-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.1', '외래 및 응급환자 등록 절차', '외래환자 등록 절차 수립·이행, 응급환자 등록 절차 수립·이행', ARRAY['acute'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.2', '입원 절차', '입원 절차, 순서배정 입원 관리, 입원 지연 환자 관리, 입원 시 환자 정보 제공', ARRAY['acute'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.3', '중환자실·특수치료실 입실 절차', '중환자실 입실 절차, 입실 전 환자/보호자 설명, 입실 관리, 특수치료실 동일 적용', ARRAY['acute'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.4', '입원환자 진료 책임자 지정 및 상태변화 대응', '책임의사 지정·교대 시 정보공유 규정, 전과·전동 기록, 근무교대 정보공유, 상태변화 보고체계·신속대응체계', ARRAY['acute'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.5', '퇴원 및 전원 절차', '퇴원·전원 절차, 환자 참여 퇴원 결정, 퇴원요약지, 퇴원 정보·가정간호 정보 제공, 의뢰·전원서비스', ARRAY['acute'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.6', '외래환자 초기평가', '외래환자 초기평가 규정, 의뢰 환자 정보 확인, 의사 외래 초기평가·특수환자 초기평가 수행 기록', ARRAY['acute'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.7', '입원환자 초기평가/재평가', '입원환자 초기평가 규정, 의학적·간호·영양·특수환자 초기평가(24시간 이내), 의학적 재평가, 평가 기록 공유', ARRAY['acute'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.8', '응급환자 초기평가', '응급환자 초기평가 규정, 환자 분류·기록, 의학적·간호 초기평가 수행·기록, 평가 기록 공유', ARRAY['acute'], 8
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.9', '검체검사 운영과정 관리', '검체검사 운영 규정, 적격자 시행·판독, 검체 안전 획득·확인절차, 검체 보관, 정도관리, 외부 의뢰', ARRAY['acute'], 9
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.10', '검체검사 결과 보고 절차', '검체검사 결과보고 절차, 정확·신속 결과 보고, 이상결과 보고', ARRAY['acute'], 10
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.11', '검체검사실 안전관리 절차', '검체검사실 안전관리 절차·안전관리자, 직원 교육, 안전사고 보고체계 인지, 감염·위해요인 관리', ARRAY['acute'], 11
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.12', '혈액제제 관리', '안전한 혈액관리 절차, 혈액 위원회 운영, 적격 담당자, 혈액제제 안전 보관, 수혈 전 검사, 불출·반납·재고·폐기 관리', ARRAY['acute'], 12
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.13', '영상검사 운영과정 관리', '영상검사 운영 규정, 적격자 시행·판독, 상시 제공, 검사 전 준비·확인절차, 정도관리, 외부 의뢰', ARRAY['acute'], 13
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.14', '영상검사 결과 보고 절차', '영상검사 결과보고 절차, 정확·신속 결과 보고, 이상결과 보고, 결과 변경 시 즉시 보고', ARRAY['acute'], 14
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-2.15', '방사선 안전관리 절차', '방사선 안전관리 절차, 적격 담당자, 직원 교육, 안전사고 보고체계 인지, 방사선 안전관리 활동, 방사성물질 관리', ARRAY['acute'], 15
FROM accreditation_chapters c WHERE c.code = 'CH-02-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-3.1', '입원환자 치료계획', '의사 치료계획 수립·경과 기록·재수립, 간호사 간호과정 기록, 치료계획 공유·설명, 퇴원계획 수립', ARRAY['acute'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-03-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-3.2', '협의진료체계', '협의진료 규정, 협의진료 의뢰 및 회신', ARRAY['acute'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-03-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-3.3', '통증 관리', '통증관리 규정, 외래·입원환자 통증 초기평가, 통증 관리, 입원환자 상태변화 시 재평가', ARRAY['acute'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-03-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-3.4', '영양관리', '영양관리 규정, 치료목적 식사 제공, 치료식 설명, 영양 상담, 영양불량 위험환자 관리', ARRAY['acute'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-03-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-3.5', '영양집중지원서비스', '영양집중지원관리 규정, 팀 운영, 치료계획 수립, 서비스 제공, 환자 관리', ARRAY['acute'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-03-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-3.6', '욕창관리', '욕창 예방관리 규정, 입원 시 초기평가, 고위험 예방활동, 정기 재평가, 욕창 발생 시 관리', ARRAY['acute'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-03-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-3.7', '호스피스·완화의료', '호스피스·완화의료 규정, 정보 제공, 호스피스·완화의료팀 운영, 환자상태에 따른 치료계획·서비스 제공', ARRAY['acute'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-03-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-3.8', '중증응급환자 진료체계', '중증응급환자 진료 규정, 의료진 협력체계, Fast Track 운영, 이송서비스 규정·의약품·물품·의료기기 관리, 이송 적격자', ARRAY['acute'], 8
FROM accreditation_chapters c WHERE c.code = 'CH-03-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-3.9', '심폐소생술 관리', 'CPR 규정, CPR 팀 운영, 필요물품·의약품 관리, 제세동기 적시 사용', ARRAY['acute'], 9
FROM accreditation_chapters c WHERE c.code = 'CH-03-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-3.10', '수혈환자 관리', '안전한 수혈 규정, 혈액제제 관리·적절한 시간 수혈, 수혈 직전 혈액제제·환자 확인, 수혈 모니터링·부작용 대처', ARRAY['acute'], 10
FROM accreditation_chapters c WHERE c.code = 'CH-03-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-3.11', '항암화학요법', '항암화학요법 규정, 적격자, 환자 정보 제공, 조제 전 감사, 무균 조제, 안전 투여, 부작용 관찰·기록, 안전 폐기', ARRAY['acute'], 11
FROM accreditation_chapters c WHERE c.code = 'CH-03-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-3.12', '신체보호대 및 격리·강박', '신체보호대 사용 규정·적절한 사용, 격리·강박 규정·적절한 시행', ARRAY['acute'], 12
FROM accreditation_chapters c WHERE c.code = 'CH-03-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-4.1', '의약품관리체계', '의약품관리(약사)위원회 운영·사업계획 수행·결과 보고·공유, 항생제 사용 관리체계', ARRAY['acute'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-04-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-4.2', '의약품 구매선정', '의약품 선정·확보 규정, 의약품 선정, 정보 제공, 적절한 확보', ARRAY['acute'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-04-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-4.3', '의약품 보관', '의약품 보관 규정, 전체·응급·마약류·고위험·주의의약품 안전 보관, 정기 감사, 안전 회수', ARRAY['acute'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-04-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-4.4', '의약품 처방 및 조제', '처방·조제 규정, 적격자 처방·조제 전 감사·조제·조제 후 감사·라벨링·운반, 조제환경 관리, 주사용 의약품 감염 안전관리', ARRAY['acute'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-04-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-4.5', '의약품 투여 및 모니터링', '투여 규정, 적격 투여 자격, 투여 시 필요 정보 확인·기록, 고위험의약품 주의사항, 투약 설명, 안전 폐기, 지참약 관리', ARRAY['acute'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-04-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-4.6', '의약품 부작용 모니터링', '의약품 부작용 모니터링 규정, 모니터링·발생 시 보고, 보고결과 평가·관리, 결과 보고·공유', ARRAY['acute'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-04-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-5.1', '수술 계획', '수술 전 평가 기반 계획 수립, 수술 전 진단명 기록, 수술실 퇴실 전 수술 내용 기록, 수술 후 24시간 이내 치료계획·간호계획 수립', ARRAY['acute'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-05-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-5.2', '수술 중 환자안전 보장', '수술 시 환자안전 규정, 수술 전·후 피부상태 확인·기록, 수술계수(counts) 기록, 계수 불일치 대처, 조직표본검체 취급 기록', ARRAY['acute'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-05-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-5.3', '시술 계획, 시술 중 환자안전 보장', '시술 전 평가 기반 계획 수립, 진단명 기록, 시술 후 기록, 치료·간호계획, 시술 안전 규정, 피부상태 확인, 검체 취급 기록', ARRAY['acute'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-05-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-5.4', '진정치료', '진정치료 규정, 적격자, 진정 전 평가, 진정 중 모니터링·기록, 응급 대처, 모니터링 종료 기준 및 적격자 결정', ARRAY['acute'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-05-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-5.5', '마취진료', '마취진료 규정, 적격자, 마취 전 평가·계획 수립, 마취 유도 직전 평가·기록, 마취 중·마취 후 회복 중 모니터링·기록, 회복실 퇴실기준, 상시 마취서비스', ARRAY['acute'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-05-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-5.6', '수술장 안전 관리', '수술장 안전관리 규정, 구역 구분·관리, 공기질 관리, 복장·보호구 착용, 출입 제한·관리, 수술실 CCTV 운영', ARRAY['acute'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-05-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-6.1', '환자 권리 존중 및 안전 보장', '환자 권리·의무 규정, 직원 인지, 정보 제공, 진료 참여, 사생활·신체노출·개인정보 보호', ARRAY['acute'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-06-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-6.2', '취약환자 권리보호', '취약환자 권리보호 규정, 학대·폭력피해자 보고·지원, 신생아·소아 유괴예방, 의사소통 어려운 환자 지원, 장애환자 편의시설', ARRAY['acute'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-06-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-6.3', '불만 및 고충 관리', '불만·고충 관리 규정, 처리 절차 안내, 불만 처리, 지속적 관리, 결과 보고·공유', ARRAY['acute'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-06-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-6.4', '의료사회복지체계', '의료사회복지 체계, 직원 의뢰 절차 인지, 의료사회복지 서비스 제공, 지역사회 요구도 반영 서비스', ARRAY['acute'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-06-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-6.5', '동의서', '동의서 규정, 수술/시술 동의서, 마취/진정 동의서, 수혈 동의서, 고위험의약품 동의서, 조영제 동의서 취득', ARRAY['acute'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-06-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-6.6', '임상연구관리', '임상연구 관리 규정, 목록 관리, 적격자, 심의위원회 운영, 연구 정보 제공, 동의서 취득, 이상반응 보고, 기밀 보안', ARRAY['acute'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-06-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-6.7', '장기이식관리', '장기기증·이식 규정, 뇌사추정자 발생 시 신고절차, 정보 제공, 절차 수행, 장기기증 활성화 활동', ARRAY['acute'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-06-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-7.1', '환자안전·의료 질 향상 운영체계', '규정, 위원회 운영, 전담부서·적격자, 사업계획, 자원 지원', ARRAY['acute'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-07-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-7.2', '위험관리체계', '위험관리체계, 위험범주·유형·요인 확인, 위험 정도 평가·우선순위, 위험요인 분석·개선, 효과 모니터링, 결과 보고·공유', ARRAY['acute'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-07-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-7.3', '환자안전사고 관리', '환자안전사고 관리 절차, 직원 보고 인식, 분석, 개선활동, 결과 보고·공유, 적신호사건 환자·보호자 정보 제공, 주의경보 공유', ARRAY['acute'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-07-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-7.4', '질 향상 활동', '우선순위 고려 주제 선정, 활동방법 사용, 분석도구 활용, 성과 지속 관리, 결과 보고·공유', ARRAY['acute'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-07-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-7.5', '표준진료지침 개발 및 적용', '표준진료지침 규정, 지침에 따른 환자진료 수행, 활용성과 지속 관리, 결과 보고·공유', ARRAY['acute'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-07-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-8.1', '감염예방·관리체계', '감염 예방·관리 규정, 위원회 운영, 전담부서·적격자, 부서별 감염관리 규정', ARRAY['acute'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-08-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-8.2', '감염감시 및 개선활동', '감염발생 감시프로그램, 위험평가, 감시활동 계획·수행, 개선활동, 결과 보고·공유', ARRAY['acute'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-08-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-8.3', '감염예방·관리 교육', '감염관리 교육 계획, 직원·상시출입자 교육, 환자·보호자 교육·정보 제공', ARRAY['acute'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-08-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-8.4', '의료기구 감염관리', '의료기구 감염관리 규정, 호흡기 치료기구·유치도뇨관·혈관 내 카테터 관련 감염관리', ARRAY['acute'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-08-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-8.5', '세척·소독·멸균 및 세탁물 관리', '세척·소독·멸균 규정, 중앙공급실 운영, 세척·소독·멸균 수행, 멸균기·멸균물품 관리, 세탁물 규정·관리', ARRAY['acute'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-08-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-8.6', '환자치료영역 환경관리', '환경관리 규정, 청소·소독 수행, 환자치료영역 물 및 의료기관 내 음용수 관리', ARRAY['acute'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-08-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-8.7', '급식서비스 관리', '급식서비스 관리 규정, 식재료·조리기구·장비·조리장 환경 관리, 직원 개인위생', ARRAY['acute'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-08-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-8.8', '감염성질환 및 면역저하 환자관리', '감염성질환 관리 규정, 내성균 환자 관리, 유행성 감염병 외래 관리, 응급실 내원 감염성질환 관리, 전파경로별 환자 관리, 음압격리병실 관리, 보호격리', ARRAY['acute'], 8
FROM accreditation_chapters c WHERE c.code = 'CH-08-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-8.9', '유행성 감염병 대응체계', '유행성 감염병 대응 표준매뉴얼, 경보체계, 대응팀, 진료지원 체계, 대응체계 점검·재난훈련', ARRAY['acute'], 9
FROM accreditation_chapters c WHERE c.code = 'CH-08-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-9.1', '합리적인 의사결정', '의료기관 운영 규정, 의사결정조직·전달조직(회의체) 운영, 경영·관리 계획 수립·승인, 규정 승인 조직, 신진료행위 도입 조직, 위탁서비스 관리, 서비스 정보 제공', ARRAY['acute'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-09-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-9.2', '의료기관 운영방침', '미션·핵심가치 수립·이행 활동·공지, 직원 인지', ARRAY['acute'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-09-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-9.3', '부서운영', '부서 업무 정의, 부서 운영계획 수립·수행, 부서장 업무수행 평가', ARRAY['acute'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-09-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-9.4', '윤리위원회 운영', '진료 관련 윤리위원회 운영, 직원 윤리적 문제 관련 위원회 운영', ARRAY['acute'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-09-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-10.1', '인사관리체계', '인사관리 규정, 인력 요구도 확인, 인사계획, 직원 모집·배치, 직원만족도 향상 활동', ARRAY['acute'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-10-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-10.2', '의사(전문의) 진료권한 승인 및 평가', '의사 진료권한 승인·관리 규정, 개별 진료권한 정의서, 정기 검토·재설계, 정기 평가, 결과 보고 및 권한 반영', ARRAY['acute'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-10-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-10.3', '직원 자격 요건 및 직무 관리', '직원 자격·직무 관리 규정, 직무기술서 수립, 정기 검토·재설계, 직무능력 평가, 결과 인사관리 활용', ARRAY['acute'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-10-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-10.4', '인사정보 관리', '인사정보 관리체계, 의사·간호사·기타 인력 인사정보 관리', ARRAY['acute'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-10-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-10.5', '직원교육', '직원 교육체계, 요구도 확인·교육계획, 경영진 교육(시범), 신규직원 교육, 필수교육, 특성화 교육', ARRAY['acute'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-10-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-10.6', '보건의료인력 법적기준', '의사인력·응급실 전담의사·간호인력·응급실/중환자실 간호인력·기타 보건의료인력 법적 기준 준수', ARRAY['acute'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-10-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-10.7', '직원안전 관리활동', '직원 건강·안전 관리 규정·계획, 건강·안전 활동 수행, 안전사고 관리 규정·보고·관리·경영진 보고', ARRAY['acute'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-10-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-10.8', '폭력 예방 및 관리', '폭력 예방·관리체계, 예방·관리 활동, 직원·환자에게 폭력 상담·신고절차 안내', ARRAY['acute'], 8
FROM accreditation_chapters c WHERE c.code = 'CH-10-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-11.1', '시설 및 환경안전 관리', '시설·환경 안전 관리 규정·위원회·계획·책임자, 직원 교육, 안전사고 보고절차 인지·처리결과 보고, 시설·환경 안전 관리, 건물 건축·보수·철거 전 위험평가', ARRAY['acute'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-11-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-11.2', '설비시스템 관리', '설비시스템 관리 규정, 전기설비·급수설비·수질·의료가스·진공설비·실내공기질 안전 관리', ARRAY['acute'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-11-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-11.3', '위험물질 관리', '유해화학물질·의료폐기물 관리 절차, 유해화학물질·의료폐기물 안전 관리, 의료폐기물 감소 활동(시범)', ARRAY['acute'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-11-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-11.4', '보안 관리', '환자안전 보안체계, 보안사고 예방, 통제/제한구역 지정·모니터링, 보안사고 보고, 병문안객 관리', ARRAY['acute'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-11-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-11.5', '의료기기 관리', '의료기기 관리 체계, 심의위원회 운영, 적격 담당자, 목록 관리, 예방점검, 안전 회수, 오작동·사고 대처, 부작용 보고·조치, 고위험기기 결과 보고', ARRAY['acute'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-11-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-11.6', '화재안전 관리 활동', '화재안전 관리 규정·계획, 화재예방점검, 소방훈련, 소방안전 교육, 화재 대응체계 인지, 금연관리', ARRAY['acute'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-11-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-11.7', '재난관리체계', '재난관리체계 수립, 재난관리 수행, 모의훈련 수행·관리', ARRAY['acute'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-11-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-12.1', '의료정보/의무기록 관리', '의무기록 관리 규정·위원회·적격자, 정정관리, 접근권한 관리, 사본 발급, 대출·열람·반납, 금기약어·기호 관리, 보관', ARRAY['acute'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-12-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-12.2', '의무기록 완결', '의학적 초기평가·간호 초기평가·경과기록·간호기록·수술기록·시술기록·마취기록·동의서·전과기록·퇴원요약 작성, 표준 코드 사용', ARRAY['acute'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-12-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-12.3', '의료정보수집 및 활용', '자료와 정보의 수집·활용 규정, 환자진료·교육·연구·질 관리·경영관리·보건정책기관 정보 지원', ARRAY['acute'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-12-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-12.4', '개인정보보호 및 보안', '개인정보 보호·보안 규정, 적격 담당자, 개인정보 보안체계, 접근통제구역 출입 관리, 정보시스템 접근통제·접근권한 관리, 접속기록 보관', ARRAY['acute'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-12-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-13.1', '지표 관리', '지표관리 규정, 규정에 따른 지표 관리, 교육 지원, 결과 보고·공유', ARRAY['acute'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-13-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-13.2', '환자안전 영역 지표 관리', '환자 확인·수술/시술·낙상·손위생·욕창 관련 지표 관리', ARRAY['acute'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-13-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-13.3', '진료 영역 지표 관리', '구두처방·감염·환자평가·협의진료·CPR·진단/영상/병리검사·마취·진정·수혈·응급실·모성/신생아·사망률·의약품·의무기록 관련 지표 관리', ARRAY['acute'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-13-ACUTE'
UNION ALL
SELECT c.id, 'STD-ACUTE-13.4', '의료기관 관리 영역 지표 관리', '이용도·재무관리·인사관리·직원교육·직원안전·환자만족도 관련 지표 관리', ARRAY['acute'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-13-ACUTE';

INSERT INTO accreditation_survey_items (entry_id, code, title, description, sop_type, is_mandatory, is_pilot, severity, hospital_types, required_evidence, sort_order)
SELECT e.id, 'ME-ACUTE-1.1', '정확한 환자 확인', '환자 확인 규정, 의약품 투여·수혈·검사·진료·처치·시술 전 정확한 환자 확인', 'process', true, false, 'major', ARRAY['acute'], '환자 확인 오류 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-1.1'
UNION ALL
SELECT e.id, 'ME-ACUTE-1.2', '의료진간 정확한 의사소통', '의료진 의사소통 규정, 구두처방·필요시처방(p.r.n) 관리·수행, 혼동 처방 대처', 'process', true, false, 'major', ARRAY['acute'], '구두처방 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-1.2'
UNION ALL
SELECT e.id, 'ME-ACUTE-1.3', '수술/시술의 정확한 수행', '환자확인·수술명·수술부위 확인 규정, 수술부위 표시(환자 참여), 수술/시술 전 확인, Sign-In, Time-Out 수행', 'process', true, false, 'major', ARRAY['acute'], '수술 전 확인 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-1.3'
UNION ALL
SELECT e.id, 'ME-ACUTE-1.4', '낙상 예방활동', '낙상 예방 규정, 낙상 위험 평가(초기·상태변화 시 재평가), 고위험 예방활동, 낙상 발생 가능 장소 예방활동', 'process', true, false, 'major', ARRAY['acute'], '낙상 위험 평가 현황; 낙상 발생률', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-1.4'
UNION ALL
SELECT e.id, 'ME-ACUTE-1.5', '손위생 수행', '손위생 수행 규정, 올바른 손위생 수행, 손위생 자원 지원', 'process', true, false, 'major', ARRAY['acute'], '손위생 수행률 모니터링 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-1.5'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.1', '외래 및 응급환자 등록 절차', '외래환자 등록 절차 수립·이행, 응급환자 등록 절차 수립·이행', 'process', true, false, 'major', ARRAY['acute'], '외래·응급 등록 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.1'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.2', '입원 절차', '입원 절차, 순서배정 입원 관리, 입원 지연 환자 관리, 입원 시 환자 정보 제공', 'process', true, false, 'major', ARRAY['acute'], '입원 지연 관리 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.2'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.3', '중환자실·특수치료실 입실 절차', '중환자실 입실 절차, 입실 전 환자/보호자 설명, 입실 관리, 특수치료실 동일 적용', 'process', true, false, 'major', ARRAY['acute'], '중환자실 입실 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.3'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.4', '입원환자 진료 책임자 지정 및 상태변화 대응', '책임의사 지정·교대 시 정보공유 규정, 전과·전동 기록, 근무교대 정보공유, 상태변화 보고체계·신속대응체계', 'process', true, false, 'major', ARRAY['acute'], '전과·전동 기록 현황; 신속대응 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.4'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.5', '퇴원 및 전원 절차', '퇴원·전원 절차, 환자 참여 퇴원 결정, 퇴원요약지, 퇴원 정보·가정간호 정보 제공, 의뢰·전원서비스', 'process', true, false, 'major', ARRAY['acute'], '퇴원요약지 작성률; 전원 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.5'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.6', '외래환자 초기평가', '외래환자 초기평가 규정, 의뢰 환자 정보 확인, 의사 외래 초기평가·특수환자 초기평가 수행 기록', 'process', true, false, 'major', ARRAY['acute'], '외래 초기평가 기록 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.6'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.7', '입원환자 초기평가/재평가', '입원환자 초기평가 규정, 의학적·간호·영양·특수환자 초기평가(24시간 이내), 의학적 재평가, 평가 기록 공유', 'process', true, false, 'major', ARRAY['acute'], '초기평가 24시간 이내 이행률', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.7'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.8', '응급환자 초기평가', '응급환자 초기평가 규정, 환자 분류·기록, 의학적·간호 초기평가 수행·기록, 평가 기록 공유', 'process', true, false, 'major', ARRAY['acute'], '응급환자 초기평가 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.8'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.9', '검체검사 운영과정 관리', '검체검사 운영 규정, 적격자 시행·판독, 검체 안전 획득·확인절차, 검체 보관, 정도관리, 외부 의뢰', 'process', true, false, 'major', ARRAY['acute'], '검체검사 정도관리 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.9'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.10', '검체검사 결과 보고 절차', '검체검사 결과보고 절차, 정확·신속 결과 보고, 이상결과 보고', 'process', true, false, 'major', ARRAY['acute'], '이상결과 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.10'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.11', '검체검사실 안전관리 절차', '검체검사실 안전관리 절차·안전관리자, 직원 교육, 안전사고 보고체계 인지, 감염·위해요인 관리', 'process', true, false, 'major', ARRAY['acute'], '검사실 안전점검 결과; 직원 교육 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.11'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.12', '혈액제제 관리', '안전한 혈액관리 절차, 혈액 위원회 운영, 적격 담당자, 혈액제제 안전 보관, 수혈 전 검사, 불출·반납·재고·폐기 관리', 'process', true, false, 'major', ARRAY['acute'], '혈액제제 관리 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.12'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.13', '영상검사 운영과정 관리', '영상검사 운영 규정, 적격자 시행·판독, 상시 제공, 검사 전 준비·확인절차, 정도관리, 외부 의뢰', 'process', true, false, 'major', ARRAY['acute'], '영상검사 정도관리 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.13'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.14', '영상검사 결과 보고 절차', '영상검사 결과보고 절차, 정확·신속 결과 보고, 이상결과 보고, 결과 변경 시 즉시 보고', 'process', true, false, 'major', ARRAY['acute'], '이상결과 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.14'
UNION ALL
SELECT e.id, 'ME-ACUTE-2.15', '방사선 안전관리 절차', '방사선 안전관리 절차, 적격 담당자, 직원 교육, 안전사고 보고체계 인지, 방사선 안전관리 활동, 방사성물질 관리', 'process', true, false, 'major', ARRAY['acute'], '방사선 안전점검 결과; 직원 교육 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-2.15'
UNION ALL
SELECT e.id, 'ME-ACUTE-3.1', '입원환자 치료계획', '의사 치료계획 수립·경과 기록·재수립, 간호사 간호과정 기록, 치료계획 공유·설명, 퇴원계획 수립', 'process', true, false, 'major', ARRAY['acute'], '치료계획 수립 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-3.1'
UNION ALL
SELECT e.id, 'ME-ACUTE-3.2', '협의진료체계', '협의진료 규정, 협의진료 의뢰 및 회신', 'process', true, false, 'major', ARRAY['acute'], '협의진료 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-3.2'
UNION ALL
SELECT e.id, 'ME-ACUTE-3.3', '통증 관리', '통증관리 규정, 외래·입원환자 통증 초기평가, 통증 관리, 입원환자 상태변화 시 재평가', 'process', true, false, 'major', ARRAY['acute'], '통증 평가 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-3.3'
UNION ALL
SELECT e.id, 'ME-ACUTE-3.4', '영양관리', '영양관리 규정, 치료목적 식사 제공, 치료식 설명, 영양 상담, 영양불량 위험환자 관리', 'process', true, false, 'major', ARRAY['acute'], '영양 상담 제공 현황; 영양불량 위험환자 관리 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-3.4'
UNION ALL
SELECT e.id, 'ME-ACUTE-3.5', '영양집중지원서비스', '영양집중지원관리 규정, 팀 운영, 치료계획 수립, 서비스 제공, 환자 관리', 'process', true, false, 'major', ARRAY['acute'], '영양집중지원 팀 운영 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-3.5'
UNION ALL
SELECT e.id, 'ME-ACUTE-3.6', '욕창관리', '욕창 예방관리 규정, 입원 시 초기평가, 고위험 예방활동, 정기 재평가, 욕창 발생 시 관리', 'process', true, false, 'major', ARRAY['acute'], '욕창 위험 평가 기록; 욕창 발생률', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-3.6'
UNION ALL
SELECT e.id, 'ME-ACUTE-3.7', '호스피스·완화의료', '호스피스·완화의료 규정, 정보 제공, 호스피스·완화의료팀 운영, 환자상태에 따른 치료계획·서비스 제공', 'process', true, false, 'major', ARRAY['acute'], '호스피스·완화의료 제공 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-3.7'
UNION ALL
SELECT e.id, 'ME-ACUTE-3.8', '중증응급환자 진료체계', '중증응급환자 진료 규정, 의료진 협력체계, Fast Track 운영, 이송서비스 규정·의약품·물품·의료기기 관리, 이송 적격자', 'process', true, false, 'major', ARRAY['acute'], 'Fast Track 운영 현황; 이송서비스 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-3.8'
UNION ALL
SELECT e.id, 'ME-ACUTE-3.9', '심폐소생술 관리', 'CPR 규정, CPR 팀 운영, 필요물품·의약품 관리, 제세동기 적시 사용', 'process', true, false, 'major', ARRAY['acute'], 'CPR 시행 기록; 제세동기 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-3.9'
UNION ALL
SELECT e.id, 'ME-ACUTE-3.10', '수혈환자 관리', '안전한 수혈 규정, 혈액제제 관리·적절한 시간 수혈, 수혈 직전 혈액제제·환자 확인, 수혈 모니터링·부작용 대처', 'process', true, false, 'major', ARRAY['acute'], '수혈 현황; 수혈 부작용 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-3.10'
UNION ALL
SELECT e.id, 'ME-ACUTE-3.11', '항암화학요법', '항암화학요법 규정, 적격자, 환자 정보 제공, 조제 전 감사, 무균 조제, 안전 투여, 부작용 관찰·기록, 안전 폐기', 'process', true, false, 'major', ARRAY['acute'], '항암제 조제 감사 현황; 부작용 관찰 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-3.11'
UNION ALL
SELECT e.id, 'ME-ACUTE-3.12', '신체보호대 및 격리·강박', '신체보호대 사용 규정·적절한 사용, 격리·강박 규정·적절한 시행', 'process', true, false, 'major', ARRAY['acute'], '신체보호대 사용 현황; 격리·강박 사용 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-3.12'
UNION ALL
SELECT e.id, 'ME-ACUTE-4.1', '의약품관리체계', '의약품관리(약사)위원회 운영·사업계획 수행·결과 보고·공유, 항생제 사용 관리체계', 'process', true, false, 'major', ARRAY['acute'], '위원회 운영 현황; 항생제 사용 관리 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-4.1'
UNION ALL
SELECT e.id, 'ME-ACUTE-4.2', '의약품 구매선정', '의약품 선정·확보 규정, 의약품 선정, 정보 제공, 적절한 확보', 'process', true, false, 'major', ARRAY['acute'], '의약품 목록; 의약품 정보 제공 자료', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-4.2'
UNION ALL
SELECT e.id, 'ME-ACUTE-4.3', '의약품 보관', '의약품 보관 규정, 전체·응급·마약류·고위험·주의의약품 안전 보관, 정기 감사, 안전 회수', 'process', true, false, 'major', ARRAY['acute'], '의약품 보관 감사 결과; 마약류 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-4.3'
UNION ALL
SELECT e.id, 'ME-ACUTE-4.4', '의약품 처방 및 조제', '처방·조제 규정, 적격자 처방·조제 전 감사·조제·조제 후 감사·라벨링·운반, 조제환경 관리, 주사용 의약품 감염 안전관리', 'process', true, false, 'major', ARRAY['acute'], '처방·조제 오류 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-4.4'
UNION ALL
SELECT e.id, 'ME-ACUTE-4.5', '의약품 투여 및 모니터링', '투여 규정, 적격 투여 자격, 투여 시 필요 정보 확인·기록, 고위험의약품 주의사항, 투약 설명, 안전 폐기, 지참약 관리', 'process', true, false, 'major', ARRAY['acute'], '투약 오류 현황; 지참약 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-4.5'
UNION ALL
SELECT e.id, 'ME-ACUTE-4.6', '의약품 부작용 모니터링', '의약품 부작용 모니터링 규정, 모니터링·발생 시 보고, 보고결과 평가·관리, 결과 보고·공유', 'process', true, false, 'major', ARRAY['acute'], '의약품 부작용 보고 현황; 부작용 분석·개선 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-4.6'
UNION ALL
SELECT e.id, 'ME-ACUTE-5.1', '수술 계획', '수술 전 평가 기반 계획 수립, 수술 전 진단명 기록, 수술실 퇴실 전 수술 내용 기록, 수술 후 24시간 이내 치료계획·간호계획 수립', 'process', true, false, 'major', ARRAY['acute'], '수술기록 작성 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-5.1'
UNION ALL
SELECT e.id, 'ME-ACUTE-5.2', '수술 중 환자안전 보장', '수술 시 환자안전 규정, 수술 전·후 피부상태 확인·기록, 수술계수(counts) 기록, 계수 불일치 대처, 조직표본검체 취급 기록', 'process', true, false, 'major', ARRAY['acute'], '수술계수 이행 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-5.2'
UNION ALL
SELECT e.id, 'ME-ACUTE-5.3', '시술 계획, 시술 중 환자안전 보장', '시술 전 평가 기반 계획 수립, 진단명 기록, 시술 후 기록, 치료·간호계획, 시술 안전 규정, 피부상태 확인, 검체 취급 기록', 'process', true, false, 'major', ARRAY['acute'], '시술기록 작성 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-5.3'
UNION ALL
SELECT e.id, 'ME-ACUTE-5.4', '진정치료', '진정치료 규정, 적격자, 진정 전 평가, 진정 중 모니터링·기록, 응급 대처, 모니터링 종료 기준 및 적격자 결정', 'process', true, false, 'major', ARRAY['acute'], '진정치료 시행 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-5.4'
UNION ALL
SELECT e.id, 'ME-ACUTE-5.5', '마취진료', '마취진료 규정, 적격자, 마취 전 평가·계획 수립, 마취 유도 직전 평가·기록, 마취 중·마취 후 회복 중 모니터링·기록, 회복실 퇴실기준, 상시 마취서비스', 'process', true, false, 'major', ARRAY['acute'], '마취 전 평가 현황; 마취 시행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-5.5'
UNION ALL
SELECT e.id, 'ME-ACUTE-5.6', '수술장 안전 관리', '수술장 안전관리 규정, 구역 구분·관리, 공기질 관리, 복장·보호구 착용, 출입 제한·관리, 수술실 CCTV 운영', 'process', true, false, 'major', ARRAY['acute'], '수술장 환경 점검 결과; 공기질 검사 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-5.6'
UNION ALL
SELECT e.id, 'ME-ACUTE-6.1', '환자 권리 존중 및 안전 보장', '환자 권리·의무 규정, 직원 인지, 정보 제공, 진료 참여, 사생활·신체노출·개인정보 보호', 'process', true, false, 'major', ARRAY['acute'], '환자 권리 교육 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-6.1'
UNION ALL
SELECT e.id, 'ME-ACUTE-6.2', '취약환자 권리보호', '취약환자 권리보호 규정, 학대·폭력피해자 보고·지원, 신생아·소아 유괴예방, 의사소통 어려운 환자 지원, 장애환자 편의시설', 'process', true, false, 'major', ARRAY['acute'], '취약환자 지원 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-6.2'
UNION ALL
SELECT e.id, 'ME-ACUTE-6.3', '불만 및 고충 관리', '불만·고충 관리 규정, 처리 절차 안내, 불만 처리, 지속적 관리, 결과 보고·공유', 'process', true, false, 'major', ARRAY['acute'], '불만·고충 처리 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-6.3'
UNION ALL
SELECT e.id, 'ME-ACUTE-6.4', '의료사회복지체계', '의료사회복지 체계, 직원 의뢰 절차 인지, 의료사회복지 서비스 제공, 지역사회 요구도 반영 서비스', 'process', true, false, 'major', ARRAY['acute'], '사회복지 서비스 제공 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-6.4'
UNION ALL
SELECT e.id, 'ME-ACUTE-6.5', '동의서', '동의서 규정, 수술/시술 동의서, 마취/진정 동의서, 수혈 동의서, 고위험의약품 동의서, 조영제 동의서 취득', 'process', true, false, 'major', ARRAY['acute'], '동의서 취득 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-6.5'
UNION ALL
SELECT e.id, 'ME-ACUTE-6.6', '임상연구관리', '임상연구 관리 규정, 목록 관리, 적격자, 심의위원회 운영, 연구 정보 제공, 동의서 취득, 이상반응 보고, 기밀 보안', 'process', true, false, 'major', ARRAY['acute'], '임상연구 목록; 심의위원회 운영 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-6.6'
UNION ALL
SELECT e.id, 'ME-ACUTE-6.7', '장기이식관리', '장기기증·이식 규정, 뇌사추정자 발생 시 신고절차, 정보 제공, 절차 수행, 장기기증 활성화 활동', 'process', true, false, 'major', ARRAY['acute'], '장기기증 신고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-6.7'
UNION ALL
SELECT e.id, 'ME-ACUTE-7.1', '환자안전·의료 질 향상 운영체계', '규정, 위원회 운영, 전담부서·적격자, 사업계획, 자원 지원', 'process', true, false, 'major', ARRAY['acute'], '위원회 운영 현황; 사업계획 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-7.1'
UNION ALL
SELECT e.id, 'ME-ACUTE-7.2', '위험관리체계', '위험관리체계, 위험범주·유형·요인 확인, 위험 정도 평가·우선순위, 위험요인 분석·개선, 효과 모니터링, 결과 보고·공유', 'process', true, false, 'major', ARRAY['acute'], '위험관리 활동 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-7.2'
UNION ALL
SELECT e.id, 'ME-ACUTE-7.3', '환자안전사고 관리', '환자안전사고 관리 절차, 직원 보고 인식, 분석, 개선활동, 결과 보고·공유, 적신호사건 환자·보호자 정보 제공, 주의경보 공유', 'process', true, false, 'major', ARRAY['acute'], '환자안전사고 보고 현황; 개선활동 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-7.3'
UNION ALL
SELECT e.id, 'ME-ACUTE-7.4', '질 향상 활동', '우선순위 고려 주제 선정, 활동방법 사용, 분석도구 활용, 성과 지속 관리, 결과 보고·공유', 'process', true, false, 'major', ARRAY['acute'], 'QI 활동 주제 및 결과; 성과 개선 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-7.4'
UNION ALL
SELECT e.id, 'ME-ACUTE-7.5', '표준진료지침 개발 및 적용', '표준진료지침 규정, 지침에 따른 환자진료 수행, 활용성과 지속 관리, 결과 보고·공유', 'process', true, false, 'major', ARRAY['acute'], '표준진료지침 활용성과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-7.5'
UNION ALL
SELECT e.id, 'ME-ACUTE-8.1', '감염예방·관리체계', '감염 예방·관리 규정, 위원회 운영, 전담부서·적격자, 부서별 감염관리 규정', 'process', true, false, 'major', ARRAY['acute'], '감염관리 위원회 운영 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-8.1'
UNION ALL
SELECT e.id, 'ME-ACUTE-8.2', '감염감시 및 개선활동', '감염발생 감시프로그램, 위험평가, 감시활동 계획·수행, 개선활동, 결과 보고·공유', 'process', true, false, 'major', ARRAY['acute'], '감염발생 감시활동 결과; 개선활동 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-8.2'
UNION ALL
SELECT e.id, 'ME-ACUTE-8.3', '감염예방·관리 교육', '감염관리 교육 계획, 직원·상시출입자 교육, 환자·보호자 교육·정보 제공', 'process', true, false, 'major', ARRAY['acute'], '감염관리 교육 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-8.3'
UNION ALL
SELECT e.id, 'ME-ACUTE-8.4', '의료기구 감염관리', '의료기구 감염관리 규정, 호흡기 치료기구·유치도뇨관·혈관 내 카테터 관련 감염관리', 'process', true, false, 'major', ARRAY['acute'], '기구 관련 감염 발생률', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-8.4'
UNION ALL
SELECT e.id, 'ME-ACUTE-8.5', '세척·소독·멸균 및 세탁물 관리', '세척·소독·멸균 규정, 중앙공급실 운영, 세척·소독·멸균 수행, 멸균기·멸균물품 관리, 세탁물 규정·관리', 'process', true, false, 'major', ARRAY['acute'], '멸균기 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-8.5'
UNION ALL
SELECT e.id, 'ME-ACUTE-8.6', '환자치료영역 환경관리', '환경관리 규정, 청소·소독 수행, 환자치료영역 물 및 의료기관 내 음용수 관리', 'process', true, false, 'major', ARRAY['acute'], '환경관리 점검 결과; 음용수 수질 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-8.6'
UNION ALL
SELECT e.id, 'ME-ACUTE-8.7', '급식서비스 관리', '급식서비스 관리 규정, 식재료·조리기구·장비·조리장 환경 관리, 직원 개인위생', 'process', true, false, 'major', ARRAY['acute'], '급식 위생 점검 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-8.7'
UNION ALL
SELECT e.id, 'ME-ACUTE-8.8', '감염성질환 및 면역저하 환자관리', '감염성질환 관리 규정, 내성균 환자 관리, 유행성 감염병 외래 관리, 응급실 내원 감염성질환 관리, 전파경로별 환자 관리, 음압격리병실 관리, 보호격리', 'process', true, false, 'major', ARRAY['acute'], '감염병 관리 현황; 음압격리 운영 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-8.8'
UNION ALL
SELECT e.id, 'ME-ACUTE-8.9', '유행성 감염병 대응체계', '유행성 감염병 대응 표준매뉴얼, 경보체계, 대응팀, 진료지원 체계, 대응체계 점검·재난훈련', 'process', true, false, 'major', ARRAY['acute'], '대응체계 점검 결과; 재난훈련 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-8.9'
UNION ALL
SELECT e.id, 'ME-ACUTE-9.1', '합리적인 의사결정', '의료기관 운영 규정, 의사결정조직·전달조직(회의체) 운영, 경영·관리 계획 수립·승인, 규정 승인 조직, 신진료행위 도입 조직, 위탁서비스 관리, 서비스 정보 제공', 'process', true, false, 'major', ARRAY['acute'], '운영 회의체 현황; 위탁서비스 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-9.1'
UNION ALL
SELECT e.id, 'ME-ACUTE-9.2', '의료기관 운영방침', '미션·핵심가치 수립·이행 활동·공지, 직원 인지', 'process', true, false, 'major', ARRAY['acute'], '미션 공지 현황; 이행 활동 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-9.2'
UNION ALL
SELECT e.id, 'ME-ACUTE-9.3', '부서운영', '부서 업무 정의, 부서 운영계획 수립·수행, 부서장 업무수행 평가', 'process', true, false, 'major', ARRAY['acute'], '부서 운영계획 이행 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-9.3'
UNION ALL
SELECT e.id, 'ME-ACUTE-9.4', '윤리위원회 운영', '진료 관련 윤리위원회 운영, 직원 윤리적 문제 관련 위원회 운영', 'process', true, false, 'major', ARRAY['acute'], '윤리위원회 운영 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-9.4'
UNION ALL
SELECT e.id, 'ME-ACUTE-10.1', '인사관리체계', '인사관리 규정, 인력 요구도 확인, 인사계획, 직원 모집·배치, 직원만족도 향상 활동', 'process', true, false, 'major', ARRAY['acute'], '인사계획 이행 현황; 직원만족도 조사 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-10.1'
UNION ALL
SELECT e.id, 'ME-ACUTE-10.2', '의사(전문의) 진료권한 승인 및 평가', '의사 진료권한 승인·관리 규정, 개별 진료권한 정의서, 정기 검토·재설계, 정기 평가, 결과 보고 및 권한 반영', 'process', true, false, 'major', ARRAY['acute'], '진료권한 평가 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-10.2'
UNION ALL
SELECT e.id, 'ME-ACUTE-10.3', '직원 자격 요건 및 직무 관리', '직원 자격·직무 관리 규정, 직무기술서 수립, 정기 검토·재설계, 직무능력 평가, 결과 인사관리 활용', 'process', true, false, 'major', ARRAY['acute'], '직무기술서 현황; 직무능력 평가 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-10.3'
UNION ALL
SELECT e.id, 'ME-ACUTE-10.4', '인사정보 관리', '인사정보 관리체계, 의사·간호사·기타 인력 인사정보 관리', 'process', true, false, 'major', ARRAY['acute'], '직종별 인력 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-10.4'
UNION ALL
SELECT e.id, 'ME-ACUTE-10.5', '직원교육', '직원 교육체계, 요구도 확인·교육계획, 경영진 교육(시범), 신규직원 교육, 필수교육, 특성화 교육', 'process', true, false, 'major', ARRAY['acute'], '교육 이수 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-10.5'
UNION ALL
SELECT e.id, 'ME-ACUTE-10.6', '보건의료인력 법적기준', '의사인력·응급실 전담의사·간호인력·응급실/중환자실 간호인력·기타 보건의료인력 법적 기준 준수', 'process', true, false, 'critical', ARRAY['acute'], '직종별 인력 현황 및 법적 기준 준수 증빙', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-10.6'
UNION ALL
SELECT e.id, 'ME-ACUTE-10.7', '직원안전 관리활동', '직원 건강·안전 관리 규정·계획, 건강·안전 활동 수행, 안전사고 관리 규정·보고·관리·경영진 보고', 'process', true, false, 'major', ARRAY['acute'], '직원 건강검진 현황; 직원 안전사고 처리 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-10.7'
UNION ALL
SELECT e.id, 'ME-ACUTE-10.8', '폭력 예방 및 관리', '폭력 예방·관리체계, 예방·관리 활동, 직원·환자에게 폭력 상담·신고절차 안내', 'process', true, false, 'major', ARRAY['acute'], '폭력 예방 활동 결과; 폭력 신고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-10.8'
UNION ALL
SELECT e.id, 'ME-ACUTE-11.1', '시설 및 환경안전 관리', '시설·환경 안전 관리 규정·위원회·계획·책임자, 직원 교육, 안전사고 보고절차 인지·처리결과 보고, 시설·환경 안전 관리, 건물 건축·보수·철거 전 위험평가', 'process', true, false, 'major', ARRAY['acute'], '시설·환경 안전점검 결과; 시설환경안전위원회 운영 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-11.1'
UNION ALL
SELECT e.id, 'ME-ACUTE-11.2', '설비시스템 관리', '설비시스템 관리 규정, 전기설비·급수설비·수질·의료가스·진공설비·실내공기질 안전 관리', 'process', true, false, 'major', ARRAY['acute'], '전기·의료가스 점검 결과; 수질·공기질 검사 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-11.2'
UNION ALL
SELECT e.id, 'ME-ACUTE-11.3', '위험물질 관리', '유해화학물질·의료폐기물 관리 절차, 유해화학물질·의료폐기물 안전 관리, 의료폐기물 감소 활동(시범)', 'process', true, false, 'major', ARRAY['acute'], '유해화학물질 관리 현황; 의료폐기물 처리 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-11.3'
UNION ALL
SELECT e.id, 'ME-ACUTE-11.4', '보안 관리', '환자안전 보안체계, 보안사고 예방, 통제/제한구역 지정·모니터링, 보안사고 보고, 병문안객 관리', 'process', true, false, 'major', ARRAY['acute'], '보안사고 현황; 병문안 관리 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-11.4'
UNION ALL
SELECT e.id, 'ME-ACUTE-11.5', '의료기기 관리', '의료기기 관리 체계, 심의위원회 운영, 적격 담당자, 목록 관리, 예방점검, 안전 회수, 오작동·사고 대처, 부작용 보고·조치, 고위험기기 결과 보고', 'process', true, false, 'major', ARRAY['acute'], '의료기기 목록; 예방점검 결과; 부작용 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-11.5'
UNION ALL
SELECT e.id, 'ME-ACUTE-11.6', '화재안전 관리 활동', '화재안전 관리 규정·계획, 화재예방점검, 소방훈련, 소방안전 교육, 화재 대응체계 인지, 금연관리', 'process', true, false, 'major', ARRAY['acute'], '화재예방점검 결과; 소방훈련 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-11.6'
UNION ALL
SELECT e.id, 'ME-ACUTE-11.7', '재난관리체계', '재난관리체계 수립, 재난관리 수행, 모의훈련 수행·관리', 'process', true, false, 'major', ARRAY['acute'], '재난관리 현황; 모의훈련 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-11.7'
UNION ALL
SELECT e.id, 'ME-ACUTE-12.1', '의료정보/의무기록 관리', '의무기록 관리 규정·위원회·적격자, 정정관리, 접근권한 관리, 사본 발급, 대출·열람·반납, 금기약어·기호 관리, 보관', 'process', true, false, 'major', ARRAY['acute'], '의무기록 접근통제 현황; 의무기록 보관 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-12.1'
UNION ALL
SELECT e.id, 'ME-ACUTE-12.2', '의무기록 완결', '의학적 초기평가·간호 초기평가·경과기록·간호기록·수술기록·시술기록·마취기록·동의서·전과기록·퇴원요약 작성, 표준 코드 사용', 'process', true, false, 'major', ARRAY['acute'], '의무기록 완결률; 퇴원요약지 완결률', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-12.2'
UNION ALL
SELECT e.id, 'ME-ACUTE-12.3', '의료정보수집 및 활용', '자료와 정보의 수집·활용 규정, 환자진료·교육·연구·질 관리·경영관리·보건정책기관 정보 지원', 'process', true, false, 'major', ARRAY['acute'], '의료정보 제공 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-12.3'
UNION ALL
SELECT e.id, 'ME-ACUTE-12.4', '개인정보보호 및 보안', '개인정보 보호·보안 규정, 적격 담당자, 개인정보 보안체계, 접근통제구역 출입 관리, 정보시스템 접근통제·접근권한 관리, 접속기록 보관', 'process', true, false, 'major', ARRAY['acute'], '정보시스템 접근통제 현황; 접속기록 보관 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-12.4'
UNION ALL
SELECT e.id, 'ME-ACUTE-13.1', '지표 관리', '지표관리 규정, 규정에 따른 지표 관리, 교육 지원, 결과 보고·공유', 'process', true, false, 'major', ARRAY['acute'], '지표 관리 현황; 지표 교육 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-13.1'
UNION ALL
SELECT e.id, 'ME-ACUTE-13.2', '환자안전 영역 지표 관리', '환자 확인·수술/시술·낙상·손위생·욕창 관련 지표 관리', 'process', true, false, 'major', ARRAY['acute'], '환자확인 지표; 낙상 지표; 손위생 지표; 욕창 지표; 수술/시술 지표', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-13.2'
UNION ALL
SELECT e.id, 'ME-ACUTE-13.3', '진료 영역 지표 관리', '구두처방·감염·환자평가·협의진료·CPR·진단/영상/병리검사·마취·진정·수혈·응급실·모성/신생아·사망률·의약품·의무기록 관련 지표 관리', 'process', true, false, 'major', ARRAY['acute'], '진료 지표 모니터링 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-13.3'
UNION ALL
SELECT e.id, 'ME-ACUTE-13.4', '의료기관 관리 영역 지표 관리', '이용도·재무관리·인사관리·직원교육·직원안전·환자만족도 관련 지표 관리', 'process', true, false, 'major', ARRAY['acute'], '환자만족도 조사 결과; 직원안전 지표', 1
FROM accreditation_entries e WHERE e.code = 'STD-ACUTE-13.4';

-- ==================== tertiary ====================
DELETE FROM accreditation_survey_items WHERE 'tertiary' = ANY(hospital_types);
DELETE FROM accreditation_categories WHERE entry_id IN (SELECT id FROM accreditation_entries WHERE 'tertiary' = ANY(hospital_types));
DELETE FROM accreditation_entries WHERE 'tertiary' = ANY(hospital_types);
DELETE FROM accreditation_chapters WHERE 'tertiary' = ANY(hospital_types);

INSERT INTO accreditation_chapters (area_id, code, title, hospital_types, sort_order)
SELECT a.id, 'CH-01-TERTIARY', '1장. 환자안전보장활동', ARRAY['tertiary'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-02-TERTIARY', '2장. 진료전달체계와 평가', ARRAY['tertiary'], 2
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-03-TERTIARY', '3장. 전문진료 및 중증질환 관리', ARRAY['tertiary'], 3
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-04-TERTIARY', '4장. 의약품관리', ARRAY['tertiary'], 4
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-05-TERTIARY', '5장. 환자권리 존중 및 보호', ARRAY['tertiary'], 5
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-06-TERTIARY', '6장. 질 향상 및 환자안전 활동', ARRAY['tertiary'], 6
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-07-TERTIARY', '7장. 감염관리', ARRAY['tertiary'], 7
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-08-TERTIARY', '8장. 경영 및 조직운영', ARRAY['tertiary'], 8
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-09-TERTIARY', '9장. 인적자원관리', ARRAY['tertiary'], 9
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-10-TERTIARY', '10장. 시설 및 환경관리', ARRAY['tertiary'], 10
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-11-TERTIARY', '11장. 의료정보 및 의무기록 관리', ARRAY['tertiary'], 11
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-12-TERTIARY', '12장. 성과관리 및 지속 개선', ARRAY['tertiary'], 12
FROM accreditation_areas a WHERE a.code = 'QS';

INSERT INTO accreditation_entries (chapter_id, code, title, description, hospital_types, sort_order)
SELECT c.id, 'STD-TERTIARY-1.1', '환자를 정확하게 확인한다', '두 가지 이상 식별자를 이용한 환자 확인, 고위험 시술 전 Time-out 수행', ARRAY['tertiary'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-01-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-1.2', '의료진 간 정확한 의사소통', 'SBAR 기반 의사소통, 구두처방·필요시처방(p.r.n) 관리, 인수인계 표준화', ARRAY['tertiary'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-01-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-1.3', '수술·시술 전 안전 확인(Time-out)', '수술·침습 시술 전 환자·부위·술기 정확성 확인 프로세스 운영', ARRAY['tertiary'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-01-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-1.4', '낙상 예방활동', '낙상 위험 평가·고위험 예방·재평가·모니터링, 중환자·수술 후 환자 특화 관리', ARRAY['tertiary'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-01-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-1.5', '손위생 수행', '손위생 수행 규정 수립·이행률 모니터링·자원 제공, ICU·수술실 집중 관리', ARRAY['tertiary'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-01-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-1.6', '신속대응팀(RRT) 운영', '환자 상태 급변 조기 인식·신속대응팀 출동·처치 체계 운영', ARRAY['tertiary'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-01-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-2.1', '외래·응급환자 등록 및 중증도 분류', '외래·응급 등록, 중증도 분류(KTAS) 및 우선순위 진료 체계 운영', ARRAY['tertiary'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-02-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-2.2', '입원 절차 및 병상 배정 관리', '입원 수속, 중증질환·희귀난치질환 우선 입원 절차 운영', ARRAY['tertiary'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-02-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-2.3', '중환자실(ICU) 입실·퇴실 기준 관리', 'ICU·NICU·CICU 입퇴실 기준, 집중 모니터링 및 의료진 배치 기준', ARRAY['tertiary'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-02-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-2.4', '입원환자 초기평가·재평가 및 다학제 진료', '다학제팀(MDT) 구성·진료 계획 수립·시행, 복잡 만성질환 통합 케어', ARRAY['tertiary'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-02-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-2.5', '퇴원·전원·지역사회 연계 관리', '퇴원 계획, 전원 안전, 지역 연계 의료기관 협력 네트워크 운영', ARRAY['tertiary'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-02-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-2.6', '검사실 및 영상검사 운영관리', '검체·영상검사 운영, 위험값(Critical Value) 보고 체계, 방사선 안전', ARRAY['tertiary'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-02-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-3.1', '중증·희귀난치질환 진료 체계', '중증질환(암·심뇌혈관·외상 등) 전문 진료 경로 및 희귀난치질환 진단·치료 체계 운영', ARRAY['tertiary'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-03-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-3.2', '수술·마취·진정 안전 관리', '수술 계획 수립, 마취 전 평가, 진정치료 안전 프로토콜 운영', ARRAY['tertiary'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-03-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-3.3', '장기이식 관리', '장기기증·이식 동의, 이식 대기자 관리, 이식 후 추적 관리 체계', ARRAY['tertiary'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-03-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-3.4', '항암화학요법·방사선치료 안전 관리', '항암제 처방·조제·투여 안전, 방사선치료 계획 및 부작용 모니터링', ARRAY['tertiary'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-03-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-3.5', '통증·완화의료·호스피스 서비스', '통증 평가·관리, 말기환자 완화의료·호스피스 연계 서비스 제공', ARRAY['tertiary'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-03-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-4.1', '의약품관리체계 및 고위험의약품 관리', '의약품 선정·보관·처방·조제·투여·모니터링 전주기 관리, 고위험의약품 이중 확인', ARRAY['tertiary'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-04-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-4.2', '임상약사 서비스 운영', '입원환자 약물 검토, 중재 기록, 부작용 보고 및 약물 상담 서비스', ARRAY['tertiary'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-04-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-4.3', '혈액제제 안전 관리', '혈액형 검사·교차시험·수혈 전 확인·수혈 반응 모니터링', ARRAY['tertiary'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-04-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-5.1', '환자 권리 보호 및 불만 처리', '환자 권리 선언, 취약환자 보호, 고충 처리 절차 운영', ARRAY['tertiary'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-05-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-5.2', '동의서 관리', '수술·검사·시술·임상연구 등 동의서 취득 절차 및 보관', ARRAY['tertiary'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-05-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-5.3', '임상연구(IRB) 안전 수행', '임상시험심사위원회(IRB) 운영, 연구 대상자 보호, 이상반응 보고', ARRAY['tertiary'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-05-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-5.4', '의료사회복지 서비스', '경제적·심리적·사회적 취약 환자 지원 및 지역사회 자원 연계', ARRAY['tertiary'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-05-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-6.1', '환자안전·의료 질 향상 운영체계', '질 향상위원회 운영, 성과지표 선정·모니터링·개선활동', ARRAY['tertiary'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-06-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-6.2', '환자안전사고 보고 및 분석', '환자안전사고 자발적 보고·분석·개선, 적신호 사건 근본원인분석(RCA)', ARRAY['tertiary'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-06-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-6.3', '표준진료지침(CP) 개발 및 적용', '주요 질환별 임상경로(CP) 개발·적용·평가·개정', ARRAY['tertiary'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-06-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-7.1', '감염예방·관리 체계 및 프로그램 운영', '감염관리위원회·감염관리실 운영, 연간 감염관리 프로그램 수립·시행', ARRAY['tertiary'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-07-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-7.2', '의료관련감염(HAI) 감시 및 관리', 'HAI 발생 감시, VAP·CAUTI·CLABSI·수술부위 감염 예방 번들 적용', ARRAY['tertiary'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-07-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-7.3', '멸균·소독 및 격리 관리', '의료기구 세척·소독·멸균 체계, 격리 주의 유형별 절차 운영', ARRAY['tertiary'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-07-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-7.4', '다제내성균(MDRO) 관리', 'MRSA·VRE·CRE 등 MDRO 환자 감시·격리·전파 예방 관리', ARRAY['tertiary'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-07-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-8.1', '경영진 리더십 및 의료기관 목표 관리', '병원 비전·목표 설정, 경영위원회 운영, 성과 모니터링', ARRAY['tertiary'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-08-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-8.2', '전공의 교육 및 수련 관리', '전공의 교육 프로그램 운영, 수련 환경 관리, 수련 평가', ARRAY['tertiary'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-08-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-8.3', '의료기관 윤리위원회 운영', '임상 윤리 자문, 연명의료 결정, 환자·가족 윤리 상담 운영', ARRAY['tertiary'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-08-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-9.1', '직원 채용·자격 확인 및 배치', '면허·자격 검증, 직종별 배치 기준, 수습 기간 평가', ARRAY['tertiary'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-09-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-9.2', '직원 교육·훈련 및 역량 평가', '신규·정기 교육 계획 수립, 법정 의무 교육, 역량 평가 시행', ARRAY['tertiary'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-09-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-9.3', '직원 안전·보건 관리', '의료종사자 직업성 노출(혈액·방사선·감염 등) 관리, 근무 환경 안전', ARRAY['tertiary'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-09-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-9.4', '전문간호사·전문의 자격 관리', '전문간호사·세부전문의 자격 유지, 지속 교육 이수 관리', ARRAY['tertiary'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-09-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-10.1', '의료기기·의료장비 관리', '의료기기 등록·점검·유지보수·폐기 주기 관리, 생명유지장치 우선 점검', ARRAY['tertiary'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-10-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-10.2', '의료폐기물 및 환경오염물 관리', '의료폐기물 분리·보관·수거·처리 절차, 환경 오염 예방', ARRAY['tertiary'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-10-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-10.3', '화재 안전 및 비상 대응', '화재 예방·대피 훈련, 재해 대응 계획(BCP), 비상 전력 관리', ARRAY['tertiary'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-10-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-10.4', '방사선 특수 환경 안전 관리', '방사선 구역 관리, 납 차폐 점검, 방사선 종사자 피폭 모니터링', ARRAY['tertiary'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-10-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-11.1', '의무기록 작성·보완·보존', '의무기록 적시 작성, 미완성 기록 관리, 법정 보존 기간 준수', ARRAY['tertiary'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-11-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-11.2', '의료정보 보안 및 개인정보 보호', '전자의무기록(EMR) 접근 권한 관리, 개인정보 암호화, 침해사고 대응', ARRAY['tertiary'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-11-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-12.1', '핵심 성과지표(KPI) 관리', '병원급 KPI 선정·수집·분석·개선활동, 대내외 벤치마킹', ARRAY['tertiary'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-12-TERTIARY'
UNION ALL
SELECT c.id, 'STD-TERTIARY-12.2', '환자경험 조사 및 개선', '입원·외래 환자경험 조사 수행, 결과 분석 및 개선 계획 수립', ARRAY['tertiary'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-12-TERTIARY';

INSERT INTO accreditation_survey_items (entry_id, code, title, description, sop_type, is_mandatory, is_pilot, severity, hospital_types, required_evidence, sort_order)
SELECT e.id, 'ME-TERTIARY-1.1', '환자를 정확하게 확인한다', '두 가지 이상 식별자를 이용한 환자 확인, 고위험 시술 전 Time-out 수행', 'process', true, false, 'major', ARRAY['tertiary'], '오류 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-1.1'
UNION ALL
SELECT e.id, 'ME-TERTIARY-1.2', '의료진 간 정확한 의사소통', 'SBAR 기반 의사소통, 구두처방·필요시처방(p.r.n) 관리, 인수인계 표준화', 'process', true, false, 'major', ARRAY['tertiary'], '구두처방 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-1.2'
UNION ALL
SELECT e.id, 'ME-TERTIARY-1.3', '수술·시술 전 안전 확인(Time-out)', '수술·침습 시술 전 환자·부위·술기 정확성 확인 프로세스 운영', 'process', true, false, 'major', ARRAY['tertiary'], '수술 안전 확인 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-1.3'
UNION ALL
SELECT e.id, 'ME-TERTIARY-1.4', '낙상 예방활동', '낙상 위험 평가·고위험 예방·재평가·모니터링, 중환자·수술 후 환자 특화 관리', 'process', true, false, 'major', ARRAY['tertiary'], '낙상 발생률 모니터링', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-1.4'
UNION ALL
SELECT e.id, 'ME-TERTIARY-1.5', '손위생 수행', '손위생 수행 규정 수립·이행률 모니터링·자원 제공, ICU·수술실 집중 관리', 'process', true, false, 'major', ARRAY['tertiary'], '손위생 수행률 추이', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-1.5'
UNION ALL
SELECT e.id, 'ME-TERTIARY-1.6', '신속대응팀(RRT) 운영', '환자 상태 급변 조기 인식·신속대응팀 출동·처치 체계 운영', 'process', true, false, 'major', ARRAY['tertiary'], 'RRT 출동 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-1.6'
UNION ALL
SELECT e.id, 'ME-TERTIARY-2.1', '외래·응급환자 등록 및 중증도 분류', '외래·응급 등록, 중증도 분류(KTAS) 및 우선순위 진료 체계 운영', 'process', true, false, 'major', ARRAY['tertiary'], 'KTAS 분류 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-2.1'
UNION ALL
SELECT e.id, 'ME-TERTIARY-2.2', '입원 절차 및 병상 배정 관리', '입원 수속, 중증질환·희귀난치질환 우선 입원 절차 운영', 'process', true, false, 'major', ARRAY['tertiary'], '입원 현황 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-2.2'
UNION ALL
SELECT e.id, 'ME-TERTIARY-2.3', '중환자실(ICU) 입실·퇴실 기준 관리', 'ICU·NICU·CICU 입퇴실 기준, 집중 모니터링 및 의료진 배치 기준', 'process', true, false, 'major', ARRAY['tertiary'], 'ICU 입퇴실 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-2.3'
UNION ALL
SELECT e.id, 'ME-TERTIARY-2.4', '입원환자 초기평가·재평가 및 다학제 진료', '다학제팀(MDT) 구성·진료 계획 수립·시행, 복잡 만성질환 통합 케어', 'process', true, false, 'major', ARRAY['tertiary'], '다학제 진료 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-2.4'
UNION ALL
SELECT e.id, 'ME-TERTIARY-2.5', '퇴원·전원·지역사회 연계 관리', '퇴원 계획, 전원 안전, 지역 연계 의료기관 협력 네트워크 운영', 'process', true, false, 'major', ARRAY['tertiary'], '전원 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-2.5'
UNION ALL
SELECT e.id, 'ME-TERTIARY-2.6', '검사실 및 영상검사 운영관리', '검체·영상검사 운영, 위험값(Critical Value) 보고 체계, 방사선 안전', 'process', true, false, 'major', ARRAY['tertiary'], '위험값 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-2.6'
UNION ALL
SELECT e.id, 'ME-TERTIARY-3.1', '중증·희귀난치질환 진료 체계', '중증질환(암·심뇌혈관·외상 등) 전문 진료 경로 및 희귀난치질환 진단·치료 체계 운영', 'process', true, false, 'major', ARRAY['tertiary'], '중증질환 진료 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-3.1'
UNION ALL
SELECT e.id, 'ME-TERTIARY-3.2', '수술·마취·진정 안전 관리', '수술 계획 수립, 마취 전 평가, 진정치료 안전 프로토콜 운영', 'process', true, false, 'major', ARRAY['tertiary'], '수술 결과 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-3.2'
UNION ALL
SELECT e.id, 'ME-TERTIARY-3.3', '장기이식 관리', '장기기증·이식 동의, 이식 대기자 관리, 이식 후 추적 관리 체계', 'process', true, false, 'critical', ARRAY['tertiary'], '이식 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-3.3'
UNION ALL
SELECT e.id, 'ME-TERTIARY-3.4', '항암화학요법·방사선치료 안전 관리', '항암제 처방·조제·투여 안전, 방사선치료 계획 및 부작용 모니터링', 'process', true, false, 'major', ARRAY['tertiary'], '항암 투여 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-3.4'
UNION ALL
SELECT e.id, 'ME-TERTIARY-3.5', '통증·완화의료·호스피스 서비스', '통증 평가·관리, 말기환자 완화의료·호스피스 연계 서비스 제공', 'process', true, false, 'major', ARRAY['tertiary'], '통증 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-3.5'
UNION ALL
SELECT e.id, 'ME-TERTIARY-4.1', '의약품관리체계 및 고위험의약품 관리', '의약품 선정·보관·처방·조제·투여·모니터링 전주기 관리, 고위험의약품 이중 확인', 'process', true, false, 'major', ARRAY['tertiary'], '고위험의약품 투여 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-4.1'
UNION ALL
SELECT e.id, 'ME-TERTIARY-4.2', '임상약사 서비스 운영', '입원환자 약물 검토, 중재 기록, 부작용 보고 및 약물 상담 서비스', 'process', true, false, 'major', ARRAY['tertiary'], '약물 중재 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-4.2'
UNION ALL
SELECT e.id, 'ME-TERTIARY-4.3', '혈액제제 안전 관리', '혈액형 검사·교차시험·수혈 전 확인·수혈 반응 모니터링', 'process', true, false, 'major', ARRAY['tertiary'], '수혈 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-4.3'
UNION ALL
SELECT e.id, 'ME-TERTIARY-5.1', '환자 권리 보호 및 불만 처리', '환자 권리 선언, 취약환자 보호, 고충 처리 절차 운영', 'process', true, false, 'major', ARRAY['tertiary'], '고충 처리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-5.1'
UNION ALL
SELECT e.id, 'ME-TERTIARY-5.2', '동의서 관리', '수술·검사·시술·임상연구 등 동의서 취득 절차 및 보관', 'process', true, false, 'major', ARRAY['tertiary'], '동의서 보관 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-5.2'
UNION ALL
SELECT e.id, 'ME-TERTIARY-5.3', '임상연구(IRB) 안전 수행', '임상시험심사위원회(IRB) 운영, 연구 대상자 보호, 이상반응 보고', 'process', true, false, 'critical', ARRAY['tertiary'], 'IRB 심의 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-5.3'
UNION ALL
SELECT e.id, 'ME-TERTIARY-5.4', '의료사회복지 서비스', '경제적·심리적·사회적 취약 환자 지원 및 지역사회 자원 연계', 'process', true, false, 'major', ARRAY['tertiary'], '사회복지 지원 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-5.4'
UNION ALL
SELECT e.id, 'ME-TERTIARY-6.1', '환자안전·의료 질 향상 운영체계', '질 향상위원회 운영, 성과지표 선정·모니터링·개선활동', 'process', true, false, 'major', ARRAY['tertiary'], '질 향상 활동 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-6.1'
UNION ALL
SELECT e.id, 'ME-TERTIARY-6.2', '환자안전사고 보고 및 분석', '환자안전사고 자발적 보고·분석·개선, 적신호 사건 근본원인분석(RCA)', 'process', true, false, 'major', ARRAY['tertiary'], '안전사고 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-6.2'
UNION ALL
SELECT e.id, 'ME-TERTIARY-6.3', '표준진료지침(CP) 개발 및 적용', '주요 질환별 임상경로(CP) 개발·적용·평가·개정', 'process', true, false, 'major', ARRAY['tertiary'], 'CP 이행률', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-6.3'
UNION ALL
SELECT e.id, 'ME-TERTIARY-7.1', '감염예방·관리 체계 및 프로그램 운영', '감염관리위원회·감염관리실 운영, 연간 감염관리 프로그램 수립·시행', 'process', true, false, 'major', ARRAY['tertiary'], '감염관리 회의 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-7.1'
UNION ALL
SELECT e.id, 'ME-TERTIARY-7.2', '의료관련감염(HAI) 감시 및 관리', 'HAI 발생 감시, VAP·CAUTI·CLABSI·수술부위 감염 예방 번들 적용', 'process', true, false, 'major', ARRAY['tertiary'], '감염률 모니터링 자료', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-7.2'
UNION ALL
SELECT e.id, 'ME-TERTIARY-7.3', '멸균·소독 및 격리 관리', '의료기구 세척·소독·멸균 체계, 격리 주의 유형별 절차 운영', 'process', true, false, 'major', ARRAY['tertiary'], '멸균 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-7.3'
UNION ALL
SELECT e.id, 'ME-TERTIARY-7.4', '다제내성균(MDRO) 관리', 'MRSA·VRE·CRE 등 MDRO 환자 감시·격리·전파 예방 관리', 'process', true, false, 'major', ARRAY['tertiary'], 'MDRO 발생 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-7.4'
UNION ALL
SELECT e.id, 'ME-TERTIARY-8.1', '경영진 리더십 및 의료기관 목표 관리', '병원 비전·목표 설정, 경영위원회 운영, 성과 모니터링', 'process', true, false, 'major', ARRAY['tertiary'], '경영 실적 보고', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-8.1'
UNION ALL
SELECT e.id, 'ME-TERTIARY-8.2', '전공의 교육 및 수련 관리', '전공의 교육 프로그램 운영, 수련 환경 관리, 수련 평가', 'process', true, false, 'critical', ARRAY['tertiary'], '수련 평가 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-8.2'
UNION ALL
SELECT e.id, 'ME-TERTIARY-8.3', '의료기관 윤리위원회 운영', '임상 윤리 자문, 연명의료 결정, 환자·가족 윤리 상담 운영', 'process', true, false, 'major', ARRAY['tertiary'], '윤리 자문 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-8.3'
UNION ALL
SELECT e.id, 'ME-TERTIARY-9.1', '직원 채용·자격 확인 및 배치', '면허·자격 검증, 직종별 배치 기준, 수습 기간 평가', 'process', true, false, 'major', ARRAY['tertiary'], '직원 면허 관리 대장', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-9.1'
UNION ALL
SELECT e.id, 'ME-TERTIARY-9.2', '직원 교육·훈련 및 역량 평가', '신규·정기 교육 계획 수립, 법정 의무 교육, 역량 평가 시행', 'process', true, false, 'major', ARRAY['tertiary'], '교육 실적 대장', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-9.2'
UNION ALL
SELECT e.id, 'ME-TERTIARY-9.3', '직원 안전·보건 관리', '의료종사자 직업성 노출(혈액·방사선·감염 등) 관리, 근무 환경 안전', 'process', true, false, 'major', ARRAY['tertiary'], '직원 건강 검진 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-9.3'
UNION ALL
SELECT e.id, 'ME-TERTIARY-9.4', '전문간호사·전문의 자격 관리', '전문간호사·세부전문의 자격 유지, 지속 교육 이수 관리', 'process', true, false, 'major', ARRAY['tertiary'], '자격 보유 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-9.4'
UNION ALL
SELECT e.id, 'ME-TERTIARY-10.1', '의료기기·의료장비 관리', '의료기기 등록·점검·유지보수·폐기 주기 관리, 생명유지장치 우선 점검', 'process', true, false, 'major', ARRAY['tertiary'], '점검 이력', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-10.1'
UNION ALL
SELECT e.id, 'ME-TERTIARY-10.2', '의료폐기물 및 환경오염물 관리', '의료폐기물 분리·보관·수거·처리 절차, 환경 오염 예방', 'process', true, false, 'major', ARRAY['tertiary'], '폐기물 처리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-10.2'
UNION ALL
SELECT e.id, 'ME-TERTIARY-10.3', '화재 안전 및 비상 대응', '화재 예방·대피 훈련, 재해 대응 계획(BCP), 비상 전력 관리', 'process', true, false, 'major', ARRAY['tertiary'], '훈련 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-10.3'
UNION ALL
SELECT e.id, 'ME-TERTIARY-10.4', '방사선 특수 환경 안전 관리', '방사선 구역 관리, 납 차폐 점검, 방사선 종사자 피폭 모니터링', 'process', true, false, 'major', ARRAY['tertiary'], '방사선 피폭 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-10.4'
UNION ALL
SELECT e.id, 'ME-TERTIARY-11.1', '의무기록 작성·보완·보존', '의무기록 적시 작성, 미완성 기록 관리, 법정 보존 기간 준수', 'process', true, false, 'major', ARRAY['tertiary'], '미완성 기록 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-11.1'
UNION ALL
SELECT e.id, 'ME-TERTIARY-11.2', '의료정보 보안 및 개인정보 보호', '전자의무기록(EMR) 접근 권한 관리, 개인정보 암호화, 침해사고 대응', 'process', true, false, 'major', ARRAY['tertiary'], '접근 권한 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-11.2'
UNION ALL
SELECT e.id, 'ME-TERTIARY-12.1', '핵심 성과지표(KPI) 관리', '병원급 KPI 선정·수집·분석·개선활동, 대내외 벤치마킹', 'process', true, false, 'major', ARRAY['tertiary'], 'KPI 추이 데이터', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-12.1'
UNION ALL
SELECT e.id, 'ME-TERTIARY-12.2', '환자경험 조사 및 개선', '입원·외래 환자경험 조사 수행, 결과 분석 및 개선 계획 수립', 'process', true, false, 'major', ARRAY['tertiary'], '환자경험 조사 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-TERTIARY-12.2';

-- ==================== general ====================
DELETE FROM accreditation_survey_items WHERE 'general' = ANY(hospital_types);
DELETE FROM accreditation_categories WHERE entry_id IN (SELECT id FROM accreditation_entries WHERE 'general' = ANY(hospital_types));
DELETE FROM accreditation_entries WHERE 'general' = ANY(hospital_types);
DELETE FROM accreditation_chapters WHERE 'general' = ANY(hospital_types);

INSERT INTO accreditation_chapters (area_id, code, title, hospital_types, sort_order)
SELECT a.id, 'CH-01-GENERAL', '1장. 환자안전보장활동', ARRAY['general'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-02-GENERAL', '2장. 진료전달체계와 평가', ARRAY['general'], 2
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-03-GENERAL', '3장. 환자진료', ARRAY['general'], 3
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-04-GENERAL', '4장. 의약품관리', ARRAY['general'], 4
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-05-GENERAL', '5장. 환자권리 존중 및 보호', ARRAY['general'], 5
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-06-GENERAL', '6장. 질 향상 및 환자안전 활동', ARRAY['general'], 6
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-07-GENERAL', '7장. 감염관리', ARRAY['general'], 7
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-08-GENERAL', '8장. 경영 및 조직운영', ARRAY['general'], 8
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-09-GENERAL', '9장. 인적자원관리', ARRAY['general'], 9
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-10-GENERAL', '10장. 시설 및 환경관리', ARRAY['general'], 10
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-11-GENERAL', '11장. 의료정보 및 의무기록 관리', ARRAY['general'], 11
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-12-GENERAL', '12장. 성과관리', ARRAY['general'], 12
FROM accreditation_areas a WHERE a.code = 'QS';

INSERT INTO accreditation_entries (chapter_id, code, title, description, hospital_types, sort_order)
SELECT c.id, 'STD-GENERAL-1.1', '환자를 정확하게 확인한다', '두 가지 이상 식별자 사용, 투약·수혈·검사 전 환자 확인 절차', ARRAY['general'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-01-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-1.2', '의료진 의사소통 관리', '구두처방·전화처방 확인 절차, 인수인계 표준화', ARRAY['general'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-01-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-1.3', '낙상 예방활동', '낙상 위험 평가 도구 적용, 고위험군 예방 프로그램 운영', ARRAY['general'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-01-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-1.4', '손위생 수행', '손위생 규정, 이행률 모니터링, 소독제 등 지원 자원 관리', ARRAY['general'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-01-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-1.5', '수술·시술 안전 확인', '수술 전 Time-out, 수술 부위 표시 절차 운영', ARRAY['general'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-01-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-2.1', '외래·응급환자 등록 및 진료 절차', '외래·응급 등록, 중증도 분류(KTAS) 체계 운영', ARRAY['general'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-02-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-2.2', '입원 절차 및 환자 배정', '입원 수속, 과별 환자 배정, 입원 안내 서비스 제공', ARRAY['general'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-02-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-2.3', '입원환자 초기평가 및 재평가', '입원 24시간 내 초기평가, 상태 변화 시 재평가, 진료계획 수립', ARRAY['general'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-02-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-2.4', '협의진료 및 과간 연계', '다과 협의진료 요청·회신 절차, 진료 연속성 보장', ARRAY['general'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-02-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-2.5', '퇴원 및 전원 관리', '퇴원 계획, 전원 안전, 환자 교육 및 지역사회 연계', ARRAY['general'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-02-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-2.6', '검사·영상 서비스 운영', '검체·영상검사 운영, 위험값 보고, 방사선 안전 관리', ARRAY['general'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-02-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-3.1', '치료계획 수립 및 이행', '환자별 치료 계획 수립, 다과 참여, 계획 대비 이행 모니터링', ARRAY['general'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-03-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-3.2', '수술·마취·진정 안전 관리', '수술 계획, 마취 전 평가, 수술 동의서 취득, 회복실 관리', ARRAY['general'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-03-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-3.3', '통증 관리', '입원·외래 통증 평가 체계, 다학제 통증 관리 운영', ARRAY['general'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-03-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-3.4', '욕창 예방 및 관리', '입원 시 욕창 위험 평가, 예방 조치, 발생 시 치료 계획', ARRAY['general'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-03-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-3.5', '영양 지원 및 관리', '영양 스크리닝, 영양집중지원(NST) 서비스, 경장·정맥 영양 관리', ARRAY['general'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-03-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-3.6', '응급 및 심폐소생술(CPR) 관리', '응급 대응 체계, CPR 교육, 비상 약품 및 장비 관리', ARRAY['general'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-03-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-4.1', '의약품관리체계 및 고위험의약품', '의약품 전주기(선정·보관·처방·조제·투여·모니터링) 관리, 고위험의약품 이중 확인', ARRAY['general'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-04-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-4.2', '의약품 처방·조제·투여 안전', '처방 검토, 조제 오류 예방, 투여 전 5 Rights 확인', ARRAY['general'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-04-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-4.3', '혈액제제 및 수혈 안전 관리', '수혈 전 검사, 교차시험, 수혈 이상반응 모니터링', ARRAY['general'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-04-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-5.1', '환자 권리 보호 및 고충 처리', '환자 권리 고지, 고충 접수·처리·피드백 체계 운영', ARRAY['general'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-05-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-5.2', '취약환자(노인·장애·외국인) 보호', '취약 환자 식별·맞춤 서비스·안전 보호 체계 운영', ARRAY['general'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-05-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-5.3', '동의서 취득 관리', '수술·검사·치료 전 동의서 취득, 설명 의무 이행', ARRAY['general'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-05-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-6.1', '질 향상 운영체계', '질향상위원회 운영, 성과지표 선정·모니터링·개선활동 수행', ARRAY['general'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-06-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-6.2', '환자안전사고 보고 및 분석', '자발적 보고 문화 조성, 사고 분석·개선 활동', ARRAY['general'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-06-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-6.3', '표준진료지침(CP) 운영', '주요 질환 임상경로 개발·적용·평가', ARRAY['general'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-06-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-7.1', '감염관리 체계 운영', '감염관리위원회·전담 인력 운영, 연간 계획 수립·시행', ARRAY['general'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-07-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-7.2', '의료관련감염(HAI) 감시·예방', 'HAI 발생 감시·보고, 예방 번들(손위생·격리 등) 적용', ARRAY['general'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-07-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-7.3', '의료기구·기기 세척·소독·멸균', '기구별 소독·멸균 방법 관리, 유효기간·추적 관리', ARRAY['general'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-07-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-7.4', '직원 감염 예방·관리', '의료종사자 혈액·체액 노출 관리, 예방 접종, 감염 교육', ARRAY['general'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-07-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-8.1', '경영진 리더십 및 조직 운영', '병원 비전·목표 수립, 부서별 성과 관리, 위원회 운영', ARRAY['general'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-08-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-8.2', '의료기관 안전 계획(재난·화재)', '화재·재난 대비 계획 수립, 대피 훈련, 비상 연락망 관리', ARRAY['general'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-08-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-9.1', '직원 채용 및 자격 관리', '면허·자격 검증, 적정 인력 배치, 정기 자격 갱신 관리', ARRAY['general'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-09-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-9.2', '직원 교육·훈련 체계', '신규·정기 교육 계획, 법정 의무교육, 부서별 직무 교육', ARRAY['general'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-09-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-9.3', '직원 건강·안전 관리', '직업성 노출(혈액·방사선 등) 관리, 근무 환경 위험 평가', ARRAY['general'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-09-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-10.1', '의료기기·의료장비 점검 및 유지', '의료기기 등록·정기 점검·교정·폐기 관리', ARRAY['general'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-10-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-10.2', '의료폐기물 관리', '의료폐기물 분리·보관·위탁 처리 절차 준수', ARRAY['general'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-10-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-10.3', '화재·재난 안전 관리', '소방 시설 점검, 화재 대피 훈련, 비상 전력 관리', ARRAY['general'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-10-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-11.1', '의무기록 작성·보완·보존 관리', '의무기록 완결도 관리, 법정 보존 기간 준수, 미완성 기록 관리', ARRAY['general'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-11-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-11.2', '의료정보 보안 및 개인정보 보호', 'EMR 접근 권한 관리, 개인정보 보호, 정보보안 교육', ARRAY['general'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-11-GENERAL'
UNION ALL
SELECT c.id, 'STD-GENERAL-12.1', '환자안전·질 향상 성과지표 관리', '핵심 성과지표(낙상·감염·재입원율 등) 수집·분석·개선', ARRAY['general'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-12-GENERAL';

INSERT INTO accreditation_survey_items (entry_id, code, title, description, sop_type, is_mandatory, is_pilot, severity, hospital_types, required_evidence, sort_order)
SELECT e.id, 'ME-GENERAL-1.1', '환자를 정확하게 확인한다', '두 가지 이상 식별자 사용, 투약·수혈·검사 전 환자 확인 절차', 'process', true, false, 'major', ARRAY['general'], '오류 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-1.1'
UNION ALL
SELECT e.id, 'ME-GENERAL-1.2', '의료진 의사소통 관리', '구두처방·전화처방 확인 절차, 인수인계 표준화', 'process', true, false, 'major', ARRAY['general'], '구두처방 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-1.2'
UNION ALL
SELECT e.id, 'ME-GENERAL-1.3', '낙상 예방활동', '낙상 위험 평가 도구 적용, 고위험군 예방 프로그램 운영', 'process', true, false, 'major', ARRAY['general'], '낙상 발생률', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-1.3'
UNION ALL
SELECT e.id, 'ME-GENERAL-1.4', '손위생 수행', '손위생 규정, 이행률 모니터링, 소독제 등 지원 자원 관리', 'process', true, false, 'major', ARRAY['general'], '손위생 수행률', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-1.4'
UNION ALL
SELECT e.id, 'ME-GENERAL-1.5', '수술·시술 안전 확인', '수술 전 Time-out, 수술 부위 표시 절차 운영', 'process', true, false, 'major', ARRAY['general'], '수술 안전 확인 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-1.5'
UNION ALL
SELECT e.id, 'ME-GENERAL-2.1', '외래·응급환자 등록 및 진료 절차', '외래·응급 등록, 중증도 분류(KTAS) 체계 운영', 'process', true, false, 'major', ARRAY['general'], '응급환자 분류 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-2.1'
UNION ALL
SELECT e.id, 'ME-GENERAL-2.2', '입원 절차 및 환자 배정', '입원 수속, 과별 환자 배정, 입원 안내 서비스 제공', 'process', true, false, 'major', ARRAY['general'], '입원 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-2.2'
UNION ALL
SELECT e.id, 'ME-GENERAL-2.3', '입원환자 초기평가 및 재평가', '입원 24시간 내 초기평가, 상태 변화 시 재평가, 진료계획 수립', 'process', true, false, 'major', ARRAY['general'], '초기평가 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-2.3'
UNION ALL
SELECT e.id, 'ME-GENERAL-2.4', '협의진료 및 과간 연계', '다과 협의진료 요청·회신 절차, 진료 연속성 보장', 'process', true, false, 'major', ARRAY['general'], '협의진료 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-2.4'
UNION ALL
SELECT e.id, 'ME-GENERAL-2.5', '퇴원 및 전원 관리', '퇴원 계획, 전원 안전, 환자 교육 및 지역사회 연계', 'process', true, false, 'major', ARRAY['general'], '전원 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-2.5'
UNION ALL
SELECT e.id, 'ME-GENERAL-2.6', '검사·영상 서비스 운영', '검체·영상검사 운영, 위험값 보고, 방사선 안전 관리', 'process', true, false, 'major', ARRAY['general'], '위험값 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-2.6'
UNION ALL
SELECT e.id, 'ME-GENERAL-3.1', '치료계획 수립 및 이행', '환자별 치료 계획 수립, 다과 참여, 계획 대비 이행 모니터링', 'process', true, false, 'major', ARRAY['general'], '치료계획 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-3.1'
UNION ALL
SELECT e.id, 'ME-GENERAL-3.2', '수술·마취·진정 안전 관리', '수술 계획, 마취 전 평가, 수술 동의서 취득, 회복실 관리', 'process', true, false, 'major', ARRAY['general'], '수술 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-3.2'
UNION ALL
SELECT e.id, 'ME-GENERAL-3.3', '통증 관리', '입원·외래 통증 평가 체계, 다학제 통증 관리 운영', 'process', true, false, 'major', ARRAY['general'], '통증 평가 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-3.3'
UNION ALL
SELECT e.id, 'ME-GENERAL-3.4', '욕창 예방 및 관리', '입원 시 욕창 위험 평가, 예방 조치, 발생 시 치료 계획', 'process', true, false, 'major', ARRAY['general'], '욕창 발생률', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-3.4'
UNION ALL
SELECT e.id, 'ME-GENERAL-3.5', '영양 지원 및 관리', '영양 스크리닝, 영양집중지원(NST) 서비스, 경장·정맥 영양 관리', 'process', true, false, 'major', ARRAY['general'], '영양 평가 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-3.5'
UNION ALL
SELECT e.id, 'ME-GENERAL-3.6', '응급 및 심폐소생술(CPR) 관리', '응급 대응 체계, CPR 교육, 비상 약품 및 장비 관리', 'process', true, false, 'major', ARRAY['general'], 'CPR 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-3.6'
UNION ALL
SELECT e.id, 'ME-GENERAL-4.1', '의약품관리체계 및 고위험의약품', '의약품 전주기(선정·보관·처방·조제·투여·모니터링) 관리, 고위험의약품 이중 확인', 'process', true, false, 'major', ARRAY['general'], '투약 오류 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-4.1'
UNION ALL
SELECT e.id, 'ME-GENERAL-4.2', '의약품 처방·조제·투여 안전', '처방 검토, 조제 오류 예방, 투여 전 5 Rights 확인', 'process', true, false, 'major', ARRAY['general'], '처방·조제 오류 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-4.2'
UNION ALL
SELECT e.id, 'ME-GENERAL-4.3', '혈액제제 및 수혈 안전 관리', '수혈 전 검사, 교차시험, 수혈 이상반응 모니터링', 'process', true, false, 'major', ARRAY['general'], '수혈 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-4.3'
UNION ALL
SELECT e.id, 'ME-GENERAL-5.1', '환자 권리 보호 및 고충 처리', '환자 권리 고지, 고충 접수·처리·피드백 체계 운영', 'process', true, false, 'major', ARRAY['general'], '고충 처리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-5.1'
UNION ALL
SELECT e.id, 'ME-GENERAL-5.2', '취약환자(노인·장애·외국인) 보호', '취약 환자 식별·맞춤 서비스·안전 보호 체계 운영', 'process', true, false, 'major', ARRAY['general'], '취약환자 서비스 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-5.2'
UNION ALL
SELECT e.id, 'ME-GENERAL-5.3', '동의서 취득 관리', '수술·검사·치료 전 동의서 취득, 설명 의무 이행', 'process', true, false, 'major', ARRAY['general'], '동의서 보관 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-5.3'
UNION ALL
SELECT e.id, 'ME-GENERAL-6.1', '질 향상 운영체계', '질향상위원회 운영, 성과지표 선정·모니터링·개선활동 수행', 'process', true, false, 'major', ARRAY['general'], '질 향상 활동 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-6.1'
UNION ALL
SELECT e.id, 'ME-GENERAL-6.2', '환자안전사고 보고 및 분석', '자발적 보고 문화 조성, 사고 분석·개선 활동', 'process', true, false, 'major', ARRAY['general'], '사고 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-6.2'
UNION ALL
SELECT e.id, 'ME-GENERAL-6.3', '표준진료지침(CP) 운영', '주요 질환 임상경로 개발·적용·평가', 'process', true, false, 'major', ARRAY['general'], 'CP 이행률', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-6.3'
UNION ALL
SELECT e.id, 'ME-GENERAL-7.1', '감염관리 체계 운영', '감염관리위원회·전담 인력 운영, 연간 계획 수립·시행', 'process', true, false, 'major', ARRAY['general'], '감염관리 회의 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-7.1'
UNION ALL
SELECT e.id, 'ME-GENERAL-7.2', '의료관련감염(HAI) 감시·예방', 'HAI 발생 감시·보고, 예방 번들(손위생·격리 등) 적용', 'process', true, false, 'major', ARRAY['general'], '감염률 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-7.2'
UNION ALL
SELECT e.id, 'ME-GENERAL-7.3', '의료기구·기기 세척·소독·멸균', '기구별 소독·멸균 방법 관리, 유효기간·추적 관리', 'process', true, false, 'major', ARRAY['general'], '멸균 이력', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-7.3'
UNION ALL
SELECT e.id, 'ME-GENERAL-7.4', '직원 감염 예방·관리', '의료종사자 혈액·체액 노출 관리, 예방 접종, 감염 교육', 'process', true, false, 'major', ARRAY['general'], '예방 접종 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-7.4'
UNION ALL
SELECT e.id, 'ME-GENERAL-8.1', '경영진 리더십 및 조직 운영', '병원 비전·목표 수립, 부서별 성과 관리, 위원회 운영', 'process', true, false, 'major', ARRAY['general'], '위원회 회의록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-8.1'
UNION ALL
SELECT e.id, 'ME-GENERAL-8.2', '의료기관 안전 계획(재난·화재)', '화재·재난 대비 계획 수립, 대피 훈련, 비상 연락망 관리', 'process', true, false, 'major', ARRAY['general'], '훈련 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-8.2'
UNION ALL
SELECT e.id, 'ME-GENERAL-9.1', '직원 채용 및 자격 관리', '면허·자격 검증, 적정 인력 배치, 정기 자격 갱신 관리', 'process', true, false, 'major', ARRAY['general'], '면허 관리 대장', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-9.1'
UNION ALL
SELECT e.id, 'ME-GENERAL-9.2', '직원 교육·훈련 체계', '신규·정기 교육 계획, 법정 의무교육, 부서별 직무 교육', 'process', true, false, 'major', ARRAY['general'], '교육 실적 대장', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-9.2'
UNION ALL
SELECT e.id, 'ME-GENERAL-9.3', '직원 건강·안전 관리', '직업성 노출(혈액·방사선 등) 관리, 근무 환경 위험 평가', 'process', true, false, 'major', ARRAY['general'], '건강 검진 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-9.3'
UNION ALL
SELECT e.id, 'ME-GENERAL-10.1', '의료기기·의료장비 점검 및 유지', '의료기기 등록·정기 점검·교정·폐기 관리', 'process', true, false, 'major', ARRAY['general'], '점검 이력', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-10.1'
UNION ALL
SELECT e.id, 'ME-GENERAL-10.2', '의료폐기물 관리', '의료폐기물 분리·보관·위탁 처리 절차 준수', 'process', true, false, 'major', ARRAY['general'], '처리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-10.2'
UNION ALL
SELECT e.id, 'ME-GENERAL-10.3', '화재·재난 안전 관리', '소방 시설 점검, 화재 대피 훈련, 비상 전력 관리', 'process', true, false, 'major', ARRAY['general'], '훈련 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-10.3'
UNION ALL
SELECT e.id, 'ME-GENERAL-11.1', '의무기록 작성·보완·보존 관리', '의무기록 완결도 관리, 법정 보존 기간 준수, 미완성 기록 관리', 'process', true, false, 'major', ARRAY['general'], '완결도 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-11.1'
UNION ALL
SELECT e.id, 'ME-GENERAL-11.2', '의료정보 보안 및 개인정보 보호', 'EMR 접근 권한 관리, 개인정보 보호, 정보보안 교육', 'process', true, false, 'major', ARRAY['general'], '접근 권한 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-11.2'
UNION ALL
SELECT e.id, 'ME-GENERAL-12.1', '환자안전·질 향상 성과지표 관리', '핵심 성과지표(낙상·감염·재입원율 등) 수집·분석·개선', 'process', true, false, 'major', ARRAY['general'], 'KPI 추이 자료', 1
FROM accreditation_entries e WHERE e.code = 'STD-GENERAL-12.1';

-- ==================== hospital ====================
DELETE FROM accreditation_survey_items WHERE 'hospital' = ANY(hospital_types);
DELETE FROM accreditation_categories WHERE entry_id IN (SELECT id FROM accreditation_entries WHERE 'hospital' = ANY(hospital_types));
DELETE FROM accreditation_entries WHERE 'hospital' = ANY(hospital_types);
DELETE FROM accreditation_chapters WHERE 'hospital' = ANY(hospital_types);

INSERT INTO accreditation_chapters (area_id, code, title, hospital_types, sort_order)
SELECT a.id, 'CH-01-HOSPITAL', '1장. 환자안전보장활동', ARRAY['hospital'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-02-HOSPITAL', '2장. 진료전달체계와 평가', ARRAY['hospital'], 2
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-03-HOSPITAL', '3장. 환자진료', ARRAY['hospital'], 3
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-04-HOSPITAL', '4장. 의약품관리', ARRAY['hospital'], 4
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-05-HOSPITAL', '5장. 환자권리 존중 및 보호', ARRAY['hospital'], 5
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-06-HOSPITAL', '6장. 질 향상 및 환자안전 활동', ARRAY['hospital'], 6
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-07-HOSPITAL', '7장. 감염관리', ARRAY['hospital'], 7
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-08-HOSPITAL', '8장. 경영 및 조직운영', ARRAY['hospital'], 8
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-09-HOSPITAL', '9장. 인적자원관리', ARRAY['hospital'], 9
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-10-HOSPITAL', '10장. 시설 및 환경관리', ARRAY['hospital'], 10
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-11-HOSPITAL', '11장. 의무기록 및 정보관리', ARRAY['hospital'], 11
FROM accreditation_areas a WHERE a.code = 'GL';

INSERT INTO accreditation_entries (chapter_id, code, title, description, hospital_types, sort_order)
SELECT c.id, 'STD-HOSPITAL-1.1', '환자를 정확하게 확인한다', '이름·생년월일 확인, 투약·처치 전 환자 확인 절차', ARRAY['hospital'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-01-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-1.2', '낙상 예방활동', '낙상 위험 평가, 고위험 환자 표시 및 예방 조치', ARRAY['hospital'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-01-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-1.3', '손위생 수행', '손위생 규정, 수행률 모니터링, 소독제 비치 관리', ARRAY['hospital'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-01-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-2.1', '외래·입원환자 등록 및 진료 절차', '외래·입원 수속 절차, 진료 정보 안내', ARRAY['hospital'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-02-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-2.2', '입원환자 초기평가', '입원 24시간 내 초기평가, 진료계획 수립', ARRAY['hospital'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-02-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-2.3', '퇴원 및 전원 관리', '퇴원 계획·교육, 전원 안전 절차', ARRAY['hospital'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-02-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-3.1', '통증 평가 및 관리', '입원 시 통증 평가, 진통제 투여 후 재평가', ARRAY['hospital'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-03-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-3.2', '욕창 예방 및 관리', '욕창 위험 평가·예방 조치·발생 기록', ARRAY['hospital'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-03-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-3.3', '응급 및 CPR 대응', '원내 응급 상황 대응 절차, 비상 약품·제세동기(AED) 관리', ARRAY['hospital'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-03-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-3.4', '수술·처치 안전 관리', '소수술 동의서, 시술 전 확인 절차, 회복 모니터링', ARRAY['hospital'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-03-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-4.1', '의약품 보관·관리', '의약품 구분 보관(냉장·상온·마약), 유효기간 관리', ARRAY['hospital'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-04-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-4.2', '의약품 처방·조제·투여 안전', '처방 검토, 5 Rights 확인, 투약 오류 보고', ARRAY['hospital'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-04-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-4.3', '마약류·향정신성의약품 관리', '마약류 이중 잠금·사용 기록·재고 관리 절차', ARRAY['hospital'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-04-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-5.1', '환자 권리 보호 및 불만 처리', '환자 권리 안내, 고충 접수·처리 절차', ARRAY['hospital'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-05-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-5.2', '동의서 취득 관리', '입원·수술·처치 동의서 취득, 설명 의무 이행', ARRAY['hospital'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-05-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-6.1', '질 향상 활동 및 성과지표 관리', '원내 성과지표 선정·수집·분석·개선활동 수행', ARRAY['hospital'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-06-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-6.2', '환자안전사고 보고 및 개선', '사고 자발적 보고, 원인 분석, 재발 방지 계획 수립', ARRAY['hospital'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-06-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-7.1', '감염관리 체계 및 교육', '감염관리 담당자 지정, 감염관리 규정·교육 운영', ARRAY['hospital'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-07-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-7.2', '의료기구 소독·멸균 관리', '기구별 소독·멸균 방법, 유효기간·사용 기록 관리', ARRAY['hospital'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-07-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-7.3', '격리 및 감염성 환자 관리', '감염성 질환 환자 격리 지침, 격리 주의 표시 운영', ARRAY['hospital'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-07-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-8.1', '원장 리더십 및 원내 위원회 운영', '병원 목표 설정, 원내 위원회 구성·운영·회의록 관리', ARRAY['hospital'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-08-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-9.1', '직원 채용 및 면허·자격 관리', '의사·간호사 면허 확인, 직원 배치 기준 관리', ARRAY['hospital'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-09-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-9.2', '직원 교육·훈련', '신규 직원 오리엔테이션, 법정 의무교육, 직무 교육 시행', ARRAY['hospital'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-09-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-10.1', '의료기기·장비 점검', '의료기기 정기 점검, 이상 발생 시 보고·수리 절차', ARRAY['hospital'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-10-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-10.2', '의료폐기물 및 환경위생 관리', '의료폐기물 분리 보관, 환경 청결 유지 절차', ARRAY['hospital'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-10-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-10.3', '화재·재난 안전 관리', '소화기·화재 경보기 점검, 대피 훈련 실시', ARRAY['hospital'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-10-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-11.1', '의무기록 작성 및 보존 관리', '의무기록 완결도, 법정 보존 기간 관리', ARRAY['hospital'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-11-HOSPITAL'
UNION ALL
SELECT c.id, 'STD-HOSPITAL-11.2', '환자 개인정보 보호', '환자 정보 접근 제한, 개인정보 동의, 정보 유출 예방', ARRAY['hospital'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-11-HOSPITAL';

INSERT INTO accreditation_survey_items (entry_id, code, title, description, sop_type, is_mandatory, is_pilot, severity, hospital_types, required_evidence, sort_order)
SELECT e.id, 'ME-HOSPITAL-1.1', '환자를 정확하게 확인한다', '이름·생년월일 확인, 투약·처치 전 환자 확인 절차', 'process', true, false, 'major', ARRAY['hospital'], '오류 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-1.1'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-1.2', '낙상 예방활동', '낙상 위험 평가, 고위험 환자 표시 및 예방 조치', 'process', true, false, 'major', ARRAY['hospital'], '낙상 발생 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-1.2'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-1.3', '손위생 수행', '손위생 규정, 수행률 모니터링, 소독제 비치 관리', 'process', true, false, 'major', ARRAY['hospital'], '손위생 수행률', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-1.3'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-2.1', '외래·입원환자 등록 및 진료 절차', '외래·입원 수속 절차, 진료 정보 안내', 'process', true, false, 'major', ARRAY['hospital'], '진료 등록 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-2.1'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-2.2', '입원환자 초기평가', '입원 24시간 내 초기평가, 진료계획 수립', 'process', true, false, 'major', ARRAY['hospital'], '초기평가 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-2.2'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-2.3', '퇴원 및 전원 관리', '퇴원 계획·교육, 전원 안전 절차', 'process', true, false, 'major', ARRAY['hospital'], '전원 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-2.3'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-3.1', '통증 평가 및 관리', '입원 시 통증 평가, 진통제 투여 후 재평가', 'process', true, false, 'major', ARRAY['hospital'], '통증 평가 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-3.1'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-3.2', '욕창 예방 및 관리', '욕창 위험 평가·예방 조치·발생 기록', 'process', true, false, 'major', ARRAY['hospital'], '욕창 발생 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-3.2'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-3.3', '응급 및 CPR 대응', '원내 응급 상황 대응 절차, 비상 약품·제세동기(AED) 관리', 'process', true, false, 'major', ARRAY['hospital'], 'CPR 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-3.3'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-3.4', '수술·처치 안전 관리', '소수술 동의서, 시술 전 확인 절차, 회복 모니터링', 'process', true, false, 'major', ARRAY['hospital'], '수술·처치 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-3.4'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-4.1', '의약품 보관·관리', '의약품 구분 보관(냉장·상온·마약), 유효기간 관리', 'process', true, false, 'major', ARRAY['hospital'], '재고 점검 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-4.1'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-4.2', '의약품 처방·조제·투여 안전', '처방 검토, 5 Rights 확인, 투약 오류 보고', 'process', true, false, 'major', ARRAY['hospital'], '투약 오류 보고', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-4.2'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-4.3', '마약류·향정신성의약품 관리', '마약류 이중 잠금·사용 기록·재고 관리 절차', 'process', true, false, 'critical', ARRAY['hospital'], '마약류 사용 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-4.3'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-5.1', '환자 권리 보호 및 불만 처리', '환자 권리 안내, 고충 접수·처리 절차', 'process', true, false, 'major', ARRAY['hospital'], '고충 처리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-5.1'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-5.2', '동의서 취득 관리', '입원·수술·처치 동의서 취득, 설명 의무 이행', 'process', true, false, 'major', ARRAY['hospital'], '동의서 보관 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-5.2'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-6.1', '질 향상 활동 및 성과지표 관리', '원내 성과지표 선정·수집·분석·개선활동 수행', 'process', true, false, 'major', ARRAY['hospital'], '성과 데이터', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-6.1'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-6.2', '환자안전사고 보고 및 개선', '사고 자발적 보고, 원인 분석, 재발 방지 계획 수립', 'process', true, false, 'major', ARRAY['hospital'], '사고 보고 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-6.2'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-7.1', '감염관리 체계 및 교육', '감염관리 담당자 지정, 감염관리 규정·교육 운영', 'process', true, false, 'major', ARRAY['hospital'], '감염 교육 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-7.1'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-7.2', '의료기구 소독·멸균 관리', '기구별 소독·멸균 방법, 유효기간·사용 기록 관리', 'process', true, false, 'major', ARRAY['hospital'], '멸균 이력', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-7.2'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-7.3', '격리 및 감염성 환자 관리', '감염성 질환 환자 격리 지침, 격리 주의 표시 운영', 'process', true, false, 'major', ARRAY['hospital'], '격리 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-7.3'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-8.1', '원장 리더십 및 원내 위원회 운영', '병원 목표 설정, 원내 위원회 구성·운영·회의록 관리', 'process', true, false, 'major', ARRAY['hospital'], '회의 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-8.1'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-9.1', '직원 채용 및 면허·자격 관리', '의사·간호사 면허 확인, 직원 배치 기준 관리', 'process', true, false, 'major', ARRAY['hospital'], '면허 관리 대장', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-9.1'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-9.2', '직원 교육·훈련', '신규 직원 오리엔테이션, 법정 의무교육, 직무 교육 시행', 'process', true, false, 'major', ARRAY['hospital'], '교육 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-9.2'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-10.1', '의료기기·장비 점검', '의료기기 정기 점검, 이상 발생 시 보고·수리 절차', 'process', true, false, 'major', ARRAY['hospital'], '점검 이력', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-10.1'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-10.2', '의료폐기물 및 환경위생 관리', '의료폐기물 분리 보관, 환경 청결 유지 절차', 'process', true, false, 'major', ARRAY['hospital'], '폐기물 처리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-10.2'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-10.3', '화재·재난 안전 관리', '소화기·화재 경보기 점검, 대피 훈련 실시', 'process', true, false, 'major', ARRAY['hospital'], '훈련 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-10.3'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-11.1', '의무기록 작성 및 보존 관리', '의무기록 완결도, 법정 보존 기간 관리', 'process', true, false, 'major', ARRAY['hospital'], '완결도 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-11.1'
UNION ALL
SELECT e.id, 'ME-HOSPITAL-11.2', '환자 개인정보 보호', '환자 정보 접근 제한, 개인정보 동의, 정보 유출 예방', 'process', true, false, 'major', ARRAY['hospital'], '접근 이력 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-HOSPITAL-11.2';

-- ==================== dental ====================
DELETE FROM accreditation_survey_items WHERE 'dental' = ANY(hospital_types);
DELETE FROM accreditation_categories WHERE entry_id IN (SELECT id FROM accreditation_entries WHERE 'dental' = ANY(hospital_types));
DELETE FROM accreditation_entries WHERE 'dental' = ANY(hospital_types);
DELETE FROM accreditation_chapters WHERE 'dental' = ANY(hospital_types);

INSERT INTO accreditation_chapters (area_id, code, title, hospital_types, sort_order)
SELECT a.id, 'CH-01-DENTAL', '1장. 환자안전보장활동', ARRAY['dental'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-02-DENTAL', '2장. 진료전달체계와 평가', ARRAY['dental'], 2
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-03-DENTAL', '3장. 환자진료', ARRAY['dental'], 3
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-04-DENTAL', '4장. 의약품관리', ARRAY['dental'], 4
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-05-DENTAL', '5장. 수술 및 마취진정관리', ARRAY['dental'], 5
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-06-DENTAL', '6장. 환자권리존중 및 보호', ARRAY['dental'], 6
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-07-DENTAL', '7장. 질 향상 및 환자안전 활동', ARRAY['dental'], 7
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-08-DENTAL', '8장. 감염관리', ARRAY['dental'], 8
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-09-DENTAL', '9장. 경영 및 조직운영', ARRAY['dental'], 9
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-10-DENTAL', '10장. 인적자원관리', ARRAY['dental'], 10
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-11-DENTAL', '11장. 시설 및 환경관리', ARRAY['dental'], 11
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-12-DENTAL', '12장. 의료정보/의무기록 관리', ARRAY['dental'], 12
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-13-DENTAL', '13장. 성과관리', ARRAY['dental'], 13
FROM accreditation_areas a WHERE a.code = 'QS';

INSERT INTO accreditation_entries (chapter_id, code, title, description, hospital_types, sort_order)
SELECT c.id, 'STD-DENTAL-1.1', '환자를 정확하게 확인한다', '의약품 투여·혈액제제 투여·검사 시행·진료 처치 시술 전 정확한 환자 확인 절차를 수립하고 이행한다.', ARRAY['dental'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-01-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-1.2', '의료진은 정확하게 의사소통한다', '구두처방·필요시처방(p.r.n) 관리 및 혼동하기 쉬운 부정확한 처방에 대한 대처방안을 수립하고 이행한다.', ARRAY['dental'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-01-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-1.3', '수술/시술 전 정확하게 확인한다', '정확한 환자·수술시술명·수술시술부위 확인 규정을 수립하고, 수술시술 부위 표시 및 확인 절차를 이행한다.', ARRAY['dental'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-01-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-1.4', '낙상 예방활동을 수행한다', '낙상 예방 규정을 수립하고 낙상 위험 평가도구를 이용한 평가 및 고위험환자 예방활동을 수행한다.', ARRAY['dental'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-01-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-1.5', '손위생을 철저히 수행한다', '손위생 수행 규정을 수립하고 올바른 손위생 수행 및 지원 자원을 제공한다.', ARRAY['dental'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-01-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-2.1.1', '외래환자 등록 절차가 있다', '외래환자 등록 절차를 수립하고, 등록 관리 및 의료기관 제공 서비스에 대한 정보를 제공한다.', ARRAY['dental'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-02-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-2.1.2', '입원 절차가 있다', '입원 절차 및 순서배정·지연 관리 규정을 수립하고, 입원 시 환자에게 필요한 정보를 제공한다.', ARRAY['dental'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-02-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-2.1.3', '퇴원 절차가 있다', '퇴원 절차 규정을 수립하고, 퇴원 결정 참여·퇴원요약지 작성·퇴원 시 필요한 정보를 제공한다.', ARRAY['dental'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-02-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-2.2.1', '외래환자의 요구를 확인하고, 초기평가 및 구강건강교육을 수행한다', '외래환자 초기평가 및 구강건강교육 규정을 수립하고, 치과의사가 초기평가를 수행·기록하며 구강건강교육을 제공한다.', ARRAY['dental'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-02-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-2.2.2', '입원환자의 요구를 확인하고 초기평가를 수행한다', '입원환자 초기평가 규정을 수립하고 의학·간호·영양 초기평가를 24시간 이내 수행·기록하며 관련 직원과 공유한다.', ARRAY['dental'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-02-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-2.3.1', '검체검사 운영과정을 관리한다', '검체검사 운영 규정 수립, 적격한 검사자 배치, 검체 안전 획득 및 정확한 결과 보고·외부 의뢰 체계를 관리한다.', ARRAY['dental'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-02-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-2.3.2', '영상검사 운영과정을 관리한다', '영상검사 운영 규정 수립, 적격한 검사자 배치, 검사 전 준비 확인 및 정확한 결과 보고·정도관리를 수행한다.', ARRAY['dental'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-02-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-2.3.3', '검사실을 안전하게 관리한다', '검사실 안전관리 규정을 수립하고 검체검사실 및 방사선을 안전하게 관리한다.', ARRAY['dental'], 8
FROM accreditation_chapters c WHERE c.code = 'CH-02-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-2.4.1', '기공물을 안전하게 제작하고 관리한다', '기공물 관리 규정을 수립하고 구강인상체 채득·제작 의뢰·기공물 제작 및 외부 의뢰 체계를 관리한다. (치과병원 특화 기준)', ARRAY['dental'], 9
FROM accreditation_chapters c WHERE c.code = 'CH-02-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-2.4.2', '기공실을 안전하게 관리한다', '기공실 안전관리 규정을 수립하고 기공실 환경 및 안전을 관리한다. (치과병원 특화 기준)', ARRAY['dental'], 10
FROM accreditation_chapters c WHERE c.code = 'CH-02-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-3.1.1', '적시에 치료계획(care plan)을 세우고 이를 수행한다', '치과의사는 치료계획을 수립하고 주요 상태변화 경과를 기록하며, 간호사는 간호과정을 기록하고 환자에게 치료계획을 설명한다.', ARRAY['dental'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-03-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-3.1.2', '협의진료를 수행한다', '협의진료 규정을 수립하고 의료기관 내 타 진료과 협의진료 절차 및 타 의료기관 진료의뢰 절차를 준수한다.', ARRAY['dental'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-03-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-3.1.3', '통증을 적절하게 관리한다', '통증관리 규정을 수립하고 외래·입원환자 통증 초기평가 수행 및 평가 결과에 따른 통증 관리를 수행한다.', ARRAY['dental'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-03-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-3.1.4', '환자에게 영양을 적절하게 공급하고 관리한다', '영양관리 규정을 수립하고 치료목적에 맞게 식사를 제공하며 환자에게 치료식에 대해 설명한다.', ARRAY['dental'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-03-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-3.2.1', '심폐소생술이 요구되는 환자에게 양질의 의료서비스를 제공한다', '심폐소생술 규정을 수립하고 요구 환자 발생 시 대처, 필요물품·의약품 관리 및 적시 제세동기 사용 체계를 갖춘다.', ARRAY['dental'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-03-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-3.2.2', '수혈환자에게 양질의 의료서비스를 제공한다', '수혈 규정을 수립하고 수혈 전 검사·혈액제제 관리·수혈 직전 확인·환자 모니터링 및 부작용 대처 절차를 이행한다.', ARRAY['dental'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-03-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-4.1', '의약품을 안전하게 보관한다', '의약품 보관 규정을 수립하고 응급·마약류·고위험·주의 의약품 안전 보관 및 회수 절차를 이행한다.', ARRAY['dental'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-04-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-4.2', '의약품을 안전하게 처방하고 조제한다', '의약품 처방·조제 규정을 수립하고, 적격한 자가 처방·감사·조제하며 주사용 의약품 감염안전 및 라벨링을 준수한다.', ARRAY['dental'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-04-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-4.3', '의약품을 안전하게 투여한다', '의약품 투여 규정을 수립하고, 적격한 자가 안전하게 투여하며 고위험의약품 주의사항 이행 및 부작용 보고 절차를 갖춘다.', ARRAY['dental'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-04-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-5.1', '수술 계획을 수립하고 수행한다', '수술 전 평가 기반 수술 계획 수립, 진단명 기록, 수술기록·수술 후 치료계획·간호계획을 수립하고 기록한다. (치과병원 특화 기준)', ARRAY['dental'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-05-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-5.2', '수술 시 환자의 안전을 보장한다', '수술 시 환자안전 보장 규정을 수립하고 수술계수(counts)를 기록하며 불일치 시 대처 절차를 이행한다. (치과병원 특화 기준)', ARRAY['dental'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-05-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-5.3', '시술 계획을 수립하고 수행한다', '시술 전 평가 기반 시술 계획 수립, 진단명 기록 및 시술 내용을 24시간 이내 기록한다. (치과병원 특화 기준)', ARRAY['dental'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-05-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-5.4', '진정치료를 안전하게 수행한다', '진정치료 규정 수립, 적격한 자 배치, 진정치료 전·중·후 환자 모니터링 및 응급상황 대처·퇴실 기준 적용을 이행한다. (치과병원 특화 기준)', ARRAY['dental'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-05-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-5.5', '마취진료를 안전하게 제공하고, 마취진료를 제공받은 환자상태를 모니터링한다', '마취진료 규정 수립, 적격한 자 배치, 마취 전·중·회복 중 환자 상태 모니터링·기록 및 회복실 퇴실 기준 적용을 이행한다. (치과병원 특화 기준)', ARRAY['dental'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-05-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-5.6', '수술장을 안전하게 관리한다', '수술장 안전관리 규정을 수립하고 구역 구분·공기질 관리·복장 관리 및 출입 제한을 이행한다. (치과병원 특화 기준)', ARRAY['dental'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-05-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-6.1', '환자의 권리를 존중하고, 안전을 보장한다', '환자의 권리와 의무에 대한 규정을 수립하고, 직원 교육 및 환자에게 정보를 제공하며 진료과정 참여 및 개인정보 보호를 이행한다.', ARRAY['dental'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-06-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-6.2', '취약환자의 권리를 보호하고, 안전을 보장한다', '취약환자 권리보호 규정을 수립하고 학대·폭력피해자 절차, 의사소통 어려운 환자 지원 및 장애환자 편의시설을 운영한다.', ARRAY['dental'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-06-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-6.3', '환자의 불만 및 고충을 관리한다', '환자 불만·고충 관리 규정을 수립하고, 환자에게 처리 절차 안내·처리 수행·정기 분석 및 경영진 보고를 이행한다.', ARRAY['dental'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-06-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-6.4', '의료사회복지체계를 수립하고 운영한다', '의료사회복지체계를 수립하고 직원이 의뢰 가능 대상을 알고 절차를 준수하며 서비스를 제공한다.', ARRAY['dental'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-06-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-6.5', '환자에게 동의서를 받는다', '동의서 규정을 수립하고 수술·시술, 마취·진정, 혈액제제, 고위험의약품, 조영제 사용 동의서를 받는다.', ARRAY['dental'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-06-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-6.6', '임상연구를 안전하게 수행하고 관리한다', '임상연구 관리 규정을 수립하고 연구 목록 관리·참여 정보 제공 및 동의서를 받는다.', ARRAY['dental'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-06-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-7.1', '질 향상과 환자안전을 위한 운영체계가 있다', '질 향상·환자안전 규정을 수립하고 위원회 운영, 전담 부서·적격자 배치, 활동 계획 수립 및 필요 자원 지원 체계를 갖춘다.', ARRAY['dental'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-07-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-7.2', '환자안전사건을 관리한다', '환자안전사건 관리 절차를 수립하고 보고·분류·분석·개선활동 수행 및 적신호사건 시 환자·보호자 정보 제공을 이행한다.', ARRAY['dental'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-07-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-7.3', '의료기관의 질 향상 및 환자안전 활동을 수행한다', '우선순위에 따른 활동 주제 선정, 통계적 기법·도구를 사용한 자료 분석, 성과 지속 관리 및 경영진 보고를 이행한다.', ARRAY['dental'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-07-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-8.1', '감염예방 및 관리체계를 운영한다', '감염예방·관리 규정을 수립하고 위원회를 운영하며 전담 부서 및 적격한 자를 배치한다.', ARRAY['dental'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-08-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-8.2', '의료기구의 세척, 소독, 멸균과정과 세탁물을 적절히 관리한다', '의료기구 세척·소독·멸균 규정을 수립하고 중앙·외래 소독시설 관리, 멸균기 정기 관리 및 세탁물을 적절히 관리한다.', ARRAY['dental'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-08-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-8.3', '환자치료영역의 청소 및 소독을 수행하고, 환경을 관리한다', '환자치료영역 환경관리 규정을 수립하고 수관관리·표면관리·청소 및 소독·의료기관 내 음용수를 적절히 관리한다.', ARRAY['dental'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-08-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-8.4', '급식서비스를 관리한다', '입원환자 급식서비스 관리 규정을 수립하고 식재료·조리기구 및 장비·조리장 환경·직원 개인위생을 관리한다.', ARRAY['dental'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-08-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-8.5', '감염성질환 환자를 관리한다', '감염성질환 관리 규정을 수립하고 유행성 감염병 위기 시 관리 절차 및 감염병 전파경로에 따른 환자 관리 절차를 이행한다.', ARRAY['dental'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-08-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-9.1', '경영진은 합리적 의사결정을 하고, 체계적인 계획 하에 의료기관을 운영한다', '의료기관 운영 규정을 수립하고 의사결정조직(회의체) 운영·규정 관리·위탁서비스를 관리한다.', ARRAY['dental'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-09-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-9.2', '의료기관의 운영방향을 공유한다', '미션과 핵심가치를 수립하고 직원과 공유하며, 이행 활동을 수행하고 직원이 알고 있음을 확인한다.', ARRAY['dental'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-09-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-9.3', '윤리적 갈등 해결 및 폭력 예방을 위한 지원체계를 갖추고 지원한다', '윤리적 갈등 해결 및 폭력 예방 지원체계를 갖추고, 진료 관련 윤리적 갈등 해결 및 의료기관 내 폭력 관련 갈등 해결을 지원한다.', ARRAY['dental'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-09-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-10.1', '인사관리체계를 운영한다', '인사관리 규정 및 인사계획을 수립하고 인력을 관리한다.', ARRAY['dental'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-10-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-10.2', '직원의 인사정보를 관리한다', '인사정보 관리체계를 갖추고 의사, 간호사·치과위생사, 기타 인력의 인사정보를 관리한다.', ARRAY['dental'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-10-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-10.3', '직원에게 지속적인 교육 및 훈련을 제공한다', '직원 교육체계 및 교육계획을 수립하고 신규 직원 필수교육·재직 직원 필수교육·특성화교육을 시행한다.', ARRAY['dental'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-10-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-10.4', '보건의료인력의 법적 기준을 준수한다', '치과의사·간호사·치과위생사·약사·영양사의 법적 기준을 준수한다.', ARRAY['dental'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-10-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-10.5', '직원의 건강유지와 안전 관리활동을 수행한다', '직원 건강유지·안전 관리활동 규정 및 계획을 수립하고 활동 수행, 직원 안전사고 관리 및 경영진 보고를 이행한다.', ARRAY['dental'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-10-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-11.1', '시설 및 환경안전 관리를 수행한다', '시설·환경안전 관리 규정·담당자·교육·사고 보고 절차를 수립하고, 안전계획 및 안전 관리를 수행한다.', ARRAY['dental'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-11-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-11.2', '설비시스템을 안전하게 관리한다', '설비시스템 관리 규정을 수립하고 전기설비·급수설비 및 수질·의료가스 및 진공설비·실내공기질을 안전하게 관리한다.', ARRAY['dental'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-11-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-11.3', '위험물질을 안전하게 관리한다', '유해화학물질·의료폐기물 관리 규정을 수립하고 안전하게 관리한다.', ARRAY['dental'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-11-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-11.4', '보안체계를 운영한다', '환자안전 보안체계를 갖추고 보안사고 예방·보고 및 병문안객을 관리한다.', ARRAY['dental'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-11-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-11.5', '의료기기를 안전하게 관리한다', '의료기기 관리 규정을 수립하고 목록 관리·예방점검·안전 회수·오작동 및 부작용 발생 시 대처 절차를 이행한다.', ARRAY['dental'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-11-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-11.6', '화재안전 관리활동을 수행한다', '화재안전 관리 규정·계획을 수립하고 화재예방점검·소방훈련·소방안전교육 및 금연관리를 수행한다.', ARRAY['dental'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-11-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-12.1', '의료정보/의무기록을 관리한다', '의료정보·의무기록 관리 규정을 수립하고 접근 권한 관리·사본 발급·대출·열람·반납·금기약어 및 보관 관리를 이행한다.', ARRAY['dental'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-12-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-12.2', '의무기록의 작성을 완결한다', '의학적·간호 초기평가, 경과기록, 간호기록, 수술·시술·마취기록, 동의서, 퇴원요약, 표준화 코드 사용을 완결하여 작성한다.', ARRAY['dental'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-12-DENTAL'
UNION ALL
SELECT c.id, 'STD-DENTAL-13.1', '환자안전과 질 향상을 위한 지표를 관리한다', '낙상·손위생·직원안전·환자만족도 관련 지표를 정의하고 정기적으로 모니터링·분석하여 개선활동에 활용한다.', ARRAY['dental'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-13-DENTAL';

INSERT INTO accreditation_survey_items (entry_id, code, title, description, sop_type, is_mandatory, is_pilot, severity, hospital_types, required_evidence, sort_order)
SELECT e.id, 'ME-DENTAL-1.1', '환자를 정확하게 확인한다', '의약품 투여·혈액제제 투여·검사 시행·진료 처치 시술 전 정확한 환자 확인 절차를 수립하고 이행한다.', 'process', true, false, 'major', ARRAY['dental'], '환자 확인 수행 기록; 직원 교육 이수 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-1.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-1.2', '의료진은 정확하게 의사소통한다', '구두처방·필요시처방(p.r.n) 관리 및 혼동하기 쉬운 부정확한 처방에 대한 대처방안을 수립하고 이행한다.', 'process', true, false, 'major', ARRAY['dental'], '구두처방 수행 기록; 직원 교육 이수 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-1.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-1.3', '수술/시술 전 정확하게 확인한다', '정확한 환자·수술시술명·수술시술부위 확인 규정을 수립하고, 수술시술 부위 표시 및 확인 절차를 이행한다.', 'process', true, false, 'major', ARRAY['dental'], '수술·시술 전 확인 기록; 부위 표시 사진 또는 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-1.3'
UNION ALL
SELECT e.id, 'ME-DENTAL-1.4', '낙상 예방활동을 수행한다', '낙상 예방 규정을 수립하고 낙상 위험 평가도구를 이용한 평가 및 고위험환자 예방활동을 수행한다.', 'process', true, false, 'major', ARRAY['dental'], '낙상 위험 평가 기록; 낙상 예방 활동 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-1.4'
UNION ALL
SELECT e.id, 'ME-DENTAL-1.5', '손위생을 철저히 수행한다', '손위생 수행 규정을 수립하고 올바른 손위생 수행 및 지원 자원을 제공한다.', 'process', true, false, 'major', ARRAY['dental'], '손위생 수행률 모니터링 결과; 손위생 소독제 비치 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-1.5'
UNION ALL
SELECT e.id, 'ME-DENTAL-2.1.1', '외래환자 등록 절차가 있다', '외래환자 등록 절차를 수립하고, 등록 관리 및 의료기관 제공 서비스에 대한 정보를 제공한다.', 'process', true, false, 'major', ARRAY['dental'], '외래환자 등록 기록; 서비스 안내문', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-2.1.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-2.1.2', '입원 절차가 있다', '입원 절차 및 순서배정·지연 관리 규정을 수립하고, 입원 시 환자에게 필요한 정보를 제공한다.', 'process', true, false, 'major', ARRAY['dental'], '입원 절차 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-2.1.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-2.1.3', '퇴원 절차가 있다', '퇴원 절차 규정을 수립하고, 퇴원 결정 참여·퇴원요약지 작성·퇴원 시 필요한 정보를 제공한다.', 'process', true, false, 'major', ARRAY['dental'], '퇴원요약지 작성 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-2.1.3'
UNION ALL
SELECT e.id, 'ME-DENTAL-2.2.1', '외래환자의 요구를 확인하고, 초기평가 및 구강건강교육을 수행한다', '외래환자 초기평가 및 구강건강교육 규정을 수립하고, 치과의사가 초기평가를 수행·기록하며 구강건강교육을 제공한다.', 'process', true, false, 'major', ARRAY['dental'], '초기평가 수행 기록; 구강건강교육 제공 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-2.2.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-2.2.2', '입원환자의 요구를 확인하고 초기평가를 수행한다', '입원환자 초기평가 규정을 수립하고 의학·간호·영양 초기평가를 24시간 이내 수행·기록하며 관련 직원과 공유한다.', 'process', true, false, 'major', ARRAY['dental'], '입원환자 초기평가 수행 기록(24시간 이내)', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-2.2.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-2.3.1', '검체검사 운영과정을 관리한다', '검체검사 운영 규정 수립, 적격한 검사자 배치, 검체 안전 획득 및 정확한 결과 보고·외부 의뢰 체계를 관리한다.', 'process', true, false, 'major', ARRAY['dental'], '검체검사 정도관리 기록; 검사자 자격 증빙', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-2.3.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-2.3.2', '영상검사 운영과정을 관리한다', '영상검사 운영 규정 수립, 적격한 검사자 배치, 검사 전 준비 확인 및 정확한 결과 보고·정도관리를 수행한다.', 'process', true, false, 'major', ARRAY['dental'], '영상검사 정도관리 기록; 검사자 자격 증빙', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-2.3.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-2.3.3', '검사실을 안전하게 관리한다', '검사실 안전관리 규정을 수립하고 검체검사실 및 방사선을 안전하게 관리한다.', 'process', true, false, 'major', ARRAY['dental'], '검사실 안전점검 기록; 방사선 안전관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-2.3.3'
UNION ALL
SELECT e.id, 'ME-DENTAL-2.4.1', '기공물을 안전하게 제작하고 관리한다', '기공물 관리 규정을 수립하고 구강인상체 채득·제작 의뢰·기공물 제작 및 외부 의뢰 체계를 관리한다. (치과병원 특화 기준)', 'process', true, false, 'major', ARRAY['dental'], '기공물 의뢰·수령 기록; 기공물 제작 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-2.4.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-2.4.2', '기공실을 안전하게 관리한다', '기공실 안전관리 규정을 수립하고 기공실 환경 및 안전을 관리한다. (치과병원 특화 기준)', 'process', true, false, 'major', ARRAY['dental'], '기공실 환경점검 기록; 기공실 안전관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-2.4.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-3.1.1', '적시에 치료계획(care plan)을 세우고 이를 수행한다', '치과의사는 치료계획을 수립하고 주요 상태변화 경과를 기록하며, 간호사는 간호과정을 기록하고 환자에게 치료계획을 설명한다.', 'process', true, false, 'major', ARRAY['dental'], '치료계획 수립 기록; 환자 설명 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-3.1.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-3.1.2', '협의진료를 수행한다', '협의진료 규정을 수립하고 의료기관 내 타 진료과 협의진료 절차 및 타 의료기관 진료의뢰 절차를 준수한다.', 'process', true, false, 'major', ARRAY['dental'], '협의진료 기록; 타 의료기관 의뢰 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-3.1.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-3.1.3', '통증을 적절하게 관리한다', '통증관리 규정을 수립하고 외래·입원환자 통증 초기평가 수행 및 평가 결과에 따른 통증 관리를 수행한다.', 'process', true, false, 'major', ARRAY['dental'], '통증 초기평가 기록; 통증 관리 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-3.1.3'
UNION ALL
SELECT e.id, 'ME-DENTAL-3.1.4', '환자에게 영양을 적절하게 공급하고 관리한다', '영양관리 규정을 수립하고 치료목적에 맞게 식사를 제공하며 환자에게 치료식에 대해 설명한다.', 'process', true, false, 'major', ARRAY['dental'], '영양 평가 기록; 치료식 제공 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-3.1.4'
UNION ALL
SELECT e.id, 'ME-DENTAL-3.2.1', '심폐소생술이 요구되는 환자에게 양질의 의료서비스를 제공한다', '심폐소생술 규정을 수립하고 요구 환자 발생 시 대처, 필요물품·의약품 관리 및 적시 제세동기 사용 체계를 갖춘다.', 'process', true, false, 'major', ARRAY['dental'], '심폐소생술 훈련 기록; 제세동기 점검 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-3.2.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-3.2.2', '수혈환자에게 양질의 의료서비스를 제공한다', '수혈 규정을 수립하고 수혈 전 검사·혈액제제 관리·수혈 직전 확인·환자 모니터링 및 부작용 대처 절차를 이행한다.', 'process', true, false, 'major', ARRAY['dental'], '수혈 전 환자 확인 기록; 수혈 모니터링 기록; 혈액제제 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-3.2.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-4.1', '의약품을 안전하게 보관한다', '의약품 보관 규정을 수립하고 응급·마약류·고위험·주의 의약품 안전 보관 및 회수 절차를 이행한다.', 'process', true, false, 'major', ARRAY['dental'], '의약품 보관 감사 기록; 마약류 수불 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-4.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-4.2', '의약품을 안전하게 처방하고 조제한다', '의약품 처방·조제 규정을 수립하고, 적격한 자가 처방·감사·조제하며 주사용 의약품 감염안전 및 라벨링을 준수한다.', 'process', true, false, 'major', ARRAY['dental'], '의약품 처방 감사 기록; 조제 기록; 직원 자격 증빙', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-4.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-4.3', '의약품을 안전하게 투여한다', '의약품 투여 규정을 수립하고, 적격한 자가 안전하게 투여하며 고위험의약품 주의사항 이행 및 부작용 보고 절차를 갖춘다.', 'process', true, false, 'major', ARRAY['dental'], '투약 수행 기록; 의약품 부작용 보고 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-4.3'
UNION ALL
SELECT e.id, 'ME-DENTAL-5.1', '수술 계획을 수립하고 수행한다', '수술 전 평가 기반 수술 계획 수립, 진단명 기록, 수술기록·수술 후 치료계획·간호계획을 수립하고 기록한다. (치과병원 특화 기준)', 'process', true, false, 'major', ARRAY['dental'], '수술 계획 수립 기록; 수술 기록지; 수술 후 치료계획 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-5.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-5.2', '수술 시 환자의 안전을 보장한다', '수술 시 환자안전 보장 규정을 수립하고 수술계수(counts)를 기록하며 불일치 시 대처 절차를 이행한다. (치과병원 특화 기준)', 'process', true, false, 'major', ARRAY['dental'], '수술계수 기록; 수술계수 불일치 보고 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-5.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-5.3', '시술 계획을 수립하고 수행한다', '시술 전 평가 기반 시술 계획 수립, 진단명 기록 및 시술 내용을 24시간 이내 기록한다. (치과병원 특화 기준)', 'process', true, false, 'major', ARRAY['dental'], '시술 계획 수립 기록; 시술 기록(24시간 이내)', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-5.3'
UNION ALL
SELECT e.id, 'ME-DENTAL-5.4', '진정치료를 안전하게 수행한다', '진정치료 규정 수립, 적격한 자 배치, 진정치료 전·중·후 환자 모니터링 및 응급상황 대처·퇴실 기준 적용을 이행한다. (치과병원 특화 기준)', 'process', true, false, 'major', ARRAY['dental'], '진정치료 수행 기록; 적격자 자격 증빙; 퇴실 기준 적용 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-5.4'
UNION ALL
SELECT e.id, 'ME-DENTAL-5.5', '마취진료를 안전하게 제공하고, 마취진료를 제공받은 환자상태를 모니터링한다', '마취진료 규정 수립, 적격한 자 배치, 마취 전·중·회복 중 환자 상태 모니터링·기록 및 회복실 퇴실 기준 적용을 이행한다. (치과병원 특화 기준)', 'process', true, false, 'major', ARRAY['dental'], '마취 전 평가 기록; 마취 수행 기록; 회복실 퇴실 기준 적용 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-5.5'
UNION ALL
SELECT e.id, 'ME-DENTAL-5.6', '수술장을 안전하게 관리한다', '수술장 안전관리 규정을 수립하고 구역 구분·공기질 관리·복장 관리 및 출입 제한을 이행한다. (치과병원 특화 기준)', 'process', true, false, 'major', ARRAY['dental'], '수술장 안전점검 기록; 공기질 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-5.6'
UNION ALL
SELECT e.id, 'ME-DENTAL-6.1', '환자의 권리를 존중하고, 안전을 보장한다', '환자의 권리와 의무에 대한 규정을 수립하고, 직원 교육 및 환자에게 정보를 제공하며 진료과정 참여 및 개인정보 보호를 이행한다.', 'process', true, false, 'major', ARRAY['dental'], '직원 교육 이수 기록; 환자 권리 안내 제공 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-6.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-6.2', '취약환자의 권리를 보호하고, 안전을 보장한다', '취약환자 권리보호 규정을 수립하고 학대·폭력피해자 절차, 의사소통 어려운 환자 지원 및 장애환자 편의시설을 운영한다.', 'process', true, false, 'major', ARRAY['dental'], '취약환자 지원 기록; 장애환자 편의시설 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-6.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-6.3', '환자의 불만 및 고충을 관리한다', '환자 불만·고충 관리 규정을 수립하고, 환자에게 처리 절차 안내·처리 수행·정기 분석 및 경영진 보고를 이행한다.', 'process', true, false, 'major', ARRAY['dental'], '불만·고충 처리 기록; 불만·고충 분석 보고서', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-6.3'
UNION ALL
SELECT e.id, 'ME-DENTAL-6.4', '의료사회복지체계를 수립하고 운영한다', '의료사회복지체계를 수립하고 직원이 의뢰 가능 대상을 알고 절차를 준수하며 서비스를 제공한다.', 'process', true, false, 'major', ARRAY['dental'], '의료사회복지 의뢰 기록; 서비스 제공 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-6.4'
UNION ALL
SELECT e.id, 'ME-DENTAL-6.5', '환자에게 동의서를 받는다', '동의서 규정을 수립하고 수술·시술, 마취·진정, 혈액제제, 고위험의약품, 조영제 사용 동의서를 받는다.', 'process', true, false, 'major', ARRAY['dental'], '동의서 수령 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-6.5'
UNION ALL
SELECT e.id, 'ME-DENTAL-6.6', '임상연구를 안전하게 수행하고 관리한다', '임상연구 관리 규정을 수립하고 연구 목록 관리·참여 정보 제공 및 동의서를 받는다.', 'process', true, false, 'major', ARRAY['dental'], '임상연구 목록; 임상연구 동의서 수령 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-6.6'
UNION ALL
SELECT e.id, 'ME-DENTAL-7.1', '질 향상과 환자안전을 위한 운영체계가 있다', '질 향상·환자안전 규정을 수립하고 위원회 운영, 전담 부서·적격자 배치, 활동 계획 수립 및 필요 자원 지원 체계를 갖춘다.', 'process', true, false, 'major', ARRAY['dental'], '위원회 운영 기록(회의록); 전담 부서 및 적격자 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-7.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-7.2', '환자안전사건을 관리한다', '환자안전사건 관리 절차를 수립하고 보고·분류·분석·개선활동 수행 및 적신호사건 시 환자·보호자 정보 제공을 이행한다.', 'process', true, false, 'major', ARRAY['dental'], '환자안전사건 보고 및 분석 기록; 개선활동 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-7.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-7.3', '의료기관의 질 향상 및 환자안전 활동을 수행한다', '우선순위에 따른 활동 주제 선정, 통계적 기법·도구를 사용한 자료 분석, 성과 지속 관리 및 경영진 보고를 이행한다.', 'process', true, false, 'major', ARRAY['dental'], '질 향상 활동 주제 선정 기록; 통계 분석 자료; 경영진 보고 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-7.3'
UNION ALL
SELECT e.id, 'ME-DENTAL-8.1', '감염예방 및 관리체계를 운영한다', '감염예방·관리 규정을 수립하고 위원회를 운영하며 전담 부서 및 적격한 자를 배치한다.', 'process', true, false, 'major', ARRAY['dental'], '감염관리위원회 회의록; 전담 인력 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-8.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-8.2', '의료기구의 세척, 소독, 멸균과정과 세탁물을 적절히 관리한다', '의료기구 세척·소독·멸균 규정을 수립하고 중앙·외래 소독시설 관리, 멸균기 정기 관리 및 세탁물을 적절히 관리한다.', 'process', true, false, 'major', ARRAY['dental'], '멸균기 정기점검 기록; 세탁물 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-8.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-8.3', '환자치료영역의 청소 및 소독을 수행하고, 환경을 관리한다', '환자치료영역 환경관리 규정을 수립하고 수관관리·표면관리·청소 및 소독·의료기관 내 음용수를 적절히 관리한다.', 'process', true, false, 'major', ARRAY['dental'], '환경 청소·소독 수행 기록; 수관관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-8.3'
UNION ALL
SELECT e.id, 'ME-DENTAL-8.4', '급식서비스를 관리한다', '입원환자 급식서비스 관리 규정을 수립하고 식재료·조리기구 및 장비·조리장 환경·직원 개인위생을 관리한다.', 'process', true, false, 'major', ARRAY['dental'], '식재료 관리 기록; 조리장 위생점검 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-8.4'
UNION ALL
SELECT e.id, 'ME-DENTAL-8.5', '감염성질환 환자를 관리한다', '감염성질환 관리 규정을 수립하고 유행성 감염병 위기 시 관리 절차 및 감염병 전파경로에 따른 환자 관리 절차를 이행한다.', 'process', true, false, 'major', ARRAY['dental'], '감염성질환 환자 관리 기록; 유행성 감염병 대응 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-8.5'
UNION ALL
SELECT e.id, 'ME-DENTAL-9.1', '경영진은 합리적 의사결정을 하고, 체계적인 계획 하에 의료기관을 운영한다', '의료기관 운영 규정을 수립하고 의사결정조직(회의체) 운영·규정 관리·위탁서비스를 관리한다.', 'process', true, false, 'major', ARRAY['dental'], '의사결정조직 회의록; 규정 관리 현황; 위탁서비스 계약서', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-9.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-9.2', '의료기관의 운영방향을 공유한다', '미션과 핵심가치를 수립하고 직원과 공유하며, 이행 활동을 수행하고 직원이 알고 있음을 확인한다.', 'process', true, false, 'major', ARRAY['dental'], '미션·핵심가치 공지 기록; 직원 교육 이수 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-9.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-9.3', '윤리적 갈등 해결 및 폭력 예방을 위한 지원체계를 갖추고 지원한다', '윤리적 갈등 해결 및 폭력 예방 지원체계를 갖추고, 진료 관련 윤리적 갈등 해결 및 의료기관 내 폭력 관련 갈등 해결을 지원한다.', 'process', true, false, 'major', ARRAY['dental'], '윤리 갈등 해결 기록; 폭력 예방 활동 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-9.3'
UNION ALL
SELECT e.id, 'ME-DENTAL-10.1', '인사관리체계를 운영한다', '인사관리 규정 및 인사계획을 수립하고 인력을 관리한다.', 'process', true, false, 'major', ARRAY['dental'], '인력 현황 자료; 인사계획 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-10.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-10.2', '직원의 인사정보를 관리한다', '인사정보 관리체계를 갖추고 의사, 간호사·치과위생사, 기타 인력의 인사정보를 관리한다.', 'process', true, false, 'major', ARRAY['dental'], '직원 인사정보 파일(의사·간호사·치과위생사·기타 인력)', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-10.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-10.3', '직원에게 지속적인 교육 및 훈련을 제공한다', '직원 교육체계 및 교육계획을 수립하고 신규 직원 필수교육·재직 직원 필수교육·특성화교육을 시행한다.', 'process', true, false, 'major', ARRAY['dental'], '신규 직원 교육 이수 기록; 재직 직원 교육 이수 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-10.3'
UNION ALL
SELECT e.id, 'ME-DENTAL-10.4', '보건의료인력의 법적 기준을 준수한다', '치과의사·간호사·치과위생사·약사·영양사의 법적 기준을 준수한다.', 'process', true, false, 'major', ARRAY['dental'], '치과의사 면허증; 간호사·치과위생사 면허증; 약사 면허증; 영양사 면허증', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-10.4'
UNION ALL
SELECT e.id, 'ME-DENTAL-10.5', '직원의 건강유지와 안전 관리활동을 수행한다', '직원 건강유지·안전 관리활동 규정 및 계획을 수립하고 활동 수행, 직원 안전사고 관리 및 경영진 보고를 이행한다.', 'process', true, false, 'major', ARRAY['dental'], '직원 건강검진 기록; 직원 안전사고 처리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-10.5'
UNION ALL
SELECT e.id, 'ME-DENTAL-11.1', '시설 및 환경안전 관리를 수행한다', '시설·환경안전 관리 규정·담당자·교육·사고 보고 절차를 수립하고, 안전계획 및 안전 관리를 수행한다.', 'process', true, false, 'major', ARRAY['dental'], '시설 안전점검 기록; 직원 교육 이수 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-11.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-11.2', '설비시스템을 안전하게 관리한다', '설비시스템 관리 규정을 수립하고 전기설비·급수설비 및 수질·의료가스 및 진공설비·실내공기질을 안전하게 관리한다.', 'process', true, false, 'major', ARRAY['dental'], '전기설비 점검 기록; 수질 검사 기록; 의료가스 관리 기록; 실내공기질 측정 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-11.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-11.3', '위험물질을 안전하게 관리한다', '유해화학물질·의료폐기물 관리 규정을 수립하고 안전하게 관리한다.', 'process', true, false, 'major', ARRAY['dental'], '유해화학물질 관리 기록; 의료폐기물 처리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-11.3'
UNION ALL
SELECT e.id, 'ME-DENTAL-11.4', '보안체계를 운영한다', '환자안전 보안체계를 갖추고 보안사고 예방·보고 및 병문안객을 관리한다.', 'process', true, false, 'major', ARRAY['dental'], '보안사고 예방 활동 기록; 병문안 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-11.4'
UNION ALL
SELECT e.id, 'ME-DENTAL-11.5', '의료기기를 안전하게 관리한다', '의료기기 관리 규정을 수립하고 목록 관리·예방점검·안전 회수·오작동 및 부작용 발생 시 대처 절차를 이행한다.', 'process', true, false, 'major', ARRAY['dental'], '의료기기 목록; 의료기기 예방점검 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-11.5'
UNION ALL
SELECT e.id, 'ME-DENTAL-11.6', '화재안전 관리활동을 수행한다', '화재안전 관리 규정·계획을 수립하고 화재예방점검·소방훈련·소방안전교육 및 금연관리를 수행한다.', 'process', true, false, 'major', ARRAY['dental'], '화재예방점검 기록; 소방훈련 실시 기록; 소방안전교육 이수 기록; 금연관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-11.6'
UNION ALL
SELECT e.id, 'ME-DENTAL-12.1', '의료정보/의무기록을 관리한다', '의료정보·의무기록 관리 규정을 수립하고 접근 권한 관리·사본 발급·대출·열람·반납·금기약어 및 보관 관리를 이행한다.', 'process', true, false, 'major', ARRAY['dental'], '의무기록 접근 권한 현황; 의무기록 보관 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-12.1'
UNION ALL
SELECT e.id, 'ME-DENTAL-12.2', '의무기록의 작성을 완결한다', '의학적·간호 초기평가, 경과기록, 간호기록, 수술·시술·마취기록, 동의서, 퇴원요약, 표준화 코드 사용을 완결하여 작성한다.', 'process', true, false, 'major', ARRAY['dental'], '의무기록 완결도 점검 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-12.2'
UNION ALL
SELECT e.id, 'ME-DENTAL-13.1', '환자안전과 질 향상을 위한 지표를 관리한다', '낙상·손위생·직원안전·환자만족도 관련 지표를 정의하고 정기적으로 모니터링·분석하여 개선활동에 활용한다.', 'process', true, false, 'major', ARRAY['dental'], '지표 모니터링 결과 보고서; 지표 분석 결과 경영진 보고 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-DENTAL-13.1';

-- ==================== korean ====================
DELETE FROM accreditation_survey_items WHERE 'korean' = ANY(hospital_types);
DELETE FROM accreditation_categories WHERE entry_id IN (SELECT id FROM accreditation_entries WHERE 'korean' = ANY(hospital_types));
DELETE FROM accreditation_entries WHERE 'korean' = ANY(hospital_types);
DELETE FROM accreditation_chapters WHERE 'korean' = ANY(hospital_types);

INSERT INTO accreditation_chapters (area_id, code, title, hospital_types, sort_order)
SELECT a.id, 'CH-01-KOREAN', '1장. 안전보장활동', ARRAY['korean'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-02-KOREAN', '2장. 지속적 질 향상 및 환자안전', ARRAY['korean'], 2
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-03-KOREAN', '3장. 진료전달체계와 평가', ARRAY['korean'], 3
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-04-KOREAN', '4장. 환자진료', ARRAY['korean'], 4
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-05-KOREAN', '5장. 의약품관리', ARRAY['korean'], 5
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-06-KOREAN', '6장. 환자권리존중 및 보호', ARRAY['korean'], 6
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-07-KOREAN', '7장. 경영 및 조직운영', ARRAY['korean'], 7
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-08-KOREAN', '8장. 인적자원관리', ARRAY['korean'], 8
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-09-KOREAN', '9장. 감염관리', ARRAY['korean'], 9
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-10-KOREAN', '10장. 안전한 시설 및 환경관리', ARRAY['korean'], 10
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-11-KOREAN', '11장. 의료정보/의무기록 관리', ARRAY['korean'], 11
FROM accreditation_areas a WHERE a.code = 'GL';

INSERT INTO accreditation_entries (chapter_id, code, title, description, hospital_types, sort_order)
SELECT c.id, 'STD-KOREAN-1.1.1', '정확한 환자확인', '의약품 투여·검사·처치·시술 전 두 가지 이상 지표를 이용한 정확한 환자 확인 절차 수립·이행', ARRAY['korean'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-01-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-1.1.2', '의료진 간 정확한 의사소통', '구두처방·필요시처방(p.r.n) 관리, 혼동하기 쉬운 부정확한 처방에 대한 대처방안 수립·이행', ARRAY['korean'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-01-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-1.1.3', '낙상 예방활동', '낙상 위험 평가도구를 이용한 평가, 고위험환자 예방활동, 낙상사고 보고 및 재평가', ARRAY['korean'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-01-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-1.1.4', '손위생 수행', '손위생 수행 규정 수립, 올바른 손위생 수행, 손위생 지원 자원 제공 및 이행률 모니터링', ARRAY['korean'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-01-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-1.2', '직원안전 관리활동', '직원 건강검진·예방접종, 주사침 자상 등 직원 안전사고 보고·처리 체계 운영', ARRAY['korean'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-01-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-1.3', '화재안전 관리활동', '화재 예방점검·소방교육·금연 규정 준수(4주기부터 필수 지정), 소방훈련, 화재 대응 절차 직원 숙지', ARRAY['korean'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-01-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-2.1', '질 향상 및 환자안전 운영체계', '질 향상·환자안전 운영 계획 수립, 위원회·담당인력 구성, 활동 지원', ARRAY['korean'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-02-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-2.2', '질 향상 활동', '질 향상 주제 선정·개선활동(PDCA) 수행, 결과 공유 및 경영진 보고', ARRAY['korean'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-02-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-2.3', '환자안전 보고체계 운영', '환자안전사건 보고체계 운영, 사건 분석·개선활동, 직원 공유 및 재발 방지', ARRAY['korean'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-02-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-2.4', '만족도 관리', '환자(보호자) 만족도 조사 수행, 결과 분석 및 개선활동 반영', ARRAY['korean'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-02-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-3.1.1', '외래환자 등록절차', '외래환자 등록 절차 수립·이행, 제공 서비스 정보 안내', ARRAY['korean'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-03-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-3.1.2', '입원환자 등록절차', '입원 수속 절차 수립·이행, 입원 시 필요 정보 제공', ARRAY['korean'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-03-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-3.1.3', '환자 담당 의료진 변경 시 정보공유', '담당 의료진 변경(전과·근무교대 등) 시 진료의 일관성·연속성을 위한 정보공유 절차 이행', ARRAY['korean'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-03-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-3.1.4', '퇴원 및 전원 절차', '퇴원·전원 절차 수립, 퇴원요약 정보 제공, 전원 시 진료정보 공유', ARRAY['korean'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-03-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-3.2.1', '외래환자 초기평가', '외래환자 초기평가 수행·기록, 타 기관 진료정보 확인', ARRAY['korean'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-03-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-3.2.2', '입원환자 초기평가', '의학적·간호·영양 초기평가를 정해진 시간 내 수행·기록하고 결과 공유', ARRAY['korean'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-03-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-3.3.1', '한방검사체계', '한방검사(맥진·설진·경락기능검사 등) 운영 규정 수립, 적격한 자의 수행, 결과 기록·활용 (한방검사 미시행 병원은 미해당)', ARRAY['korean'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-03-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-3.3.2', '검체검사체계', '검체검사 운영 규정, 안전한 검체 획득·결과 보고, 정도관리, 외부 의뢰 관리', ARRAY['korean'], 8
FROM accreditation_chapters c WHERE c.code = 'CH-03-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-3.3.3', '영상검사체계', '영상검사 운영 규정, 적격한 자의 수행·판독, 방사선 안전관리, 외부 의뢰 관리', ARRAY['korean'], 9
FROM accreditation_chapters c WHERE c.code = 'CH-03-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-4.1.1', '입원환자 치료계획', '초기평가에 근거한 치료계획 수립·수행, 환자·보호자에게 설명, 경과에 따른 재수립', ARRAY['korean'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-04-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-4.1.2', '협의진료체계', '진료과 간(한·양방 협진 포함) 협의진료 절차 수립, 적시 의뢰·회신', ARRAY['korean'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-04-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-4.1.3', '침 시술 관리', '침 시술 규정(시술 전 확인·시술자 자격·일회용 침 사용·부작용 대응), 시술 기록 관리', ARRAY['korean'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-04-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-4.1.4', '약침 시술 관리', '약침 시술 규정(약침액 보관·유효기간 관리·시술 전 확인·부작용 대응), 시술 기록 관리', ARRAY['korean'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-04-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-4.1.5', '뜸 시술 관리', '뜸 시술 규정(화상 예방·환기 관리·시술 중 관찰), 시술 기록 관리', ARRAY['korean'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-04-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-4.1.6', '부항 시술 관리', '부항 시술 규정(습식·건식 구분 관리, 기구 소독, 감염 예방), 시술 기록 관리', ARRAY['korean'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-04-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-4.1.7', '수기요법 관리', '추나 등 수기요법 시술 규정(적응증·금기증 확인, 시술자 자격), 시술 기록 관리', ARRAY['korean'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-04-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-4.1.8', '기타 한방시술 관리', '기타 한방시술(전기침·온열요법 등) 안전 규정, 시술 전 확인·기록 관리', ARRAY['korean'], 8
FROM accreditation_chapters c WHERE c.code = 'CH-04-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-4.1.9', '통증관리', '통증 초기평가·재평가, 통증 관리 수행 및 기록', ARRAY['korean'], 9
FROM accreditation_chapters c WHERE c.code = 'CH-04-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-4.1.10', '영양관리', '환자 상태에 맞는 영양 공급, 치료식 관리, 영양 상담', ARRAY['korean'], 10
FROM accreditation_chapters c WHERE c.code = 'CH-04-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-4.1.11', '욕창관리', '욕창 위험 평가, 고위험환자 예방활동, 욕창 발생 시 치료·재평가', ARRAY['korean'], 11
FROM accreditation_chapters c WHERE c.code = 'CH-04-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-4.2.1', '심폐소생술 관리', '심폐소생술 대응 체계(응급호출·응급카트·제세동기), 직원 교육·훈련', ARRAY['korean'], 12
FROM accreditation_chapters c WHERE c.code = 'CH-04-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-4.2.2', '수혈환자 관리', '수혈 전 검사·동의, 정확한 혈액 확인, 수혈 중 관찰 및 부작용 대응', ARRAY['korean'], 13
FROM accreditation_chapters c WHERE c.code = 'CH-04-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-4.2.3', '감염성질환자 관리', '감염성질환자 식별·격리(주의) 지침 적용, 직원 보호구 착용, 전파 예방 관리', ARRAY['korean'], 14
FROM accreditation_chapters c WHERE c.code = 'CH-04-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-5.1', '의약품관리체계', '의약품(한약재 포함) 관리 체계 수립, 담당자 지정, 관리 현황 점검', ARRAY['korean'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-05-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-5.2', '의약품 선정', '의약품·한약재 선정 기준과 절차 수립(원산지·규격품 확인 포함), 신규 의약품 심의', ARRAY['korean'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-05-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-5.3', '의약품 보관', '의약품·한약재 보관 기준(온습도·차광·유효기간), 고위험 의약품 구분 보관, 탕전실 관리', ARRAY['korean'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-05-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-5.4', '조제', '처방 검토 후 안전한 조제(탕약·환제 포함), 조제 환경 위생 관리', ARRAY['korean'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-05-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-5.5', '투약 및 모니터링', '정확한 투약(5R) 수행, 투약 설명, 부작용 모니터링·보고', ARRAY['korean'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-05-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-6.1', '환자권리존중 및 보호', '환자 권리·책임 고지, 사생활 보호, 신체 노출 최소화, 개인정보 보호', ARRAY['korean'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-06-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-6.2', '취약환자 권리보호', '취약환자(노인·장애인·학대 피해자 등) 유형 정의, 보호 절차 및 지원체계 운영', ARRAY['korean'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-06-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-6.3', '불만고충처리', '불만·고충 접수 창구 운영, 처리 절차·기한 관리, 결과 환류', ARRAY['korean'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-06-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-6.4', '동의서', '동의서 필요 항목 정의(시술·수혈·마취 등), 충분한 설명 후 동의 취득·보관', ARRAY['korean'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-06-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-7.1', '의료기관 운영방침', '미션·비전·운영방침 수립, 직원 공유, 부서 운영계획 연계', ARRAY['korean'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-07-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-7.2', '합리적인 의사결정', '경영진의 의사결정 체계(위원회·회의체) 운영, 조직도·업무분장 관리', ARRAY['korean'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-07-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-7.3', '의료사회복지체계', '의료사회복지 서비스(경제적 지원 연계·지역사회 자원 연계) 운영', ARRAY['korean'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-07-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-8.1', '인사정보관리', '직원 인사정보(면허·자격·경력) 관리, 최신성 유지', ARRAY['korean'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-08-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-8.2', '직원교육', '신규직원 교육, 법정 의무교육, 직무교육 계획 수립·수행·평가', ARRAY['korean'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-08-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-8.3', '의료인력 법적기준', '한의사·간호인력 등 보건의료인력의 법적 기준 준수 및 현황 관리', ARRAY['korean'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-08-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-9.1', '감염관리체계', '감염관리 체계(담당자·위원회) 구성, 연간 감염관리 계획 수립·수행', ARRAY['korean'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-09-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-9.2.1', '기구 감염관리', '침·부항 등 한방 시술기구 포함 의료기구의 사용·재사용 감염관리 기준 수립·이행', ARRAY['korean'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-09-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-9.2.2', '기구 세척·소독·멸균 관리', '세척·소독·멸균 절차 수립, 멸균기 관리·멸균 확인(BI 등), 멸균물품 보관 관리', ARRAY['korean'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-09-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-9.3.1', '조리장 감염관리', '조리장 위생 관리(식재료 보관·조리기구·배식 과정), 조리 종사자 위생 관리', ARRAY['korean'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-09-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-9.3.2', '세탁물 감염관리', '오염·비오염 세탁물 구분 수거·보관·운반, 세탁물 처리 위생 관리', ARRAY['korean'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-09-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-10.1', '시설 및 환경 안전관리', '시설안전 관리 계획 수립, 정기 시설 점검, 환경 안전 개선활동', ARRAY['korean'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-10-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-10.2', '설비시스템 관리', '전기·물·의료가스·공조 등 설비시스템 점검·유지 관리, 비상 대응 계획', ARRAY['korean'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-10-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-10.3', '위험물질 관리', '위험물질 목록화, 보관·취급·폐기 기준, 노출 시 대응 절차', ARRAY['korean'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-10-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-10.4', '보안관리', '보안 취약구역 관리, 출입 통제, 보안사고 대응 절차', ARRAY['korean'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-10-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-10.5', '의료기기 안전관리', '의료기기 목록·정기 점검, 예방 정비, 사용자 교육', ARRAY['korean'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-10-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-11.1', '의료정보/의무기록 관리', '의무기록 작성·관리 규정, 기록 접근 권한 관리, 대출·열람 관리', ARRAY['korean'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-11-KOREAN'
UNION ALL
SELECT c.id, 'STD-KOREAN-11.2', '의무기록 완결도 관리', '퇴원환자 의무기록의 완결도 점검(기한 내 완결·필수 서식 포함 여부), 미비 기록 관리', ARRAY['korean'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-11-KOREAN';

INSERT INTO accreditation_survey_items (entry_id, code, title, description, sop_type, is_mandatory, is_pilot, severity, hospital_types, required_evidence, sort_order)
SELECT e.id, 'ME-KOREAN-1.1.1', '정확한 환자확인', '의약품 투여·검사·처치·시술 전 두 가지 이상 지표를 이용한 정확한 환자 확인 절차 수립·이행', 'process', true, false, 'major', ARRAY['korean'], '환자 확인 수행 기록; 직원 교육 이수 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-1.1.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-1.1.2', '의료진 간 정확한 의사소통', '구두처방·필요시처방(p.r.n) 관리, 혼동하기 쉬운 부정확한 처방에 대한 대처방안 수립·이행', 'process', true, false, 'major', ARRAY['korean'], '구두처방 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-1.1.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-1.1.3', '낙상 예방활동', '낙상 위험 평가도구를 이용한 평가, 고위험환자 예방활동, 낙상사고 보고 및 재평가', 'process', true, false, 'major', ARRAY['korean'], '낙상 위험 평가 기록; 낙상 예방활동 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-1.1.3'
UNION ALL
SELECT e.id, 'ME-KOREAN-1.1.4', '손위생 수행', '손위생 수행 규정 수립, 올바른 손위생 수행, 손위생 지원 자원 제공 및 이행률 모니터링', 'process', true, false, 'major', ARRAY['korean'], '손위생 수행률 모니터링 자료; 손위생 교육 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-1.1.4'
UNION ALL
SELECT e.id, 'ME-KOREAN-1.2', '직원안전 관리활동', '직원 건강검진·예방접종, 주사침 자상 등 직원 안전사고 보고·처리 체계 운영', 'process', true, false, 'major', ARRAY['korean'], '직원 건강검진 결과; 안전사고 처리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-1.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-1.3', '화재안전 관리활동', '화재 예방점검·소방교육·금연 규정 준수(4주기부터 필수 지정), 소방훈련, 화재 대응 절차 직원 숙지', 'process', true, false, 'major', ARRAY['korean'], '소방훈련 실시 기록; 소방교육 이수 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-1.3'
UNION ALL
SELECT e.id, 'ME-KOREAN-2.1', '질 향상 및 환자안전 운영체계', '질 향상·환자안전 운영 계획 수립, 위원회·담당인력 구성, 활동 지원', 'process', true, false, 'major', ARRAY['korean'], '위원회 운영 기록; 활동 실적 보고서', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-2.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-2.2', '질 향상 활동', '질 향상 주제 선정·개선활동(PDCA) 수행, 결과 공유 및 경영진 보고', 'process', true, false, 'major', ARRAY['korean'], '개선활동 수행 기록; 결과 공유 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-2.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-2.3', '환자안전 보고체계 운영', '환자안전사건 보고체계 운영, 사건 분석·개선활동, 직원 공유 및 재발 방지', 'process', true, false, 'major', ARRAY['korean'], '사건 보고·분석 기록; 개선활동 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-2.3'
UNION ALL
SELECT e.id, 'ME-KOREAN-2.4', '만족도 관리', '환자(보호자) 만족도 조사 수행, 결과 분석 및 개선활동 반영', 'process', true, false, 'major', ARRAY['korean'], '만족도 조사 결과 보고서; 개선 반영 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-2.4'
UNION ALL
SELECT e.id, 'ME-KOREAN-3.1.1', '외래환자 등록절차', '외래환자 등록 절차 수립·이행, 제공 서비스 정보 안내', 'process', true, false, 'major', ARRAY['korean'], '외래환자 등록 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-3.1.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-3.1.2', '입원환자 등록절차', '입원 수속 절차 수립·이행, 입원 시 필요 정보 제공', 'process', true, false, 'major', ARRAY['korean'], '입원 절차 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-3.1.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-3.1.3', '환자 담당 의료진 변경 시 정보공유', '담당 의료진 변경(전과·근무교대 등) 시 진료의 일관성·연속성을 위한 정보공유 절차 이행', 'process', true, false, 'major', ARRAY['korean'], '인수인계 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-3.1.3'
UNION ALL
SELECT e.id, 'ME-KOREAN-3.1.4', '퇴원 및 전원 절차', '퇴원·전원 절차 수립, 퇴원요약 정보 제공, 전원 시 진료정보 공유', 'process', true, false, 'major', ARRAY['korean'], '퇴원요약지 작성 기록; 전원 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-3.1.4'
UNION ALL
SELECT e.id, 'ME-KOREAN-3.2.1', '외래환자 초기평가', '외래환자 초기평가 수행·기록, 타 기관 진료정보 확인', 'process', true, false, 'major', ARRAY['korean'], '외래 초기평가 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-3.2.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-3.2.2', '입원환자 초기평가', '의학적·간호·영양 초기평가를 정해진 시간 내 수행·기록하고 결과 공유', 'process', true, false, 'major', ARRAY['korean'], '초기평가 기한 내 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-3.2.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-3.3.1', '한방검사체계', '한방검사(맥진·설진·경락기능검사 등) 운영 규정 수립, 적격한 자의 수행, 결과 기록·활용 (한방검사 미시행 병원은 미해당)', 'process', true, false, 'major', ARRAY['korean'], '한방검사 수행 기록; 검사장비 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-3.3.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-3.3.2', '검체검사체계', '검체검사 운영 규정, 안전한 검체 획득·결과 보고, 정도관리, 외부 의뢰 관리', 'process', true, false, 'major', ARRAY['korean'], '검체검사 수행 기록; 정도관리 기록; 외부 의뢰 계약서', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-3.3.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-3.3.3', '영상검사체계', '영상검사 운영 규정, 적격한 자의 수행·판독, 방사선 안전관리, 외부 의뢰 관리', 'process', true, false, 'major', ARRAY['korean'], '영상검사 수행 기록; 방사선 안전관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-3.3.3'
UNION ALL
SELECT e.id, 'ME-KOREAN-4.1.1', '입원환자 치료계획', '초기평가에 근거한 치료계획 수립·수행, 환자·보호자에게 설명, 경과에 따른 재수립', 'process', true, false, 'major', ARRAY['korean'], '치료계획 수립·설명 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-4.1.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-4.1.2', '협의진료체계', '진료과 간(한·양방 협진 포함) 협의진료 절차 수립, 적시 의뢰·회신', 'process', true, false, 'major', ARRAY['korean'], '협의진료 의뢰·회신 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-4.1.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-4.1.3', '침 시술 관리', '침 시술 규정(시술 전 확인·시술자 자격·일회용 침 사용·부작용 대응), 시술 기록 관리', 'process', true, false, 'major', ARRAY['korean'], '침 시술 수행 기록; 일회용 침 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-4.1.3'
UNION ALL
SELECT e.id, 'ME-KOREAN-4.1.4', '약침 시술 관리', '약침 시술 규정(약침액 보관·유효기간 관리·시술 전 확인·부작용 대응), 시술 기록 관리', 'process', true, false, 'major', ARRAY['korean'], '약침 시술 수행 기록; 약침액 보관·유효기간 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-4.1.4'
UNION ALL
SELECT e.id, 'ME-KOREAN-4.1.5', '뜸 시술 관리', '뜸 시술 규정(화상 예방·환기 관리·시술 중 관찰), 시술 기록 관리', 'process', true, false, 'major', ARRAY['korean'], '뜸 시술 수행 기록; 화상 예방활동 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-4.1.5'
UNION ALL
SELECT e.id, 'ME-KOREAN-4.1.6', '부항 시술 관리', '부항 시술 규정(습식·건식 구분 관리, 기구 소독, 감염 예방), 시술 기록 관리', 'process', true, false, 'major', ARRAY['korean'], '부항 시술 수행 기록; 부항 기구 소독 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-4.1.6'
UNION ALL
SELECT e.id, 'ME-KOREAN-4.1.7', '수기요법 관리', '추나 등 수기요법 시술 규정(적응증·금기증 확인, 시술자 자격), 시술 기록 관리', 'process', true, false, 'major', ARRAY['korean'], '수기요법 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-4.1.7'
UNION ALL
SELECT e.id, 'ME-KOREAN-4.1.8', '기타 한방시술 관리', '기타 한방시술(전기침·온열요법 등) 안전 규정, 시술 전 확인·기록 관리', 'process', true, false, 'major', ARRAY['korean'], '시술 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-4.1.8'
UNION ALL
SELECT e.id, 'ME-KOREAN-4.1.9', '통증관리', '통증 초기평가·재평가, 통증 관리 수행 및 기록', 'process', true, false, 'major', ARRAY['korean'], '통증 평가·중재 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-4.1.9'
UNION ALL
SELECT e.id, 'ME-KOREAN-4.1.10', '영양관리', '환자 상태에 맞는 영양 공급, 치료식 관리, 영양 상담', 'process', true, false, 'major', ARRAY['korean'], '영양 평가·상담 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-4.1.10'
UNION ALL
SELECT e.id, 'ME-KOREAN-4.1.11', '욕창관리', '욕창 위험 평가, 고위험환자 예방활동, 욕창 발생 시 치료·재평가', 'process', true, false, 'major', ARRAY['korean'], '욕창 위험 평가 기록; 예방활동 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-4.1.11'
UNION ALL
SELECT e.id, 'ME-KOREAN-4.2.1', '심폐소생술 관리', '심폐소생술 대응 체계(응급호출·응급카트·제세동기), 직원 교육·훈련', 'process', true, false, 'major', ARRAY['korean'], 'CPR 교육 이수 기록; 응급장비 점검 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-4.2.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-4.2.2', '수혈환자 관리', '수혈 전 검사·동의, 정확한 혈액 확인, 수혈 중 관찰 및 부작용 대응', 'process', true, false, 'major', ARRAY['korean'], '수혈 수행 기록; 부작용 모니터링 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-4.2.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-4.2.3', '감염성질환자 관리', '감염성질환자 식별·격리(주의) 지침 적용, 직원 보호구 착용, 전파 예방 관리', 'process', true, false, 'major', ARRAY['korean'], '감염성질환자 관리 기록; 보호구 착용 교육 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-4.2.3'
UNION ALL
SELECT e.id, 'ME-KOREAN-5.1', '의약품관리체계', '의약품(한약재 포함) 관리 체계 수립, 담당자 지정, 관리 현황 점검', 'process', true, false, 'major', ARRAY['korean'], '의약품 관리 점검 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-5.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-5.2', '의약품 선정', '의약품·한약재 선정 기준과 절차 수립(원산지·규격품 확인 포함), 신규 의약품 심의', 'process', true, false, 'major', ARRAY['korean'], '선정 심의 기록; 규격품 입고 확인 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-5.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-5.3', '의약품 보관', '의약품·한약재 보관 기준(온습도·차광·유효기간), 고위험 의약품 구분 보관, 탕전실 관리', 'process', true, false, 'major', ARRAY['korean'], '보관 상태 점검 기록; 유효기간 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-5.3'
UNION ALL
SELECT e.id, 'ME-KOREAN-5.4', '조제', '처방 검토 후 안전한 조제(탕약·환제 포함), 조제 환경 위생 관리', 'process', true, false, 'major', ARRAY['korean'], '조제·감사 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-5.4'
UNION ALL
SELECT e.id, 'ME-KOREAN-5.5', '투약 및 모니터링', '정확한 투약(5R) 수행, 투약 설명, 부작용 모니터링·보고', 'process', true, false, 'major', ARRAY['korean'], '투약 수행 기록; 부작용 모니터링 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-5.5'
UNION ALL
SELECT e.id, 'ME-KOREAN-6.1', '환자권리존중 및 보호', '환자 권리·책임 고지, 사생활 보호, 신체 노출 최소화, 개인정보 보호', 'process', true, false, 'major', ARRAY['korean'], '권리 고지 기록; 직원 교육 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-6.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-6.2', '취약환자 권리보호', '취약환자(노인·장애인·학대 피해자 등) 유형 정의, 보호 절차 및 지원체계 운영', 'process', true, false, 'major', ARRAY['korean'], '취약환자 보호 활동 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-6.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-6.3', '불만고충처리', '불만·고충 접수 창구 운영, 처리 절차·기한 관리, 결과 환류', 'process', true, false, 'major', ARRAY['korean'], '불만 접수·처리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-6.3'
UNION ALL
SELECT e.id, 'ME-KOREAN-6.4', '동의서', '동의서 필요 항목 정의(시술·수혈·마취 등), 충분한 설명 후 동의 취득·보관', 'process', true, false, 'major', ARRAY['korean'], '동의서 취득 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-6.4'
UNION ALL
SELECT e.id, 'ME-KOREAN-7.1', '의료기관 운영방침', '미션·비전·운영방침 수립, 직원 공유, 부서 운영계획 연계', 'process', true, false, 'major', ARRAY['korean'], '직원 공유·교육 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-7.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-7.2', '합리적인 의사결정', '경영진의 의사결정 체계(위원회·회의체) 운영, 조직도·업무분장 관리', 'process', true, false, 'major', ARRAY['korean'], '회의 운영 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-7.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-7.3', '의료사회복지체계', '의료사회복지 서비스(경제적 지원 연계·지역사회 자원 연계) 운영', 'process', true, false, 'major', ARRAY['korean'], '상담·연계 서비스 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-7.3'
UNION ALL
SELECT e.id, 'ME-KOREAN-8.1', '인사정보관리', '직원 인사정보(면허·자격·경력) 관리, 최신성 유지', 'process', true, false, 'major', ARRAY['korean'], '면허·자격 확인 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-8.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-8.2', '직원교육', '신규직원 교육, 법정 의무교육, 직무교육 계획 수립·수행·평가', 'process', true, false, 'major', ARRAY['korean'], '교육 수행·이수 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-8.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-8.3', '의료인력 법적기준', '한의사·간호인력 등 보건의료인력의 법적 기준 준수 및 현황 관리', 'process', true, false, 'critical', ARRAY['korean'], '인력 현황 및 법적 기준 준수 증빙', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-8.3'
UNION ALL
SELECT e.id, 'ME-KOREAN-9.1', '감염관리체계', '감염관리 체계(담당자·위원회) 구성, 연간 감염관리 계획 수립·수행', 'process', true, false, 'major', ARRAY['korean'], '감염관리 활동 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-9.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-9.2.1', '기구 감염관리', '침·부항 등 한방 시술기구 포함 의료기구의 사용·재사용 감염관리 기준 수립·이행', 'process', true, false, 'major', ARRAY['korean'], '기구 관리 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-9.2.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-9.2.2', '기구 세척·소독·멸균 관리', '세척·소독·멸균 절차 수립, 멸균기 관리·멸균 확인(BI 등), 멸균물품 보관 관리', 'process', true, false, 'major', ARRAY['korean'], '멸균 확인 기록; 멸균물품 보관 점검 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-9.2.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-9.3.1', '조리장 감염관리', '조리장 위생 관리(식재료 보관·조리기구·배식 과정), 조리 종사자 위생 관리', 'process', true, false, 'major', ARRAY['korean'], '위생 점검 기록; 종사자 건강진단 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-9.3.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-9.3.2', '세탁물 감염관리', '오염·비오염 세탁물 구분 수거·보관·운반, 세탁물 처리 위생 관리', 'process', true, false, 'major', ARRAY['korean'], '세탁물 구분 처리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-9.3.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-10.1', '시설 및 환경 안전관리', '시설안전 관리 계획 수립, 정기 시설 점검, 환경 안전 개선활동', 'process', true, false, 'major', ARRAY['korean'], '시설 점검·개선 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-10.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-10.2', '설비시스템 관리', '전기·물·의료가스·공조 등 설비시스템 점검·유지 관리, 비상 대응 계획', 'process', true, false, 'major', ARRAY['korean'], '설비 점검 기록; 비상전원 점검 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-10.2'
UNION ALL
SELECT e.id, 'ME-KOREAN-10.3', '위험물질 관리', '위험물질 목록화, 보관·취급·폐기 기준, 노출 시 대응 절차', 'process', true, false, 'major', ARRAY['korean'], '위험물질 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-10.3'
UNION ALL
SELECT e.id, 'ME-KOREAN-10.4', '보안관리', '보안 취약구역 관리, 출입 통제, 보안사고 대응 절차', 'process', true, false, 'major', ARRAY['korean'], '보안 점검·사고 대응 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-10.4'
UNION ALL
SELECT e.id, 'ME-KOREAN-10.5', '의료기기 안전관리', '의료기기 목록·정기 점검, 예방 정비, 사용자 교육', 'process', true, false, 'major', ARRAY['korean'], '의료기기 점검·정비 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-10.5'
UNION ALL
SELECT e.id, 'ME-KOREAN-11.1', '의료정보/의무기록 관리', '의무기록 작성·관리 규정, 기록 접근 권한 관리, 대출·열람 관리', 'process', true, false, 'major', ARRAY['korean'], '기록 관리 수행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-11.1'
UNION ALL
SELECT e.id, 'ME-KOREAN-11.2', '의무기록 완결도 관리', '퇴원환자 의무기록의 완결도 점검(기한 내 완결·필수 서식 포함 여부), 미비 기록 관리', 'process', true, false, 'major', ARRAY['korean'], '완결도 점검 결과; 미비 기록 개선 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-KOREAN-11.2';

-- ==================== rehabilitation ====================
DELETE FROM accreditation_survey_items WHERE 'rehabilitation' = ANY(hospital_types);
DELETE FROM accreditation_categories WHERE entry_id IN (SELECT id FROM accreditation_entries WHERE 'rehabilitation' = ANY(hospital_types));
DELETE FROM accreditation_entries WHERE 'rehabilitation' = ANY(hospital_types);
DELETE FROM accreditation_chapters WHERE 'rehabilitation' = ANY(hospital_types);

INSERT INTO accreditation_chapters (area_id, code, title, hospital_types, sort_order)
SELECT a.id, 'CH-01-REHAB', '1장. 환자안전보장활동', ARRAY['rehabilitation'], 1
FROM accreditation_areas a WHERE a.code = 'PS'
UNION ALL
SELECT a.id, 'CH-02-REHAB', '2장. 진료전달체계와 평가', ARRAY['rehabilitation'], 2
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-03-REHAB', '3장. 환자진료', ARRAY['rehabilitation'], 3
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-04-REHAB', '4장. 의약품관리', ARRAY['rehabilitation'], 4
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-05-REHAB', '5장. 환자권리존중 및 보호', ARRAY['rehabilitation'], 5
FROM accreditation_areas a WHERE a.code = 'PC'
UNION ALL
SELECT a.id, 'CH-06-REHAB', '6장. 질 향상 및 환자안전 활동', ARRAY['rehabilitation'], 6
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-07-REHAB', '7장. 감염관리', ARRAY['rehabilitation'], 7
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-08-REHAB', '8장. 경영 및 조직운영', ARRAY['rehabilitation'], 8
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-09-REHAB', '9장. 인적자원 관리', ARRAY['rehabilitation'], 9
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-10-REHAB', '10장. 시설 및 환경관리', ARRAY['rehabilitation'], 10
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-11-REHAB', '11장. 의료정보/의무기록 관리', ARRAY['rehabilitation'], 11
FROM accreditation_areas a WHERE a.code = 'GL'
UNION ALL
SELECT a.id, 'CH-12-REHAB', '12장. 성과관리', ARRAY['rehabilitation'], 12
FROM accreditation_areas a WHERE a.code = 'QS';

INSERT INTO accreditation_entries (chapter_id, code, title, description, hospital_types, sort_order)
SELECT c.id, 'STD-REHAB-1.1', '정확한 환자 확인 및 의사소통', '정확한 의사소통 규정 수립, 환자 확인 절차, 구두처방·필요시처방(p.r.n) 안전 수행', ARRAY['rehabilitation'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-01-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-1.2', '낙상 예방활동', '낙상 예방 규정, 입원 시 초기 낙상위험 평가·고위험환자 예방활동·상태변화 시 재평가', ARRAY['rehabilitation'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-01-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-1.3', '손위생 수행', '손위생 수행 규정, 올바른 손위생 수행, 손위생 자원(알코올 제제 등) 지원', ARRAY['rehabilitation'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-01-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-2.1.1', '외래환자 등록절차', '외래환자 등록절차 수립·이행, 등록 시 환자에게 필요한 정보 제공', ARRAY['rehabilitation'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-02-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-2.1.2', '입원수속 절차', '입원 절차 수립, 순서배정·입원 지연 환자 관리, 입원 시 환자 정보 제공', ARRAY['rehabilitation'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-02-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-2.1.3', '환자진료의 일관성 및 연속성 유지', '책임의사 지정·교대 시 정보공유, 전과/전동 기록, 근무교대 시 환자 상태 공유 및 보고체계', ARRAY['rehabilitation'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-02-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-2.1.4', '퇴원 및 전원 절차', '퇴원·전원 절차, 환자 참여 퇴원 결정, 퇴원요약지 작성, 전원·의뢰 서비스 제공', ARRAY['rehabilitation'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-02-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-2.2.1', '외래환자 초기평가', '외래환자 초기평가 규정, 의뢰 환자 정보 확인, 의사의 외래 초기평가 수행 및 기록', ARRAY['rehabilitation'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-02-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-2.2.2', '입원환자 초기평가/재평가', '입원환자 의학적·간호·영양 초기평가(24시간 이내), 의학적 재평가 규정·수행 기록', ARRAY['rehabilitation'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-02-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-2.3.1', '검체검사 관리', '검체검사 운영 규정, 적격자 시행·판독, 검체 안전 획득·확인·결과 보고·정도관리', ARRAY['rehabilitation'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-02-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-2.3.2', '영상검사 관리', '영상검사 운영 규정, 적격자 시행·판독, 검사 전 준비·확인 절차, 결과 보고·정도관리', ARRAY['rehabilitation'], 8
FROM accreditation_chapters c WHERE c.code = 'CH-02-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-2.3.3', '검사실 안전관리', '검사실 안전관리 규정, 검체검사실 안전관리, 방사선 안전관리', ARRAY['rehabilitation'], 9
FROM accreditation_chapters c WHERE c.code = 'CH-02-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-3.1.1', '재활치료계획', '의사의 재활치료계획 수립, 경과 기록·재수립, 간호·치료사 기록, 치료계획 공유·설명, 퇴원계획 수립', ARRAY['rehabilitation'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-03-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-3.1.2', '협의진료체계', '협의진료 규정, 협의진료 의뢰 및 회신 수행', ARRAY['rehabilitation'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-03-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-3.1.3', '통증 관리', '통증관리 규정, 외래·입원환자 초기평가, 통증 관리, 입원환자 상태변화 시 재평가', ARRAY['rehabilitation'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-03-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-3.1.4', '영양관리', '영양관리 규정, 치료목적 식사 제공, 치료식 설명, 영양 상담', ARRAY['rehabilitation'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-03-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-3.1.5', '욕창관리', '욕창 예방관리 규정, 입원 시 욕창 확인, 초기·정기 위험 평가, 고위험 예방활동, 욕창 관리', ARRAY['rehabilitation'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-03-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-3.2.1', '심폐소생술 관리', '심폐소생술 규정, CPR 팀 운영, 필요물품·의약품 관리, 제세동기 적시 사용', ARRAY['rehabilitation'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-03-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-3.2.2', '신체보호대 관리', '신체보호대 사용 규정, 적절한 사용, 사용 관련 교육 시행', ARRAY['rehabilitation'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-03-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-3.2.3', '진정치료', '진정치료 규정, 적격자 수행, 진정 전 평가, 진정 중·후 모니터링·기록, 응급 대처', ARRAY['rehabilitation'], 8
FROM accreditation_chapters c WHERE c.code = 'CH-03-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-4.1', '의약품 확보', '의약품 선정·확보 규정, 의약품 선정, 의약품 정보 제공, 적절한 확보', ARRAY['rehabilitation'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-04-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-4.2', '의약품 안전 보관', '의약품 보관 규정, 전체·응급·마약류·고위험·주의의약품 안전 보관, 정기 감사, 안전 회수', ARRAY['rehabilitation'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-04-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-4.3', '의약품 처방 및 조제', '처방·조제 규정, 적격자 처방·조제 전 감사·조제·감사·라벨링, 조제환경 관리, 주사용 의약품 감염 안전관리, 운반', ARRAY['rehabilitation'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-04-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-4.4', '투약 및 모니터링', '투여 규정, 적격자 투여, 고위험의약품 주의사항 숙지, 투약 설명, 안전 폐기, 지참약 관리', ARRAY['rehabilitation'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-04-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-4.5', '의약품부작용 모니터링', '의약품 부작용 모니터링 규정, 발생 시 보고, 평가·관리, 결과 보고 및 공유 (시범기준)', ARRAY['rehabilitation'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-04-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-5.1', '환자 권리 존중 및 안전 보장', '환자 권리·의무 규정, 직원 인지, 정보 제공, 진료 참여, 사생활·신체노출·개인정보 보호', ARRAY['rehabilitation'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-05-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-5.2', '취약환자 권리보호', '취약환자 권리보호 규정, 학대·폭력피해자 보고·지원체계, 의사소통 어려운 환자 지원체계, 거동불편 환자 편의시설', ARRAY['rehabilitation'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-05-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-5.3', '불만 및 고충 관리', '불만·고충 관리 규정, 처리 절차 안내, 불만 처리, 정기 분석·개선, 결과 보고·공유', ARRAY['rehabilitation'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-05-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-5.4', '재활사회사업체계', '재활사회사업 체계, 직원 의뢰 절차 인지, 개인력 조사, 사회사업 상담, 지역사회 연계, 가정방문(시범)', ARRAY['rehabilitation'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-05-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-5.5', '동의서', '진료동의서 규정, 진정 동의서, 고위험의약품 사용동의서, 조영제 사용동의서 취득', ARRAY['rehabilitation'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-05-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-5.6', '임상연구관리', '임상연구 관리 규정, 목록 관리, 적격자, 심의위원회 운영, 연구 정보 제공, 동의서 취득, 이상반응 보고, 기밀 보안', ARRAY['rehabilitation'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-05-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-6.1', '질 향상 및 환자안전 운영체계', '규정·위원회 운영, 담당 부서·적격자, 활동 계획·교육 계획, 자원 지원', ARRAY['rehabilitation'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-06-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-6.2', '환자안전사건 관리', '환자안전사건 관리 절차, 직원 보고 인식, 분류·분석, 개선활동, 결과 보고·공유, 적신호사건 정보 제공(시범), 주의경보 공유', ARRAY['rehabilitation'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-06-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-6.3', '질 향상 활동', '우선순위 주제 선정, 활동방법·통계기법 사용, 성과 지속 관리, 결과 보고·공유', ARRAY['rehabilitation'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-06-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-7.1', '감염예방·관리체계', '감염 예방·관리 규정, 위원회 운영, 감염관리 담당 부서·적격자', ARRAY['rehabilitation'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-07-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-7.2', '감염예방·관리 교육', '감염관리 교육 계획, 직원·상시출입자 교육, 환자·보호자 정보 제공', ARRAY['rehabilitation'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-07-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-7.3', '의료기구 감염관리', '의료기구 감염관리 규정, 호흡기 치료기구·유치도뇨관·혈관 내 카테터 관련 감염관리', ARRAY['rehabilitation'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-07-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-7.4', '세척·소독·멸균 및 세탁물 관리', '세척·소독·멸균 규정, 중앙공급실 운영, 기구 세척·소독·멸균, 멸균기 관리, 멸균물품·세탁물 관리', ARRAY['rehabilitation'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-07-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-7.5', '환자치료영역 환경관리', '환경관리 규정, 청소·소독 수행, 치료실 수질·음용수 관리', ARRAY['rehabilitation'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-07-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-7.6', '급식서비스 관리', '급식서비스 관리 규정, 식재료·조리기구·장비·조리장 환경 관리, 직원 개인위생', ARRAY['rehabilitation'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-07-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-7.7', '감염성질환 환자관리', '감염성질환 관리 규정, 유행성 감염병 외래 관리, 감염병 전파경로별 환자 관리', ARRAY['rehabilitation'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-07-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-7.8', '내시경실 및 인공신장실 감염관리', '내시경실 감염관리 규정, 내시경·부속기구 세척·소독·멸균·보관, 인공신장실 감염관리·투석기·투석용수 관리', ARRAY['rehabilitation'], 8
FROM accreditation_chapters c WHERE c.code = 'CH-07-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-8.1', '합리적인 의사결정', '의료기관 운영 규정, 의사결정조직(회의체) 정기 운영, 규정(정책과 절차) 관리', ARRAY['rehabilitation'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-08-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-8.2', '의료기관 운영방침', '미션 수립·공지·이행 활동, 직원의 미션 인지', ARRAY['rehabilitation'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-08-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-8.3', '윤리적 갈등관리', '진료 및 직원 윤리적 갈등(의료기관 내 폭력 포함) 해결 지원체계 수립·운영', ARRAY['rehabilitation'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-08-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-9.1', '인사관리체계', '인사정보 관리체계, 의사·간호사·물리치료사·작업치료사·사회복지사·기타 인력 인사정보 관리', ARRAY['rehabilitation'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-09-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-9.2', '직원교육', '직원 교육체계·교육 계획, 신규직원 교육, 직무수행 필수교육, 특성화 교육', ARRAY['rehabilitation'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-09-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-9.3', '의료인력 기준', '재활의학과 전문의·간호사·물리치료사·작업치료사·사회복지사·기타 의료인력 법정 기준 준수', ARRAY['rehabilitation'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-09-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-9.4', '직원안전 관리활동', '직원 건강·안전 관리 규정·계획, 건강유지·안전활동 수행, 안전사고 보고·관리·경영진 보고', ARRAY['rehabilitation'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-09-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-10.1', '시설 및 환경 안전관리', '시설·환경 안전 관리 규정·책임자, 교육, 사고 보고절차 인지, 결과 보고, 안전 관리 계획·수행', ARRAY['rehabilitation'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-10-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-10.2', '설비시스템 관리', '설비시스템 관리 규정, 전기설비·급수설비·수질·의료가스·진공설비·실내공기질 안전 관리', ARRAY['rehabilitation'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-10-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-10.3', '위험물질 관리', '유해화학물질·의료폐기물 관리 규정, 유해화학물질·의료폐기물 안전 관리', ARRAY['rehabilitation'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-10-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-10.4', '보안관리', '환자안전 보안체계, 보안사고 예방·보고, 병문안객 관리', ARRAY['rehabilitation'], 4
FROM accreditation_chapters c WHERE c.code = 'CH-10-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-10.5', '의료기기 및 치료도구 관리', '의료기기·치료도구 관리 규정, 목록 관리, 예방점검, 안전 회수, 오작동·사고 대처방안', ARRAY['rehabilitation'], 5
FROM accreditation_chapters c WHERE c.code = 'CH-10-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-10.6', '화재안전 관리활동', '화재안전 관리 규정·계획, 화재예방점검, 화재 시 대응절차, 소방시설 관리, 직원 교육·훈련', ARRAY['rehabilitation'], 6
FROM accreditation_chapters c WHERE c.code = 'CH-10-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-10.7', '재난관리체계', '[시범] 재난관리 규정(발생 가능성 높은 재난 유형 파악·재난 시 의사소통·자원관리), 연 1회 이상 모의훈련 계획 수립, 모의훈련 수행·평가 및 경영진 보고 (원내 화재는 10.6에서 다룸)', ARRAY['rehabilitation'], 7
FROM accreditation_chapters c WHERE c.code = 'CH-10-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-11.1', '의료정보/의무기록 관리', '의무기록 관리 규정, 의무기록 접근권한, 의무기록 열람·사본 발급, 의무기록 대출, 전자의무기록 시스템 보안, 의무기록 보관', ARRAY['rehabilitation'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-11-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-11.2', '퇴원환자 의무기록 완결도 관리', '의학적 초기평가·간호 초기평가·의사 경과기록·간호기록·치료사 경과기록·동의서·전과기록·퇴원요약 작성, 표준 코드 사용', ARRAY['rehabilitation'], 2
FROM accreditation_chapters c WHERE c.code = 'CH-11-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-11.3', '개인정보보호 및 보안', '개인정보 보호·보안 규정, 적격 담당자, 접근통제구역 출입 관리, 정보시스템 접근통제·접근권한 관리, 접속기록 보관', ARRAY['rehabilitation'], 3
FROM accreditation_chapters c WHERE c.code = 'CH-11-REHAB'
UNION ALL
SELECT c.id, 'STD-REHAB-12.1', '환자안전·질 향상 지표 관리', '낙상·손위생·욕창·재택복귀율·환자만족도 지표 관리, 지속적 모니터링·분석·개선', ARRAY['rehabilitation'], 1
FROM accreditation_chapters c WHERE c.code = 'CH-12-REHAB';

INSERT INTO accreditation_survey_items (entry_id, code, title, description, sop_type, is_mandatory, is_pilot, severity, hospital_types, required_evidence, sort_order)
SELECT e.id, 'ME-REHAB-1.1', '정확한 환자 확인 및 의사소통', '정확한 의사소통 규정 수립, 환자 확인 절차, 구두처방·필요시처방(p.r.n) 안전 수행', 'process', true, false, 'major', ARRAY['rehabilitation'], '구두처방 이행 기록; 환자확인 오류 발생 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-1.1'
UNION ALL
SELECT e.id, 'ME-REHAB-1.2', '낙상 예방활동', '낙상 예방 규정, 입원 시 초기 낙상위험 평가·고위험환자 예방활동·상태변화 시 재평가', 'process', true, false, 'major', ARRAY['rehabilitation'], '낙상 위험 평가 기록; 낙상 발생 모니터링 자료', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-1.2'
UNION ALL
SELECT e.id, 'ME-REHAB-1.3', '손위생 수행', '손위생 수행 규정, 올바른 손위생 수행, 손위생 자원(알코올 제제 등) 지원', 'process', true, false, 'major', ARRAY['rehabilitation'], '손위생 수행률 모니터링 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-1.3'
UNION ALL
SELECT e.id, 'ME-REHAB-2.1.1', '외래환자 등록절차', '외래환자 등록절차 수립·이행, 등록 시 환자에게 필요한 정보 제공', 'process', true, false, 'major', ARRAY['rehabilitation'], '외래 등록 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-2.1.1'
UNION ALL
SELECT e.id, 'ME-REHAB-2.1.2', '입원수속 절차', '입원 절차 수립, 순서배정·입원 지연 환자 관리, 입원 시 환자 정보 제공', 'process', true, false, 'major', ARRAY['rehabilitation'], '입원 지연 관리 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-2.1.2'
UNION ALL
SELECT e.id, 'ME-REHAB-2.1.3', '환자진료의 일관성 및 연속성 유지', '책임의사 지정·교대 시 정보공유, 전과/전동 기록, 근무교대 시 환자 상태 공유 및 보고체계', 'process', true, false, 'major', ARRAY['rehabilitation'], '전과·전동 기록 현황; 보고체계 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-2.1.3'
UNION ALL
SELECT e.id, 'ME-REHAB-2.1.4', '퇴원 및 전원 절차', '퇴원·전원 절차, 환자 참여 퇴원 결정, 퇴원요약지 작성, 전원·의뢰 서비스 제공', 'process', true, false, 'major', ARRAY['rehabilitation'], '퇴원요약지 작성률; 전원 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-2.1.4'
UNION ALL
SELECT e.id, 'ME-REHAB-2.2.1', '외래환자 초기평가', '외래환자 초기평가 규정, 의뢰 환자 정보 확인, 의사의 외래 초기평가 수행 및 기록', 'process', true, false, 'major', ARRAY['rehabilitation'], '외래 초기평가 기록 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-2.2.1'
UNION ALL
SELECT e.id, 'ME-REHAB-2.2.2', '입원환자 초기평가/재평가', '입원환자 의학적·간호·영양 초기평가(24시간 이내), 의학적 재평가 규정·수행 기록', 'process', true, false, 'major', ARRAY['rehabilitation'], '초기평가 24시간 이내 이행률', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-2.2.2'
UNION ALL
SELECT e.id, 'ME-REHAB-2.3.1', '검체검사 관리', '검체검사 운영 규정, 적격자 시행·판독, 검체 안전 획득·확인·결과 보고·정도관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '검체검사 정도관리 결과; 외부 의뢰 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-2.3.1'
UNION ALL
SELECT e.id, 'ME-REHAB-2.3.2', '영상검사 관리', '영상검사 운영 규정, 적격자 시행·판독, 검사 전 준비·확인 절차, 결과 보고·정도관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '영상검사 정도관리 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-2.3.2'
UNION ALL
SELECT e.id, 'ME-REHAB-2.3.3', '검사실 안전관리', '검사실 안전관리 규정, 검체검사실 안전관리, 방사선 안전관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '검사실 안전점검 결과; 방사선 노출 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-2.3.3'
UNION ALL
SELECT e.id, 'ME-REHAB-3.1.1', '재활치료계획', '의사의 재활치료계획 수립, 경과 기록·재수립, 간호·치료사 기록, 치료계획 공유·설명, 퇴원계획 수립', 'process', true, false, 'major', ARRAY['rehabilitation'], '치료계획 수립 현황; 퇴원계획 수립 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-3.1.1'
UNION ALL
SELECT e.id, 'ME-REHAB-3.1.2', '협의진료체계', '협의진료 규정, 협의진료 의뢰 및 회신 수행', 'process', true, false, 'major', ARRAY['rehabilitation'], '협의진료 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-3.1.2'
UNION ALL
SELECT e.id, 'ME-REHAB-3.1.3', '통증 관리', '통증관리 규정, 외래·입원환자 초기평가, 통증 관리, 입원환자 상태변화 시 재평가', 'process', true, false, 'major', ARRAY['rehabilitation'], '통증 평가 이행 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-3.1.3'
UNION ALL
SELECT e.id, 'ME-REHAB-3.1.4', '영양관리', '영양관리 규정, 치료목적 식사 제공, 치료식 설명, 영양 상담', 'process', true, false, 'major', ARRAY['rehabilitation'], '영양 상담 제공 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-3.1.4'
UNION ALL
SELECT e.id, 'ME-REHAB-3.1.5', '욕창관리', '욕창 예방관리 규정, 입원 시 욕창 확인, 초기·정기 위험 평가, 고위험 예방활동, 욕창 관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '욕창 위험 평가 기록; 욕창 발생률', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-3.1.5'
UNION ALL
SELECT e.id, 'ME-REHAB-3.2.1', '심폐소생술 관리', '심폐소생술 규정, CPR 팀 운영, 필요물품·의약품 관리, 제세동기 적시 사용', 'process', true, false, 'major', ARRAY['rehabilitation'], 'CPR 시행 기록; 제세동기 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-3.2.1'
UNION ALL
SELECT e.id, 'ME-REHAB-3.2.2', '신체보호대 관리', '신체보호대 사용 규정, 적절한 사용, 사용 관련 교육 시행', 'process', true, false, 'major', ARRAY['rehabilitation'], '신체보호대 사용 현황; 교육 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-3.2.2'
UNION ALL
SELECT e.id, 'ME-REHAB-3.2.3', '진정치료', '진정치료 규정, 적격자 수행, 진정 전 평가, 진정 중·후 모니터링·기록, 응급 대처', 'process', true, false, 'major', ARRAY['rehabilitation'], '진정치료 시행 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-3.2.3'
UNION ALL
SELECT e.id, 'ME-REHAB-4.1', '의약품 확보', '의약품 선정·확보 규정, 의약품 선정, 의약품 정보 제공, 적절한 확보', 'process', true, false, 'major', ARRAY['rehabilitation'], '의약품 목록; 의약품 정보 제공 자료', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-4.1'
UNION ALL
SELECT e.id, 'ME-REHAB-4.2', '의약품 안전 보관', '의약품 보관 규정, 전체·응급·마약류·고위험·주의의약품 안전 보관, 정기 감사, 안전 회수', 'process', true, false, 'major', ARRAY['rehabilitation'], '의약품 보관 감사 결과; 마약류 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-4.2'
UNION ALL
SELECT e.id, 'ME-REHAB-4.3', '의약품 처방 및 조제', '처방·조제 규정, 적격자 처방·조제 전 감사·조제·감사·라벨링, 조제환경 관리, 주사용 의약품 감염 안전관리, 운반', 'process', true, false, 'major', ARRAY['rehabilitation'], '처방·조제 오류 현황; 조제환경 점검 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-4.3'
UNION ALL
SELECT e.id, 'ME-REHAB-4.4', '투약 및 모니터링', '투여 규정, 적격자 투여, 고위험의약품 주의사항 숙지, 투약 설명, 안전 폐기, 지참약 관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '투약 오류 현황; 지참약 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-4.4'
UNION ALL
SELECT e.id, 'ME-REHAB-4.5', '의약품부작용 모니터링', '의약품 부작용 모니터링 규정, 발생 시 보고, 평가·관리, 결과 보고 및 공유 (시범기준)', 'process', true, false, 'major', ARRAY['rehabilitation'], '의약품 부작용 보고 현황; 부작용 분석·개선 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-4.5'
UNION ALL
SELECT e.id, 'ME-REHAB-5.1', '환자 권리 존중 및 안전 보장', '환자 권리·의무 규정, 직원 인지, 정보 제공, 진료 참여, 사생활·신체노출·개인정보 보호', 'process', true, false, 'major', ARRAY['rehabilitation'], '환자 권리 교육 기록; 개인정보 보호 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-5.1'
UNION ALL
SELECT e.id, 'ME-REHAB-5.2', '취약환자 권리보호', '취약환자 권리보호 규정, 학대·폭력피해자 보고·지원체계, 의사소통 어려운 환자 지원체계, 거동불편 환자 편의시설', 'process', true, false, 'major', ARRAY['rehabilitation'], '취약환자 지원 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-5.2'
UNION ALL
SELECT e.id, 'ME-REHAB-5.3', '불만 및 고충 관리', '불만·고충 관리 규정, 처리 절차 안내, 불만 처리, 정기 분석·개선, 결과 보고·공유', 'process', true, false, 'major', ARRAY['rehabilitation'], '불만·고충 처리 현황; 분석·개선 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-5.3'
UNION ALL
SELECT e.id, 'ME-REHAB-5.4', '재활사회사업체계', '재활사회사업 체계, 직원 의뢰 절차 인지, 개인력 조사, 사회사업 상담, 지역사회 연계, 가정방문(시범)', 'process', true, false, 'major', ARRAY['rehabilitation'], '사회사업 상담 현황; 지역사회 연계 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-5.4'
UNION ALL
SELECT e.id, 'ME-REHAB-5.5', '동의서', '진료동의서 규정, 진정 동의서, 고위험의약품 사용동의서, 조영제 사용동의서 취득', 'process', true, false, 'major', ARRAY['rehabilitation'], '동의서 취득 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-5.5'
UNION ALL
SELECT e.id, 'ME-REHAB-5.6', '임상연구관리', '임상연구 관리 규정, 목록 관리, 적격자, 심의위원회 운영, 연구 정보 제공, 동의서 취득, 이상반응 보고, 기밀 보안', 'process', true, false, 'major', ARRAY['rehabilitation'], '임상연구 목록; 심의위원회 운영 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-5.6'
UNION ALL
SELECT e.id, 'ME-REHAB-6.1', '질 향상 및 환자안전 운영체계', '규정·위원회 운영, 담당 부서·적격자, 활동 계획·교육 계획, 자원 지원', 'process', true, false, 'major', ARRAY['rehabilitation'], '위원회 운영 현황; QI 활동 계획서', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-6.1'
UNION ALL
SELECT e.id, 'ME-REHAB-6.2', '환자안전사건 관리', '환자안전사건 관리 절차, 직원 보고 인식, 분류·분석, 개선활동, 결과 보고·공유, 적신호사건 정보 제공(시범), 주의경보 공유', 'process', true, false, 'major', ARRAY['rehabilitation'], '환자안전사건 보고 현황; 개선활동 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-6.2'
UNION ALL
SELECT e.id, 'ME-REHAB-6.3', '질 향상 활동', '우선순위 주제 선정, 활동방법·통계기법 사용, 성과 지속 관리, 결과 보고·공유', 'process', true, false, 'major', ARRAY['rehabilitation'], 'QI 활동 주제 및 결과; 성과 개선 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-6.3'
UNION ALL
SELECT e.id, 'ME-REHAB-7.1', '감염예방·관리체계', '감염 예방·관리 규정, 위원회 운영, 감염관리 담당 부서·적격자', 'process', true, false, 'major', ARRAY['rehabilitation'], '감염관리 위원회 운영 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-7.1'
UNION ALL
SELECT e.id, 'ME-REHAB-7.2', '감염예방·관리 교육', '감염관리 교육 계획, 직원·상시출입자 교육, 환자·보호자 정보 제공', 'process', true, false, 'major', ARRAY['rehabilitation'], '감염관리 교육 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-7.2'
UNION ALL
SELECT e.id, 'ME-REHAB-7.3', '의료기구 감염관리', '의료기구 감염관리 규정, 호흡기 치료기구·유치도뇨관·혈관 내 카테터 관련 감염관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '기구 관련 감염 발생률', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-7.3'
UNION ALL
SELECT e.id, 'ME-REHAB-7.4', '세척·소독·멸균 및 세탁물 관리', '세척·소독·멸균 규정, 중앙공급실 운영, 기구 세척·소독·멸균, 멸균기 관리, 멸균물품·세탁물 관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '멸균기 관리 기록; 세탁물 처리 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-7.4'
UNION ALL
SELECT e.id, 'ME-REHAB-7.5', '환자치료영역 환경관리', '환경관리 규정, 청소·소독 수행, 치료실 수질·음용수 관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '치료실 수질 관리 결과; 환경관리 점검 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-7.5'
UNION ALL
SELECT e.id, 'ME-REHAB-7.6', '급식서비스 관리', '급식서비스 관리 규정, 식재료·조리기구·장비·조리장 환경 관리, 직원 개인위생', 'process', true, false, 'major', ARRAY['rehabilitation'], '급식 위생 점검 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-7.6'
UNION ALL
SELECT e.id, 'ME-REHAB-7.7', '감염성질환 환자관리', '감염성질환 관리 규정, 유행성 감염병 외래 관리, 감염병 전파경로별 환자 관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '감염병 관리 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-7.7'
UNION ALL
SELECT e.id, 'ME-REHAB-7.8', '내시경실 및 인공신장실 감염관리', '내시경실 감염관리 규정, 내시경·부속기구 세척·소독·멸균·보관, 인공신장실 감염관리·투석기·투석용수 관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '내시경 소독 이행 현황; 투석용수 수질 관리 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-7.8'
UNION ALL
SELECT e.id, 'ME-REHAB-8.1', '합리적인 의사결정', '의료기관 운영 규정, 의사결정조직(회의체) 정기 운영, 규정(정책과 절차) 관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '운영 회의체 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-8.1'
UNION ALL
SELECT e.id, 'ME-REHAB-8.2', '의료기관 운영방침', '미션 수립·공지·이행 활동, 직원의 미션 인지', 'process', true, false, 'major', ARRAY['rehabilitation'], '미션 공지 현황; 미션 이행 활동 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-8.2'
UNION ALL
SELECT e.id, 'ME-REHAB-8.3', '윤리적 갈등관리', '진료 및 직원 윤리적 갈등(의료기관 내 폭력 포함) 해결 지원체계 수립·운영', 'process', true, false, 'major', ARRAY['rehabilitation'], '윤리 갈등 처리 현황; 직장 내 폭력 관리 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-8.3'
UNION ALL
SELECT e.id, 'ME-REHAB-9.1', '인사관리체계', '인사정보 관리체계, 의사·간호사·물리치료사·작업치료사·사회복지사·기타 인력 인사정보 관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '직종별 인력 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-9.1'
UNION ALL
SELECT e.id, 'ME-REHAB-9.2', '직원교육', '직원 교육체계·교육 계획, 신규직원 교육, 직무수행 필수교육, 특성화 교육', 'process', true, false, 'major', ARRAY['rehabilitation'], '교육 이수 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-9.2'
UNION ALL
SELECT e.id, 'ME-REHAB-9.3', '의료인력 기준', '재활의학과 전문의·간호사·물리치료사·작업치료사·사회복지사·기타 의료인력 법정 기준 준수', 'process', true, false, 'critical', ARRAY['rehabilitation'], '직종별 인력 현황 및 기준 준수 증빙', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-9.3'
UNION ALL
SELECT e.id, 'ME-REHAB-9.4', '직원안전 관리활동', '직원 건강·안전 관리 규정·계획, 건강유지·안전활동 수행, 안전사고 보고·관리·경영진 보고', 'process', true, false, 'major', ARRAY['rehabilitation'], '직원 건강검진 현황; 직원 안전사고 처리 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-9.4'
UNION ALL
SELECT e.id, 'ME-REHAB-10.1', '시설 및 환경 안전관리', '시설·환경 안전 관리 규정·책임자, 교육, 사고 보고절차 인지, 결과 보고, 안전 관리 계획·수행', 'process', true, false, 'major', ARRAY['rehabilitation'], '시설·환경 안전점검 결과; 안전사고 처리 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-10.1'
UNION ALL
SELECT e.id, 'ME-REHAB-10.2', '설비시스템 관리', '설비시스템 관리 규정, 전기설비·급수설비·수질·의료가스·진공설비·실내공기질 안전 관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '전기·의료가스 점검 결과; 수질·공기질 검사 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-10.2'
UNION ALL
SELECT e.id, 'ME-REHAB-10.3', '위험물질 관리', '유해화학물질·의료폐기물 관리 규정, 유해화학물질·의료폐기물 안전 관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '유해화학물질 관리 현황; 의료폐기물 처리 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-10.3'
UNION ALL
SELECT e.id, 'ME-REHAB-10.4', '보안관리', '환자안전 보안체계, 보안사고 예방·보고, 병문안객 관리', 'process', true, false, 'major', ARRAY['rehabilitation'], '보안사고 현황; 병문안 관리 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-10.4'
UNION ALL
SELECT e.id, 'ME-REHAB-10.5', '의료기기 및 치료도구 관리', '의료기기·치료도구 관리 규정, 목록 관리, 예방점검, 안전 회수, 오작동·사고 대처방안', 'process', true, false, 'major', ARRAY['rehabilitation'], '의료기기 목록; 예방점검 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-10.5'
UNION ALL
SELECT e.id, 'ME-REHAB-10.6', '화재안전 관리활동', '화재안전 관리 규정·계획, 화재예방점검, 화재 시 대응절차, 소방시설 관리, 직원 교육·훈련', 'process', true, false, 'major', ARRAY['rehabilitation'], '화재예방점검 결과; 소방훈련 실적', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-10.6'
UNION ALL
SELECT e.id, 'ME-REHAB-10.7', '재난관리체계', '[시범] 재난관리 규정(발생 가능성 높은 재난 유형 파악·재난 시 의사소통·자원관리), 연 1회 이상 모의훈련 계획 수립, 모의훈련 수행·평가 및 경영진 보고 (원내 화재는 10.6에서 다룸)', 'process', true, false, 'major', ARRAY['rehabilitation'], '모의훈련 수행 기록; 평가 결과에 따른 개선방안; 경영진 보고 기록', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-10.7'
UNION ALL
SELECT e.id, 'ME-REHAB-11.1', '의료정보/의무기록 관리', '의무기록 관리 규정, 의무기록 접근권한, 의무기록 열람·사본 발급, 의무기록 대출, 전자의무기록 시스템 보안, 의무기록 보관', 'process', true, false, 'major', ARRAY['rehabilitation'], '의무기록 접근통제 현황; 의무기록 보관 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-11.1'
UNION ALL
SELECT e.id, 'ME-REHAB-11.2', '퇴원환자 의무기록 완결도 관리', '의학적 초기평가·간호 초기평가·의사 경과기록·간호기록·치료사 경과기록·동의서·전과기록·퇴원요약 작성, 표준 코드 사용', 'process', true, false, 'major', ARRAY['rehabilitation'], '의무기록 완결률; 퇴원요약지 완결률', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-11.2'
UNION ALL
SELECT e.id, 'ME-REHAB-11.3', '개인정보보호 및 보안', '개인정보 보호·보안 규정, 적격 담당자, 접근통제구역 출입 관리, 정보시스템 접근통제·접근권한 관리, 접속기록 보관', 'process', true, false, 'major', ARRAY['rehabilitation'], '정보시스템 접근통제 현황; 접속기록 보관 현황', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-11.3'
UNION ALL
SELECT e.id, 'ME-REHAB-12.1', '환자안전·질 향상 지표 관리', '낙상·손위생·욕창·재택복귀율·환자만족도 지표 관리, 지속적 모니터링·분석·개선', 'process', true, false, 'major', ARRAY['rehabilitation'], '분기별 낙상 발생 보고율; 손위생 수행률; 욕창 발생 보고율; 재택복귀율; 환자만족도 결과', 1
FROM accreditation_entries e WHERE e.code = 'STD-REHAB-12.1';
