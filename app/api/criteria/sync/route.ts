import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncHospitalsFromDataGoKr, syncEvaluationsFromDataGoKr } from '@/lib/services/external-api'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
      { status: 401 },
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_platform_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!(profile as { is_platform_admin: boolean } | null)?.is_platform_admin) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: '관리자만 동기화를 실행할 수 있습니다' } },
      { status: 403 },
    )
  }

  let body: { source?: 'hospital' | 'evaluation' | 'all'; evlYr?: string }
  try {
    body = await request.json()
  } catch {
    body = { source: 'all' }
  }

  const results: Record<string, unknown> = {}

  try {
    if (body.source === 'hospital' || body.source === 'all') {
      results.hospital = await syncHospitalsFromDataGoKr()
    }

    if (body.source === 'evaluation' || body.source === 'all') {
      results.evaluation = await syncEvaluationsFromDataGoKr(body.evlYr)
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          code: 'PROCESSING_ERROR',
          message: '동기화 중 오류가 발생했습니다',
          details: err instanceof Error ? err.message : String(err),
        },
      },
      { status: 500 },
    )
  }

  return NextResponse.json({ data: results })
}
