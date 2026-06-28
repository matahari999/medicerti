import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireHospitalMember } from '@/lib/auth'

type Params = { params: Promise<{ hospitalId: string }> }

function errResponse(e: unknown) {
  const message = e instanceof Error ? e.message : 'Internal Server Error'
  const status  = message.includes('권한') ? 403 : message.includes('로그인') ? 401 : 500
  return NextResponse.json({ error: message }, { status })
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { hospitalId } = await params

  try {
    await requireHospitalMember(hospitalId, 'viewer')
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('hospital_members')
      .select('*, profiles(full_name, avatar_url)')
      .eq('hospital_id', hospitalId)
      .neq('status', 'removed')
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data: data ?? [] })
  } catch (e) {
    return errResponse(e)
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { hospitalId } = await params

  try {
    await requireHospitalMember(hospitalId, 'admin')
    const body = await req.json() as { email: string; role?: string }

    if (!body.email) {
      return NextResponse.json({ error: '이메일이 필요합니다' }, { status: 400 })
    }

    const supabase = await createClient()

    // 이미 멤버인지 확인
    const { data: existing } = await supabase
      .from('hospital_members')
      .select('id, status')
      .eq('hospital_id', hospitalId)
      .eq('email', body.email)
      .maybeSingle()

    if (existing && (existing as { status: string }).status !== 'removed') {
      return NextResponse.json({ error: '이미 멤버입니다' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('hospital_members')
      .insert({
        hospital_id: hospitalId,
        email:       body.email,
        role:        body.role ?? 'viewer',
        status:      'invited',
      } as never)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (e) {
    return errResponse(e)
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { hospitalId } = await params

  try {
    await requireHospitalMember(hospitalId, 'admin')
    const { memberId } = await req.json() as { memberId: string }

    if (!memberId) {
      return NextResponse.json({ error: 'memberId가 필요합니다' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('hospital_members')
      .update({ status: 'removed' } as never)
      .eq('id', memberId)
      .eq('hospital_id', hospitalId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    return errResponse(e)
  }
}
