// 병원 유형
export type HospitalType =
  | 'nursing' | 'psychiatric' | 'rehabilitation' | 'acute'
  | 'dental' | 'korean' | 'general' | 'tertiary' | 'hospital'
  | 'other' | 'custom';

export const HOSPITAL_TYPE_LABELS: Record<string, string> = {
  nursing: '요양병원', psychiatric: '정신병원', rehabilitation: '재활의료기관',
  acute: '급성기병원', dental: '치과병원', korean: '한방병원',
  general: '종합병원', tertiary: '상급종합병원', hospital: '병원',
  other: '기타 병원', custom: '직접 입력',
};

// 문서 유형
export type DocumentType =
  | 'regulation' | 'guideline' | 'checklist' | 'form' | 'record' | 'manual';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  regulation: '규정집', guideline: '지침서', checklist: '체크리스트',
  form: '서식', record: '대장', manual: '매뉴얼',
};

// AI 생성 상태
export type AiGenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

// 인증 상태
export type CertificationStatus =
  | 'not_started' | 'in_progress' | 'submitted' | 'under_review'
  | 'certified' | 'conditional' | 'failed';

export const CERTIFICATION_STATUS_LABELS: Record<CertificationStatus, string> = {
  not_started: '미시작', in_progress: '진행 중', submitted: '제출 완료',
  under_review: '심사 중', certified: '인증 완료', conditional: '조건부 인증', failed: '인증 불가',
};

// 사용자 역할
export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: '관리자', manager: '담당자', staff: '직원', viewer: '열람자',
};

// 교육 카테고리
export type EducationCategory =
  | 'patient_safety' | 'infection_control' | 'fire_safety'
  | 'human_rights' | 'quality' | 'other';

export const EDUCATION_CATEGORY_LABELS: Record<EducationCategory, string> = {
  patient_safety: '환자 안전', infection_control: '감염 관리',
  fire_safety: '화재 안전', human_rights: '인권', quality: '질 향상', other: '기타',
};

export interface EducationCourse {
  id: string;
  title: string;
  category: EducationCategory;
  hospitalType: HospitalType;
  duration: number;
  description: string;
  mandatory: boolean;
}

// 공지 출처
export type NoticeSource = 'mss' | 'nts' | 'bizinfo' | 'gsp' | 'other';

export const NOTICE_SOURCE_LABELS: Record<NoticeSource, string> = {
  mss: '중소벤처기업부', nts: '국세청', bizinfo: '기업마당', gsp: '경기스타트업', other: '기타',
};

// 공공데이터 유형
export const PUBLIC_DATA_TYPE_LABELS: Record<string, string> = {
  insurance: '건강보험', evaluation: '기관 평가', statistics: '통계',
  guideline: '지침', certification: '인증 정보',
};

// 문서 템플릿
export interface DocumentTemplate {
  id: string;
  title: string;
  type: DocumentType;
  hospitalType: HospitalType;
  content: string;
  createdAt: string;
}
