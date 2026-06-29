'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import {
  recordAcknowledgment,
  getAcknowledgmentsByHospital,
  getAcknowledgmentStats,
  getRegulationsForAcknowledgment,
  deleteAcknowledgment,
  getAcknowledgedEmployeesByDocument,
} from '@/lib/services/acknowledgment.service'

export async function submitAcknowledgment(
  hospitalId: string,
  documentId: string,
  documentType: string,
  documentTitle: string,
  employeeName: string,
  employeeDepartment?: string,
  employeeRole?: string
) {
  await requireAuth()
  await recordAcknowledgment(hospitalId, documentId, documentType, documentTitle, employeeName, employeeDepartment, employeeRole)
  revalidatePath(`/hospitals/${hospitalId}/acknowledgments`)
}

export async function fetchAcknowledgments(hospitalId: string) {
  await requireAuth()
  return getAcknowledgmentsByHospital(hospitalId)
}

export async function fetchAcknowledgmentStats(hospitalId: string) {
  await requireAuth()
  return getAcknowledgmentStats(hospitalId)
}

export async function fetchRegulationsForAck(hospitalId: string) {
  await requireAuth()
  return getRegulationsForAcknowledgment(hospitalId)
}

export async function removeAcknowledgment(id: string, hospitalId: string) {
  await requireAuth()
  await deleteAcknowledgment(id)
  revalidatePath(`/hospitals/${hospitalId}/acknowledgments`)
}

export async function fetchAcknowledgedEmployees(hospitalId: string, documentId: string) {
  await requireAuth()
  return getAcknowledgedEmployeesByDocument(hospitalId, documentId)
}
