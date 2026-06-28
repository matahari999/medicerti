export type DataGoKrResultCode = '00' | '11' | '12' | '20' | '21' | '22' | '30' | '99'

export interface DataGoKrResponseHeader {
  resultCode: DataGoKrResultCode
  resultMsg: string
}

export interface DataGoKrResponseBody<T> {
  items: T[] | null
  numOfRows: number
  pageNo: number
  totalCount: number
}

export interface DataGoKrResponse<T> {
  response: {
    header: DataGoKrResponseHeader
    body: DataGoKrResponseBody<T>
  }
}

export interface DataGoKrError {
  code: string
  message: string
  detail?: unknown
}

// ============================
// 건강보험심사평가원_병원정보서비스 (HIRA Hospital Info)
// ============================

export interface HiraHospitalItem {
  ykiho: string
  yadmNm: string
  hospTyTpCd: string
  hospTyTpNm: string
  addr: string
  telno: string | null
  bedCnt: string | null
  sidoCd: string
  sgguCd: string
  emdongNm: string | null
  drCnt: string | null
  intnCnt: string | null
  resdntCnt: string | null
  estbDd: string | null
  clScd: string
  clCd: string
}

// ============================
// 병원평가정보서비스 (Hospital Evaluation Results)
// ============================

export interface HospitalEvaluationItem {
  ykiho: string
  hospNm: string
  evlYr: string
  totScor: string | null
  totGrd: string | null
  dom1Scor: string | null
  dom1Grd: string | null
  dom2Scor: string | null
  dom2Grd: string | null
  dom3Scor: string | null
  dom3Grd: string | null
  dom4Scor: string | null
  dom4Grd: string | null
}

// ============================
// 내부 표준 스키마 (정규화 결과)
// ============================

export interface NormalizedHospital {
  externalId: string
  name: string
  typeCode: string
  typeName: string
  address: string
  phone: string | null
  bedCount: number | null
  regionCode: string
  districtCode: string
  doctorCount: number | null
  nurseCount: number | null
  residentCount: number | null
  establishedDate: string | null
  source: string
  rawData: Record<string, unknown>
}

export interface NormalizedEvaluation {
  externalId: string
  hospitalName: string
  evaluationYear: string
  totalScore: number | null
  totalGrade: string | null
  domainScores: {
    patientSafety: number | null
    patientCentered: number | null
    governance: number | null
    qualityImprovement: number | null
  }
  source: string
  rawData: Record<string, unknown>
}

export const DEFAULT_NORMALIZED_HOSPITAL: Omit<NormalizedHospital, 'externalId' | 'name' | 'typeCode' | 'typeName' | 'address' | 'regionCode' | 'districtCode' | 'source' | 'rawData'> = {
  phone: null,
  bedCount: null,
  doctorCount: null,
  nurseCount: null,
  residentCount: null,
  establishedDate: null,
}

export const DEFAULT_NORMALIZED_EVALUATION: Omit<NormalizedEvaluation, 'externalId' | 'hospitalName' | 'evaluationYear' | 'source' | 'rawData'> = {
  totalScore: null,
  totalGrade: null,
  domainScores: {
    patientSafety: null,
    patientCentered: null,
    governance: null,
    qualityImprovement: null,
  },
}

// ============================
// Field Map (외부 필드명 → 내부 표준 필드명)
// ============================

export interface FieldMapEntry {
  externalName: string
  internalName: string
  transform?: (value: unknown) => unknown
}

export type FieldMap = FieldMapEntry[]

export interface NormalizerResult<T> {
  success: boolean
  data: T | null
  warnings: string[]
  error?: string
}

export interface SyncResult {
  source: string
  totalFetched: number
  normalized: number
  upserted: number
  failed: number
  errors: string[]
  duration: number
}

// ============================
// API 엔드포인트 설정
// ============================

export interface DataGoKrEndpointConfig {
  baseUrl: string
  serviceKey: string
  defaultParams: Record<string, string>
}

export const ENDPOINTS = {
  HOSPITAL_INFO: {
    baseUrl: 'https://apis.data.go.kr/B552657/HsptlAsembySttusInfoService',
    endpoint: '/getHsptlList',
  },
  EVALUATION_RESULTS: {
    baseUrl: 'https://apis.data.go.kr/B552657/HsptlEvlInfoService',
    endpoint: '/getHsptlEvlList',
  },
} as const

export const DATA_GOKR_RESULT_CODES: Record<DataGoKrResultCode, string> = {
  '00': '정상 처리',
  '11': '데이터 없음',
  '12': 'HTTP 오류',
  '20': '서비스 키 오류',
  '21': '만료된 서비스 키',
  '22': '등록되지 않은 서비스 키',
  '30': '데이터베이스 오류',
  '99': '알 수 없는 오류',
}
