'use server'

import { createClient } from '@/lib/supabase/server'
import { generateApplicationDraftForHospital } from '@/lib/services/draft.service'

export async function generateDraft(hospitalId: string, analysisRunId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '인증이 필요합니다' }

  const { data: member } = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', hospitalId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!member || ((member as Record<string, unknown>).role as string) === 'viewer') {
    return { success: false, error: '초안을 생성할 권한이 없습니다' }
  }

  try {
    const result = await generateApplicationDraftForHospital(hospitalId, analysisRunId, user.id)
    return { success: true, data: result }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
