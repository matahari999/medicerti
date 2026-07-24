// 이미 올라가 있는 참고자료 PDF를 다시 청킹·색인한다.
// 한 번에 한 파일만 처리하고 클라이언트가 순차 호출한다 — 서버리스 실행시간 한도를 넘기지 않기 위해서다.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isPlatformAdmin } from '@/lib/services/admin.service'
import { listCriteriaDocs } from '@/lib/services/criteriaDocs.service'
import { indexCriteriaPdf, countChunksBySource } from '@/lib/services/referenceStore.service'

export const maxDuration = 300

/** 색인 현황: 문서별 청크 수 */
export async function GET() {
  const isAdmin = await isPlatformAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const [docs, counts] = await Promise.all([listCriteriaDocs(), countChunksBySource()])
  return NextResponse.json({
    data: docs.map((d) => ({ path: d.path, title: d.title, chunks: counts[d.path] ?? 0 })),
  })
}

export async function POST(req: Request) {
  const isAdmin = await isPlatformAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const body = (await req.json()) as { path?: string; title?: string; hospitalType?: string }
  if (!body.path?.startsWith('criteria/') || body.path.includes('..')) {
    return NextResponse.json({ error: '잘못된 경로' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: blob, error } = await supabase.storage.from('documents').download(body.path)
  if (error || !blob) {
    return NextResponse.json({ error: error?.message ?? '파일을 찾을 수 없습니다' }, { status: 404 })
  }

  // 제목은 인덱스에 저장된 값을 우선 사용(장 번호 추출에 쓰인다)
  const title = body.title?.trim() || body.path.split('/').pop() || body.path

  try {
    const result = await indexCriteriaPdf({
      path: body.path,
      title,
      buffer: Buffer.from(await blob.arrayBuffer()),
      hospitalType: body.hospitalType ?? 'auto',
    })
    return NextResponse.json({ path: body.path, title, ...result })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
