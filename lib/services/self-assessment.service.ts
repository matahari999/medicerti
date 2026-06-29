import { createClient } from '@/lib/supabase/server'
import type { SelfAssessment, SelfAssessmentResult } from '@/types/database.types'

export async function createAssessmentSession(hospitalId: string, title = '') {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_self_assessment', {
    p_hospital_id: hospitalId,
    p_title: title,
  })
  if (error) throw new Error(error.message)
  return data as unknown as SelfAssessment
}

export async function getAssessmentsByHospital(hospitalId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('self_assessments')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('created_at', { ascending: false })
  return (data ?? []) as SelfAssessment[]
}

export async function getAssessmentWithResults(assessmentId: string) {
  const supabase = await createClient()
  const { data: assessment } = await supabase
    .from('self_assessments')
    .select('*')
    .eq('id', assessmentId)
    .single()
  if (!assessment) return null

  const { data: results } = await supabase
    .from('self_assessment_results')
    .select(`
      *,
      survey_item:survey_item_id (*)
    `)
    .eq('assessment_id', assessmentId)
    .order('priority_score', { ascending: false })

  return {
    assessment: assessment as SelfAssessment,
    results: (results ?? []) as unknown as SelfAssessmentResult[],
  }
}

export async function updateResultStatus(
  resultId: string,
  complianceStatus: string,
  notes?: string
) {
  const supabase = await createClient()
  const updates: Record<string, unknown> = { compliance_status: complianceStatus }
  if (notes !== undefined) updates.notes = notes
  const { error } = await supabase
    .from('self_assessment_results')
    .update(updates)
    .eq('id', resultId)
  if (error) throw new Error(error.message)
}

export async function getLatestAssessment(hospitalId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('self_assessments')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as SelfAssessment | null
}
