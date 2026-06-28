import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { MANAGED_DOC_STATUS_TRANSITIONS } from '@/lib/constants'
import type { ManagedDocStatus } from '@/types/database.types'

type Params = { params: Promise<{ docId: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { docId } = await params
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const service = await createServiceClient()
  const { data: doc, error } = await service
    .from('managed_documents')
    .select(`
      *,
      accreditation_criteria(code, title, domain),
      creator_profile:profiles!managed_documents_created_by_fkey(full_name)
    `)
    .eq('id', docId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!doc)  return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  // 멤버 권한 확인
  const { data: member } = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', doc.hospital_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  if (!member) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  // 버전 이력
  const { data: versions } = await service
    .from('managed_document_versions')
    .select('*')
    .eq('document_id', docId)
    .order('version_number', { ascending: false })

  return NextResponse.json({ data: doc, versions: versions ?? [] })
}

export async function PATCH(request: Request, { params }: Params) {
  const { docId } = await params
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await request.json() as {
    title?:         string
    content?:       string
    status?:        ManagedDocStatus
    change_summary?: string
  }

  const service = await createServiceClient()

  // 현재 문서 조회
  const { data: existing } = await service
    .from('managed_documents')
    .select('id, hospital_id, status, version_number, title, content')
    .eq('id', docId)
    .maybeSingle()

  if (!existing) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  // 권한 확인 (admin/manager)
  const { data: member } = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', existing.hospital_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  if (!member || !['admin', 'manager'].includes(member.role)) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  // 상태 전환 유효성 검사
  if (body.status && body.status !== existing.status) {
    const allowed = MANAGED_DOC_STATUS_TRANSITIONS[existing.status] ?? []
    if (!allowed.includes(body.status)) {
      return NextResponse.json(
        { error: `상태 전환 불가: ${existing.status} → ${body.status}` },
        { status: 422 }
      )
    }
  }

  const isContentChange = body.title !== undefined || body.content !== undefined
  const newVersion = isContentChange ? existing.version_number + 1 : existing.version_number

  const updatePayload: Record<string, unknown> = { updated_by: user.id }
  if (body.title   !== undefined) updatePayload.title   = body.title
  if (body.content !== undefined) updatePayload.content = body.content
  if (body.status  !== undefined) {
    updatePayload.status = body.status
    if (body.status === 'approved') {
      updatePayload.approved_by = user.id
      updatePayload.approved_at = new Date().toISOString()
    }
    if (body.status === 'archived') {
      updatePayload.archived_at = new Date().toISOString()
    }
  }
  if (isContentChange) updatePayload.version_number = newVersion

  const { data: updated, error } = await service
    .from('managed_documents')
    .update(updatePayload)
    .eq('id', docId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 버전 스냅샷 저장 (내용 변경 또는 상태 변경 시)
  if (isContentChange || body.status) {
    await service.from('managed_document_versions').insert({
      document_id:    docId,
      hospital_id:    existing.hospital_id,
      version_number: newVersion,
      title:          body.title ?? existing.title,
      content:        body.content ?? existing.content,
      status:         body.status ?? existing.status,
      change_summary: body.change_summary ?? (body.status ? `상태 변경: ${body.status}` : '내용 수정'),
      created_by:     user.id,
    })
  }

  // 감사 로그
  await service.from('audit_logs').insert({
    user_id:       user.id,
    hospital_id:   existing.hospital_id,
    action:        body.status ? `managed_doc.status.${body.status}` : 'managed_doc.update',
    resource_type: 'managed_document',
    resource_id:   docId,
    metadata:      { prev_status: existing.status, new_status: body.status },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { docId } = await params
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const service = await createServiceClient()
  const { data: existing } = await service
    .from('managed_documents')
    .select('id, hospital_id, status')
    .eq('id', docId)
    .maybeSingle()

  if (!existing) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  if (existing.status === 'approved') {
    return NextResponse.json({ error: '승인완료 문서는 삭제할 수 없습니다' }, { status: 422 })
  }

  const { data: member } = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', existing.hospital_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  if (!member || member.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const { error } = await service.from('managed_documents').delete().eq('id', docId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await service.from('audit_logs').insert({
    user_id:       user.id,
    hospital_id:   existing.hospital_id,
    action:        'managed_doc.delete',
    resource_type: 'managed_document',
    resource_id:   docId,
    metadata:      {},
  })

  return NextResponse.json({ data: null })
}
