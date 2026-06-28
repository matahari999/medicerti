import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { ManagedDocType } from '@/types/database.types'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const hospitalId = searchParams.get('hospitalId')
  const docType    = searchParams.get('doc_type') as ManagedDocType | null
  const status     = searchParams.get('status')

  if (!hospitalId) return NextResponse.json({ error: 'hospitalId required' }, { status: 400 })

  // 멤버 권한 확인
  const { data: member } = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', hospitalId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  if (!member) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const service = await createServiceClient()
  let q = service
    .from('managed_documents')
    .select(`
      *,
      accreditation_criteria(code, title, domain)
    `)
    .eq('hospital_id', hospitalId)
    .order('updated_at', { ascending: false })

  if (docType) q = q.eq('doc_type', docType)
  if (status)  q = q.eq('status', status)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json() as {
    hospitalId:   string
    doc_type:     ManagedDocType
    title:        string
    content?:     string
    criterion_id?: string
    analysis_run_id?: string
    policy_draft_id?: string
  }

  const { hospitalId, doc_type, title } = body
  if (!hospitalId || !doc_type || !title) {
    return NextResponse.json({ error: 'hospitalId, doc_type, title required' }, { status: 400 })
  }

  // admin/manager만 생성 가능
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

  const service = await createServiceClient()
  const { data, error } = await service
    .from('managed_documents')
    .insert({
      hospital_id:     hospitalId,
      doc_type,
      title,
      content:         body.content ?? '',
      status:          'draft',
      version_number:  1,
      criterion_id:    body.criterion_id ?? null,
      analysis_run_id: body.analysis_run_id ?? null,
      policy_draft_id: body.policy_draft_id ?? null,
      created_by:      user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 감사 로그 기록
  await service.from('audit_logs').insert({
    user_id:       user.id,
    hospital_id:   hospitalId,
    action:        'managed_doc.create',
    resource_type: 'managed_document',
    resource_id:   data.id,
    metadata:      { doc_type, title },
  })

  // 초기 버전 스냅샷 저장
  await service.from('managed_document_versions').insert({
    document_id:    data.id,
    hospital_id:    hospitalId,
    version_number: 1,
    title,
    content:        body.content ?? '',
    status:         'draft',
    change_summary: '최초 생성',
    created_by:     user.id,
  })

  return NextResponse.json({ data }, { status: 201 })
}
