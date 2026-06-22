import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hospitalSchema } from '@/lib/validators/hospital'
import { getHospital, updateHospital, deleteHospital } from '@/lib/services/hospital.service'

type Params = { params: Promise<{ hospitalId: string }> }

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function getMemberRole(hospitalId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', hospitalId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()
  return (data as { role: string } | null)?.role ?? null
}

export async function GET(_req: Request, { params }: Params) {
  const { hospitalId } = await params
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } }, { status: 401 })

  const hospital = await getHospital(hospitalId)
  if (!hospital) return NextResponse.json({ error: { code: 'NOT_FOUND', message: '병원을 찾을 수 없습니다' } }, { status: 404 })

  return NextResponse.json({ data: hospital })
}

export async function PATCH(request: Request, { params }: Params) {
  const { hospitalId } = await params
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } }, { status: 401 })

  const role = await getMemberRole(hospitalId, user.id)
  if (!role || role === 'viewer') return NextResponse.json({ error: { code: 'FORBIDDEN', message: '수정 권한이 없습니다' } }, { status: 403 })

  const body = await request.json().catch(() => null)
  const parsed = hospitalSchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }, { status: 422 })

  try {
    const hospital = await updateHospital(hospitalId, parsed.data)
    return NextResponse.json({ data: hospital })
  } catch (e) {
    return NextResponse.json({ error: { code: 'PROCESSING_ERROR', message: e instanceof Error ? e.message : '수정 실패' } }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { hospitalId } = await params
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } }, { status: 401 })

  const role = await getMemberRole(hospitalId, user.id)
  if (role !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: '삭제 권한이 없습니다' } }, { status: 403 })

  try {
    await deleteHospital(hospitalId)
    return NextResponse.json({ data: { success: true } })
  } catch (e) {
    return NextResponse.json({ error: { code: 'PROCESSING_ERROR', message: e instanceof Error ? e.message : '삭제 실패' } }, { status: 500 })
  }
}
