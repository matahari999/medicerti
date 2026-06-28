'use server'

import { createClient } from '@/lib/supabase/server'
import { runFullAnalysis } from '@/lib/services/analysis.service'

export async function triggerAnalysis(hospitalId: string) {
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
    return { success: false, error: '분석을 실행할 권한이 없습니다' }
  }

  try {
    const result = await runFullAnalysis(hospitalId, user.id)
    return { success: true, data: result }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
