-- ============================================================
-- AccrediQ — 병원별 규정집 자동 커스터마이징: 파일럿 마스터 템플릿 30종
-- 요양병원 15종은 lib/regulationLibrary.ts(2021년 실제 요양병원 규정집 43종,
--   병원명 비식별화 완료)의 목적·정의·정책 원문을 그대로 사용하고
--   "제5조(본원 적용사항)"에만 {{변수}} 슬롯을 추가한다(원문 문장은 변경하지 않음).
-- 정신병원 15종은 그에 대응하는 실제 원문 라이브러리가 없어,
--   lib/standardCatalog.ts의 PSYCHIATRIC_CHAPTERS 조사항목을 근거로 신규 작성한
--   파일럿 초안이다. 두 유형 모두 실제 병원 배포 전 법무/QPS 검수가 필요하다.
-- ============================================================

-- ============================================================
-- 요양병원 15종 (lib/regulationLibrary.ts 원문 기반)
-- ============================================================

INSERT INTO regulation_templates (template_code, hospital_type, title, entry_code, template_content, variable_schema, sort_order) VALUES

('ltc-fall-prevention', 'long_term_care', '낙상 예방활동 규정', '1.2', $tpl$제1조(목적) 낙상으로 인한 환자의 상해를 줄이기 위해 환자의 특성과 시설, 환경 등을 고려하여 낙상 예방활동을 수행한다.

제2조(용어의 정의) 낙상 : 본인의 의사와 상관없이 신체가 조절되지 않아 갑자기 바닥이나 낮은 곳으로 비의도적으로 이동하는 것 (Gibson,1990)

제3조(기본방침)
1. 입원 시 모든 환자에게 낙상위험 평가도구를 이용하여 초기 환자평가를 수행한다.
2. 낙상위험 평가 결과에 따라 고위험환자에 대한 낙상 예방활동을 수행한다.
3. 낙상위험 평가도구를 이용하여 정기적인 재평가를 수행한다.
4. 낙상발생 가능한 장소 또는 부서에서 낙상 예방활동을 수행한다.
5. 낙상 예방활동의 성과를 지속적으로 관리한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 간호부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 낙상 예방활동 적용 진료과·부서: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서: {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필(병상수·진료과·인력구성·특수부서·운영시간) 변경 시 재검토하며, 세부 평가도구·서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 1),

('ltc-care-continuity', 'long_term_care', '환자진료의 일관성 및 연속성 유지 규정', '2.1.3', $tpl$제1조(목적) 환자 담당 주치의 변경, 전동 및 직원의 근무교대 시 표준화된 의사소통 과정을 통해 정보의 연속성을 유지한다.

제2조(용어의 정의)
1. 전과: 환자 진료과가 변경되는 경우를 말한다.
2. 전동: 병동과 병동의 이동을 의미한다.
3. 진료과 내 주치의 변경: 동일 진료과 내에서 주치의가 변경되는 경우를 말한다.
4. 근무교대: 병동 간호사 근무조에 따른 교대 및 주치의의 근무교대(당직의↔주치의)를 말한다.

제3조(기본방침)
1. 주치의 변경 시 의료진 간 필요한 정보를 공유하기 위해 의무기록을 작성한다.
2. 전동 시 의료진 간 필요한 정보를 공유하기 위해 의무기록을 작성한다.
3. 근무교대 시 환자상태에 대한 정보를 공유한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 간호부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 전과·전동이 발생할 수 있는 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서: {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토하며, 세부 서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 2),

('ltc-discharge-transfer', 'long_term_care', '퇴원 및 전원절차 규정', '2.1.4', $tpl$제1조(목적) 진료의 연속성을 유지하기 위해 퇴원, 전원 및 의뢰 결정과정에 환자가 참여하며, 퇴원계획 수립, 퇴원 설명, 퇴원 후 추후관리 정보제공, 필요시 전원, 의뢰서비스 등을 제공한다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 퇴원 및 전원 절차가 있다.
2. 퇴원 전에 퇴원요약지를 작성한다.
3. 퇴원 시에는 진료의 연속성을 유지하기 위해 필요한 정보를 제공한다.
4. 전원 및 의뢰서비스를 제공한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 간호부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 퇴원·전원 절차가 적용되는 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서: {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토하며, 세부 서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 3),

('ltc-initial-assessment', 'long_term_care', '입원환자 초기평가 규정', '2.2', $tpl$제1조(목적) 정확하고 적절한 진료서비스를 제공하기 위해 입원환자의 요구를 확인하고 초기평가를 수행, 치료에 대한 반응을 파악하고 지속적 치료와 퇴원을 계획하기 위해 환자의 상태와 치료를 정기적으로 재평가하여 기록하며 환자 진료를 담당하는 직원과 공유한다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 의학적 초기평가는 24시간 이내에 수행하고 기록한다.
2. 간호 초기평가를 24시간 이내 수행하고 기록한다.
3. 영양 초기평가를 수행하고 기록한다.
4. 환자평가 기록은 환자 진료를 담당하는 직원과 공유한다.
5. 입원 시 초기검사를 수행한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 간호부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 초기평가에 협업하는 진료과: {{department_list}}
- 담당 인력 구성(의학적·간호·영양 초기평가 수행 인력): {{staff_summary}}
- 관련 특수부서: {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토하며, 세부 서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 4),

('ltc-cpr-management', 'long_term_care', '심폐소생술 관리 규정', '3.2.1', $tpl$제1조(목적) 심폐소생술이 요구되는 환자에게 양질의 의료서비스를 제공한다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 직원은 심폐소생술이 필요한 상황에 대처할 수 있다.
2. 심폐소생술을 위한 필요물품 및 의약품을 관리한다.
3. 적시에 제세동기를 사용할 수 있다.

제4조(담당부서) 본 규정의 관리 책임 부서는 간호부/총무과로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 적용 진료과: {{department_list}}
- 담당 인력 구성(당직 포함): {{staff_summary}}
- 응급카트·제세동기 배치와 관련된 특수부서: {{special_unit_clause}}
- 당직·운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토하며, 세부 서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 5),

('ltc-medication-storage', 'long_term_care', '의약품 보관 규정', '4.1', $tpl$제1조(목적) 의약품의 안전한 관리를 위하여 모든 의약품을 적절하게 보관하고 회수에 대한 절차를 마련한다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 모든 의약품을 안전하게 보관한다.
2. 모든 의약품의 보관 상태를 정기적으로 감사한다.
3. 응급의약품의 보관 및 보충사항을 점검한다.
4. 마약류는 관련법을 준수하여 안전하게 보관한다.
5. 고위험의약품을 안전하게 보관한다.
6. 주의를 요하는 의약품을 안전하게 보관한다.
7. 의약품 회수 절차를 준수한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 간호부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수(병동별 보관 캐비닛 배치 기준): {{bed_count}}
- 의약품 보관이 필요한 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서(응급의약품 별도 보관): {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토하며, 세부 서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 6),

('ltc-environment-management', 'long_term_care', '환경관리 규정', '8.4', $tpl$제1조(목적) 환경은 다양한 미생물의 저장소 역할을 하며, 병원 환경 내의 기회 감염균 또는 병원성 미생물 등은 감염을 일으킬 수 있다. 병원 환경의 청소와 소독, 치료에 사용되는 물과 음용수의 관리 및 특수 진료 환경에 적합한 환기 시설을 관리하여 청결하고 안전한 의료 환경을 유지하고 의료관련감염 발생을 예방하기 위함이다.

제2조(용어의 정의) 환자치료영역 : 환자의 입원, 치료, 시술 등이 이루어지는 공간과 그 주변 공간을 의미한다. 환자치료영역에는 환자가 치료를 위해 머무는 영역으로 병실, 환자 휴게실, 복도, 화장실 등의 일상 환경구역과 격리실 등의 구역으로 나눌 수 있다.

제3조(기본방침)
1. 환자치료영역의 청소 및 소독을 수행한다.
2. 청소 및 소독 직원은 개인보호구를 착용한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 감염관리위원회로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수(환자치료영역 규모): {{bed_count}}
- 환경관리 적용 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서(격리실 등 별도 환경관리 필요 구역): {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토하며, 세부 서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 7),

('ltc-organizational-decision', 'long_term_care', '경영관리체계(합리적인 의사결정) 규정', '9.1', $tpl$제1조(목적) 이 규정은 병원의 경영관리체계 규정으로 경영진이 의료기관 운영의 안정 및 효율을 위하여 의사결정 조직을 구성하고 정기적으로 운영하기 위함을 목적으로 한다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 의사결정 조직을 운영한다.
2. 규정과 정책을 관리한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 원무·총무로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 운영 진료과: {{department_list}}
- 의사결정 조직 구성 인력: {{staff_summary}}
- 관련 특수부서: {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토하며, 세부 서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 8),

('ltc-hr-management', 'long_term_care', '인사관리체계(인력배치 기준) 규정', '9.1', $tpl$제1조(목적) 환자안전과 양질의 의료서비스 제공을 위하여 자격을 갖춘 적격한 인력을 갖춤으로써 환자의 진료 및 치료결과에 기여할 수 있도록 효율적인 인사정보를 관리한다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 인사체계를 수립하여 효율적으로 인력을 관리한다.
2. 인사정보체계를 수립하고 관리한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 원무부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수(법정 인력배치 기준 산정): {{bed_count}}
- 적용 진료과: {{department_list}}
- 담당 인력 구성(의사·간호사·간호조무사·기타): {{staff_summary}}
- 관련 특수부서: {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토하며, 세부 서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 9),

('ltc-staff-education', 'long_term_care', '직원교육 규정', '10.2', $tpl$제1조(목적) 양질의 의료서비스를 제공하기 위하여 직원들이 체계적이고 적절한 교육을 통하여 직원 개인의 역량 및 전문성을 키우고 병원의 경쟁력을 높이기 위함이다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 연간 교육계획을 수립한다.
2. 신규직원 교육을 실시한다.
3. 직원의 직무수행에 필요한 필수교육을 시행한다.
4. 직원의 직무수행에 필요한 특성화교육을 시행한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 원무부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 교육 대상 진료과: {{department_list}}
- 교육 대상 인력 구성: {{staff_summary}}
- 관련 특수부서(특성화교육 대상): {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토하며, 세부 서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 10),

('ltc-staff-safety', 'long_term_care', '직원안전 관리활동 규정', '10.4', $tpl$제1조(목적) 직원의 건강과 안전을 유지하고 직원안전사고 발생 시 신속하게 보고·관리하기 위한 체계를 수립한다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 직원 건강유지 및 안전관리활동을 위한 규정이 있다.
2. 직원 건강유지 및 안전관리활동을 계획한다.
3. 직원 건강유지와 안전관리활동을 수행한다.
4. 직원안전사고 관리 규정이 있다.
5. 직원안전사고 발생 시 보고체계에 따라 보고하고 치료 및 관리한다.
6. 감염노출을 포함한 직원안전사고 처리결과를 경영진에게 보고한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 원무부/보건관리자로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 적용 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서(직업적 노출 위험 부서): {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토하며, 세부 서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 11),

('ltc-violence-prevention', 'long_term_care', '시설 및 환경 안전관리(폭력 예방 및 관리) 규정', '10.5', $tpl$제1조(목적) 시설물 안전관리와 예방을 위하여 필요한 사항을 정하고 안전관리대상의 시설물에 대하여 관련 법규 및 검사요건을 준수하여 시설물에 대한 안전성 확보 및 효율적인 관리를 통하여 병원 시설 이용 환자 및 보호자와 직원을 보호하는데 그 목적이 있다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 시설 및 환경과 관련된 안전관리 계획을 수립하고 관리 및 운영한다.
2. 시설 및 환경안전 관련 업무 구분 및 책임자를 지정 체계적인 관리를 한다.
3. 시설 및 환경안전 관리에 대해 직원들의 교육을 실시한다.
4. 법률에 적합토록 시설과 환경안전을 운영 및 관리한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 총무과/원무과로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 적용 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서(고위험 대응 부서): {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토하며, 세부 서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 12),

('ltc-facility-safety', 'long_term_care', '시설 및 환경 안전 관리 규정', '11.1', $tpl$제1조(목적) 병원의 환자진료를 위해 필수적인 전기 및 물 공급, 수질감시, 의료가스, 공기정화, 환기 등의 설비시스템에 대한 정기적인 검사, 유지, 보수, 개선계획을 수립하고 관련된 위험요인을 파악하여 안전한 의료서비스 환경을 제공한다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 전기설비 안전관리를 수행한다.
2. 급수설비 및 수질감시 관리를 수행한다.
3. 의료가스 및 진공설비를 수행한다.
4. 실내 공기질 관리를 수행한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 총무과로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수(설비 용량 산정 기준): {{bed_count}}
- 적용 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서(의료가스·전기 이중화가 필요한 부서): {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토하며, 세부 서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 13),

('ltc-equipment-management', 'long_term_care', '의료기기 관리 규정', '11.5', $tpl$제1조(목적) 이 규정은 본원 의료기기에 대한 예방점검 및 안전점검, 고장 수리 조치를 통하여 진료, 수술, 검사 및 치료에 있어 환자에게 안전한 양질의 서비스를 제공하고자 의료기기의 최적의 기능상태를 유지하기 위한 관리 운용을 목적으로 한다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침) 의료기기(시험 DEMO 사용 의료기기 포함)의 안전관리 체계는 관련법을 준수하여 본원 규정에 따라 관리한다(단, 4주 이내로 사용하는 시험용 의료기기는 제외).
1. 의료기기 목록을 관리한다.
2. 의료기기를 정기점검한다.
3. 의료기기를 예방점검한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 총무과로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 의료기기 배치 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서(전용 장비가 필요한 부서): {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토하며, 세부 서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 14),

('ltc-health-info-management', 'long_term_care', '의료정보 관리 규정', '12.1', $tpl$제1조(목적) 진단과 치료의 근거, 치료과정과 경과의 기록 및 치료의 연속성을 증진시킬 수 있도록 퇴원환자 및 재원환자의 의무기록 완결도 관리에 대한 절차를 정의하여 필수의무기록의 누락이나 기재 내용의 완결성 등에 문제가 없는지 확인하여 의무기록의 충실성을 제고하고 관리하기 위함이다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 규정에 따라 퇴원환자 의무기록을 작성한다.
2. 의학적 초기평가를 기록한다.
3. 간호초기평가를 기록한다.
4. 경과기록을 작성한다.
5. 간호기록을 작성한다.
6. 퇴원요약을 작성한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 의무기록실로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 의무기록 작성 대상 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서: {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토하며, 세부 서식은 관리문서함의 원본 규정을 따른다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 15);

-- ============================================================
-- 정신병원 15종 (lib/standardCatalog.ts PSYCHIATRIC_CHAPTERS 조사항목 근거,
--   원문 라이브러리가 없어 신규 작성한 파일럿 초안)
-- ============================================================

INSERT INTO regulation_templates (template_code, hospital_type, title, entry_code, template_content, variable_schema, sort_order) VALUES

('psy-admission-bed-management', 'psychiatric', '입원 수속 및 병상 운영 관리 규정', '2.1', $tpl$제1조(목적) 자의·동의·보호의무자에 의한·행정·응급 입원 등 입원 유형별 수속 절차를 명확히 하고, 병상 배정과 계속입원 절차를 일관되게 관리하여 입원환자의 권리를 보호한다.

제2조(용어의 정의) 계속입원: 입원 기간이 법정 심사 주기를 경과하여 계속 치료가 필요한 경우 심사를 거쳐 입원을 유지하는 절차를 말한다.

제3조(기본방침)
1. 입원 유형별 구비서류와 절차를 준수한다.
2. 계속입원 심사 절차를 준수한다.
3. 병상 배정은 병동별 정원과 환자 특성을 고려하여 결정한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 원무부/간호부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 병동 운영 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서(보호병동·격리병동 등): {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 1),

('psy-comorbidity-referral', 'psychiatric', '동반질환 관리(협의진료체계) 규정', '3.2', $tpl$제1조(목적) 정신과 입원환자의 동반질환을 적시에 관리하기 위해 원내·외 협의진료 체계를 수립하고, 필요 시 신속한 응급의뢰가 이루어지도록 한다.

제2조(용어의 정의) 협의진료: 주치의가 타 진료과 또는 외부 의료기관에 환자 진료를 의뢰하고 결과를 회신받는 절차를 말한다.

제3조(기본방침)
1. 협의진료 의뢰서식과 응급의뢰 기준을 마련한다.
2. 협의진료 결과를 확인하고 기록한다.
3. 동반질환 환자에게 영양관리(주치의 처방·영양상담)를 제공한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 진료부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 원내 협의진료가 가능한 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서: {{special_unit_clause}}
- 운영시간(협의진료 응대 가능 시간): {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 2),

('psy-staffing-standard', 'psychiatric', '인적자원관리(인력배치 기준) 규정', '9.1', $tpl$제1조(목적) 정신의료기관에 요구되는 법정 인력기준(의사·간호·기타 인력)을 준수하고, 면허·자격을 갖춘 인력을 배치하여 환자에게 안전한 진료 환경을 제공한다.

제2조(용어의 정의) ME3: 보건의료인력 법적기준 준수 여부를 판정하는 조사방법을 말한다.

제3조(기본방침)
1. 직원의 면허·자격을 확인하고 관리한다.
2. 의료 인력 법적기준(병상당 인력배치 기준 포함) 준수 여부를 정기적으로 점검한다.
3. 인사기록카드를 통해 인사정보를 관리한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 원무부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수(법정 인력배치 기준 산정): {{bed_count}}
- 적용 진료과: {{department_list}}
- 담당 인력 구성(의사·간호사·간호조무사·기타): {{staff_summary}}
- 관련 특수부서: {{special_unit_clause}}
- 운영시간(당직 포함): {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 3),

('psy-seclusion-management', 'psychiatric', '격리 관리 규정', '3.7', $tpl$제1조(목적) 격리는 환자 및 타인의 안전을 보호하기 위한 최후의 수단으로만 적용하며, 최소화 원칙에 따라 기준·처방·수행·모니터링 절차를 엄격히 준수한다.

제2조(용어의 정의) 격리: 환자를 특정 공간에 제한하여 자·타해 위험으로부터 보호하는 조치를 말한다.

제3조(기본방침)
1. 격리는 의사의 처방에 따라서만 시행한다.
2. 격리 중인 환자는 정기적으로 관찰하고 기록한다.
3. 격리 최소화 원칙에 따라 상태 호전 시 즉시 해제한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 간호부/진료부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 격리 조치가 적용되는 진료과: {{department_list}}
- 담당 인력 구성(격리 모니터링 인력): {{staff_summary}}
- 격리병동·보호실 등 관련 특수부서: {{special_unit_clause}}
- 운영시간(관찰 주기 포함): {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 4),

('psy-restraint-management', 'psychiatric', '강박 관리 규정', '3.8', $tpl$제1조(목적) 강박은 환자 및 타인의 안전을 보호하기 위한 최후의 수단으로만 적용하며, 최소화 원칙에 따라 기준·처방·수행·모니터링 절차를 엄격히 준수한다.

제2조(용어의 정의) 강박: 신체의 움직임을 제한하는 기구를 이용하여 환자의 행동을 제한하는 조치를 말한다.

제3조(기본방침)
1. 강박은 의사의 처방에 따라서만 시행한다.
2. 강박 중인 환자는 정기적으로 관찰하고 기록한다.
3. 강박 최소화 원칙에 따라 상태 호전 시 즉시 해제한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 간호부/진료부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 강박 조치가 적용되는 진료과: {{department_list}}
- 담당 인력 구성(강박 모니터링 인력): {{staff_summary}}
- 격리병동·보호실 등 관련 특수부서: {{special_unit_clause}}
- 운영시간(관찰 주기 포함): {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 5),

('psy-leave-of-absence', 'psychiatric', '외출 및 외박 관리 규정', '1.5', $tpl$제1조(목적) 입원환자의 외출·외박을 안전하게 관리하기 위해 신청·처방·교육·귀원 확인 절차를 수립하고, 미귀원자·무단이탈자 발생 시 신속히 대처한다.

제2조(용어의 정의) 미귀원자: 허가된 외출·외박 시간 내에 귀원하지 않은 환자를 말한다.

제3조(기본방침)
1. 외출·외박은 주치의 처방과 보호의무자 동의를 거쳐 신청한다.
2. 외출·외박 전 주의사항을 교육하고 확인서를 받는다.
3. 귀원 시 상태를 확인하고 기록한다.
4. 미귀원자 발생 시 정해진 절차에 따라 대처한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 간호부/진료부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 적용 진료과: {{department_list}}
- 담당 인력 구성(외출·외박 확인 인력): {{staff_summary}}
- 관련 특수부서: {{special_unit_clause}}
- 외출·외박 허용 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 6),

('psy-staff-education', 'psychiatric', '직원교육 규정', '9.2', $tpl$제1조(목적) 신규 및 재직 직원에게 체계적인 교육(인권교육 포함)을 제공하여 정신의료서비스의 질을 높이고 환자 인권을 보호한다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 연간 교육 계획을 수립하고 이행한다.
2. 신규 직원에게 오리엔테이션 교육을 실시한다.
3. 전 직원에게 인권교육을 연 1회 이상 실시한다.
4. 교육 결과를 평가하고 기록한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 원무부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 교육 대상 진료과: {{department_list}}
- 교육 대상 인력 구성: {{staff_summary}}
- 관련 특수부서(특성화교육 대상): {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 7),

('psy-staff-safety', 'psychiatric', '직원 안전관리 활동 규정', '9.3', $tpl$제1조(목적) 직원의 건강 검진, 감염 예방접종, 직업적 노출(혈액·체액) 관리를 통해 직원의 건강과 안전을 보호한다.

제2조(용어의 정의) 직업적 노출: 업무 중 혈액·체액 등에 노출되는 사고를 말한다.

제3조(기본방침)
1. 직원 건강 검진을 정기적으로 실시한다.
2. 감염 예방접종을 관리한다.
3. 직업적 노출 발생 시 즉시 보고하고 조치한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 원무부/보건관리자로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 적용 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서(직업적 노출 위험 부서): {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 8),

('psy-violence-prevention', 'psychiatric', '폭력 예방 및 관리 규정', '9.4', $tpl$제1조(목적) 직원 대상 폭력을 예방하고, 폭력 발생 시 신속히 대응하며 피해 직원에게 사후 심리 지원을 제공한다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 직원 대상 폭력 예방 교육을 실시한다.
2. 폭력 발생 시 대응 절차에 따라 처리하고 보고한다.
3. 피해 직원에게 사후 심리 지원을 제공한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 총무과/원무과로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 적용 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서(고위험 대응 인력이 필요한 부서): {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 9),

('psy-fall-prevention', 'psychiatric', '낙상 예방활동 규정', '1.4', $tpl$제1조(목적) 검증된 낙상 위험 평가도구를 이용하여 낙상 고위험환자를 식별하고 예방활동을 수행하여 환자의 상해를 예방한다.

제2조(용어의 정의) 낙상: 본인의 의사와 무관하게 신체가 갑자기 낮은 곳으로 이동하는 것을 말한다.

제3조(기본방침)
1. 검증된 낙상 위험 평가도구(Morse Fall Scale 등)를 사용한다.
2. 고위험환자에 대한 예방활동을 수행하고 정보를 공유한다.
3. 낙상 발생 가능 장소별 예방활동을 수행한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 간호부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 낙상 예방활동 적용 진료과·부서: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서: {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 10),

('psy-care-continuity', 'psychiatric', '환자진료의 일관성 및 연속성 유지 규정', '2.2', $tpl$제1조(목적) 담당 주치의 변경, 전동 및 근무교대 시 표준화된 의사소통(인수인계)으로 환자 정보를 공유하여 진료의 연속성을 유지한다.

제2조(용어의 정의) 인수인계: 근무 교대 시 환자 상태와 치료 정보를 다음 근무자에게 전달하는 절차를 말한다.

제3조(기본방침)
1. 근무교대 시 표준화된 인수인계 기록지를 사용한다.
2. 주치의 변경 시 서면으로 정보를 인계한다.
3. 전동 시 전동 기록지를 작성하고 공유한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 간호부/진료부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 전동이 발생할 수 있는 진료과·병동: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서: {{special_unit_clause}}
- 근무교대 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 11),

('psy-discharge-transfer', 'psychiatric', '퇴원 및 전원 관리 규정', '2.3', $tpl$제1조(목적) 퇴원 계획 수립·교육·정보 제공을 통해 진료의 연속성을 유지하고, 정신재활서비스(정신건강복지센터·보건소) 연계 및 전원 절차를 준수한다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 퇴원 계획을 수립하고 환자·보호의무자에게 설명한다.
2. 퇴원 요약지(투약·주의사항 포함)를 작성한다.
3. 필요 시 정신건강복지센터 등에 통보하고 연계한다.
4. 전원 절차를 준수한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 간호부/사회복지과로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 적용 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 관련 특수부서: {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 12),

('psy-initial-assessment', 'psychiatric', '입원환자 초기평가 규정', '2.4', $tpl$제1조(목적) 입원 후 24~72시간 이내 의학적 초기평가(MSE·자살위험 평가 포함)와 간호 초기평가(24시간 이내)를 수행하여 치료 담당 직원과 공유한다.

제2조(용어의 정의) MSE(Mental Status Examination): 정신상태 평가를 말한다.

제3조(기본방침)
1. 의학적 초기평가는 입원 후 24~72시간 이내 수행하고 자살위험을 평가한다.
2. 간호 초기평가는 24시간 이내 수행하고 낙상위험도를 포함한다.
3. 평가 결과를 치료 담당 직원과 공유한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 진료부/간호부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 초기평가에 협업하는 진료과: {{department_list}}
- 담당 인력 구성(의학적·간호 초기평가 수행 인력): {{staff_summary}}
- 관련 특수부서: {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 13),

('psy-emergency-management', 'psychiatric', '정신과적 응급상황 관리 규정', '1.3', $tpl$제1조(목적) 자살·자해·폭언·폭행·기물파손 등 정신과적 응급상황에 신속히 대처하고, 고위험환자를 식별·공유·모니터링하여 환자와 직원의 안전을 보호한다.

제2조(용어의 정의) 고위험환자: 자·타해 위험이 높다고 평가된 환자를 말한다.

제3조(기본방침)
1. 고위험환자 식별 기준과 공유 절차를 마련한다.
2. 정신과적 응급상황 발생 시 대응 절차에 따라 조치한다.
3. 고위험환자를 정기적으로 모니터링하고 기록한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 간호부/진료부로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 적용 진료과: {{department_list}}
- 담당 인력 구성(응급상황 대응 인력): {{staff_summary}}
- 격리병동·보호실 등 관련 특수부서: {{special_unit_clause}}
- 운영시간(당직 포함): {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 14),

('psy-facility-environment', 'psychiatric', '시설 및 환경관리 규정', '10.1', $tpl$제1조(목적) 의료기관 시설의 안전을 정기적으로 점검하고 환경을 유지·관리하여 환자와 직원에게 안전한 치료 환경을 제공한다.

제2조(용어의 정의) 해당 사항 없음

제3조(기본방침)
1. 시설 안전 점검을 정기적으로 수행하고 기록한다.
2. 환경 모니터링을 수행하고 개선활동을 실시한다.
3. 위해도구·반입 제한 물품 관리 절차를 준수한다.

제4조(담당부서) 본 규정의 관리 책임 부서는 총무과로 한다.

제5조(본원 적용사항) 본 규정은 아래 병원 정보를 반영하여 적용한다.
- 병상 수: {{bed_count}}
- 적용 진료과: {{department_list}}
- 담당 인력 구성: {{staff_summary}}
- 격리병동·보호실 등 관련 특수부서: {{special_unit_clause}}
- 운영시간: {{operating_hours_summary}}

부칙 이 규정은 병원 프로필 변경 시 재검토한다. 본 초안은 파일럿 템플릿으로, 실제 적용 전 법무·QPS 검토가 필요하다.$tpl$, '{"bed_count":{"label":"병상 수","source":"hospitals.bed_count","required":true},"department_list":{"label":"진료과 목록","source":"hospitals.departments","required":true},"staff_summary":{"label":"인력 구성","source":"hospitals.staff_composition","required":true},"special_unit_clause":{"label":"특수부서","source":"hospitals.special_units","required":false},"operating_hours_summary":{"label":"운영시간","source":"hospitals.operating_hours","required":false}}'::jsonb, 15);
