import { z } from 'zod'

export const hospitalSchema = z.object({
  name:                 z.string().min(2, '병원명은 2자 이상 입력해 주세요').max(100),
  license_number:       z.string().optional().nullable(),
  type:                 z.string().default('long_term_care'),
  bed_count:            z.coerce.number().int().positive().optional().nullable(),
  region:               z.string().optional().nullable(),
  address:              z.string().optional().nullable(),
  phone:                z.string().optional().nullable(),
  accreditation_cycle:  z.coerce.number().int().positive().default(1),
  accreditation_start:  z.string().optional().nullable(),
  accreditation_target: z.string().optional().nullable(),
})

export const inviteMemberSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  role:  z.enum(['admin', 'manager', 'viewer']),
})

export type HospitalInput      = z.infer<typeof hospitalSchema>
export type InviteMemberInput  = z.infer<typeof inviteMemberSchema>

export const REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
] as const
