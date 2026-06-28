import { createClient } from '@/lib/supabase/server'
import type { ManagedDocument, ManagedDocumentVersion, ManagedDocType, ManagedDocStatus } from '@/types/database.types'

export interface ManagedDocWithCriterion extends ManagedDocument {
  accreditation_criteria: {
    code: string
    title: string
    domain: string
  } | null
  creator_profile: {
    full_name: string | null
  } | null
}

export async function getManagedDocuments(
  hospitalId: string,
  filters?: { doc_type?: ManagedDocType; status?: ManagedDocStatus }
): Promise<ManagedDocWithCriterion[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let q = supabase
    .from('managed_documents')
    .select(`
      *,
      accreditation_criteria(code, title, domain),
      creator_profile:profiles!managed_documents_created_by_fkey(full_name)
    `)
    .eq('hospital_id', hospitalId)
    .order('updated_at', { ascending: false })

  if (filters?.doc_type) q = q.eq('doc_type', filters.doc_type)
  if (filters?.status)   q = q.eq('status', filters.status)

  const { data, error } = await q
  if (error) { console.error('[ManagedDoc] list error', error); return [] }
  return (data ?? []) as unknown as ManagedDocWithCriterion[]
}

export async function getManagedDocument(
  documentId: string,
  hospitalId: string
): Promise<ManagedDocWithCriterion | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('managed_documents')
    .select(`
      *,
      accreditation_criteria(code, title, domain),
      creator_profile:profiles!managed_documents_created_by_fkey(full_name)
    `)
    .eq('id', documentId)
    .eq('hospital_id', hospitalId)
    .maybeSingle()

  if (error) { console.error('[ManagedDoc] get error', error); return null }
  return data as unknown as ManagedDocWithCriterion | null
}

export async function getManagedDocVersions(
  documentId: string
): Promise<ManagedDocumentVersion[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('managed_document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false })

  if (error) { console.error('[ManagedDoc] versions error', error); return [] }
  return (data ?? []) as ManagedDocumentVersion[]
}

export async function getManagedDocStats(hospitalId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('managed_documents')
    .select('doc_type, status')
    .eq('hospital_id', hospitalId)

  if (error || !data) return { total: 0, byStatus: {} as Record<string, number>, byType: {} as Record<string, number> }

  const byStatus: Record<string, number> = {}
  const byType:   Record<string, number> = {}
  for (const row of data) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1
    byType[row.doc_type] = (byType[row.doc_type] ?? 0) + 1
  }
  return { total: data.length, byStatus, byType }
}
