import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Hospital, Profile, HospitalMember } from '@/types/database.types'

export async function isPlatformAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('profiles')
    .select('is_platform_admin')
    .eq('id', user.id)
    .maybeSingle()

  return (data as { is_platform_admin: boolean } | null)?.is_platform_admin ?? false
}

export async function getAllHospitals(): Promise<(Hospital & { member_count: number; document_count: number })[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('hospitals')
    .select(`
      *,
      hospital_members(count),
      documents(count)
    `)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return (data as unknown as Array<Hospital & {
    hospital_members: [{ count: number }]
    documents: [{ count: number }]
  }>).map((h) => ({
    ...h,
    member_count: h.hospital_members?.[0]?.count ?? 0,
    document_count: h.documents?.[0]?.count ?? 0,
  }))
}

export async function getAllUsers(): Promise<(Profile & { email: string })[]> {
  const supabase = await createServiceClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !profiles) return []

  const { data: { users } } = await supabase.auth.admin.listUsers()
  const emailMap = new Map(users.map((u) => [u.id, u.email ?? '']))

  return (profiles as unknown as Profile[]).map((p) => ({
    ...p,
    email: emailMap.get(p.id) ?? '',
  }))
}

export async function getHospitalWithMembers(hospitalId: string) {
  const supabase = await createServiceClient()

  const { data: hospital } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', hospitalId)
    .single()

  const { data: members } = await supabase
    .from('hospital_members')
    .select('*, profiles(full_name, avatar_url, job_title)')
    .eq('hospital_id', hospitalId)
    .neq('status', 'removed')
    .order('created_at', { ascending: true })

  const { data: analysisRuns } = await supabase
    .from('analysis_runs')
    .select('id, overall_score, status, completed_at, created_at')
    .eq('hospital_id', hospitalId)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: documents } = await supabase
    .from('documents')
    .select('id, original_name, status, category, created_at')
    .eq('hospital_id', hospitalId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    hospital: hospital as unknown as Hospital | null,
    members: (members ?? []) as unknown as Array<HospitalMember & {
      profiles: { full_name: string | null; avatar_url: string | null; job_title: string | null } | null
    }>,
    analysisRuns: (analysisRuns ?? []) as unknown as Array<{
      id: string; overall_score: number | null; status: string; completed_at: string | null; created_at: string
    }>,
    documents: (documents ?? []) as unknown as Array<{
      id: string; original_name: string; status: string; category: string; created_at: string
    }>,
  }
}

export async function setHospitalStatus(
  hospitalId: string,
  status: 'active' | 'suspended' | 'archived'
): Promise<void> {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('hospitals')
    .update({ status } as never)
    .eq('id', hospitalId)
  if (error) throw new Error(error.message)
}

export async function togglePlatformAdmin(userId: string, value: boolean): Promise<void> {
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_platform_admin: value } as never)
    .eq('id', userId)
  if (error) throw new Error(error.message)
}
