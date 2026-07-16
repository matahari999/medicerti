import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isPlatformAdmin } from '@/lib/services/admin.service'
import type { HospitalRole } from '@/types/database.types'

const ROLE_HIERARCHY: Record<HospitalRole, number> = {
  viewer:  0,
  manager: 1,
  admin:   2,
}

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return user
}

export async function requireHospitalMember(
  hospitalId: string,
  minRole: HospitalRole = 'viewer'
) {
  const user = await requireAuth()

  // 플랫폼 관리자는 소속 여부와 무관하게 모든 병원에 admin 권한으로 접근한다
  // (DB의 is_platform_admin() OR is_hospital_member(...) RLS 규칙과 동일한 원칙)
  if (await isPlatformAdmin()) {
    return { user, role: 'admin' as HospitalRole }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', hospitalId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  const member = data as { role: string } | null

  if (error || !member) {
    redirect('/dashboard')
  }

  const role = member!.role as HospitalRole

  if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[minRole]) {
    redirect('/dashboard')
  }

  return { user, role }
}

export async function getHospitalMemberRole(
  hospitalId: string
): Promise<HospitalRole | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', hospitalId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  const member = data as { role: string } | null
  return (member?.role as HospitalRole) ?? null
}
