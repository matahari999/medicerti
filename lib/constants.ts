// ============================
// AI Model
// ============================
export const GEMINI_MODEL = 'gemini-2.5-flash' as const

// ============================
// 인증 도메인 정의
// ============================
export const DOMAINS = {
  PS: { code: 'PS', name: '환자안전', nameEn: 'Patient Safety', weight: 1.5, color: '#ef4444' },
  PC: { code: 'PC', name: '환자중심', nameEn: 'Patient-Centered Care', weight: 1.2, color: '#f59e0b' },
  GL: { code: 'GL', name: '지도체계', nameEn: 'Governance & Leadership', weight: 1.0, color: '#3b82f6' },
  QS: { code: 'QS', name: '안전/질향상', nameEn: 'Quality & Safety', weight: 1.0, color: '#10b981' },
} as const

export type DomainCode = keyof typeof DOMAINS

// ============================
// 적합도 상태 레이블
// ============================
export const COMPLIANCE_STATUS_LABELS = {
  compliant:     '적합',
  partial:       '부분적합',
  non_compliant: '부적합',
  not_reviewed:  '미검토',
} as const

export const COMPLIANCE_STATUS_COLORS = {
  compliant:     'bg-green-100 text-green-800 border-green-200',
  partial:       'bg-amber-100 text-amber-800 border-amber-200',
  non_compliant: 'bg-red-100 text-red-800 border-red-200',
  not_reviewed:  'bg-gray-100 text-gray-600 border-gray-200',
} as const

// ============================
// 심각도 레이블
// ============================
export const SEVERITY_LABELS = {
  critical: '치명적',
  major:    '중요',
  minor:    '경미',
} as const

export const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  major:    'bg-amber-100 text-amber-800 border-amber-200',
  minor:    'bg-blue-100 text-blue-800 border-blue-200',
} as const

// ============================
// 문서 카테고리
// ============================
export const DOCUMENT_CATEGORY_LABELS = {
  policy:    '정책',
  procedure: '절차',
  record:    '기록',
  evidence:  '근거',
  other:     '기타',
} as const

// ============================
// 시스템 제한
// ============================
export const MAX_FILE_SIZE_MB = 50
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const MAX_BATCH_UPLOAD = 20
export const ANALYSIS_TIMEOUT_MS = 120_000
export const OCR_MAX_RETRIES = 3
export const MAX_ANALYSIS_HISTORY = 10
export const OCR_TOKEN_LIMIT = 8_000
export const ANALYSIS_TOKEN_LIMIT = 100_000

// ============================
// 점수 임계값
// ============================
export const SCORE_THRESHOLDS = {
  PASS:    80,
  WARNING: 60,
} as const

// ============================
// 역할 레이블
// ============================
export const ROLE_LABELS: Record<string, string> = {
  admin:   '관리자',
  manager: '담당자',
  viewer:  '뷰어',
} as const

// PDF 허용 MIME 타입
export const ALLOWED_MIME_TYPES = ['application/pdf'] as const
export const PDF_MAGIC_BYTES = '%PDF'

// ============================
// 관리 문서 유형
// ============================
export const MANAGED_DOC_TYPE_LABELS = {
  regulation:       '규정집',
  criteria_book:    '기준집',
  legal_form:       '법정양식',
  checklist:        '점검표',
  education_record: '교육기록',
  meeting_minutes:  '회의록',
  corrective_action:'시정조치서',
} as const

export const MANAGED_DOC_TYPE_ICONS: Record<string, string> = {
  regulation:       '📋',
  criteria_book:    '📚',
  legal_form:       '📄',
  checklist:        '✅',
  education_record: '🎓',
  meeting_minutes:  '📝',
  corrective_action:'🔧',
}

// ============================
// 관리 문서 상태
// ============================
export const MANAGED_DOC_STATUS_LABELS = {
  draft:        '초안',
  under_review: '검토중',
  approved:     '승인완료',
  archived:     '보관',
} as const

export const MANAGED_DOC_STATUS_COLORS = {
  draft:        'bg-gray-100 text-gray-700 border-gray-200',
  under_review: 'bg-amber-100 text-amber-800 border-amber-200',
  approved:     'bg-green-100 text-green-800 border-green-200',
  archived:     'bg-blue-100 text-blue-700 border-blue-200',
} as const

// 상태 전환 허용 맵: 현재 상태 → 이동 가능한 다음 상태들
export const MANAGED_DOC_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft:        ['under_review'],
  under_review: ['approved', 'draft'],
  approved:     ['archived'],
  archived:     [],
} as const
