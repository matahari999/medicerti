import { createClient } from '@/lib/supabase/server'
import { generateApplicationDraft } from '@/lib/gemini/draft'
import { COMPLIANCE_STATUS_LABELS, SEVERITY_LABELS } from '@/lib/constants'

// ponytail: single function, no class, reuse managed_documents table

export async function generateApplicationDraftForHospital(
  hospitalId: string,
  analysisRunId: string,
  userId: string,
) {
  const supabase = await createClient()

  const { data: hospital } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', hospitalId)
    .single()
  if (!hospital) throw new Error('병원을 찾을 수 없습니다')

  const { data: run } = await supabase
    .from('analysis_runs')
    .select('*')
    .eq('id', analysisRunId)
    .single()
  if (!run) throw new Error('분석 결과를 찾을 수 없습니다')

  const { data: results } = await supabase
    .from('criterion_results')
    .select('*, accreditation_criteria!inner(code, domain, domain_code, title, description)')
    .eq('analysis_run_id', analysisRunId)
    .order('criterion_id', { ascending: true })

  const h = hospital as Record<string, unknown>
  const r = run as Record<string, unknown>

  const hospitalJson = JSON.stringify({
    name: h.name,
    type: h.type,
    bed_count: h.bed_count,
    region: h.region,
    address: h.address,
    phone: h.phone,
    license_number: h.license_number,
    accreditation_cycle: h.accreditation_cycle,
    accreditation_start: h.accreditation_start,
    accreditation_target: h.accreditation_target,
  })

  const domainScoresJson = JSON.stringify(r.domain_scores ?? {})

  const rows = (results ?? []) as unknown as Array<
    Record<string, unknown> & { accreditation_criteria: Record<string, unknown> }
  >

  const criteriaResults = rows.map((cr) => ({
    code: (cr.accreditation_criteria as Record<string, unknown>).code ?? '?',
    domain: (cr.accreditation_criteria as Record<string, unknown>).domain ?? '?',
    title: (cr.accreditation_criteria as Record<string, unknown>).title ?? '?',
    compliance: COMPLIANCE_STATUS_LABELS[cr.compliance_status as keyof typeof COMPLIANCE_STATUS_LABELS] ?? cr.compliance_status,
    severity: cr.severity ? SEVERITY_LABELS[cr.severity as keyof typeof SEVERITY_LABELS] : '-',
    gap: cr.gap_description ?? '',
    recommendation: cr.recommendation ?? '',
    evidence: cr.evidence_text ? String(cr.evidence_text).slice(0, 200) : '',
  }))

  const summaryCounts = JSON.stringify({
    total: rows.length,
    compliant: rows.filter((r) => r.compliance_status === 'compliant').length,
    partial: rows.filter((r) => r.compliance_status === 'partial').length,
    non_compliant: rows.filter((r) => r.compliance_status === 'non_compliant').length,
    not_reviewed: rows.filter((r) => r.compliance_status === 'not_reviewed').length,
    critical_gaps: rows.filter((r) => r.severity === 'critical').length,
    overall_score: r.overall_score,
  })

  const draft = await generateApplicationDraft({
    hospitalJson,
    domainScoresJson,
    criteriaResults: JSON.stringify(criteriaResults.slice(0, 50)),
    // ponytail: first 50 criteria only, add pagination if >50 criteria exist
    summaryCounts,
  })

  const { data: doc, error } = await supabase
    .from('managed_documents')
    .insert({
      hospital_id: hospitalId,
      doc_type: 'criteria_book',
      title: draft.title,
      content: draft.sections.map((s) => (
        `--- ${s.heading} --- [${s.origin === 'hospital' ? '병원입력' : 'AI생성'}]\n${s.body}`
      )).join('\n\n'),
      status: 'draft',
      version_number: 1,
      analysis_run_id: analysisRunId,
      created_by: userId,
    } as never)
    .select()
    .single()

  if (error) throw new Error(`초안 저장 실패: ${error.message}`)

  return { docId: (doc as Record<string, unknown>).id as string, title: draft.title, sections: draft.sections }
}
