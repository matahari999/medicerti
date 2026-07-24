// 기준 하나를 지정해 규정집을 생성한다("7장 감염관리 → 7.1 감염예방·관리체계").
// 기존 regulations-batch가 카탈로그 앞에서부터 5개씩 뽑던 것과 달리,
// 구독자가 필요한 장/기준만 골라 만들 수 있고 업로드된 규정집·사례집 원문을 근거로 삼는다.
//
// 한 번에 기준 1개만 생성한다 — Gemini 호출이 길어 서버리스 실행시간 안에 여러 개를 처리할 수 없다.
// 장 전체 생성은 클라이언트가 기준 목록을 돌며 순차 호출한다.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { generateFullRegulation } from '@/lib/gemini/regulation-writer'
import { findReferences, formatReferenceBlock } from '@/lib/referenceSearch'
import { STANDARD_CATALOG } from '@/lib/standardCatalog'
import { isPlatformAdmin } from '@/lib/services/admin.service'
import type { HospitalTypeKey } from '@/lib/types'

export const maxDuration = 300

const CATALOG_BY_HOSPITAL_TYPE: Record<string, HospitalTypeKey> = {
  long_term_care: 'nursing',
  psychiatric: 'psychiatric',
}

async function resolveHospital(hospitalId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

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
      return { error: NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 }) }
    }
  }

  const { data: hospital } = await supabase
    .from('hospitals')
    .select('id, name, type')
    .eq('id', hospitalId)
    .maybeSingle()
  if (!hospital) {
    return { error: NextResponse.json({ error: '병원을 찾을 수 없습니다' }, { status: 404 }) }
  }

  const hospitalType = (hospital as { type: string }).type
  const catalogKey = CATALOG_BY_HOSPITAL_TYPE[hospitalType]
  if (!catalogKey) {
    return { error: NextResponse.json({ error: `지원하지 않는 병원 유형입니다: ${hospitalType}` }, { status: 422 }) }
  }

  return { user, hospitalType, catalogKey, isAdmin: admin }
}

/** 이 병원 종별의 장/기준 목록 — 생성 화면의 선택 UI가 쓴다. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const hospitalId = searchParams.get('hospitalId')
  if (!hospitalId) return NextResponse.json({ error: 'hospitalId required' }, { status: 400 })

  const resolved = await resolveHospital(hospitalId)
  if ('error' in resolved) return resolved.error

  const catalog = STANDARD_CATALOG[resolved.catalogKey]
  return NextResponse.json({
    hospitalType: resolved.hospitalType,
    chapters: catalog.chapters.map((ch) => ({
      chapterNumber: ch.chapterNumber,
      chapterTitle: ch.chapterTitle,
      items: ch.items.map((it) => ({
        itemNumber: it.itemNumber,
        itemTitle: it.itemTitle,
        summary: it.summary,
      })),
    })),
  })
}

export async function POST(req: Request) {
  const { hospitalId, itemNumber } = (await req.json()) as { hospitalId?: string; itemNumber?: string }
  if (!hospitalId || !itemNumber) {
    return NextResponse.json({ error: 'hospitalId와 itemNumber가 필요합니다' }, { status: 400 })
  }

  const resolved = await resolveHospital(hospitalId)
  if ('error' in resolved) return resolved.error

  const catalog = STANDARD_CATALOG[resolved.catalogKey]
  const chapter = catalog.chapters.find((ch) => ch.items.some((it) => it.itemNumber === itemNumber))
  const item = chapter?.items.find((it) => it.itemNumber === itemNumber)
  if (!chapter || !item) {
    return NextResponse.json({ error: `기준을 찾을 수 없습니다: ${itemNumber}` }, { status: 404 })
  }

  const chapterNo = Number(chapter.chapterNumber)

  // 업로드된 병원 규정집·규정 사례집·인증기준집에서 이 기준의 근거 원문을 모은다
  const { hits, sourceRefs } = await findReferences({
    hospitalType: resolved.hospitalType,
    regCode: itemNumber,
    chapterNo: Number.isFinite(chapterNo) ? chapterNo : null,
    itemTitle: item.itemTitle,
    chapterTitle: chapter.chapterTitle,
    summary: item.summary,
  })

  const regulation = await generateFullRegulation({
    criterionCode: item.itemNumber,
    criterionTitle: `${chapter.chapterTitle} - ${item.itemTitle}`,
    criterionDesc: item.summary,
    requiredDocuments: item.requiredDocuments ?? [],
    requiredForms: item.requiredForms ?? [],
    requiredChecklists: item.requiredChecklists ?? [],
    requiredEvidence: item.requiredEvidence ?? [],
    hospitalType: resolved.catalogKey,
    reference: hits.length
      ? {
          source: `보유 자료 ${new Set(sourceRefs.map((r) => r.sourceTitle)).size}종 (${sourceRefs.length}개 발췌)`,
          title: `${item.itemNumber} ${item.itemTitle}`,
          content: formatReferenceBlock(hits),
        }
      : undefined,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
  }
  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabaseAdmin
    .from('managed_documents')
    .insert({
      hospital_id: hospitalId,
      doc_type: 'regulation',
      title: regulation.title,
      content: formatRegulationContent(regulation),
      status: 'draft',
      created_by: resolved.user.id,
      // 출처는 관리자 확인용으로만 저장한다(구독자 화면에는 노출하지 않음)
      source_refs: sourceRefs.length ? sourceRefs : null,
    } as never)
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: `문서 저장 실패: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({
    docId: (data as { id: string }).id,
    title: regulation.title,
    itemNumber: item.itemNumber,
    itemTitle: item.itemTitle,
    groundedChunks: hits.length,
    // 구독자에게는 개수만, 관리자에게는 출처 상세까지
    sourceRefs: resolved.isAdmin ? sourceRefs : undefined,
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
  const lines: string[] = [`# ${reg.title}`, '', `**규정번호**: ${reg.regulationNumber}`, `**시행일**: ${reg.effectiveDate}`, '', '---', '']
  for (const section of reg.sections) {
    lines.push(`## ${section.heading}`, '', section.body, '')
  }
  if (reg.relatedForms.length > 0) {
    lines.push('---', '## 관련 양식', '')
    for (const form of reg.relatedForms) lines.push(`- ${form}`)
    lines.push('')
  }
  if (reg.relatedRegulations.length > 0) {
    lines.push('## 관련 규정', '')
    for (const r of reg.relatedRegulations) lines.push(`- ${r}`)
    lines.push('')
  }
  return lines.join('\n')
}
