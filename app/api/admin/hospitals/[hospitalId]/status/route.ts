import { NextResponse } from 'next/server'
import { isPlatformAdmin, setHospitalStatus } from '@/lib/services/admin.service'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ hospitalId: string }> }
) {
  const isAdmin = await isPlatformAdmin()
  if (!isAdmin) return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { hospitalId } = await params
  const { status } = await request.json() as { status: 'active' | 'suspended' | 'archived' }

  try {
    await setHospitalStatus(hospitalId, status)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
