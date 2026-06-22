// 자동 생성 예정: supabase gen types typescript --linked > types/database.types.ts
// 현재는 수동 정의 (Supabase 프로젝트 연결 후 대체)

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type HospitalRole = 'admin' | 'manager' | 'viewer'
export type MemberStatus = 'active' | 'invited' | 'removed'
export type DocumentCategory = 'policy' | 'procedure' | 'record' | 'evidence' | 'other'
export type DocumentStatus = 'pending' | 'processing' | 'extracted' | 'failed' | 'deleted'
export type AnalysisStatus = 'queued' | 'running' | 'complete' | 'failed'
export type ComplianceStatus = 'compliant' | 'partial' | 'non_compliant' | 'not_reviewed'
export type CriterionSeverity = 'critical' | 'major' | 'minor'

// ============================
// Table Row Types
// ============================

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  job_title: string | null
  created_at: string
  updated_at: string
}

export interface Hospital {
  id: string
  name: string
  license_number: string | null
  type: string
  bed_count: number | null
  region: string | null
  address: string | null
  phone: string | null
  accreditation_cycle: number
  accreditation_start: string | null
  accreditation_target: string | null
  status: 'active' | 'suspended' | 'archived'
  logo_url: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface HospitalMember {
  id: string
  hospital_id: string
  user_id: string | null
  email: string
  role: HospitalRole
  status: MemberStatus
  invite_token: string | null
  invite_expires: string | null
  invited_by: string | null
  joined_at: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  hospital_id: string
  uploaded_by: string
  original_name: string
  storage_path: string
  file_size_bytes: number
  mime_type: string
  category: DocumentCategory
  tags: string[]
  status: DocumentStatus
  error_message: string | null
  extraction_attempts: number
  extracted_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface DocumentExtraction {
  id: string
  document_id: string
  hospital_id: string
  full_text: string
  page_data: Json
  total_pages: number
  avg_confidence: number | null
  word_count: number | null
  extracted_by: string
  created_at: string
}

export interface AccreditationCriterion {
  id: string
  code: string
  domain: string
  domain_code: string
  category: string | null
  title: string
  description: string
  required_evidence: string | null
  default_severity: CriterionSeverity
  weight: number
  is_mandatory: boolean
  is_active: boolean
  version: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface AnalysisRun {
  id: string
  hospital_id: string
  triggered_by: string
  status: AnalysisStatus
  overall_score: number | null
  domain_scores: Json | null
  total_criteria: number | null
  compliant_count: number
  partial_count: number
  non_compliant_count: number
  not_reviewed_count: number
  critical_gap_count: number
  major_gap_count: number
  minor_gap_count: number
  documents_analyzed: number
  tokens_used: number | null
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface CriterionResult {
  id: string
  analysis_run_id: string
  hospital_id: string
  criterion_id: string
  compliance_status: ComplianceStatus
  evidence_text: string | null
  evidence_document_hint: string | null
  gap_description: string | null
  recommendation: string | null
  severity: CriterionSeverity | null
  ai_confidence: number | null
  created_at: string
}

export interface Report {
  id: string
  hospital_id: string
  analysis_run_id: string
  generated_by: string
  storage_path: string
  file_size_bytes: number | null
  page_count: number | null
  title: string
  generated_at: string
}

export interface AuditLog {
  id: number
  user_id: string | null
  hospital_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  metadata: Json
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// ============================
// Insert Types
// ============================

export type ProfileInsert = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>> & { id: string }
export type HospitalInsert = Omit<Hospital, 'id' | 'created_at' | 'updated_at'>
export type HospitalMemberInsert = Omit<HospitalMember, 'id' | 'created_at' | 'updated_at'>
export type DocumentInsert = Omit<Document, 'id' | 'created_at' | 'updated_at'>
export type DocumentExtractionInsert = Omit<DocumentExtraction, 'id' | 'created_at'>
export type AnalysisRunInsert = Omit<AnalysisRun, 'id' | 'created_at'>
export type CriterionResultInsert = Omit<CriterionResult, 'id' | 'created_at'>
export type ReportInsert = Omit<Report, 'id'>
export type AuditLogInsert = Omit<AuditLog, 'id' | 'created_at'>

// ============================
// Update Types
// ============================

export type HospitalUpdate = Partial<HospitalInsert>
export type DocumentUpdate = Partial<Pick<Document, 'status' | 'error_message' | 'extraction_attempts' | 'extracted_at' | 'deleted_at' | 'category' | 'tags'>>
export type AnalysisRunUpdate = Partial<Pick<AnalysisRun, 'status' | 'overall_score' | 'domain_scores' | 'compliant_count' | 'partial_count' | 'non_compliant_count' | 'not_reviewed_count' | 'critical_gap_count' | 'major_gap_count' | 'minor_gap_count' | 'documents_analyzed' | 'tokens_used' | 'error_message' | 'started_at' | 'completed_at' | 'total_criteria'>>

// ============================
// Supabase Database Interface
// ============================

export interface Database {
  public: {
    Tables: {
      profiles:                { Row: Profile;                Insert: ProfileInsert;                Update: Partial<Profile> }
      hospitals:               { Row: Hospital;               Insert: HospitalInsert;               Update: HospitalUpdate }
      hospital_members:        { Row: HospitalMember;         Insert: HospitalMemberInsert;         Update: Partial<HospitalMember> }
      documents:               { Row: Document;               Insert: DocumentInsert;               Update: DocumentUpdate }
      document_extractions:    { Row: DocumentExtraction;     Insert: DocumentExtractionInsert;     Update: never }
      accreditation_criteria:  { Row: AccreditationCriterion; Insert: AccreditationCriterion;      Update: Partial<AccreditationCriterion> }
      analysis_runs:           { Row: AnalysisRun;            Insert: AnalysisRunInsert;            Update: AnalysisRunUpdate }
      criterion_results:       { Row: CriterionResult;        Insert: CriterionResultInsert;        Update: never }
      reports:                 { Row: Report;                 Insert: ReportInsert;                 Update: never }
      audit_logs:              { Row: AuditLog;               Insert: AuditLogInsert;               Update: never }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      hospital_role:      HospitalRole
      member_status:      MemberStatus
      document_category:  DocumentCategory
      document_status:    DocumentStatus
      analysis_status:    AnalysisStatus
      compliance_status:  ComplianceStatus
      criterion_severity: CriterionSeverity
    }
  }
}
