import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isPlatformAdmin } from '@/lib/services/admin.service'
import { upsertCriteriaDoc, deleteCriteriaDoc, type CriteriaDocCategory } from '@/lib/services/criteriaDocs.service'
import { indexCriteriaPdf, deleteCriteriaChunks } from '@/lib/services/referenceStore.service'

// 업로드 직후 텍스트 추출·임베딩까지 하므로 기본 실행시간으로는 부족하다.
export const maxDuration = 300

export async function POST(req: Request) {
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

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'File exceeds 50MB limit' }, { status: 413 })
  }

  const title = (form.get('title') as string | null)?.trim() || file.name.replace(/\.pdf$/i, '')
  const category = ((form.get('category') as string | null) === 'standard' ? 'standard' : 'etc') as CriteriaDocCategory

  const hospitalType = (form.get('hospitalType') as string | null) || 'auto'

  const path = `criteria/${crypto.randomUUID()}.pdf`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, buffer, { contentType: 'application/pdf', upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  await upsertCriteriaDoc({
    path,
    title,
    category,
    originalFilename: file.name,
    uploadedAt: new Date().toISOString(),
  })

  // 규정집 생성이 근거로 쓸 수 있도록 본문을 청킹해 색인한다.
  // 색인이 실패해도 업로드 자체는 성공으로 둔다(어드민 화면에서 재색인 가능).
  let indexed: number | null = null
  let indexError: string | null = null
  try {
    const result = await indexCriteriaPdf({ path, title, buffer, hospitalType })
    indexed = result.chunks
  } catch (e) {
    indexError = e instanceof Error ? e.message : String(e)
    console.error(`[criteria/pdf] 색인 실패 ${path}:`, e)
  }

  return NextResponse.json({ path, title, indexed, indexError })
}

// 제목/카테고리 수정
export async function PATCH(req: Request) {
  const isAdmin = await isPlatformAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const body = await req.json() as { path?: string; title?: string; category?: string }
  if (!body.path || !body.title?.trim()) {
    return NextResponse.json({ error: 'path와 title이 필요합니다' }, { status: 400 })
  }

  try {
    await upsertCriteriaDoc({
      path: body.path,
      title: body.title.trim(),
      category: (body.category === 'standard' ? 'standard' : 'etc') as CriteriaDocCategory,
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// 파일 삭제
export async function DELETE(req: Request) {
  const isAdmin = await isPlatformAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')
  if (!path) return NextResponse.json({ error: 'path가 필요합니다' }, { status: 400 })

  try {
    await deleteCriteriaDoc(path)
    await deleteCriteriaChunks(path)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
