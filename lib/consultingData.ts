export type ConsultingField = 'certification' | 'quality' | 'claim' | 'inspection' | 'infection' | 'qps';
export type HospitalTypeKey = 'nursing' | 'psychiatric' | 'rehabilitation' | 'acute' | 'dental' | 'korean' | 'all';

export interface Expert {
  id: string;
  name: string;
  title: string;
  affiliation: string;
  fields: ConsultingField[];
  hospitalTypes: HospitalTypeKey[];
  experience: number;
  bio: string;
  achievements: string[];
  rate: string;
  available: boolean;
  rating: number;
  reviewCount: number;
}

export const FIELD_LABELS: Record<ConsultingField, string> = {
  certification: '평가인증',
  quality:       '적정성평가',
  claim:         '청구심사',
  inspection:    '현지조사',
  infection:     '감염관리',
  qps:           '환자안전(QPS)',
};

export const FIELD_COLORS: Record<ConsultingField, string> = {
  certification: 'bg-blue-100 text-blue-700',
  quality:       'bg-cyan-100 text-cyan-700',
  claim:         'bg-amber-100 text-amber-700',
  inspection:    'bg-red-100 text-red-700',
  infection:     'bg-emerald-100 text-emerald-700',
  qps:           'bg-purple-100 text-purple-700',
};

export const EXPERTS: Expert[] = [
  {
    id: 'e1',
    name: '김민준',
    title: '의료기관 인증 전문위원',
    affiliation: '전 의료기관평가인증원',
    fields: ['certification', 'qps'],
    hospitalTypes: ['nursing', 'psychiatric', 'rehabilitation', 'all'],
    experience: 15,
    bio: '의료기관평가인증원 심사위원 출신. 요양·정신·재활병원 인증 준비 컨설팅 200건 이상 수행. 인증 기준집 개발 위원 역임.',
    achievements: ['인증 성공률 98%', '전국 30개 이상 병원 인증 획득 지원', '인증 기준집 3판 공동 집필'],
    rate: '시간당 150,000원',
    available: true,
    rating: 4.9,
    reviewCount: 87,
  },
  {
    id: 'e2',
    name: '이수정',
    title: '건강보험 청구심사 자문위원',
    affiliation: '前 건강보험심사평가원',
    fields: ['claim', 'quality', 'inspection'],
    hospitalTypes: ['acute', 'nursing', 'all'],
    experience: 18,
    bio: '심평원 심사위원 18년 경력. DRG 포괄수가, 행위별 수가 청구 오류 교정 전문. 현지조사 대응 컨설팅.',
    achievements: ['청구 오류 환수 방지 평균 87% 절감', '현지조사 무과징금 처리 43건', '요양급여 적용기준 해설 강의 500회+'],
    rate: '시간당 180,000원',
    available: true,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: 'e3',
    name: '박재현',
    title: '감염관리 전문간호사·컨설턴트',
    affiliation: '감염관리간호사회 이사',
    fields: ['infection', 'certification'],
    hospitalTypes: ['acute', 'rehabilitation', 'dental', 'all'],
    experience: 12,
    bio: '감염관리 전문간호사 자격 보유. 중환자실·수술실 감염 관리 프로그램 개발 전문. KOIHA 인증 감염 영역 심사위원.',
    achievements: ['HAI 발생률 평균 43% 감소 달성', 'MRSA·VRE 관리 프로토콜 표준화', '감염관리 교육 프로그램 50개 기관 도입'],
    rate: '시간당 130,000원',
    available: true,
    rating: 4.7,
    reviewCount: 62,
  },
  {
    id: 'e4',
    name: '최은영',
    title: '환자안전 QPS 전문가',
    affiliation: '전 환자안전보고학습시스템 운영위원',
    fields: ['qps', 'certification'],
    hospitalTypes: ['nursing', 'psychiatric', 'acute', 'all'],
    experience: 10,
    bio: '환자안전법 제정 이후 QPS 활동 체계 구축 전문. 적신호사건 RCA 교육 강사. 환자안전 보고 시스템 도입 컨설팅.',
    achievements: ['환자안전사고 보고율 3배 향상', 'QPS 활동 체계 20개 병원 구축', '환자안전 전담인력 교육 연 2,000명+'],
    rate: '시간당 120,000원',
    available: false,
    rating: 4.9,
    reviewCount: 41,
  },
  {
    id: 'e5',
    name: '정성호',
    title: '적정성평가 전략 컨설턴트',
    affiliation: '의료경영 컨설팅 그룹 대표',
    fields: ['quality', 'claim'],
    hospitalTypes: ['acute', 'nursing', 'all'],
    experience: 14,
    bio: '건강보험 적정성평가 1등급 획득 전략 전문. 급성기·요양병원 지표 개선 프로그램 운영. 심평원 평가 대응 시뮬레이션.',
    achievements: ['적정성평가 1등급 전환 병원 35개', '항생제 내성 관리 우수병원 선정 지원', '입원 적정성평가 지표 점수 평균 12점 향상'],
    rate: '시간당 160,000원',
    available: true,
    rating: 4.6,
    reviewCount: 78,
  },
  {
    id: 'e6',
    name: '한지수',
    title: '치과병원 인증 전문위원',
    affiliation: '대한치과병원협회 자문위원',
    fields: ['certification', 'infection'],
    hospitalTypes: ['dental'],
    experience: 9,
    bio: '치과병원 의료기관 인증 특화 컨설턴트. 치과 감염관리·방사선 안전관리 기준 전문. 치과 인증 기준집 해설 강의.',
    achievements: ['치과병원 인증 취득률 100%', '치과 감염관리 표준 절차 15개 기관 도입', '치과 인증 준비 가이드북 공동 저자'],
    rate: '시간당 120,000원',
    available: true,
    rating: 4.8,
    reviewCount: 33,
  },
];
