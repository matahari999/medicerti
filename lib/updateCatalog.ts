import type { HospitalType } from '@/types';

// ─── 업데이트 카테고리 ─────────────────────────────────────────
export type UpdateCategory = 'criteria_book' | 'regulation' | 'form' | 'etc';

export const UPDATE_CATEGORY_LABELS: Record<UpdateCategory, string> = {
  criteria_book: '기준집',
  regulation: '규정집',
  form: '양식·서식',
  etc: '기타',
};

export const UPDATE_CATEGORY_ICONS: Record<UpdateCategory, string> = {
  criteria_book: '📚',
  regulation: '📋',
  form: '📄',
  etc: '🗂️',
};

// ─── 업데이트 항목 ────────────────────────────────────────────
export interface UpdateEntry {
  id: string;
  category: UpdateCategory;
  title: string;
  version?: string;
  publishedDate?: string; // 공표·발표일 (YYYY-MM-DD)
  effectiveDate?: string; // 시행일 (YYYY-MM-DD)
  hospitalTypes: HospitalType[]; // 빈 배열 = 전체 병원 유형
  summary: string;
  affectedDocuments: string[]; // 이 개정으로 원내에서 개정 검토가 필요한 문서
  sourceName: string;
  sourceUrl: string;
  isImportant: boolean;
}

// 출처가 확인된 실제 개정·배포 정보만 등록한다.
// 새 개정이 공표되면 이 배열 맨 앞에 추가한다 (최신순 정렬 유지).
export const UPDATE_ENTRIES: UpdateEntry[] = [
  {
    id: 'basic-casebook-v1',
    category: 'regulation',
    title: '기본 인증기준 규정 사례집 Ver. 1.0 (수정판)',
    version: 'Ver. 1.0',
    publishedDate: '2026-03-30',
    hospitalTypes: ['hospital'],
    summary:
      '기본 인증기준에 맞춘 규정 작성 예시 모음집(240p). 기준별 규정 목차·필수 포함 내용·작성 사례를 제공하므로 병원급 의료기관의 규정집 신규 작성·개정 시 직접 참고 가능.',
    affectedDocuments: ['원내 전체 규정집 (작성·개정 시 참조)', '규정 관리 규정(문서관리 규정)'],
    sourceName: '의료기관평가인증원',
    sourceUrl: 'https://www.koiha.or.kr',
    isImportant: false,
  },
  {
    id: 'basic-v1-2025',
    category: 'criteria_book',
    title: '기본 인증기준 Ver. 1.0 공표 (신설)',
    version: 'Ver. 1.0',
    hospitalTypes: ['hospital'],
    summary:
      '2025년 12월 공표된 신설 인증 트랙. 대상은 「의료법」 제3조제2항제3호에 따른 병원급 의료기관. 환자안전 보장활동, 진료전달, 환자진료, 의약품관리, 수술·마취진정관리 등 핵심 기준 중심으로 구성.',
    affectedDocuments: ['인증 준비 마스터플랜 (기본 인증 신청 검토)', '핵심 기준 규정집 일체'],
    sourceName: '의료기관평가인증원 (2025.12. 공표)',
    sourceUrl: 'https://www.koiha.or.kr',
    isImportant: true,
  },
  {
    id: 'dental-v4-1',
    category: 'criteria_book',
    title: '4주기 치과병원 인증기준 Ver. 4.1 개정',
    version: 'Ver. 4.1',
    publishedDate: '2025-12-01',
    effectiveDate: '2026-02-01',
    hospitalTypes: ['dental'],
    summary:
      '2026년 2월 1일부터 적용. 13장·61기준 체계. 기공물·기공실 관리(2.4.x), 수술·마취진정관리(5장) 등 치과 특화 기준 포함. 신구대조표는 인증원 자료실 참조.',
    affectedDocuments: ['시설·설비시스템 관리 규정집', '기공물·기공실 관리 규정집', '규정집 개정이력표'],
    sourceName: '의료기관평가인증원',
    sourceUrl: 'https://www.koiha.or.kr',
    isImportant: false,
  },
  {
    id: 'psy-eval-6th',
    category: 'criteria_book',
    title: '6주기 정신의료기관 평가기준 발표',
    version: '6주기',
    publishedDate: '2025-12-01',
    hospitalTypes: ['psychiatric'],
    summary:
      '정신병원: 3개 영역·11개 장·44개 기준·195개 평가항목(ME). 병원급 설치 정신건강의학과: 10장·34기준·132ME. 격리·강박(3.7/3.8)은 필수 기준. 200병상 이상/미만 구분 적용.',
    affectedDocuments: ['격리·강박 규정집', '정신과적 응급상황 관리 규정집', '치료프로그램 운영계획서', '평가 자체점검표'],
    sourceName: '의료기관평가인증원',
    sourceUrl: 'https://www.koiha.or.kr',
    isImportant: true,
  },
  {
    id: 'korean-guide-4th',
    category: 'form',
    title: '4주기 한방병원 인증조사 표준지침서 배포',
    version: '4주기',
    hospitalTypes: ['korean'],
    summary:
      '4주기 한방병원 인증조사의 조사방법·판정기준 지침서(2024.12.). 한방서비스·한약재관리 등 한방 특화 기준의 조사 포인트 포함. 3주기 대비 비교표 함께 배포.',
    affectedDocuments: ['조사항목별 자체점검표', '한약재 관리 규정집', '모의조사 체크리스트'],
    sourceName: '의료기관평가인증원',
    sourceUrl: 'https://ae.koiha.or.kr',
    isImportant: false,
  },
  {
    id: 'mid-survey-notice',
    category: 'etc',
    title: '중간현장조사 의료기관 안내사항 (요양 3주기·급성기 4주기·재활 2주기·한방 3주기)',
    hospitalTypes: ['nursing', 'acute', 'rehabilitation', 'korean'],
    summary:
      '인증 유지 중인 기관은 인증 유효기간 중 중간조사(중간현장조사 또는 중간자체조사)를 받아야 함. 주기별 안내문에 조사 절차·준비 서류·일정 협의 방법이 정리되어 있음. 인증 취득이 끝이 아니라 유지 관리가 필요.',
    affectedDocuments: ['중간조사 자체점검표', '인증 후 개선활동 이행 기록', '지표 모니터링 자료'],
    sourceName: '의료기관평가인증원',
    sourceUrl: 'https://ae.koiha.or.kr',
    isImportant: false,
  },
  {
    id: 'acute-v5-2025',
    category: 'criteria_book',
    title: '급성기병원 인증기준 Ver. 5.0 공표',
    version: 'Ver. 5.0',
    publishedDate: '2025-12-03',
    effectiveDate: '2026-09-01',
    hospitalTypes: ['acute', 'general', 'tertiary'],
    summary:
      '4주기 인증 만료에 따른 새 기준 공표. 4개 영역, 13개 장, 92개 기준, 523개 조사항목(병원급 517개)으로 구성. 2026년 9월 1일부터 적용되는 인증조사부터 시행.',
    affectedDocuments: [
      '전체 규정집 신구대조표 기반 개정 검토',
      '수술장 안전관리 규정집',
      '인증 준비 마스터플랜',
    ],
    sourceName: '대한병원협회 (인증원 공문)',
    sourceUrl: 'https://kha.or.kr/kha_home/notice_list.do?mode=view&articleNo=45954',
    isImportant: true,
  },
  {
    id: 'nursing-v4-1',
    category: 'criteria_book',
    title: '4주기 요양병원 인증기준 Ver. 4.1 개정',
    version: 'Ver. 4.1',
    effectiveDate: '2026-02-01',
    hospitalTypes: ['nursing'],
    summary:
      '기준 10.2 설비시스템 관리에 일부 조사항목 "미해당" 신설. 의료기관의 다양성을 반영하고 인증조사의 객관성·공정성을 강화하기 위한 개정. 2026년 2월 1일부터 시행하는 인증조사부터 적용.',
    affectedDocuments: [
      '시설·설비시스템 관리 규정집',
      '설비시스템 점검표',
      '시설안전 라운딩 체크리스트',
    ],
    sourceName: '대한환자안전질향상간호사회 (인증원 공문)',
    sourceUrl: 'https://www.qi.or.kr/bbs/board.php?bo_table=institution&wr_id=204',
    isImportant: true,
  },
  {
    id: 'psychiatric-v4-1',
    category: 'criteria_book',
    title: '4주기 정신병원 인증기준 Ver. 4.1 개정',
    version: 'Ver. 4.1',
    effectiveDate: '2026-02-01',
    hospitalTypes: ['psychiatric'],
    summary:
      '손위생 수행·감염성질환 환자관리 기준 분리, 감염예방·관리 교육 기준 신설, 정확한 환자확인 조사항목 신설, 질 향상·환자안전 부서/인력 판정기준 강화, 외래환자 초기평가 기준 신설, 치료프로그램 기준 통합.',
    affectedDocuments: [
      '감염관리 규정집',
      '환자확인 및 의사소통 규정집',
      '감염예방·관리 교육계획서',
      '외래환자 초기평가지',
      'QPS(질 향상·환자안전) 운영 규정집',
    ],
    sourceName: '대한병원협회 (인증원 공문)',
    sourceUrl: 'https://www.kha.or.kr/kha_home/notice_list.do?mode=view&articleNo=45963',
    isImportant: true,
  },
  {
    id: 'rehab-v2-1',
    category: 'criteria_book',
    title: '2주기 재활의료기관 인증기준 Ver. 2.1 개정',
    version: 'Ver. 2.1',
    effectiveDate: '2026-02-01',
    hospitalTypes: ['rehabilitation'],
    summary:
      '기준 10.2 설비시스템 관리 일부 조사항목 "미해당" 처리 신설(요양병원 Ver 4.1과 동일 취지). 2026년 2월 1일부터 시행하는 인증조사부터 적용.',
    affectedDocuments: ['시설·설비시스템 관리 규정집', '설비시스템 점검표'],
    sourceName: '대한환자안전질향상간호사회 (인증원 공문)',
    sourceUrl: 'https://www.qi.or.kr/bbs/board.php?bo_table=institution&wr_id=207',
    isImportant: false,
  },
  {
    id: 'nursing-guide-4th',
    category: 'form',
    title: '4주기 요양병원 인증조사 표준지침서 (Ver. 4.1 반영)',
    version: '4주기',
    hospitalTypes: ['nursing'],
    summary:
      '4주기 요양병원 인증기준(4개 영역, 12개 장, 60개 기준, 303개 조사항목)의 조사방법·판정기준을 담은 표준지침서. Ver 4.1 개정사항이 반영된 최신본을 의료기관평가인증시스템 자료실에서 확인.',
    affectedDocuments: ['조사항목별 자체점검표', 'System Tracer 대비 자료', '모의조사 체크리스트'],
    sourceName: '의료기관평가인증시스템 자료실',
    sourceUrl: 'https://ae.koiha.or.kr',
    isImportant: false,
  },
  {
    id: 'regulation-checkpoint-v4-1',
    category: 'regulation',
    title: '[메디인증 가이드] Ver 4.1 반영 규정집 개정 체크포인트',
    hospitalTypes: ['nursing', 'psychiatric', 'rehabilitation'],
    summary:
      '2026-02-01 시행 개정(요양 Ver 4.1 · 정신 Ver 4.1 · 재활 Ver 2.1)에 맞춰 원내 규정집에서 우선 점검할 항목 정리: ① 설비시스템 관리 규정의 미해당 항목 확인 ② (정신) 감염관리·환자확인 규정 분리/신설 반영 ③ 규정집 개정이력표·개정차수 갱신 ④ 개정 규정 직원 공지 및 교육 기록 확보.',
    affectedDocuments: ['규정집 개정이력표', '규정 관리 규정(문서관리 규정)', '직원 공지·교육 기록'],
    sourceName: '메디인증',
    sourceUrl: '/standards',
    isImportant: false,
  },
];

// ─── 시행일까지 남은 일수 (지났으면 음수) ─────────────────────
export function getDaysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00+09:00`).getTime();
  if (Number.isNaN(target)) return null;
  const now = Date.now();
  return Math.ceil((target - now) / 86_400_000);
}
