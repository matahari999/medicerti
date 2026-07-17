// 인증 참고자료(기준집/기타 항목) 목록 — 로그인한 모든 사용자가 조회 가능.
// 관리자가 인증기준 관리에서 올린 PDF들을 일반 구독자가 열람할 수 있게 signed URL과 함께 반환한다.
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listCriteriaDocs, signedUrlFor } from '@/lib/services/criteriaDocs.service'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })

  try {
    const docs = await listCriteriaDocs()
    const withUrls = await Promise.all(
      docs.map(async (d) => ({ ...d, url: await signedUrlFor(d.path) }))
    )
    return NextResponse.json({ data: withUrls })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
