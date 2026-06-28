import { createClient } from '@/lib/supabase/server'
import type { Hospital, HospitalMember } from '@/types/database.types'
import type { HospitalInput } from '@/lib/validators/hospital'

export async function getUserHospitals(): Promise<(Hospital & { role: string })[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('hospital_members')
    .select('role, hospitals(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')

  if (error || !data) return []

  const rows = data as unknown as Array<{ role: string; hospitals: Hospital | null }>
  return rows
    .filter((m) => m.hospitals !== null)
    .map((m) => ({ ...m.hospitals!, role: m.role }))
}

export async function getHospital(hospitalId: string): Promise<Hospital | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', hospitalId)
    .single()

  if (error) return null
  return data as unknown as Hospital
}

export async function createHospital(input: HospitalInput): Promise<Hospital> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('인증이 필요합니다')

  const { data: hospital, error: hospitalError } = await supabase
    .from('hospitals')
    .insert({ ...input, created_by: user.id } as never)
    .select()
    .single()

  if (hospitalError) throw new Error(hospitalError.message)
  const h = hospital as unknown as Hospital

  // 병원 생성자 자기자신 추가 — RLS 정책(20260629000002)으로 허용됨
  const { error: memberError } = await supabase
    .from('hospital_members')
    .insert({
      hospital_id: h.id,
      user_id:     user.id,
      email:       user.email!,
      role:        'admin',
      status:      'active',
      joined_at:   new Date().toISOString(),
    } as never)

  if (memberError) {
    await supabase.from('hospitals').delete().eq('id', h.id)
    throw new Error('멤버 추가 실패: ' + memberError.message)
  }

  return h
}

export async function updateHospital(
  hospitalId: string,
  input: Partial<HospitalInput>
): Promise<Hospital> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hospitals')
    .update(input as never)
    .eq('id', hospitalId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as Hospital
}

export async function deleteHospital(hospitalId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hospitals')
    .update({ status: 'archived' } as never)
    .eq('id', hospitalId)

  if (error) throw new Error(error.message)
}

export async function getHospitalMembers(hospitalId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('hospital_members')
    .select('*, profiles(full_name, avatar_url)')
    .eq('hospital_id', hospitalId)
    .neq('status', 'removed')
    .order('created_at', { ascending: true })

  if (error) return []
  return data as unknown as Array<
    HospitalMember & { profiles: { full_name: string | null; avatar_url: string | null } | null }
  >
}

export async function getHospitalDocumentStats(hospitalId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .select('status')
    .eq('hospital_id', hospitalId)
    .is('deleted_at', null)

  if (error || !data) return { total: 0, extracted: 0, pending: 0, failed: 0 }
  const rows = data as unknown as Array<{ status: string }>

  return {
    total:     rows.length,
    extracted: rows.filter((d) => d.status === 'extracted').length,
    pending:   rows.filter((d) => d.status === 'pending' || d.status === 'processing').length,
    failed:    rows.filter((d) => d.status === 'failed').length,
  }
}

export async function getLatestAnalysis(hospitalId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('analysis_runs')
    .select('id, overall_score, status, completed_at, created_at')
    .eq('hospital_id', hospitalId)
    .eq('status', 'complete')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data as unknown as {
    id: string
    overall_score: number | null
    status: string
    completed_at: string | null
    created_at: string
  } | null
}
