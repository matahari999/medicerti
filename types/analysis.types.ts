// 분석 관련 복합 타입

import type {
  AnalysisRun,
  CriterionResult,
  AccreditationCriterion,
  Hospital,
  Document,
} from './database.types'

// ============================
// 대시보드용 집계 타입
// ============================

export interface DomainBreakdown {
  domainCode: string
  domainName: string
  score: number
  compliantCount: number
  partialCount: number
  nonCompliantCount: number
  notReviewedCount: number
  criticalGaps: number
  totalCriteria: number
}

export interface DashboardStats {
  hospital: Hospital
  latestRun: AnalysisRun | null
  domainBreakdowns: DomainBreakdown[]
  criticalGaps: (CriterionResult & { criterion: AccreditationCriterion })[]
  documentStats: {
    total: number
    extracted: number
    pending: number
    failed: number
  }
  scoreHistory: { runId: string; score: number; date: string }[]
  daysUntilDeadline: number | null
}

// ============================
// 보고서 생성용 타입
// ============================

export interface ReportData {
  hospital: Hospital
  analysisRun: AnalysisRun
  domainBreakdowns: DomainBreakdown[]
  criterionResults: (CriterionResult & { criterion: AccreditationCriterion })[]
  topGaps: (CriterionResult & { criterion: AccreditationCriterion })[]
  remediationPlan: RemediationItem[]
  generatedAt: string
}

export interface RemediationItem {
  priority: number
  criterionCode: string
  criterionTitle: string
  severity: 'critical' | 'major' | 'minor'
  gapDescription: string
  recommendation: string
  domain: string
}

// ============================
// 분석 결과 상세 (페이지용)
// ============================

export interface AnalysisDetail {
  run: AnalysisRun
  results: (CriterionResult & { criterion: AccreditationCriterion })[]
  domainBreakdowns: DomainBreakdown[]
}

// ============================
// 문서 목록용 타입
// ============================

export interface DocumentWithExtraction extends Document {
  extraction: {
    wordCount: number | null
    avgConfidence: number | null
    totalPages: number
  } | null
}
