import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const analysisRunId = searchParams.get('analysisRunId')
  if (!analysisRunId) return NextResponse.json({ error: 'analysisRunId required' }, { status: 400 })

  const { data, error } = await supabase
    .from('policy_drafts')
    .select('*, accreditation_criteria(code, domain, title)')
    .eq('analysis_run_id', analysisRunId)
    .order('generated_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json() as { hospitalId: string; analysisRunId: string }
  if (!body.hospitalId || !body.analysisRunId) {
    return NextResponse.json({ error: 'hospitalId, analysisRunId required' }, { status: 400 })
  }

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

  const hospital = await supabase
    .from('hospitals')
    .select('name')
    .eq('id', body.hospitalId)
    .single()
    .then((r) => r.data as { name: string } | null)

  if (!hospital) return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })

  const gaps = await supabase
    .from('criterion_results')
    .select('*, accreditation_criteria(code, title, description, required_evidence)')
    .eq('analysis_run_id', body.analysisRunId)
    .in('compliance_status', ['partial', 'non_compliant'])
    .then((r) => r.data as unknown[] | null)

  if (!gaps || gaps.length === 0) {
    return NextResponse.json({ error: '부적합/부분적합 항목이 없습니다' }, { status: 400 })
  }

  generateDrafts(supabase, body.hospitalId, body.analysisRunId, hospital.name, gaps)

  return NextResponse.json({ data: { status: 'generating', count: gaps.length } }, { status: 202 })
}

async function generateDrafts(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  hospitalId: string,
  analysisRunId: string,
  hospitalName: string,
  gaps: unknown[],
) {
  const { generatePolicyDraft } = await import('@/lib/gemini/regulations')
  const { retrieveRelatedCriteria, retrieveSelfAssessmentContext } = await import('@/lib/rag')

  for (const gap of gaps) {
    const g = gap as Record<string, unknown>
    const crit = g.accreditation_criteria as Record<string, unknown> | null
    if (!crit) continue

    try {
      const [criteriaRag, selfAssessmentRag] = await Promise.all([
        retrieveRelatedCriteria(crit.code as string, ''),
        retrieveSelfAssessmentContext(hospitalId, crit.title as string),
      ])
      const ragContext = [criteriaRag, selfAssessmentRag].filter(Boolean).join('\n\n')

      const draft = await generatePolicyDraft({
        criterionCode:    crit.code as string,
        criterionTitle:   crit.title as string,
        criterionDesc:    crit.description as string,
        requiredEvidence: crit.required_evidence as string | null,
        gapDescription:   g.gap_description as string | null,
        recommendation:   g.recommendation as string | null,
        complianceStatus: g.compliance_status as string,
        hospitalName,
        ragContext: ragContext || undefined,
      })

      await supabase
        .from('policy_drafts')
        .upsert({
          hospital_id:      hospitalId,
          analysis_run_id:  analysisRunId,
          criterion_id:     g.criterion_id as string,
          title:            draft.title,
          content:          draft.content,
          compliance_status: g.compliance_status as string,
        } as never, { onConflict: 'analysis_run_id,criterion_id' })
    } catch {
      // 개별 항목 실패는 건너뜀
    }
  }
}
