import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isPlatformAdmin } from '@/lib/services/admin.service'
import { analyzeCriteriaForDocs } from '@/lib/gemini/document-planner'

export async function POST() {
  const isAdmin = await isPlatformAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Fetch full criteria tree
  const { data: tree } = await supabase.rpc('get_accreditation_tree')
  if (!tree) return NextResponse.json({ error: 'No criteria data found' }, { status: 400 })

  const plan = await analyzeCriteriaForDocs(JSON.stringify(tree), '__platform__')

  if (plan.items.length === 0) {
    return NextResponse.json({ error: plan.summary || '문서 분석에 실패했습니다' }, { status: 500 })
  }

  // Create managed_doc drafts for each recommended item
  const created: Array<{ title: string; docType: string; id: string }> = []
  const errors: string[] = []

  for (const item of plan.items.slice(0, 50)) { // max 50
    const { data, error } = await supabase
      .from('managed_documents')
      .insert({
        hospital_id: '__platform__',
        doc_type: item.docType,
        title: item.title,
        content: `## AI 추천 문서\n\n**관련 기준**: ${item.relatedCriterion}\n**필요 이유**: ${item.reason}\n**우선순위**: ${item.priority}\n\n---\n\n*이 문서는 인증기준 분석 결과 AI가 자동 생성한 추천 템플릿입니다. 실제 내용을 작성해주세요.*`,
        status: 'draft',
        created_by: '00000000-0000-0000-0000-000000000000',
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
