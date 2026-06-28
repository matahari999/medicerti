import { createServiceClient } from '@/lib/supabase/server'
import { runGapAnalysis, calculateScores } from '@/lib/gemini/analysis'
import type { AccreditationCriterion, CriterionResultInsert, AnalysisRunInsert } from '@/types/database.types'

// ponytail: single orchestrator, no base class, no abstraction

export async function runFullAnalysis(hospitalId: string, userId: string) {
  const supabase = await createServiceClient()

  const { data: hospital } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', hospitalId)
    .single()
  if (!hospital) throw new Error('병원을 찾을 수 없습니다')

  const { data: extractions } = await supabase
    .from('document_extractions')
    .select('full_text, documents!inner(original_name)')
    .eq('hospital_id', hospitalId)

  const { data: criteria } = await supabase
    .from('accreditation_criteria')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (!criteria || criteria.length === 0) {
    throw new Error('활성화된 인증 기준이 없습니다')
  }

  const docsText = (extractions ?? [])
    .map((e) => {
      const doc = e as unknown as { full_text: string; documents: { original_name: string } }
      return `[문서: ${doc.documents?.original_name ?? '알 수 없음'}]\n${doc.full_text}`
    })
    .join('\n\n---\n\n')

  const hospitalContext = [
    `병원명: ${(hospital as Record<string, unknown>).name}`,
    `유형: ${(hospital as Record<string, unknown>).type}`,
    `병상수: ${(hospital as Record<string, unknown>).bed_count ?? '정보 없음'}`,
    `지역: ${(hospital as Record<string, unknown>).region ?? '정보 없음'}`,
    `인증주기: ${(hospital as Record<string, unknown>).accreditation_cycle}차`,
  ].join('\n')

  const inputText = `[병원 현황]\n${hospitalContext}\n\n[제출 문서]\n${docsText || '(업로드된 문서 없음 — 병원 현황 정보만으로 판단하세요)'}`

  const runData: AnalysisRunInsert = {
    hospital_id: hospitalId,
    triggered_by: userId,
    status: 'running',
    overall_score: null,
    domain_scores: null,
    total_criteria: criteria.length,
    compliant_count: 0,
    partial_count: 0,
    non_compliant_count: 0,
    not_reviewed_count: 0,
    critical_gap_count: 0,
    major_gap_count: 0,
    minor_gap_count: 0,
    documents_analyzed: extractions?.length ?? 0,
    tokens_used: null,
    error_message: null,
    started_at: new Date().toISOString(),
    completed_at: null,
  }

  const { data: run, error: runError } = await supabase
    .from('analysis_runs')
    .insert(runData as never)
    .select()
    .single()

  if (runError || !run) throw new Error(`분석 실행 생성 실패: ${runError?.message}`)
  const runId = (run as Record<string, unknown>).id as string

  try {
    const results = await runGapAnalysis({
      hospitalId,
      runId,
      documentsText: inputText,
      criteria: criteria as unknown as AccreditationCriterion[],
    })

    const { overallScore, domainScores } = calculateScores(
      results,
      criteria as unknown as AccreditationCriterion[],
    )

    const counts = { compliant: 0, partial: 0, non_compliant: 0, not_reviewed: 0 }
    const critical = { critical: 0, major: 0, minor: 0 }
    for (const r of results) {
      counts[r.compliance_status]++
      if (r.severity) critical[r.severity]++
    }

    const inserts: CriterionResultInsert[] = results.map((r) => ({
      analysis_run_id: runId,
      hospital_id: hospitalId,
      criterion_id: r.criterion_id,
      compliance_status: r.compliance_status,
      evidence_text: r.evidence_text,
      evidence_document_hint: r.evidence_document_hint,
      gap_description: r.gap_description,
      recommendation: r.recommendation,
      severity: r.severity,
      ai_confidence: r.ai_confidence,
    }))

    const { error: insertError } = await supabase
      .from('criterion_results')
      .insert(inserts as never)

    if (insertError) throw new Error(`결과 저장 실패: ${insertError.message}`)

    const { error: updateError } = await supabase
      .from('analysis_runs')
      .update({
        status: 'complete',
        overall_score: overallScore,
        domain_scores: domainScores as never,
        compliant_count: counts.compliant,
        partial_count: counts.partial,
        non_compliant_count: counts.non_compliant,
        not_reviewed_count: counts.not_reviewed,
        critical_gap_count: critical.critical,
        major_gap_count: critical.major,
        minor_gap_count: critical.minor,
        completed_at: new Date().toISOString(),
      } as never)
      .eq('id', runId)

    if (updateError) throw new Error(`점수 업데이트 실패: ${updateError.message}`)

    return { runId, overallScore, domainScores, totalCriteria: criteria.length }
  } catch (err) {
    await supabase
      .from('analysis_runs')
      .update({
        status: 'failed',
        error_message: err instanceof Error ? err.message : String(err),
        completed_at: new Date().toISOString(),
      } as never)
      .eq('id', runId)

    throw err
  }
}
