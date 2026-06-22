'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { hospitalSchema } from '@/lib/validators/hospital'
import {
  createHospital,
  updateHospital,
  deleteHospital,
} from '@/lib/services/hospital.service'
import { requireAuth, requireHospitalMember } from '@/lib/auth'

export type HospitalState = {
  error?: string
  success?: boolean
  fieldErrors?: Record<string, string[]>
}

export async function createHospitalAction(
  _prev: HospitalState | null,
  formData: FormData
): Promise<HospitalState> {
  await requireAuth()

  const raw = {
    name:                 formData.get('name'),
    license_number:       formData.get('license_number') || null,
    type:                 formData.get('type') || 'long_term_care',
    bed_count:            formData.get('bed_count') || null,
    region:               formData.get('region') || null,
    address:              formData.get('address') || null,
    phone:                formData.get('phone') || null,
    accreditation_cycle:  formData.get('accreditation_cycle') || 1,
    accreditation_start:  formData.get('accreditation_start') || null,
    accreditation_target: formData.get('accreditation_target') || null,
  }

  const parsed = hospitalSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.')
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return { error: parsed.error.errors[0].message, fieldErrors }
  }

  try {
    const hospital = await createHospital(parsed.data)
    revalidatePath('/hospitals')
    redirect(`/hospitals/${hospital.id}`)
  } catch (e) {
    return { error: e instanceof Error ? e.message : '병원 생성에 실패했습니다' }
  }
}

export async function updateHospitalAction(
  hospitalId: string,
  _prev: HospitalState | null,
  formData: FormData
): Promise<HospitalState> {
  await requireHospitalMember(hospitalId, 'manager')

  const raw = {
    name:                 formData.get('name'),
    license_number:       formData.get('license_number') || null,
    type:                 formData.get('type') || 'long_term_care',
    bed_count:            formData.get('bed_count') || null,
    region:               formData.get('region') || null,
    address:              formData.get('address') || null,
    phone:                formData.get('phone') || null,
    accreditation_cycle:  formData.get('accreditation_cycle') || 1,
    accreditation_start:  formData.get('accreditation_start') || null,
    accreditation_target: formData.get('accreditation_target') || null,
  }

  const parsed = hospitalSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.')
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return { error: parsed.error.errors[0].message, fieldErrors }
  }

  try {
    await updateHospital(hospitalId, parsed.data)
    revalidatePath(`/hospitals/${hospitalId}`)
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : '저장에 실패했습니다' }
  }
}

export async function deleteHospitalAction(hospitalId: string) {
  await requireHospitalMember(hospitalId, 'admin')
  await deleteHospital(hospitalId)
  revalidatePath('/hospitals')
  redirect('/hospitals')
}
