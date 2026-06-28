import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/managed-docs/from-draft
 * policy_drafts의 AI 초안을 managed_documents로 가져오기
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json() as {
    hospitalId:     string
    policyDraftId:  string
    analysisRunId:  string
  }

  const { hospitalId, policyDraftId, analysisRunId } = body
  if (!hospitalId || !policyDraftId) {
    return NextResponse.json({ error: 'hospitalId, policyDraftId required' }, { status: 400 })
  }

  const { data: member } = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', hospitalId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!member || !['admin', 'manager'].includes(member.role)) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  // 원본 AI 초안 조회
  const { data: draft, error: draftErr } = await supabase
    .from('policy_drafts')
    .select('*, accreditation_criteria(id, code, title)')
    .eq('id', policyDraftId)
    .maybeSingle()

  if (draftErr || !draft) {
    return NextResponse.json({ error: '초안을 찾을 수 없습니다' }, { status: 404 })
  }

  // 이미 가져온 문서가 있는지 확인
  const { data: existing } = await supabase
    .from('managed_documents')
    .select('id')
    .eq('hospital_id', hospitalId)
    .eq('policy_draft_id', policyDraftId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: '이미 관리 문서로 가져온 초안입니다', existingId: existing.id },
      { status: 409 }
    )
  }

  const criterionId = (draft.accreditation_criteria as { id: string } | null)?.id ?? null

  const { data: newDoc, error } = await supabase
    .from('managed_documents')
    .insert({
      hospital_id:     hospitalId,
      doc_type:        'regulation',
      title:           draft.title,
      content:         draft.content,
      status:          'draft',
      version_number:  1,
      criterion_id:    criterionId,
      analysis_run_id: analysisRunId ?? null,
      policy_draft_id: policyDraftId,
      created_by:      user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 초기 버전 스냅샷
  await supabase.from('managed_document_versions').insert({
    document_id:    newDoc.id,
    hospital_id:    hospitalId,
    version_number: 1,
    title:          draft.title,
    content:        draft.content,
    status:         'draft',
    change_summary: 'AI 초안에서 가져옴',
    created_by:     user.id,
  })

  await supabase.from('audit_logs').insert({
    user_id:       user.id,
    hospital_id:   hospitalId,
    action:        'managed_doc.create_from_draft',
    resource_type: 'managed_document',
    resource_id:   newDoc.id,
    metadata:      { policy_draft_id: policyDraftId },
  })

  return NextResponse.json({ data: newDoc }, { status: 201 })
}
