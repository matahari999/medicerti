import { createClient } from '@/lib/supabase/server'

export interface DomainBreakdownReport {
  code: string
  name: string
  score: number
  compliantCount: number
  partialCount: number
  nonCompliantCount: number
  totalCount: number
}

export interface CriterionReportRow {
  code: string
  title: string
  domain: string
  category: string | null
  complianceStatus: string
  severity: string | null
  evidence: string | null
  gap: string | null
  recommendation: string | null
  confidence: number | null
}

export interface ReportData {
  hospitalName: string
  hospitalRegion: string | null
  hospitalBeds: number | null
  accreditationCycle: number
  accreditationTarget: string | null
  analysisDate: string
  overallScore: number | null
  domainBreakdowns: DomainBreakdownReport[]
  criterionResults: CriterionReportRow[]
  criticalGapsCount: number
  majorGapsCount: number
  compliantCount: number
  partialCount: number
  nonCompliantCount: number
  totalCriteria: number
}

export async function buildReportData(hospitalId: string, analysisRunId: string): Promise<ReportData | null> {
  const supabase = await createClient()

  const [hospitalData, runData] = await Promise.all([
    supabase.from('hospitals').select('*').eq('id', hospitalId).single().then((r) => r.data as Record<string, unknown> | null),
    supabase.from('analysis_runs').select('*').eq('id', analysisRunId).single().then((r) => r.data as Record<string, unknown> | null),
  ])

  if (!hospitalData || !runData) return null

  const results = await supabase
    .from('criterion_results')
    .select('*, accreditation_criteria(*)')
    .eq('analysis_run_id', analysisRunId)
    .order('created_at', { ascending: true })
    .then((r) => r.data as Record<string, unknown>[] | null)

  const criterionRows: CriterionReportRow[] = (results ?? []).map((r) => {
    const crit = r.accreditation_criteria as Record<string, unknown> | null
    return {
      code: (crit?.code as string) ?? '',
      title: (crit?.title as string) ?? '',
      domain: (crit?.domain as string) ?? '',
      category: (crit?.category as string | null) ?? null,
      complianceStatus: r.compliance_status as string,
      severity: r.severity as string | null,
      evidence: r.evidence_text as string | null,
      gap: r.gap_description as string | null,
      recommendation: r.recommendation as string | null,
      confidence: r.ai_confidence as number | null,
    }
  })

  const domainScores = runData.domain_scores as Record<string, number> | null
  const domainMap: Record<string, string> = { PS: '환자안전', PC: '환자중심', GL: '지도체계', QS: '안전/질향상' }
  const domainBreakdowns: DomainBreakdownReport[] = domainScores
    ? Object.entries(domainScores).map(([code, score]) => {
        const domainRows = criterionRows.filter((r) => r.domain === (domainMap[code] ?? code))
        return {
          code,
          name: domainMap[code] ?? code,
          score: Math.round(score),
          compliantCount: domainRows.filter((r) => r.complianceStatus === 'compliant').length,
          partialCount: domainRows.filter((r) => r.complianceStatus === 'partial').length,
          nonCompliantCount: domainRows.filter((r) => r.complianceStatus === 'non_compliant').length,
          totalCount: domainRows.length,
        }
      })
    : []

  return {
    hospitalName: hospitalData.name as string,
    hospitalRegion: hospitalData.region as string | null,
    hospitalBeds: hospitalData.bed_count as number | null,
    accreditationCycle: (hospitalData.accreditation_cycle as number) ?? 1,
    accreditationTarget: hospitalData.accreditation_target as string | null,
    analysisDate: runData.completed_at as string ?? runData.created_at as string,
    overallScore: runData.overall_score as number | null,
    domainBreakdowns,
    criterionResults: criterionRows,
    criticalGapsCount: (runData.critical_gap_count as number) ?? 0,
    majorGapsCount: (runData.major_gap_count as number) ?? 0,
    compliantCount: (runData.compliant_count as number) ?? 0,
    partialCount: (runData.partial_count as number) ?? 0,
    nonCompliantCount: (runData.non_compliant_count as number) ?? 0,
    totalCriteria: (runData.total_criteria as number) ?? 0,
  }
}
