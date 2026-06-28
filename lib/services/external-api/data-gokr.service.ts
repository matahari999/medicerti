import type { SyncResult, NormalizedHospital, NormalizedEvaluation } from './data-gokr.types'
import { normalizeHospital, normalizeEvaluation, applyFallbackHospital } from './data-gokr.normalizer'
import {
  fetchAllHospitals,
  fetchAllEvaluations,
  DataGoKrClientError,
} from './data-gokr.client'
import { createServiceClient } from '@/lib/supabase/server'

export async function syncHospitalsFromDataGoKr(
  signal?: AbortSignal,
): Promise<SyncResult> {
  const start = Date.now()
  const errors: string[] = []
  let normalized = 0
  let upserted = 0
  let failed = 0

  try {
    const { items, errors: fetchErrors } = await fetchAllHospitals(
      undefined,
      signal,
    )

    for (const e of fetchErrors) {
      errors.push(`[fetch] code=${e.code} message=${e.message}`)
    }

    const normalizedItems: NormalizedHospital[] = []

    for (const item of items) {
      const result = normalizeHospital(item)
      if (result.success && result.data) {
        normalizedItems.push(applyFallbackHospital(result.data))
        normalized++
      } else {
        failed++
        if (result.error) {
          errors.push(`[normalize] ${result.error}`)
        }
      }
    }

    if (normalizedItems.length > 0) {
      const supabase = await createServiceClient()
      const { error: upsertError } = await supabase
        .from('hospitals')
        .upsert(
          normalizedItems.map((h) => ({
            name: h.name,
            license_number: h.externalId,
            type: h.typeName || h.typeCode || 'long_term_care',
            bed_count: h.bedCount,
            region: h.regionCode,
            address: h.address,
            phone: h.phone,
          })),
          { onConflict: 'license_number', ignoreDuplicates: false },
        )

      if (upsertError) {
        errors.push(`[upsert] ${upsertError.message}`)
      } else {
        upserted = normalizedItems.length
      }
    }
  } catch (err) {
    const message = err instanceof DataGoKrClientError
      ? `[client] code=${err.code} ${err.message}`
      : err instanceof Error ? err.message : String(err)
    errors.push(message)
  }

  return {
    source: 'data.go.kr:hospital_info',
    totalFetched: normalized + failed,
    normalized,
    upserted,
    failed,
    errors,
    duration: Date.now() - start,
  }
}

export async function syncEvaluationsFromDataGoKr(
  evlYr?: string,
  signal?: AbortSignal,
): Promise<SyncResult> {
  const start = Date.now()
  const errors: string[] = []
  let normalized = 0
  let upserted = 0
  let failed = 0

  try {
    const { items, errors: fetchErrors } = await fetchAllEvaluations(
      evlYr,
      undefined,
      signal,
    )

    for (const e of fetchErrors) {
      errors.push(`[fetch] code=${e.code} message=${e.message}`)
    }

    const normalizedItems: NormalizedEvaluation[] = []

    for (const item of items) {
      const result = normalizeEvaluation(item)
      if (result.success && result.data) {
        normalizedItems.push(result.data)
        normalized++
      } else {
        failed++
        if (result.error) {
          errors.push(`[normalize] ${result.error}`)
        }
      }
    }

    if (normalizedItems.length > 0) {
      const supabase = await createServiceClient()

      const { error: upsertError } = await supabase
        .from('analysis_runs')
        .insert(
          normalizedItems.map((e) => ({
            hospital_id: e.externalId,
            triggered_by: 'system',
            status: 'complete' as const,
            overall_score: e.totalScore,
          })),
        )

      if (upsertError) {
        errors.push(`[upsert] ${upsertError.message}`)
      } else {
        upserted = normalizedItems.length
      }
    }
  } catch (err) {
    const message = err instanceof DataGoKrClientError
      ? `[client] code=${err.code} ${err.message}`
      : err instanceof Error ? err.message : String(err)
    errors.push(message)
  }

  return {
    source: 'data.go.kr:evaluation',
    totalFetched: normalized + failed,
    normalized,
    upserted,
    failed,
    errors,
    duration: Date.now() - start,
  }
}
