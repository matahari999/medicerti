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
export type ManagedDocType =
  | 'regulation'
  | 'criteria_book'
  | 'legal_form'
  | 'checklist'
  | 'education_record'
  | 'meeting_minutes'
  | 'corrective_action'
export type ManagedDocStatus = 'draft' | 'under_review' | 'approved' | 'archived'

// ============================
// Table Row Types
// ============================

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  job_title: string | null
  is_platform_admin: boolean
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

export interface ManagedDocument {
  id: string
  hospital_id: string
  doc_type: ManagedDocType
  title: string
  content: string
  status: ManagedDocStatus
  version_number: number
  criterion_id: string | null
  analysis_run_id: string | null
  policy_draft_id: string | null
  approved_by: string | null
  approved_at: string | null
  archived_at: string | null
  created_by: string
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface ManagedDocumentVersion {
  id: string
  document_id: string
  hospital_id: string
  version_number: number
  title: string
  content: string
  status: ManagedDocStatus
  change_summary: string | null
  created_by: string
  created_at: string
}

export type ManagedDocumentInsert = Omit<ManagedDocument, 'id' | 'created_at' | 'updated_at'>
export type ManagedDocumentUpdate = Partial<Pick<ManagedDocument,
  'title' | 'content' | 'status' | 'version_number' | 'approved_by' | 'approved_at' | 'archived_at' | 'updated_by'
>>

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
// 5단계 계층: 인증기준 데이터 모델
// ============================

export interface AccreditationArea {
  id: string
  code: string
  name: string
  name_en: string | null
  description: string | null
  color: string | null
  weight: number
  sort_order: number
  created_at: string
}

export interface AccreditationChapter {
  id: string
  area_id: string
  code: string
  title: string
  description: string | null
  hospital_types: string[]
  sort_order: number
  created_at: string
}

export interface AccreditationEntry {
  id: string
  chapter_id: string
  code: string
  title: string
  description: string | null
  hospital_types: string[]
  sort_order: number
  created_at: string
}

export interface AccreditationCategory {
  id: string
  entry_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface AccreditationSurveyItem {
  id: string
  category_id: string | null
  entry_id: string
  code: string
  title: string
  description: string
  assessment_method: string | null
  sop_type: 'structure' | 'process' | 'outcome'
  is_pilot: boolean
  severity: CriterionSeverity
  weight: number
  is_mandatory: boolean
  is_active: boolean
  version: string
  hospital_types: string[]
  required_evidence: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

// 계층 트리 조회 결과 타입
export interface AreaTree extends AccreditationArea {
  chapters: ChapterTree[]
}

export interface ChapterTree extends AccreditationChapter {
  entries: EntryTree[]
}

export interface EntryTree extends AccreditationEntry {
  categories: CategoryTree[]
  items: SurveyItemBrief[]
}

export interface CategoryTree extends AccreditationCategory {
  items: SurveyItemBrief[]
}

export interface SurveyItemBrief {
  id: string
  code: string
  title: string
  description: string
  assessment_method: string | null
  sop_type: string
  is_pilot: boolean
  severity: string
  is_mandatory: boolean
  required_evidence: string | null
  category_id?: string | null
}

export type SopType = 'structure' | 'process' | 'outcome'

export const SOP_TYPE_LABELS: Record<SopType, string> = {
  structure: '구조',
  process: '과정',
  outcome: '결과',
}

// ============================
// Self-Assessment Types
// ============================

export interface SelfAssessment {
  id: string
  hospital_id: string
  title: string
  overall_score: number | null
  total_items: number
  compliant_count: number
  partial_count: number
  non_compliant_count: number
  not_reviewed_count: number
  critical_gap_count: number
  priority_score: number | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface SelfAssessmentResult {
  id: string
  assessment_id: string
  hospital_id: string
  survey_item_id: string
  compliance_status: ComplianceStatus
  notes: string | null
  evidence_hint: string | null
  priority_score: number | null
  created_at: string
  updated_at: string
}

export interface SelfAssessmentResultWithItem extends SelfAssessmentResult {
  survey_item: AccreditationSurveyItem
}

// ============================
// Rounding/Mock Survey Types
// ============================

export interface RoundingCategory {
  id: string
  name: string
  description: string | null
  hospital_type: string[]
  max_score: number
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface RoundingRecord {
  id: string
  hospital_id: string
  title: string
  round_date: string
  overall_score: number | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface RoundingResult {
  id: string
  rounding_id: string
  category_id: string
  hospital_id: string
  score: number
  finding: string | null
  action_needed: string | null
  created_at: string
}

export interface RoundingMetric {
  id: string
  hospital_id: string
  metric_name: string
  metric_label: string
  metric_value: number
  unit: string
  recorded_date: string
  notes: string | null
  recorded_by: string | null
  created_at: string
}

// ============================
// Employee Acknowledgment Types
// ============================

export interface EmployeeAcknowledgment {
  id: string
  hospital_id: string
  document_id: string | null
  document_type: string
  document_title: string
  employee_name: string
  employee_department: string | null
  employee_role: string | null
  acknowledged_at: string
  expires_at: string | null
  expiration_months: number | null
  created_by: string | null
  created_at: string
}

export interface EmployeeAckLog {
  id: number
  acknowledgment_id: string
  hospital_id: string
  action: string
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  changed_by: string | null
  created_at: string
}

// ============================
// Cross-Standard Mapping Types
// ============================

export interface AccreditationStandard {
  id: string
  code: string
  name: string
  issuing_body: string | null
  description: string | null
  version: string
  icon: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface StandardMapping {
  id: string
  source_standard_id: string
  target_standard_id: string
  source_code: string
  target_code: string
  source_title: string | null
  target_title: string | null
  mapping_type: 'equivalent' | 'related' | 'subset' | 'superset'
  confidence: 'auto' | 'manual' | 'verified'
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export const CROSS_STANDARD_PRESETS = [
  { code: 'hospital_cert', name: '의료기관인증', issuing: '의료기관평가인증원', icon: '🏥' },
  { code: 'long_term_care_eval', name: '장기요양급여 제공기준', issuing: '건강보험심사평가원', icon: '🏠' },
  { code: 'mental_health_eval', name: '정신건강복지시설 평가', issuing: '보건복지부', icon: '🧠' },
] as const

export const ROUNDING_METRIC_PRESETS = [
  { name: 'chart_sign_omission', label: '의무기록 서명 누락률', unit: '%' },
  { name: 'hand Hygiene_rate', label: '손위생 이행률', unit: '%' },
  { name: 'fall_incidence', label: '낙상 발생률', unit: '건/천재원일' },
  { name: 'medication_error', label: '투약 오류 보고 건수', unit: '건' },
  { name: 'pressure_ulcer_rate', label: '욕창 발생률', unit: '%' },
  { name: 'restraint_rate', label: '신체억제대 사용률', unit: '%' },
] as const

export const SOP_TYPE_COLORS: Record<SopType, string> = {
  structure: 'bg-blue-100 text-blue-700 border-blue-200',
  process: 'bg-amber-100 text-amber-700 border-amber-200',
  outcome: 'bg-green-100 text-green-700 border-green-200',
}

// ============================
// Supabase Database Interface
// ============================

export interface Database {
  public: {
    Tables: {
      profiles:                 { Row: Profile;                 Insert: ProfileInsert;                 Update: Partial<Profile> }
      hospitals:                { Row: Hospital;                Insert: HospitalInsert;                Update: HospitalUpdate }
      hospital_members:         { Row: HospitalMember;          Insert: HospitalMemberInsert;          Update: Partial<HospitalMember> }
      documents:                { Row: Document;                Insert: DocumentInsert;                Update: DocumentUpdate }
      document_extractions:     { Row: DocumentExtraction;      Insert: DocumentExtractionInsert;      Update: never }
      accreditation_criteria:   { Row: AccreditationCriterion;  Insert: AccreditationCriterion;       Update: Partial<AccreditationCriterion> }
      analysis_runs:            { Row: AnalysisRun;             Insert: AnalysisRunInsert;             Update: AnalysisRunUpdate }
      criterion_results:        { Row: CriterionResult;         Insert: CriterionResultInsert;         Update: never }
      reports:                  { Row: Report;                  Insert: ReportInsert;                  Update: never }
      audit_logs:               { Row: AuditLog;                Insert: AuditLogInsert;                Update: never }
      accreditation_areas:        { Row: AccreditationArea;        Insert: Partial<AccreditationArea>;    Update: Partial<AccreditationArea> }
      accreditation_chapters:     { Row: AccreditationChapter;     Insert: Partial<AccreditationChapter>;  Update: Partial<AccreditationChapter> }
      accreditation_entries:      { Row: AccreditationEntry;       Insert: Partial<AccreditationEntry>;    Update: Partial<AccreditationEntry> }
      accreditation_categories:   { Row: AccreditationCategory;    Insert: Partial<AccreditationCategory>; Update: Partial<AccreditationCategory> }
      accreditation_survey_items: { Row: AccreditationSurveyItem;  Insert: Partial<AccreditationSurveyItem>; Update: Partial<AccreditationSurveyItem> }
      self_assessments:           { Row: SelfAssessment;           Insert: Partial<SelfAssessment>;        Update: Partial<SelfAssessment> }
      self_assessment_results:    { Row: SelfAssessmentResult;     Insert: Partial<SelfAssessmentResult>;  Update: Partial<SelfAssessmentResult> }
      rounding_categories:        { Row: RoundingCategory;         Insert: Partial<RoundingCategory>;      Update: Partial<RoundingCategory> }
      rounding_records:           { Row: RoundingRecord;           Insert: Partial<RoundingRecord>;        Update: Partial<RoundingRecord> }
      rounding_results:           { Row: RoundingResult;           Insert: Partial<RoundingResult>;        Update: Partial<RoundingResult> }
      rounding_metrics:            { Row: RoundingMetric;            Insert: Partial<RoundingMetric>;         Update: Partial<RoundingMetric> }
      employee_acknowledgments:     { Row: EmployeeAcknowledgment;   Insert: Partial<EmployeeAcknowledgment>;  Update: Partial<EmployeeAcknowledgment> }
      employee_acknowledgment_logs: { Row: EmployeeAckLog;           Insert: never;                           Update: never }
      accreditation_standards:      { Row: AccreditationStandard;    Insert: Partial<AccreditationStandard>;  Update: Partial<AccreditationStandard> }
      standard_mappings:            { Row: StandardMapping;          Insert: Partial<StandardMapping>;        Update: Partial<StandardMapping> }
    }
    Views: Record<string, never>
    Functions: {
      get_accreditation_tree: {
        Args: { p_hospital_type: string | null }
        Returns: Json
      }
      create_self_assessment: {
        Args: { p_hospital_id: string; p_title: string }
        Returns: Json
      }
      calculate_item_priority: {
        Args: { p_severity: string; p_domain_code: string; p_is_mandatory: boolean; p_sop_type: string }
        Returns: number
      }
      get_rounding_trends: {
        Args: { p_hospital_id: string; p_months: number }
        Returns: Json
      }
      get_metric_trends: {
        Args: { p_hospital_id: string; p_metric_name: string | null; p_months: number }
        Returns: Json
      }
      get_acknowledgment_stats: {
        Args: { p_hospital_id: string }
        Returns: Json
      }
      get_hospital_cross_mappings: {
        Args: { p_hospital_type: string }
        Returns: Json
      }
    }
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

// Notification types (Feature C)
export type NotificationType =
  | 'rounding_due' | 'rounding_overdue'
  | 'accreditation_expiring' | 'accreditation_expired'
  | 'education_retrain'
  | 'assessment_incomplete'
  | 'acknowledgment_due'
  | 'kpi_alert'
  | 'system'

export interface Notification {
  id: string
  hospital_id: string
  user_id: string | null
  type: NotificationType
  title: string
  message: string | null
  severity: 'info' | 'warning' | 'critical'
  link: string | null
  is_read: boolean
  created_at: string
  read_at: string | null
}
