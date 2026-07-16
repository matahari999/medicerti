import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fillRegulationTemplate } from '@/lib/gemini/regulation-template-fill'
import { isPlatformAdmin } from '@/lib/services/admin.service'
import type { Hospital, RegulationTemplate } from '@/types/database.types'

/**
 * POST /api/managed-docs/generate-from-template
 * 병원 프로필 + 마스터 규정 템플릿으로 1차 초안을 생성해 managed_documents에 저장
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  // 병원 맞춤 규정집 자동 커스터마이징은 아직 파일럿 단계라 플랫폼 관리자만 사용 가능
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const body = await request.json() as {
    hospitalId: string
    templateId: string
    regenerate?: boolean
  }

  const { hospitalId, templateId, regenerate } = body
  if (!hospitalId || !templateId) {
    return NextResponse.json({ error: 'hospitalId, templateId required' }, { status: 400 })
  }

  const { data: hospital, error: hospitalErr } = await supabase
    .from('hospitals')
    .select('id, name, type, bed_count, departments, staff_composition, special_units, operating_hours')
    .eq('id', hospitalId)
    .maybeSingle()

  if (hospitalErr || !hospital) {
    return NextResponse.json({ error: '병원을 찾을 수 없습니다' }, { status: 404 })
  }

  const { data: template, error: templateErr } = await supabase
    .from('regulation_templates')
    .select('*')
    .eq('id', templateId)
    .maybeSingle()

  if (templateErr || !template) {
    return NextResponse.json({ error: '템플릿을 찾을 수 없습니다' }, { status: 404 })
  }

  const h = hospital as unknown as Hospital
  const t = template as unknown as RegulationTemplate

  if (t.hospital_type !== h.type) {
    return NextResponse.json(
      { error: '병원 유형과 템플릿 유형이 일치하지 않습니다' },
      { status: 422 }
    )
  }

  const { data: existing } = await supabase
    .from('managed_documents')
    .select('id, title, version_number')
    .eq('hospital_id', hospitalId)
    .eq('template_id', templateId)
    .maybeSingle()

  if (existing && !regenerate) {
    return NextResponse.json(
      { error: '이미 생성된 초안이 있습니다', existingId: existing.id },
      { status: 409 }
    )
  }

  let filled: Awaited<ReturnType<typeof fillRegulationTemplate>>
  try {
    filled = await fillRegulationTemplate(t, h)
  } catch {
    return NextResponse.json(
      { error: '초안 생성에 실패했습니다. 잠시 후 다시 시도해 주세요' },
      { status: 502 }
    )
  }

  if (existing && regenerate) {
    const nextVersion = existing.version_number + 1

    const { data: updated, error } = await supabase
      .from('managed_documents')
      .update({
        content:        filled.content,
        status:         'draft',
        updated_by:     user.id,
        version_number: nextVersion,
      } as never)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase.from('managed_document_versions').insert({
      document_id:    existing.id,
      hospital_id:    hospitalId,
      version_number: updated.version_number,
      title:          updated.title,
      content:        filled.content,
      status:         'draft',
      change_summary: '템플릿에서 재생성',
      created_by:     user.id,
    })

    await supabase.from('audit_logs').insert({
      user_id:       user.id,
      hospital_id:   hospitalId,
      action:        'managed_doc.regenerate_from_template',
      resource_type: 'managed_document',
      resource_id:   existing.id,
      metadata:      { template_id: templateId, needs_review_count: filled.needsReviewCount },
    })

    return NextResponse.json({ data: updated })
  }

  const { data: newDoc, error } = await supabase
    .from('managed_documents')
    .insert({
      hospital_id:    hospitalId,
      doc_type:       'regulation',
      title:          t.title,
      content:        filled.content,
      status:         'draft',
      version_number: 1,
      template_id:    templateId,
      created_by:     user.id,
    } as never)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('managed_document_versions').insert({
    document_id:    newDoc.id,
    hospital_id:    hospitalId,
    version_number: 1,
    title:          t.title,
    content:        filled.content,
    status:         'draft',
    change_summary: '템플릿에서 초안 생성',
    created_by:     user.id,
  })

  await supabase.from('audit_logs').insert({
    user_id:       user.id,
    hospital_id:   hospitalId,
    action:        'managed_doc.generate_from_template',
    resource_type: 'managed_document',
    resource_id:   newDoc.id,
    metadata:      { template_id: templateId, needs_review_count: filled.needsReviewCount },
  })

  return NextResponse.json({ data: newDoc }, { status: 201 })
}
