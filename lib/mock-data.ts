import type { EducationCourse } from '@/types';

export const mockCertificationCategories = [
  { id: '1', name: '기본가치', code: 'BV', totalItems: 12, completedItems: 8 },
  { id: '2', name: '환자안전보장활동', code: 'PS', totalItems: 20, completedItems: 14 },
  { id: '3', name: '진료전달체계와 평가', code: 'ME', totalItems: 18, completedItems: 10 },
  { id: '4', name: '환자진료', code: 'PC', totalItems: 35, completedItems: 22 },
  { id: '5', name: '수술 및 마취진정 관리', code: 'SA', totalItems: 15, completedItems: 9 },
  { id: '6', name: '의약품 관리', code: 'MM', totalItems: 14, completedItems: 11 },
  { id: '7', name: '감염관리', code: 'IC', totalItems: 16, completedItems: 13 },
  { id: '8', name: '경영 및 조직운영', code: 'MO', totalItems: 22, completedItems: 15 },
  { id: '9', name: '인적자원관리', code: 'HR', totalItems: 18, completedItems: 12 },
  { id: '10', name: '시설 및 환경관리', code: 'FE', totalItems: 20, completedItems: 16 },
];

export const mockPublicDataMeta = [
  { id: 'insurance', name: '건강보험 청구 현황', source: '건강보험심사평가원', updatedAt: '2026-06-01', type: 'insurance' },
  { id: 'evaluation', name: '요양기관 평가 결과', source: '의료기관평가인증원', updatedAt: '2026-05-15', type: 'evaluation' },
  { id: 'statistics', name: '의료기관 통계', source: '보건복지부', updatedAt: '2026-04-30', type: 'statistics' },
];

export const mockEducationCourses: EducationCourse[] = [
  { id: '1', title: '낙상 예방 교육', category: 'patient_safety', hospitalType: 'nursing', duration: 60, description: '낙상 위험 평가 및 예방 활동', mandatory: true },
  { id: '2', title: '손위생 교육', category: 'infection_control', hospitalType: 'nursing', duration: 30, description: '올바른 손위생 방법', mandatory: true },
  { id: '3', title: '화재 대피 훈련', category: 'fire_safety', hospitalType: 'nursing', duration: 90, description: '화재 발생 시 대피 절차', mandatory: true },
  { id: '4', title: '환자 권리 교육', category: 'human_rights', hospitalType: 'nursing', duration: 45, description: '환자 권리와 의무', mandatory: true },
  { id: '5', title: '의료기관 인증 이해', category: 'quality', hospitalType: 'nursing', duration: 60, description: '4주기 인증기준 개요', mandatory: false },
];

export const mockNotices = [
  { id: '1', title: '2026년 요양병원 현지조사 계획 안내', source: 'nts' as const, publishedAt: '2026-06-15', url: '#', isNew: true, urgency: 'high', content: '', targetHospitalTypes: ['nursing'] },
  { id: '2', title: '의료기관 인증 신청 접수 안내 (하반기)', source: 'mss' as const, publishedAt: '2026-06-10', url: '#', isNew: true, urgency: 'medium', content: '', targetHospitalTypes: [] },
  { id: '3', title: '요양병원 입원급여 적정성 평가 결과 공개', source: 'bizinfo' as const, publishedAt: '2026-06-05', url: '#', isNew: false, urgency: 'low', content: '', targetHospitalTypes: ['nursing'] },
  { id: '4', title: '감염병 예방 지침 개정 안내', source: 'mss' as const, publishedAt: '2026-05-28', url: '#', isNew: false, urgency: 'medium', content: '', targetHospitalTypes: [] },
  { id: '5', title: '경기도 의료기관 지원사업 공고', source: 'gsp' as const, publishedAt: '2026-05-20', url: '#', isNew: false, urgency: 'low', content: '', targetHospitalTypes: [] },
];
