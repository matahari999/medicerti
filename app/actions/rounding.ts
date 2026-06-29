'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import {
  createRoundingRecord,
  getRoundingRecords,
  getRoundingTrends,
  getRoundingCategories,
  recordMetric,
  getMetricTrends,
  getRecentRoundingRecords,
} from '@/lib/services/rounding.service'

export async function submitRounding(
  hospitalId: string,
  title: string,
  roundDate: string,
  scores: { category_id: string; score: number; finding?: string; action_needed?: string }[]
) {
  await requireAuth()
  const result = await createRoundingRecord(hospitalId, title, roundDate, scores)
  revalidatePath(`/hospitals/${hospitalId}/rounding`)
  return result
}

export async function fetchRoundingRecords(hospitalId: string, months?: number) {
  await requireAuth()
  return getRoundingRecords(hospitalId, months)
}

export async function fetchRoundingTrends(hospitalId: string, months?: number) {
  await requireAuth()
  return getRoundingTrends(hospitalId, months)
}

export async function fetchRoundingCategories(hospitalType?: string) {
  return getRoundingCategories(hospitalType)
}

export async function submitMetric(
  hospitalId: string,
  metricName: string,
  metricLabel: string,
  metricValue: number,
  unit: string,
  recordedDate: string
) {
  await requireAuth()
  await recordMetric(hospitalId, metricName, metricLabel, metricValue, unit, recordedDate)
  revalidatePath(`/hospitals/${hospitalId}/rounding`)
}

export async function fetchMetricTrends(hospitalId: string, months?: number) {
  await requireAuth()
  return getMetricTrends(hospitalId, months)
}

export async function fetchRecentRoundingRecords(hospitalId: string) {
  await requireAuth()
  return getRecentRoundingRecords(hospitalId)
}
