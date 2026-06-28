'use server'

import { createClient } from '@/lib/supabase/server'
import { syncHospitalsFromDataGoKr, syncEvaluationsFromDataGoKr } from '@/lib/services/external-api'
import type { SyncResult } from '@/lib/services/external-api'

interface SyncActionResult {
  success: boolean
  data?: { hospital?: SyncResult; evaluation?: SyncResult }
  error?: string
}

export async function syncCriteria(
  _prevState: SyncActionResult,
  formData: FormData,
): Promise<SyncActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: '인증이 필요합니다' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_platform_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!(profile as { is_platform_admin: boolean } | null)?.is_platform_admin) {
    return { success: false, error: '관리자만 동기화를 실행할 수 있습니다' }
  }

  const source = formData.get('source') as string | null
  const evlYr = formData.get('evlYr') as string | undefined
  const results: { hospital?: SyncResult; evaluation?: SyncResult } = {}

  try {
    if (!source || source === 'all' || source === 'hospital') {
      results.hospital = await syncHospitalsFromDataGoKr()
    }

    if (!source || source === 'all' || source === 'evaluation') {
      results.evaluation = await syncEvaluationsFromDataGoKr(evlYr)
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }

  return { success: true, data: results }
}
