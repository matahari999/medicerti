// ─── 병원 유형 ───────────────────────────────────────────────
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

// ─── 문서 유형 ───────────────────────────────────────────────
export type DocumentType =
  | 'regulation' | 'guideline' | 'checklist' | 'form' | 'record' | 'manual' | 'other';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  regulation: '규정집', guideline: '지침서', checklist: '체크리스트',
  form: '서식', record: '대장', manual: '매뉴얼', other: '기타',
};

// ─── AI 생성 상태 ─────────────────────────────────────────────
export type AiGenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

// ─── 인증 상태 ───────────────────────────────────────────────
export type CertificationStatus =
  | 'not_started' | 'in_progress' | 'submitted' | 'under_review'
  | 'certified' | 'conditional' | 'failed' | 'completed' | 'overdue';

export const CERTIFICATION_STATUS_LABELS: Record<string, string> = {
  not_started: '미시작', in_progress: '진행 중', submitted: '제출 완료',
  under_review: '심사 중', certified: '인증 완료', conditional: '조건부 인증',
  failed: '인증 불가', completed: '완료', overdue: '기한 초과',
};

// ─── 사용자 역할 ─────────────────────────────────────────────
export type UserRole =
  | 'admin' | 'manager' | 'staff' | 'viewer'
  | 'hospital_admin' | 'department_manager' | 'consultant';

export const USER_ROLE_LABELS: Record<string, string> = {
  admin: '관리자', manager: '담당자', staff: '직원', viewer: '열람자',
  hospital_admin: '병원 관리자', department_manager: '부서장', consultant: '컨설턴트',
};

// ─── 교육 카테고리 ────────────────────────────────────────────
export type EducationCategory =
  | 'patient_safety' | 'infection_control' | 'fire_safety'
  | 'human_rights' | 'quality' | 'other' | 'admin'
  | 'mandatory' | 'certification' | 'infection' | 'safety' | 'job_skill';

export const EDUCATION_CATEGORY_LABELS: Record<string, string> = {
  patient_safety: '환자 안전', infection_control: '감염 관리',
  fire_safety: '화재 안전', human_rights: '인권', quality: '질 향상',
  other: '기타', admin: '행정/관리',
  mandatory: '의무교육', certification: '인증교육', infection: '감염관리',
  safety: '안전교육', job_skill: '직무역량',
};

export interface EducationCourse {
  id: string;
  title: string;
  category: EducationCategory;
  hospitalType: HospitalType;
  duration: number;
  description: string;
  mandatory?: boolean;
  isMandatory?: boolean;
  targetJobTypes?: string[];
  hasCertificate?: boolean;
  [key: string]: unknown;
}

// ─── 공지 출처 ───────────────────────────────────────────────
export type NoticeSource =
  | 'mss' | 'nts' | 'bizinfo' | 'gsp' | 'other'
  | 'koiha' | 'hira' | 'mohw' | 'kdca';

export const NOTICE_SOURCE_LABELS: Record<string, string> = {
  mss: '중소벤처기업부', nts: '국세청', bizinfo: '기업마당', gsp: '경기스타트업',
  koiha: '의료기관평가인증원', hira: '건강보험심사평가원', mohw: '보건복지부',
  kdca: '질병관리청', other: '기타',
};

// ─── 공공데이터 유형 ──────────────────────────────────────────
export const PUBLIC_DATA_TYPE_LABELS: Record<string, string> = {
  insurance: '건강보험', evaluation: '기관 평가', statistics: '통계',
  guideline: '지침', certification: '인증 정보',
};

// ─── QPIC ────────────────────────────────────────────────────
export type QpicSection =
  | 'basic_values' | 'patient_safety' | 'care_delivery' | 'patient_care'
  | 'surgery' | 'medication' | 'infection' | 'management' | 'hr' | 'facility'
  | 'qps' | 'adequacy';

export type QpicResourceType =
  | 'guideline' | 'checklist' | 'form' | 'regulation' | 'record' | 'manual' | 'law' | 'news' | 'link';

export interface QpicResource {
  id: string;
  sectionId?: QpicSection;
  section?: string;
  resourceType: QpicResourceType;
  title: string;
  hospitalType?: HospitalType;
  url?: string | null;
  fileUrl?: string | null;
  description?: string;
  source?: string;
  publishedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export const QPIC_SECTION_LABELS: Record<string, string> = {
  basic_values: '기본가치', patient_safety: '환자안전', care_delivery: '진료전달',
  patient_care: '환자진료', surgery: '수술/마취', medication: '의약품',
  infection: '감염관리', management: '경영/조직', hr: '인적자원',
  facility: '시설환경', qps: '환자평가', adequacy: '적정성평가',
};

export const QPIC_RESOURCE_TYPE_LABELS: Record<string, string> = {
  guideline: '지침', checklist: '체크리스트', form: '서식',
  regulation: '규정', record: '기록', manual: '매뉴얼',
};

// ─── 문서 템플릿 ─────────────────────────────────────────────
export interface DocumentTemplate {
  id: string;
  title: string;
  type: DocumentType;
  category?: string;
  hospitalType?: HospitalType;
  hospitalTypes?: HospitalType[];
  content?: string;
  description?: string;
  version?: string;
  isAiGenerated?: boolean;
  downloadFormats?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}
