import type {
  HiraHospitalItem,
  HospitalEvaluationItem,
  FieldMap,
  NormalizedHospital,
  NormalizedEvaluation,
  NormalizerResult,
} from './data-gokr.types'

export const HOSPITAL_FIELD_MAP: FieldMap = [
  { externalName: 'ykiho',     internalName: 'externalId' },
  { externalName: 'yadmNm',    internalName: 'name' },
  { externalName: 'hospTyTpCd', internalName: 'typeCode' },
  { externalName: 'hospTyTpNm', internalName: 'typeName' },
  { externalName: 'addr',      internalName: 'address' },
  { externalName: 'telno',     internalName: 'phone' },
  { externalName: 'bedCnt',    internalName: 'bedCount', transform: (v) => (v ? Number(v) : null) },
  { externalName: 'sidoCd',    internalName: 'regionCode' },
  { externalName: 'sgguCd',    internalName: 'districtCode' },
  { externalName: 'drCnt',     internalName: 'doctorCount', transform: (v) => (v ? Number(v) : null) },
  { externalName: 'intnCnt',   internalName: 'nurseCount', transform: (v) => (v ? Number(v) : null) },
  { externalName: 'resdntCnt', internalName: 'residentCount', transform: (v) => (v ? Number(v) : null) },
  { externalName: 'estbDd',    internalName: 'establishedDate' },
]

export const EVALUATION_FIELD_MAP: FieldMap = [
  { externalName: 'ykiho',    internalName: 'externalId' },
  { externalName: 'hospNm',   internalName: 'hospitalName' },
  { externalName: 'evlYr',    internalName: 'evaluationYear' },
  { externalName: 'totScor',  internalName: 'totalScore', transform: (v) => (v ? Number(v) : null) },
  { externalName: 'totGrd',   internalName: 'totalGrade' },
  { externalName: 'dom1Scor', internalName: 'dom1Score', transform: (v) => (v ? Number(v) : null) },
  { externalName: 'dom1Grd',  internalName: 'dom1Grade' },
  { externalName: 'dom2Scor', internalName: 'dom2Score', transform: (v) => (v ? Number(v) : null) },
  { externalName: 'dom2Grd',  internalName: 'dom2Grade' },
  { externalName: 'dom3Scor', internalName: 'dom3Score', transform: (v) => (v ? Number(v) : null) },
  { externalName: 'dom3Grd',  internalName: 'dom3Grade' },
  { externalName: 'dom4Scor', internalName: 'dom4Score', transform: (v) => (v ? Number(v) : null) },
  { externalName: 'dom4Grd',  internalName: 'dom4Grade' },
]

function mapFields<T>(
  source: Record<string, unknown>,
  fieldMap: FieldMap,
): Partial<T> {
  const result: Record<string, unknown> = {}
  for (const entry of fieldMap) {
    const raw = source[entry.externalName]
    result[entry.internalName] = entry.transform ? entry.transform(raw) : (raw ?? null)
  }
  return result as Partial<T>
}

export function normalizeHospital(
  item: HiraHospitalItem,
): NormalizerResult<NormalizedHospital> {
  const warnings: string[] = []
  const raw = item as unknown as Record<string, unknown>

  if (!raw.ykiho || !raw.yadmNm) {
    return { success: false, data: null, warnings, error: '필수 필드 누락: ykiho 또는 yadmNm' }
  }

  const mapped = mapFields<NormalizedHospital>(raw, HOSPITAL_FIELD_MAP)

  const missingOptional = HOSPITAL_FIELD_MAP
    .filter((e) => (raw[e.externalName] === undefined || raw[e.externalName] === null) && e.internalName !== 'externalId' && e.internalName !== 'name')
    .map((e) => e.internalName)

  if (missingOptional.length > 0) {
    warnings.push(`선택 필드 누락: ${missingOptional.join(', ')}`)
  }

  return {
    success: true,
    data: {
      externalId: mapped.externalId ?? '',
      name: mapped.name ?? '',
      typeCode: mapped.typeCode ?? '',
      typeName: mapped.typeName ?? '',
      address: mapped.address ?? '',
      phone: mapped.phone ?? null,
      bedCount: mapped.bedCount ?? null,
      regionCode: mapped.regionCode ?? '',
      districtCode: mapped.districtCode ?? '',
      doctorCount: mapped.doctorCount ?? null,
      nurseCount: mapped.nurseCount ?? null,
      residentCount: mapped.residentCount ?? null,
      establishedDate: mapped.establishedDate ?? null,
      source: 'hira_hospital_info',
      rawData: raw,
    },
    warnings,
  }
}

export function normalizeEvaluation(
  item: HospitalEvaluationItem,
): NormalizerResult<NormalizedEvaluation> {
  const warnings: string[] = []
  const raw = item as unknown as Record<string, unknown>

  if (!raw.ykiho) {
    return { success: false, data: null, warnings, error: '필수 필드 누락: ykiho' }
  }

  const mapped = mapFields<Record<string, unknown>>(raw, EVALUATION_FIELD_MAP)

  if (!mapped.evaluationYear) {
    warnings.push('평가년도 누락')
  }

  return {
    success: true,
    data: {
      externalId: (mapped.externalId as string) ?? '',
      hospitalName: (mapped.hospitalName as string) ?? '',
      evaluationYear: (mapped.evaluationYear as string) ?? '',
      totalScore: (mapped.totalScore as number) ?? null,
      totalGrade: (mapped.totalGrade as string) ?? null,
      domainScores: {
        patientSafety: (mapped.dom1Score as number) ?? null,
        patientCentered: (mapped.dom2Score as number) ?? null,
        governance: (mapped.dom3Score as number) ?? null,
        qualityImprovement: (mapped.dom4Score as number) ?? null,
      },
      source: 'hira_evaluation',
      rawData: raw,
    },
    warnings,
  }
}

export function applyFallbackHospital(value: NormalizedHospital): NormalizedHospital {
  return {
    ...value,
    phone: value.phone ?? null,
    bedCount: value.bedCount ?? null,
    doctorCount: value.doctorCount ?? null,
    nurseCount: value.nurseCount ?? null,
    residentCount: value.residentCount ?? null,
    establishedDate: value.establishedDate ?? null,
  }
}
