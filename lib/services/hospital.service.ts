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

  // SECURITY DEFINER RPC — RLS 없이 서버 내부에서 병원+멤버 원자적 생성
  const { data, error } = await supabase.rpc('create_hospital_with_admin', {
    p_name:                 input.name,
    p_license_number:       input.license_number ?? null,
    p_type:                 input.type ?? 'long_term_care',
    p_bed_count:            input.bed_count ?? null,
    p_region:               input.region ?? null,
    p_address:              input.address ?? null,
    p_phone:                input.phone ?? null,
    p_accreditation_cycle:  input.accreditation_cycle ?? 1,
    p_accreditation_start:  input.accreditation_start ?? null,
    p_accreditation_target: input.accreditation_target ?? null,
  })

  if (error) throw new Error(error.message)
  return data as unknown as Hospital
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
