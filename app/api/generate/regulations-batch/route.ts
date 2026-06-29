import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { generateFullRegulationsFromCatalog } from '@/lib/gemini/regulation-writer'
import { STANDARD_CATALOG } from '@/lib/standardCatalog'
import type { HospitalTypeKey } from '@/lib/types'

export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { hospitalId, catalogType } = await req.json() as {
    hospitalId?: string
    catalogType?: HospitalTypeKey
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseAdmin = supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null

  const type = catalogType ?? 'nursing'
  const catalog = STANDARD_CATALOG[type]
  if (!catalog) return NextResponse.json({ error: `Catalog type "${type}" not found` }, { status: 400 })

  const targetHospitalId = hospitalId ?? '__platform__'

  // Collect all items from all chapters
  const items: Array<{
    criterionCode: string
    criterionTitle: string
    criterionDesc: string
    requiredDocuments: string[]
    requiredForms: string[]
    requiredChecklists: string[]
    requiredEvidence: string[]
  }> = []

  for (const chapter of catalog.chapters) {
    for (const item of chapter.items) {
      items.push({
        criterionCode: item.itemNumber,
        criterionTitle: `${chapter.chapterTitle} - ${item.itemTitle}`,
        criterionDesc: item.summary,
        requiredDocuments: item.requiredDocuments ?? [],
        requiredForms: item.requiredForms ?? [],
        requiredChecklists: item.requiredChecklists ?? [],
        requiredEvidence: item.requiredEvidence ?? [],
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
    type,
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
        hospital_id: targetHospitalId,
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

  return NextResponse.json({
    total: totalItems,
    generated: regulations.length,
    batchSize: 5,
    created: created.length,
    createdDocs: created,
    errors,
    remainingItems: totalItems - batch.length,
    note: `전체 ${totalItems}개 기준 중 첫 5개를 생성했습니다. 나머지는 순차적으로 생성 가능합니다.`,
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
