import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isPlatformAdmin } from '@/lib/services/admin.service'
import { upsertCriteriaDoc, deleteCriteriaDoc, type CriteriaDocCategory } from '@/lib/services/criteriaDocs.service'

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

  const path = `criteria/${crypto.randomUUID()}.pdf`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, file, { contentType: 'application/pdf', upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  await upsertCriteriaDoc({
    path,
    title,
    category,
    originalFilename: file.name,
    uploadedAt: new Date().toISOString(),
  })

  return NextResponse.json({ path, title })
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
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
