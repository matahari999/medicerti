import { createClient } from '@/lib/supabase/server'
import type {
  AccreditationArea,
  AccreditationChapter,
  AccreditationEntry,
  AccreditationCategory,
  AccreditationSurveyItem,
  AreaTree,
} from '@/types/database.types'

export async function getAccreditationAreas(): Promise<AccreditationArea[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('accreditation_areas')
    .select('*')
    .order('sort_order')
  return data ?? []
}

export async function getChaptersByArea(areaId: string): Promise<AccreditationChapter[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('accreditation_chapters')
    .select('*')
    .eq('area_id', areaId)
    .order('sort_order')
  return data ?? []
}

export async function getEntriesByChapter(chapterId: string): Promise<AccreditationEntry[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('accreditation_entries')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('sort_order')
  return data ?? []
}

export async function getCategoriesByEntry(entryId: string): Promise<AccreditationCategory[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('accreditation_categories')
    .select('*')
    .eq('entry_id', entryId)
    .order('sort_order')
  return data ?? []
}

export async function getSurveyItemsByEntry(entryId: string): Promise<AccreditationSurveyItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('accreditation_survey_items')
    .select('*')
    .eq('entry_id', entryId)
    .order('sort_order')
  return data ?? []
}

export async function getSurveyItemsByCategory(categoryId: string): Promise<AccreditationSurveyItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('accreditation_survey_items')
    .select('*')
    .eq('category_id', categoryId)
    .order('sort_order')
  return data ?? []
}

export async function getAccreditationTree(hospitalType?: string): Promise<AreaTree[]> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_accreditation_tree', {
    p_hospital_type: hospitalType ?? null,
  })
  return (data as AreaTree[]) ?? []
}

export async function getSurveyItemByCode(code: string): Promise<AccreditationSurveyItem | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('accreditation_survey_items')
    .select('*')
    .eq('code', code)
    .single()
  return data
}

export async function getChaptersByHospitalType(hospitalType: string): Promise<AccreditationChapter[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('accreditation_chapters')
    .select('*')
    .contains('hospital_types', [hospitalType])
    .order('sort_order')
  return data ?? []
}
