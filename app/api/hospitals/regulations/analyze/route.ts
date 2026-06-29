import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeRegulationForDocs } from '@/lib/gemini/document-planner'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { regulationId, hospitalId } = await req.json()
  if (!regulationId || !hospitalId) {
    return NextResponse.json({ error: 'regulationId and hospitalId required' }, { status: 400 })
  }

  // Fetch the regulation document from managed_documents
  const { data: doc } = await supabase
    .from('managed_documents')
    .select('*')
    .eq('id', regulationId)
    .eq('hospital_id', hospitalId)
    .single()

  if (!doc) return NextResponse.json({ error: 'Regulation not found' }, { status: 404 })

  const plan = await analyzeRegulationForDocs(
    doc.content || doc.title,
    doc.title,
    hospitalId
  )

  if (plan.items.length === 0) {
    return NextResponse.json({ error: plan.summary || '문서 분석에 실패했습니다' }, { status: 500 })
  }

  // Create draft managed_docs for each recommendation
  const created: Array<{ title: string; docType: string; id: string }> = []
  const errors: string[] = []

  for (const item of plan.items.slice(0, 30)) {
    const { data, error } = await supabase
      .from('managed_documents')
      .insert({
        hospital_id: hospitalId,
        doc_type: item.docType,
        title: item.title,
        content: `## AI 추천 문서\n\n**관련 기준**: ${item.relatedCriterion}\n**필요 이유**: ${item.reason}\n**우선순위**: ${item.priority}\n\n---\n\n*이 문서는 규정집 "${doc.title}" 분석 결과 AI가 자동 생성한 추천 템플릿입니다. 실제 내용을 작성해주세요.*`,
        status: 'draft',
        created_by: user.id,
      } as never)
      .select('id')
      .single()

    if (error) {
      errors.push(`${item.title}: ${error.message}`)
    } else {
      created.push({ title: item.title, docType: item.docType, id: (data as any).id })
    }
  }

  return NextResponse.json({
    summary: plan.summary,
    total: plan.items.length,
    created: created.length,
    createdDocs: created,
    errors,
  })
}
