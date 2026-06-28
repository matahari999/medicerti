export type CategoryKey = 'certification' | 'quality' | 'infection' | 'qps';

export interface TrainingTopic {
  id: string;
  title: string;
  description: string;
  duration: string;
  hospitalTypes: string[]; // 빈 배열 = 전체 병원 유형
  recommended?: boolean;
}

export interface TrainingCategory {
  key: CategoryKey;
  label: string;
  color: string;          // Tailwind bg
  textColor: string;      // Tailwind text
  borderColor: string;    // Tailwind border
  activeClass: string;    // active tab class
  topics: TrainingTopic[];
}

const ALL = ['nursing', 'psychiatric', 'rehabilitation', 'acute', 'dental', 'korean'];

export const TRAINING_CATEGORIES: TrainingCategory[] = [
  {
    key: 'certification',
    label: '평가인증',
    color: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    activeClass: 'bg-blue-600 text-white',
    topics: [
      { id: 'c1', title: '낙상 예방 및 관리', description: '입원 환자 낙상 위험 평가·예방 활동·사고 후 보고 절차', duration: '15분', hospitalTypes: ALL, recommended: true },
      { id: 'c2', title: '욕창 예방 및 관리', description: '욕창 위험 평가도구 사용·예방 중재·단계별 처치 방법', duration: '15분', hospitalTypes: ['nursing', 'rehabilitation', 'psychiatric'] },
      { id: 'c3', title: '투약 오류 예방', description: '5 RIGHT 원칙·고위험 약물 관리·투약 오류 보고 및 분석', duration: '20분', hospitalTypes: ALL, recommended: true },
      { id: 'c4', title: '환자 확인 절차', description: '2가지 이상 환자 확인 방법·검사·수술·수혈 시 확인 절차', duration: '10분', hospitalTypes: ALL },
      { id: 'c5', title: '수혈 관리 절차', description: '수혈 전 확인·수혈 중 모니터링·부작용 대처 절차', duration: '20분', hospitalTypes: ['nursing', 'acute', 'rehabilitation'] },
      { id: 'c6', title: '의료기기 안전 관리', description: '의료기기 점검·이상 발생 시 보고·유지보수 절차', duration: '15분', hospitalTypes: ALL },
      { id: 'c7', title: '응급상황 대응 절차', description: '심폐소생술·코드 발동 절차·역할 분담·훈련 기록', duration: '25분', hospitalTypes: ALL, recommended: true },
      { id: 'c8', title: '환자 권리와 의무', description: '환자 권리 고지·동의서 절차·비밀 보호·불만 처리', duration: '10분', hospitalTypes: ALL },
      { id: 'c9', title: '의무기록 작성 기준', description: '의무기록 완성도·서명·수정 방법·보관 및 열람 절차', duration: '15분', hospitalTypes: ALL },
      { id: 'c10', title: '정신건강 환자 권리 보호', description: '격리·강박 최소화·권리 고지·보호의무자 설명', duration: '20분', hospitalTypes: ['psychiatric'] },
    ],
  },
  {
    key: 'quality',
    label: '적정성평가',
    color: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    activeClass: 'bg-cyan-600 text-white',
    topics: [
      { id: 'q1', title: '항생제 적정 사용 기준', description: '항생제 선택·사용기간·약제내성 예방·스튜어드십 프로그램', duration: '20분', hospitalTypes: ALL, recommended: true },
      { id: 'q2', title: '수술 예방적 항생제 사용', description: '투여 시점·약제 선택·중단 기준·수술별 가이드라인', duration: '15분', hospitalTypes: ['acute'] },
      { id: 'q3', title: '혈액투석 관리', description: '투석 전후 평가·혈관통로 관리·합병증 모니터링', duration: '20분', hospitalTypes: ['nursing', 'acute', 'rehabilitation'] },
      { id: 'q4', title: '급성기 뇌졸중 처치', description: '증상 인식·골든타임·tPA 기준·재활 연계', duration: '20분', hospitalTypes: ['acute', 'rehabilitation'], recommended: true },
      { id: 'q5', title: '폐렴 예방 및 치료', description: '병원내폐렴·인공호흡기 관련 폐렴·VAP 번들 적용', duration: '15분', hospitalTypes: ALL },
      { id: 'q6', title: '주사제 처방률 관리', description: '주사제 남용 예방·경구 전환 기준·모니터링 방법', duration: '10분', hospitalTypes: ALL },
      { id: 'q7', title: '천식·COPD 관리', description: '흡입기 사용법·급성 악화 대응·장기 관리 계획', duration: '15분', hospitalTypes: ['nursing', 'acute'] },
    ],
  },
  {
    key: 'infection',
    label: '감염관리',
    color: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    activeClass: 'bg-emerald-600 text-white',
    topics: [
      { id: 'i1', title: '손위생 5가지 시점', description: 'WHO 5 Moments·올바른 손씻기·손소독제 사용법·감사 방법', duration: '10분', hospitalTypes: ALL, recommended: true },
      { id: 'i2', title: '표준주의 지침', description: '개인보호구 착용·혈액·체액 노출 예방·침습 시술 안전', duration: '15분', hospitalTypes: ALL, recommended: true },
      { id: 'i3', title: '격리 지침 (전파 경로별)', description: '공기·비말·접촉 격리 적용 기준·격리 해제 기준', duration: '20분', hospitalTypes: ALL },
      { id: 'i4', title: '의료폐기물 분류 및 처리', description: '격리·위해·일반 폐기물 분류·용기 사용·보관 기준', duration: '10분', hospitalTypes: ALL },
      { id: 'i5', title: '카테터 관련 요로감염 예방', description: '삽입 기술·유지 관리·조기 제거 기준·CAUTI 번들', duration: '15분', hospitalTypes: ['nursing', 'acute', 'rehabilitation'] },
      { id: 'i6', title: '신종감염병 대응 절차', description: '조기 감지·선별 기준·코호트 운영·보건당국 신고', duration: '20분', hospitalTypes: ALL, recommended: true },
      { id: 'i7', title: '수술 부위 감염 예방', description: '수술 전 준비·무균 술기·드레싱 관리·감시 방법', duration: '15분', hospitalTypes: ['acute', 'dental'] },
    ],
  },
  {
    key: 'qps',
    label: 'QPS',
    color: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    activeClass: 'bg-purple-600 text-white',
    topics: [
      { id: 'p1', title: '환자안전 보고 시스템', description: '자발적 보고 문화·근접오류 보고·비처벌 원칙·피드백 방법', duration: '15분', hospitalTypes: ALL, recommended: true },
      { id: 'p2', title: '적신호사건 분석(RCA)', description: '근본원인분석 방법·사건 분류·시스템 개선 도출', duration: '25분', hospitalTypes: ALL },
      { id: 'p3', title: '질 지표 측정과 개선', description: 'PDCA 사이클·지표 설정·데이터 수집·개선 활동 발표', duration: '20분', hospitalTypes: ALL },
      { id: 'p4', title: '의사소통 오류 예방', description: 'SBAR 보고 기법·인계 표준화·구두 처방 반복 확인', duration: '15분', hospitalTypes: ALL, recommended: true },
      { id: 'p5', title: '고위험 환자 안전 관리', description: '자살·자해 위험 평가·환경 안전·1:1 모니터링', duration: '20분', hospitalTypes: ['psychiatric', 'nursing'] },
      { id: 'p6', title: '직원 안전 및 감정 노동', description: '폭력 예방·근골격계 예방·소진 관리·심리 지원', duration: '15분', hospitalTypes: ALL },
    ],
  },
];

/** 병원 유형 키 기준으로 추천 주제 반환 (recommended: true + 해당 유형 포함) */
export function getRecommendedTopics(hospitalTypeKey: string): (TrainingTopic & { categoryLabel: string; categoryKey: CategoryKey })[] {
  const results: (TrainingTopic & { categoryLabel: string; categoryKey: CategoryKey })[] = [];
  for (const cat of TRAINING_CATEGORIES) {
    for (const topic of cat.topics) {
      if (
        topic.recommended &&
        (topic.hospitalTypes.length === 0 || topic.hospitalTypes.includes(hospitalTypeKey))
      ) {
        results.push({ ...topic, categoryLabel: cat.label, categoryKey: cat.key });
      }
    }
  }
  return results;
}
