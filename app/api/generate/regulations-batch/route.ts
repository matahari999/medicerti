import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { generateFullRegulationsFromCatalog } from '@/lib/gemini/regulation-writer'
import type { RegulationReferenceInput } from '@/lib/gemini/regulation-writer'
import { findNursingReference, findPsychiatricReference } from '@/lib/regulationReference'
import type { PsychiatricTemplateRow } from '@/lib/regulationReference'
import { STANDARD_CATALOG } from '@/lib/standardCatalog'
import { isPlatformAdmin } from '@/lib/services/admin.service'
import type { HospitalTypeKey } from '@/lib/types'

// hospitals.type (DB) → STANDARD_CATALOG 키
const CATALOG_BY_HOSPITAL_TYPE: Record<string, HospitalTypeKey> = {
  long_term_care: 'nursing',
  psychiatric: 'psychiatric',
}

export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { hospitalId } = await req.json() as { hospitalId?: string }
  if (!hospitalId) {
    return NextResponse.json({ error: 'hospitalId required' }, { status: 400 })
  }

  // 병원 소속 admin/manager 또는 플랫폼 관리자만 생성 가능
  const admin = await isPlatformAdmin()
  if (!admin) {
    const { data: member } = await supabase
      .from('hospital_members')
      .select('role')
      .eq('hospital_id', hospitalId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (!member || !['admin', 'manager'].includes((member as { role: string }).role)) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }
  }

  // 병원 유형은 클라이언트 입력이 아니라 DB에서 직접 읽어 카탈로그를 결정한다
  const { data: hospital } = await supabase
    .from('hospitals')
    .select('id, name, type')
    .eq('id', hospitalId)
    .maybeSingle()

  if (!hospital) {
    return NextResponse.json({ error: '병원을 찾을 수 없습니다' }, { status: 404 })
  }

  const hospitalType = (hospital as { type: string }).type
  const catalogKey = CATALOG_BY_HOSPITAL_TYPE[hospitalType]
  if (!catalogKey) {
    return NextResponse.json(
      { error: `지원하지 않는 병원 유형입니다: ${hospitalType}` },
      { status: 422 }
    )
  }

  const catalog = STANDARD_CATALOG[catalogKey]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseAdmin = supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null

  // 정신병원은 실제 인증병원 규정집 원문 기반 마스터 템플릿을 근거로 사용
  let psychiatricTemplates: PsychiatricTemplateRow[] = []
  if (catalogKey === 'psychiatric') {
    const { data } = await supabase
      .from('regulation_templates')
      .select('template_code, title, entry_code, template_content')
      .eq('hospital_type', 'psychiatric')
    psychiatricTemplates = (data ?? []) as unknown as PsychiatricTemplateRow[]
  }

  // Collect all items from all chapters, attaching master reference material
  const items: Array<{
    criterionCode: string
    criterionTitle: string
    criterionDesc: string
    requiredDocuments: string[]
    requiredForms: string[]
    requiredChecklists: string[]
    requiredEvidence: string[]
    reference?: RegulationReferenceInput
  }> = []

  for (const chapter of catalog.chapters) {
    for (const item of chapter.items) {
      const reference =
        catalogKey === 'nursing'
          ? findNursingReference(item.itemTitle)
          : findPsychiatricReference(item.itemNumber, item.itemTitle, psychiatricTemplates)

      items.push({
        criterionCode: item.itemNumber,
        criterionTitle: `${chapter.chapterTitle} - ${item.itemTitle}`,
        criterionDesc: item.summary,
        requiredDocuments: item.requiredDocuments ?? [],
        requiredForms: item.requiredForms ?? [],
        requiredChecklists: item.requiredChecklists ?? [],
        requiredEvidence: item.requiredEvidence ?? [],
        reference: reference ?? undefined,
      })
    }
  }

  const totalItems = items.length
  const created: Array<{ title: string; id: string }> = []
  const errors: string[] = []

  // Generate first batch (5 items)
  const batch = items.slice(0, 5)
  const regulations = await generateFullRegulationsFromCatalog(
    batch,
    catalogKey,
    (done, total) => {
      console.log(`[RegulationWriter] ${done}/${total} complete`)
    }
  )

  for (const reg of regulations) {
    if (!supabaseAdmin) {
      created.push({ title: reg.title, id: 'no-db' })
      continue
    }

    const { data, error } = await supabaseAdmin
      .from('managed_documents')
      .insert({
        hospital_id: hospitalId,
        doc_type: 'regulation',
        title: reg.title,
        content: formatRegulationContent(reg),
        status: 'draft',
        created_by: user.id,
      } as never)
      .select('id')
      .single()

    if (error) {
      errors.push(`${reg.title}: ${error.message}`)
    } else {
      created.push({ title: reg.title, id: (data as any).id })
    }
  }

  const groundedCount = batch.filter((i) => i.reference).length

  return NextResponse.json({
    total: totalItems,
    generated: regulations.length,
    batchSize: 5,
    created: created.length,
    createdDocs: created,
    errors,
    remainingItems: totalItems - batch.length,
    note: `전체 ${totalItems}개 기준 중 첫 5개를 생성했습니다 (${groundedCount}개는 실제 규정집 원문 근거 반영). 나머지는 순차적으로 생성 가능합니다.`,
  })
}

function formatRegulationContent(reg: {
  title: string
  regulationNumber: string
  effectiveDate: string
  sections: Array<{ heading: string; body: string }>
  relatedForms: string[]
  relatedRegulations: string[]
}): string {
  const lines: string[] = []
  lines.push(`# ${reg.title}`)
  lines.push(``)
  lines.push(`**규정번호**: ${reg.regulationNumber}`)
  lines.push(`**시행일**: ${reg.effectiveDate}`)
  lines.push(``)
  lines.push(`---`)
  lines.push(``)

  for (const section of reg.sections) {
    lines.push(`## ${section.heading}`)
    lines.push(``)
    lines.push(section.body)
    lines.push(``)
  }

  if (reg.relatedForms.length > 0) {
    lines.push(`---`)
    lines.push(`## 관련 양식`)
    lines.push(``)
    for (const form of reg.relatedForms) {
      lines.push(`- ${form}`)
    }
    lines.push(``)
  }

  if (reg.relatedRegulations.length > 0) {
    lines.push(`## 관련 규정`)
    lines.push(``)
    for (const r of reg.relatedRegulations) {
      lines.push(`- ${r}`)
    }
    lines.push(``)
  }

  return lines.join('\n')
}

export const maxDuration = 300
