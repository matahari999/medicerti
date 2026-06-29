'use server'

import {
  getAccreditationAreas,
  getChaptersByArea,
  getEntriesByChapter,
  getAccreditationTree,
  getSurveyItemByCode,
  getChaptersByHospitalType,
} from '@/lib/services/criteria.service'
import type { AreaTree } from '@/types/database.types'

export async function fetchAccreditationAreas() {
  return getAccreditationAreas()
}

export async function fetchAccreditationTree(hospitalType?: string): Promise<AreaTree[]> {
  return getAccreditationTree(hospitalType)
}

export async function fetchChaptersByHospitalType(hospitalType: string) {
  return getChaptersByHospitalType(hospitalType)
}

export async function fetchSurveyItem(code: string) {
  return getSurveyItemByCode(code)
}
