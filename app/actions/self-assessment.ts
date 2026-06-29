'use server'

import { revalidatePath } from 'next/cache'
import {
  createAssessmentSession,
  getAssessmentsByHospital,
  getAssessmentWithResults,
  updateResultStatus,
  getLatestAssessment,
} from '@/lib/services/self-assessment.service'
import { requireAuth } from '@/lib/auth'

export async function startAssessment(hospitalId: string) {
  await requireAuth()
  return createAssessmentSession(hospitalId)
}

export async function fetchAssessments(hospitalId: string) {
  await requireAuth()
  return getAssessmentsByHospital(hospitalId)
}

export async function fetchAssessmentDetail(assessmentId: string) {
  await requireAuth()
  return getAssessmentWithResults(assessmentId)
}

export async function updateItemStatus(
  resultId: string,
  status: string,
  notes?: string
) {
  await requireAuth()
  await updateResultStatus(resultId, status, notes)
  revalidatePath('/hospitals/[hospitalId]/criteria', 'page')
}

export async function fetchLatestAssessment(hospitalId: string) {
  await requireAuth()
  return getLatestAssessment(hospitalId)
}
