import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hospitalSchema } from '@/lib/validators/hospital'
import { createHospital, getUserHospitals } from '@/lib/services/hospital.service'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } }, { status: 401 })

  const hospitals = await getUserHospitals()
  return NextResponse.json({ data: hospitals })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: '잘못된 요청 형식입니다' } }, { status: 422 })

  const parsed = hospitalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } },
      { status: 422 }
    )
  }

  try {
    const hospital = await createHospital(parsed.data)
    return NextResponse.json({ data: hospital }, { status: 201 })
  } catch (e) {
    return NextResponse.json(
      { error: { code: 'PROCESSING_ERROR', message: e instanceof Error ? e.message : '병원 생성 실패' } },
      { status: 500 }
    )
  }
}
