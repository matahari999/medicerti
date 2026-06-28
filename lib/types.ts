// =============================================
// 메디인증 문서센터 - 타입 정의
// =============================================

export type HospitalTypeKey =
  | 'nursing'       // 요양병원
  | 'psychiatric'   // 정신병원
  | 'rehabilitation'// 재활의료기관
  | 'acute'         // 급성기병원
  | 'tertiary'      // 상급종합병원
  | 'general'       // 종합병원
  | 'hospital'      // 병원
  | 'dental'        // 치과병원
  | 'korean'        // 한방병원
  | 'other'         // 기타병원
  | 'custom';       // 직접입력

export type GenerationMode =
  | 'browse'        // 기준집 탐색 모드
  | 'single'        // 단일 문서 생성
  | 'package'       // 문서 패키지 생성
  | 'full'          // 전체 인증집 생성
  | 'search';       // 인증 만물박사 검색

export type DocumentType =
  | 'regulation'    // 규정집
  | 'guideline'     // 지침서
  | 'procedure'     // 절차서
  | 'form'          // 서식/양식
  | 'checklist'     // 체크리스트
  | 'appendix'      // 부록
  | 'education'     // 교육자료
  | 'minutes'       // 회의록
  | 'report'        // 보고서
  | 'inspection'    // 점검표
  | 'equipment'     // 장비점검표
  | 'ambulance'     // 구급차점검일지
  | 'action'        // 조치사항 추적표
  | 'revision'      // 개정이력표
  | 'package';      // 전체 패키지

export type SourceType = '공식자료' | '병원자료' | '참고자료';
export type ConfidenceType = '확인됨' | '확인 필요';
export type ActionStatus = '예정' | '진행중' | '완료' | '보완필요' | '지연';
export type QualityGrade = '실무 사용 가능 초안' | '보완 후 사용 가능' | '재생성 또는 공식자료 추가 필요';

// =============================================
// 기준집 목차 구조
// =============================================
export interface StandardItem {
  itemNumber: string;
  itemTitle: string;
  summary: string;
  requiredDocuments: string[];
  requiredForms: string[];
  requiredChecklists: string[];
  requiredEvidence: string[];
  officialCheckNeeded: boolean;
}

export interface StandardChapter {
  chapterNumber: string;
  chapterTitle: string;
  items: StandardItem[];
}

export interface StandardNavigation {
  hospitalType: string;
  certificationCycle: string;
  standardVersion: string;
  checkedDate: string;
  isOfficialSourceUploaded: boolean;
  isExampleCatalog: boolean;
  chapters: StandardChapter[];
}

// =============================================
// 선택 범위 구조
// =============================================
export interface SelectedScope {
  generationMode: GenerationMode;
  selectedHospitalType: HospitalTypeKey;
  selectedChapters: string[];
  selectedItems: string[];
  scopeDescription: string;
}

// =============================================
// 요약 카드 구조
// =============================================
export interface SummaryCard {
  documentName: string;
  hospitalType: string;
  standardItem: string;
  usedBy: string;
  whenToUse: string;
  relatedStandard: string;
  requiredEvidence: string;
  retentionOwner: string;
  approvalRequired: string;
}

// =============================================
// 문서 품질 점수 구조
// =============================================
export interface QualityScore {
  score: number;
  grade: QualityGrade;
  reason: string[];
  improvementSuggestions: string[];
}

// =============================================
// 공식 근거 구조
// =============================================
export interface OfficialBasis {
  sourceType: SourceType;
  sourceName: string;
  documentName: string;
  version: string;
  standardNumber: string;
  standardTitle: string;
  requirementSummary: string;
  evidenceNeeded: string;
  confidence: ConfidenceType;
}

// =============================================
// 문서 초안 구조
// =============================================
export interface DraftDocument {
  title: string;
  documentNumber?: string;      // 문서번호 (예: 감염 1.3)
  reviewCycle?: string;         // 검토주기 (예: 1년)
  relatedDepartment?: string;   // 관련부서
  purpose: string;
  scope: string;
  definitions: string[];
  responsibilities: string[];
  procedure: string[];
  recordsAndRetention: string[];
  educationAndTraining: string[];
  monitoring: string[];
  revisionManagement: string[];
  references?: string[];        // 참고문헌
  appendices?: string[];        // 부록
  additionalProvisions?: string; // 부칙
}

// =============================================
// 서식 구조
// =============================================
export interface BlankForm {
  formTitle: string;
  usageGuide: string;
  requiredFields: string[];
  optionalFields: string[];
  templateMarkdown: string;
}

export interface FilledExample {
  exampleTitle: string;
  privacyNotice: string;
  exampleMarkdown: string;
}

// =============================================
// 체크리스트 항목
// =============================================
export interface ChecklistItem {
  item: string;
  frequency: string;
  responsibleDepartment: string;
  evidence: string;
  criteria: string;
  resultOptions: string[];
  improvementAction: string;
}

// =============================================
// 조치사항 추적표 항목
// =============================================
export interface ActionTrackingItem {
  number: string;
  actionItem: string;
  relatedAgenda: string;
  department: string;
  owner: string;
  dueDate: string;
  status: ActionStatus;
  completedDate: string;
  confirmedBy: string;
  evidence: string;
  note: string;
}

// =============================================
// 응급장비 구조
// =============================================
export interface EmergencyEquipment {
  aedChecklist: string[];
  aedMaintenanceLog: string[];
  batteryAndPadExpiryLog: string[];
  emergencyCartChecklist: string[];
  oxygenAndSuctionChecklist: string[];
  staffTraining: string[];
}

export interface EmergencyKit {
  kitName: string;
  hospitalTypeSpecificNotes: string[];
  recommendedItems: string[];
  expiryManagement: string[];
  dailyChecklist: string[];
  monthlyChecklist: string[];
  useAndRefillLog: string[];
  officialCheckNeeded: string[];
}

export interface AmbulanceChecklist {
  vehicleInfo: string[];
  dailyInspection: string[];
  monthlyInspection: string[];
  emergencyEquipment: string[];
  emergencySupplies: string[];
  cleaningAndDisinfection: string[];
  maintenanceLog: string[];
  transportRecord: string[];
  officialCheckNeeded: string[];
}

// =============================================
// 교육자료 구조
// =============================================
export interface EducationMaterial {
  title: string;
  target: string;
  duration: string;
  objectives: string[];
  keyPoints: string[];
  caseExample: string;
  commonMistakes: string[];
  quiz: string[];
  attendanceEvidence: string;
}

// =============================================
// 부서별 사용 가이드 구조
// =============================================
export interface DepartmentGuide {
  department: string;
  howTheyUseIt: string;
  requiredForms: string[];
  evidenceToKeep: string[];
  cautions: string[];
}

// =============================================
// 병원 맞춤 항목 구조
// =============================================
export interface HospitalCustomization {
  itemsToFillByHospital: string[];
  recommendedApprovalLine: string[];
  documentNumberExample: string;
  departmentWorkflow: string[];
}

// =============================================
// 공식 확인 필요 항목
// =============================================
export interface OfficialCheckNeeded {
  item: string;
  reason: string;
  whereToCheck: string;
}

// =============================================
// 출처 구조
// =============================================
export interface SourceReference {
  sourceType: SourceType;
  sourceName: string;
  fileNameOrUrl: string;
  version: string;
  checkedDate: string;
  usage: string;
}

// =============================================
// 개정이력 구조
// =============================================
export interface RevisionHistory {
  version: string;
  date: string;
  change: string;
  writer: string;
  reviewer: string;
  approver: string;
}

// =============================================
// 전체 응답 구조 (Gemini API 응답)
// =============================================
export interface GenerationResult {
  standardNavigation?: StandardNavigation;
  selectedScope?: SelectedScope;
  summaryCard: SummaryCard;
  qualityScore: QualityScore;
  officialBasis: OfficialBasis[];
  draftDocument: DraftDocument;
  blankForm: BlankForm;
  filledExample: FilledExample;
  checklist: ChecklistItem[];
  actionTrackingTable: ActionTrackingItem[];
  emergencyEquipment?: EmergencyEquipment;
  emergencyKit?: EmergencyKit;
  ambulanceChecklist?: AmbulanceChecklist;
  educationMaterial?: EducationMaterial;
  departmentGuide: DepartmentGuide[];
  hospitalCustomization: HospitalCustomization;
  officialCheckNeeded: OfficialCheckNeeded[];
  sourceReferences: SourceReference[];
  revisionHistory: RevisionHistory[];
  internalReviewPoints: string[];
  disclaimer: string;
}

// =============================================
// 문서 생성 폼 입력 구조
// =============================================
export interface GenerationFormInput {
  hospitalName: string;
  hospitalType: HospitalTypeKey;
  hospitalId?: string;
  customHospitalType?: string;
  beds: string;
  department: string;
  certificationCycle: string;
  generationMode: GenerationMode;
  selectedChapters: string[];
  selectedItems: string[];
  userRequest: string;
  documentType: DocumentType;
  detailLevel: 'basic' | 'standard' | 'expert';
  documentStyle: string;
  includeEmergencyEquipment: boolean;
  includeEmergencyKit: boolean;
  includeAmbulanceChecklist: boolean;
  officialSourceText: string;
  hospitalSourceText: string;
  referenceSourceText: string;
}
