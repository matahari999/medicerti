// API 응답 / 요청 타입 정의

// ============================
// 공통 응답 래퍼
// ============================

export interface ApiSuccess<T> {
  data: T
  meta?: {
    page?: number
    pageSize?: number
    total?: number
  }
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ============================
// 에러 코드
// ============================

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'PROCESSING_ERROR'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'QUOTA_EXCEEDED'

// ============================
// 문서 업로드
// ============================

export interface UploadDocumentRequest {
  hospitalId: string
  category?: 'policy' | 'procedure' | 'record' | 'evidence' | 'other'
  tags?: string[]
}

export interface UploadDocumentResponse {
  documentId: string
  originalName: string
  status: 'pending'
  createdAt: string
}

// ============================
// 분석 실행
// ============================

export interface RunAnalysisRequest {
  hospitalId: string
}

export interface RunAnalysisResponse {
  runId: string
  status: 'queued' | 'running'
  startedAt: string
}

// SSE 이벤트 (분석 진행 상황)
export interface AnalysisProgressEvent {
  stage: 'preparing' | 'extracting' | 'analyzing' | 'scoring' | 'complete' | 'error'
  progress: number
  runId?: string
  message?: string
}

// ============================
// 보고서
// ============================

export interface ExportReportResponse {
  reportId: string
  downloadUrl: string
  expiresAt: string
}

// ============================
// 팀 초대
// ============================

export interface InviteMemberRequest {
  email: string
  role: 'admin' | 'manager' | 'viewer'
}

export interface InviteMemberResponse {
  memberId: string
  email: string
  role: string
  status: 'invited'
}
