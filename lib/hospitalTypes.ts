// =============================================
// 메디인증 문서센터 - 병원 유형별 정보
// =============================================

import { HospitalTypeKey } from './types';

export interface HospitalTypeInfo {
  key: HospitalTypeKey;
  name: string;
  shortName: string;
  certificationCycle: string;
  description: string;
  mainDepartments: string[];
  keyDocumentLibrary: string[];
  emergencyEquipment: string[];
  color: string;
  bgColor: string;
  icon: string;
}

export const HOSPITAL_TYPES: Record<HospitalTypeKey, HospitalTypeInfo> = {
  nursing: {
    key: 'nursing',
    name: '요양병원',
    shortName: '요양병원',
    certificationCycle: '3년',
    description: '만성질환자·노인 환자 대상 장기입원치료 제공 의료기관',
    mainDepartments: ['간호부', '진료부', '원무과', '사회사업실', '영양팀', '물리치료실', '약제부'],
    keyDocumentLibrary: [
      '환자안전위원회', '적신호사건 보고', '낙상관리', '욕창관리', '감염관리',
      '의약품관리', '환자권리와 책임', '불만고충처리', '의무기록관리',
      '개인정보보호', '시설안전관리', '화재안전', '직원교육', 'QPS 활동',
      '퇴원 및 전원관리', '영양관리', '응급상황 대응',
      'AED/전기충격기 점검', '응급키트 점검', '응급카트 점검',
      '산소공급장비 점검', '흡인기 점검', '구급차 점검일지',
      '비상연락망', '야간·휴일 응급대응', '환자 이송 절차', '응급의약품 관리',
    ],
    emergencyEquipment: ['AED', '응급키트', '응급카트', '산소공급장비', '흡인기', '구급차'],
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: '🏥',
  },
  psychiatric: {
    key: 'psychiatric',
    name: '정신병원',
    shortName: '정신병원',
    certificationCycle: '3년',
    description: '정신질환자 진단·치료·재활 전문 의료기관',
    mainDepartments: ['정신건강의학과', '간호부', '사회복지팀', '작업치료실', '약제부', '원무과'],
    keyDocumentLibrary: [
      '정신건강의학과 입원 절차', '자·타해 위험관리', '격리 및 강박 관리',
      '인권보호', '환자권리 고지', '보호의무자 안내', '정신건강 관련 동의서',
      '폭력 예방', '자살위험 평가', '약물관리', '정신과 병동 안전관리',
      '프로그램 운영 기록', '퇴원계획', '지역사회 연계', '응급상황 대응',
      'AED/전기충격기 점검', '응급키트 점검', '응급카트 점검',
      '구급차 점검일지', '자·타해 응급대응 키트', '보호장비 관리', '비상연락망',
    ],
    emergencyEquipment: ['AED', '응급키트', '응급카트', '보호장비', '구급차'],
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    icon: '🧠',
  },
  rehabilitation: {
    key: 'rehabilitation',
    name: '재활의료기관',
    shortName: '재활병원',
    certificationCycle: '3년',
    description: '장애 및 기능 회복을 위한 재활치료 전문 의료기관',
    mainDepartments: ['재활의학과', '물리치료실', '작업치료실', '언어치료실', '간호부', '사회복지팀'],
    keyDocumentLibrary: [
      '재활치료 계획', '기능평가', '다학제 회의', '환자 목표 설정',
      '재활치료 기록', '치료실 안전관리', '낙상예방', '퇴원 후 연계',
      '재활성과 평가', '물리치료실 점검', '작업치료실 점검',
      '언어치료 기록', '사회복귀 지원', '응급상황 대응',
      'AED/전기충격기 점검', '응급키트 점검', '치료실 응급카트 점검',
      '구급차 점검일지', '환자 이송 절차', '치료 중 응급상황 대응',
    ],
    emergencyEquipment: ['AED', '응급키트', '치료실 응급카트', '구급차'],
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: '♿',
  },
  acute: {
    key: 'acute',
    name: '급성기병원',
    shortName: '급성기병원',
    certificationCycle: '4년',
    description: '급성질환 진단·치료 중심의 의료기관',
    mainDepartments: ['응급실', '수술실', '중환자실', '간호부', '진료부', '약제부', '검사실'],
    keyDocumentLibrary: [
      '수술안전', '응급환자 관리', '중환자 관리', '감염관리', '투약안전',
      '환자확인', '검사관리', '진료전달체계', '환자안전사고 보고',
      '의료기기 관리', '의무기록관리', '개인정보보호', '응급상황 대응',
      'AED/전기충격기 점검', '응급카트 점검', '응급키트 점검',
      '응급의약품 관리', '구급차 점검일지', '심폐소생술 교육',
      '응급콜 체계', '환자 이송 절차', '수혈관리', '수술실 안전관리',
      '마취관리', '검사실 안전관리', '영상검사 안전관리',
    ],
    emergencyEquipment: ['AED', '응급카트', '응급키트', '구급차', '제세동기'],
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: '🚑',
  },
  tertiary: {
    key: 'tertiary',
    name: '상급종합병원',
    shortName: '상급종합병원',
    certificationCycle: '4년',
    description: '중증질환 중심의 최상위 의료기관',
    mainDepartments: ['응급의학과', '수술부', '중환자의학과', '간호부', '약제부', '진단검사의학과', '영상의학과'],
    keyDocumentLibrary: [
      '수술안전', '응급환자 관리', '중환자 관리', '감염관리', '투약안전',
      '환자확인', '검사관리', '진료전달체계', '환자안전사고 보고',
      '의료기기 관리', '의무기록관리', '개인정보보호', '응급상황 대응',
      'AED/전기충격기 점검', '응급카트 점검', '응급키트 점검',
      '응급의약품 관리', '구급차 점검일지', '심폐소생술 교육',
      '응급콜 체계', '환자 이송 절차', '수혈관리',
    ],
    emergencyEquipment: ['AED', '응급카트', '응급키트', '구급차', '제세동기'],
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    icon: '🏛️',
  },
  general: {
    key: 'general',
    name: '종합병원',
    shortName: '종합병원',
    certificationCycle: '4년',
    description: '여러 진료과를 갖춘 종합 의료기관',
    mainDepartments: ['응급실', '수술실', '간호부', '진료부', '약제부', '원무과'],
    keyDocumentLibrary: [
      '수술안전', '응급환자 관리', '감염관리', '투약안전', '환자확인',
      '진료전달체계', '환자안전사고 보고', '의무기록관리', '개인정보보호',
      'AED/전기충격기 점검', '응급카트 점검', '응급키트 점검',
      '구급차 점검일지', '심폐소생술 교육', '환자 이송 절차',
    ],
    emergencyEquipment: ['AED', '응급카트', '응급키트', '구급차'],
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    icon: '🏥',
  },
  hospital: {
    key: 'hospital',
    name: '병원',
    shortName: '병원',
    certificationCycle: '4년',
    description: '30병상 이상의 일반 의료기관',
    mainDepartments: ['진료부', '간호부', '원무과', '약제부'],
    keyDocumentLibrary: [
      '환자안전', '감염관리', '투약안전', '환자확인', '의무기록관리',
      '개인정보보호', '응급상황 대응', 'AED/전기충격기 점검',
      '응급키트 점검', '응급카트 점검', '구급차 점검일지',
    ],
    emergencyEquipment: ['AED', '응급키트', '응급카트'],
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    icon: '🏥',
  },
  dental: {
    key: 'dental',
    name: '치과병원',
    shortName: '치과병원',
    certificationCycle: '4년',
    description: '구강 및 치과 전문 의료기관',
    mainDepartments: ['치과진료부', '간호부', '멸균실', '방사선실'],
    keyDocumentLibrary: [
      '치과 진료 감염관리', '기구 멸균관리', '방사선 안전관리',
      '환자확인', '진료동의서', '응급상황 대응', '진료기록 관리',
      '치과 재료 관리', '의료폐기물 관리', 'AED/전기충격기 점검',
      '치과 응급키트 점검', '산소공급장비 점검', '흡인기 점검',
      '국소마취 관련 응급대응', '구급차 점검일지', '비상연락망',
    ],
    emergencyEquipment: ['AED', '치과 응급키트', '산소공급장비', '흡인기'],
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    icon: '🦷',
  },
  korean: {
    key: 'korean',
    name: '한방병원',
    shortName: '한방병원',
    certificationCycle: '4년',
    description: '한의학 전문 의료기관',
    mainDepartments: ['한의과', '탕전실', '침치료실', '간호부', '약제부'],
    keyDocumentLibrary: [
      '한방 진료 절차', '침·뜸·부항 관리', '한약재 관리', '탕전 관리',
      '감염관리', '환자확인', '진료기록 관리', '치료실 안전관리',
      '의료기기 관리', '응급상황 대응', 'AED/전기충격기 점검',
      '응급키트 점검', '산소공급장비 점검', '흡인기 점검',
      '침 치료 중 응급대응', '한약 복용 이상반응 대응', '구급차 점검일지',
    ],
    emergencyEquipment: ['AED', '응급키트', '산소공급장비', '흡인기'],
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    icon: '🌿',
  },
  other: {
    key: 'other',
    name: '기타 병원',
    shortName: '기타',
    certificationCycle: '확인 필요',
    description: '기타 의료기관',
    mainDepartments: ['진료부', '간호부', '원무과'],
    keyDocumentLibrary: [
      '환자안전', '감염관리', '의무기록관리', '개인정보보호',
      '응급상황 대응', 'AED/전기충격기 점검', '응급키트 점검',
    ],
    emergencyEquipment: ['AED', '응급키트'],
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    icon: '🏥',
  },
  custom: {
    key: 'custom',
    name: '직접 입력',
    shortName: '직접입력',
    certificationCycle: '직접 입력',
    description: '사용자가 직접 입력하는 병원 유형',
    mainDepartments: [],
    keyDocumentLibrary: [],
    emergencyEquipment: ['AED', '응급키트'],
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    icon: '✏️',
  },
};

export const HOSPITAL_TYPE_LIST = Object.values(HOSPITAL_TYPES);

export function getHospitalType(key: HospitalTypeKey): HospitalTypeInfo {
  return HOSPITAL_TYPES[key] ?? HOSPITAL_TYPES.other;
}
