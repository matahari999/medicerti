import { createClient } from '@/lib/supabase/server'
import type { RoundingRecord, RoundingCategory, RoundingMetric } from '@/types/database.types'

export async function getRoundingCategories(hospitalType?: string) {
  const supabase = await createClient()
  let query = supabase.from('rounding_categories').select('*').eq('is_active', true).order('sort_order')
  if (hospitalType) {
    query = query.contains('hospital_type', [hospitalType])
  }
  const { data } = await query
  return (data ?? []) as RoundingCategory[]
}

export async function createRoundingRecord(
  hospitalId: string,
  title: string,
  roundDate: string,
  scores: { category_id: string; score: number; finding?: string; action_needed?: string }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인 필요')

  const overallScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length * 10) / 10
    : 0

  const { data: record, error: recordError } = await supabase
    .from('rounding_records')
    .insert({
      hospital_id: hospitalId,
      title,
      round_date: roundDate,
      overall_score: overallScore,
      created_by: user.id,
    })
    .select()
    .single()

  if (recordError) throw new Error(recordError.message)
  const roundingId = (record as RoundingRecord).id

  const resultsData = scores.map((s) => ({
    rounding_id: roundingId,
    category_id: s.category_id,
    hospital_id: hospitalId,
    score: s.score,
    finding: s.finding ?? null,
    action_needed: s.action_needed ?? null,
  }))

  const { error: resultsError } = await supabase
    .from('rounding_results')
    .insert(resultsData)

  if (resultsError) throw new Error(resultsError.message)
  return record as RoundingRecord
}

export async function getRoundingRecords(hospitalId: string, months = 12) {
  const supabase = await createClient()
  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - months)
  const { data } = await supabase
    .from('rounding_records')
    .select('*, rounding_results(*)')
    .eq('hospital_id', hospitalId)
    .gte('round_date', cutoffDate.toISOString().split('T')[0])
    .order('round_date', { ascending: true })
  return data ?? []
}

export async function getRoundingTrends(hospitalId: string, months = 12) {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_rounding_trends', {
    p_hospital_id: hospitalId,
    p_months: months,
  })
  return data as unknown as Array<{
    id: string; date: string; score: number; title: string; categories: Array<{ category: string; score: number; finding: string | null; action_needed: string | null }>
  }> ?? []
}

export async function recordMetric(
  hospitalId: string,
  metricName: string,
  metricLabel: string,
  metricValue: number,
  unit: string,
  recordedDate: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('rounding_metrics')
    .upsert({
      hospital_id: hospitalId,
      metric_name: metricName,
      metric_label: metricLabel,
      metric_value: metricValue,
      unit,
      recorded_date: recordedDate,
      recorded_by: user?.id,
    }, { onConflict: 'hospital_id, metric_name, recorded_date' })

  if (error) throw new Error(error.message)
}

export async function getMetricTrends(hospitalId: string, months = 12) {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_metric_trends', {
    p_hospital_id: hospitalId,
    p_metric_name: null,
    p_months: months,
  })
  return data as unknown as Array<{
    name: string; label: string; value: number; unit: string; date: string
  }> ?? []
}

export async function getRecentRoundingRecords(hospitalId: string, limit = 5) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('rounding_records')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('round_date', { ascending: false })
    .limit(limit)
  return (data ?? []) as RoundingRecord[]
}
