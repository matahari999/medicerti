import { createClient } from '@/lib/supabase/server'
import type { EmployeeAcknowledgment } from '@/types/database.types'

export async function getRegulationsForAcknowledgment(hospitalId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('managed_documents')
    .select('id, title, doc_type')
    .eq('hospital_id', hospitalId)
    .eq('status', 'approved')
    .in('doc_type', ['regulation', 'education_record'])
    .order('title')
  return data ?? []
}

export async function recordAcknowledgment(
  hospitalId: string,
  documentId: string,
  documentType: string,
  documentTitle: string,
  employeeName: string,
  employeeDepartment?: string,
  employeeRole?: string,
  expirationMonths = 12
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const expiresAt = expirationMonths > 0
    ? new Date(Date.now() + expirationMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
    : null

  const { error } = await supabase
    .from('employee_acknowledgments')
    .insert({
      hospital_id: hospitalId,
      document_id: documentId,
      document_type: documentType,
      document_title: documentTitle,
      employee_name: employeeName,
      employee_department: employeeDepartment ?? null,
      employee_role: employeeRole ?? null,
      expires_at: expiresAt,
      expiration_months: expirationMonths,
      created_by: user?.id,
    })
  if (error) throw new Error(error.message)
}

export async function getAcknowledgmentsByHospital(hospitalId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('employee_acknowledgments')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('acknowledged_at', { ascending: false })
  return (data ?? []) as EmployeeAcknowledgment[]
}

export async function getAcknowledgmentStats(hospitalId: string) {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_acknowledgment_stats', {
    p_hospital_id: hospitalId,
  })
  return data as unknown as Array<{
    department: string; total_employees: number; total_documents: number;
    total_acknowledgments: number; expired_count: number; compliance_rate: number
  }> ?? []
}

export async function deleteAcknowledgment(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('employee_acknowledgments').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getAcknowledgedEmployeesByDocument(hospitalId: string, documentId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('employee_acknowledgments')
    .select('*')
    .eq('hospital_id', hospitalId)
    .eq('document_id', documentId)
    .order('acknowledged_at', { ascending: false })
  return (data ?? []) as EmployeeAcknowledgment[]
}
