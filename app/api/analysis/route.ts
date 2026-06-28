import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const hospitalId = searchParams.get('hospitalId')
  if (!hospitalId) return NextResponse.json({ error: 'hospitalId required' }, { status: 400 })

  const { data, error } = await supabase
    .from('analysis_runs')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json() as { hospitalId: string }
  if (!body.hospitalId) return NextResponse.json({ error: 'hospitalId required' }, { status: 400 })

  const member = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', body.hospitalId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
    .then((r) => r.data as { role: string } | null)

  if (!member || member.role === 'viewer') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const extractedDocs = await supabase
    .from('documents')
    .select('id')
    .eq('hospital_id', body.hospitalId)
    .eq('status', 'extracted')
    .is('deleted_at', null)
    .then((r) => r.data as { id: string }[] | null)

  if (!extractedDocs || extractedDocs.length === 0) {
    return NextResponse.json({ error: '추출된 문서가 없습니다. 먼저 문서를 업로드하고 OCR을 완료해 주세요.' }, { status: 400 })
  }

  const allCriteria = await supabase
    .from('accreditation_criteria')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .then((r) => r.data as unknown[] | null)

  if (!allCriteria || allCriteria.length === 0) {
    return NextResponse.json({ error: '등록된 인증 기준이 없습니다. 시드 데이터를 먼저 적용해 주세요.' }, { status: 500 })
  }

  const runData = await supabase
    .from('analysis_runs')
    .insert({
      hospital_id:   body.hospitalId,
      triggered_by:  user.id,
      status:        'queued',
      total_criteria: allCriteria.length,
      documents_analyzed: extractedDocs.length,
    } as never)
    .select()
    .single()
    .then((r) => {
      if (r.error) throw new Error(r.error.message)
      return r.data as { id: string }
    })

  // supabase 클라이언트를 응답 전에 생성하여 request context 밖에서도 JWT가 유효하도록 전달
  processAnalysis(supabase, body.hospitalId, runData.id)

  return NextResponse.json({ data: { runId: runData.id, status: 'queued' } }, { status: 202 })
}

async function processAnalysis(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  hospitalId: string,
  runId: string,
) {

  try {
    await supabase.from('analysis_runs').update({ status: 'running', started_at: new Date().toISOString() } as never).eq('id', runId)

    const extractions = await supabase
      .from('document_extractions')
      .select('full_text')
      .eq('hospital_id', hospitalId)
      .then((r) => r.data as { full_text: string }[] | null)

    const combinedText = extractions?.map((e) => e.full_text).join('\n\n---\n\n') ?? ''

    const criteria = await supabase
      .from('accreditation_criteria')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then((r) => r.data as unknown[] | null)

    if (!criteria || criteria.length === 0) throw new Error('No criteria found')

    const { runGapAnalysis, calculateScores } = await import('@/lib/gemini/analysis')
    const results = await runGapAnalysis({
      hospitalId,
      runId,
      documentsText: combinedText,
      criteria: criteria as never,
    })

    if (results.length > 0) {
      await supabase.from('criterion_results').insert(
        results.map((r: unknown) => {
          const row = r as Record<string, unknown>
          return {
            analysis_run_id:       runId,
            hospital_id:           hospitalId,
            criterion_id:          row.criterion_id,
            compliance_status:     row.compliance_status,
            evidence_text:         row.evidence_text ?? null,
            evidence_document_hint: row.evidence_document_hint ?? null,
            gap_description:       row.gap_description ?? null,
            recommendation:        row.recommendation ?? null,
            severity:              row.severity ?? null,
            ai_confidence:         typeof row.ai_confidence === 'number' ? parseFloat((row.ai_confidence as number).toFixed(3)) : null,
          }
        }) as never
      )
    }

    const scores = calculateScores(results as never, criteria as never) as { overallScore: number; domainScores: Record<string, number> }
    await supabase.from('analysis_runs').update({
      status: 'complete',
      overall_score: scores.overallScore,
      domain_scores: scores.domainScores as Record<string, unknown>,
      completed_at: new Date().toISOString(),
    } as never).eq('id', runId)

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    await supabase.from('analysis_runs').update({
      status: 'failed',
      error_message: message,
      completed_at: new Date().toISOString(),
    } as never).eq('id', runId)
  }
}
