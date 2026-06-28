import type {
  DataGoKrResponse,
  DataGoKrEndpointConfig,
  HiraHospitalItem,
  HospitalEvaluationItem,
  DataGoKrError,
  SyncResult,
} from './data-gokr.types'
import { ENDPOINTS, DATA_GOKR_RESULT_CODES } from './data-gokr.types'

const DEFAULT_TIMEOUT = 15_000
const MAX_RETRIES = 2
const RETRY_DELAY = 1_000

export class DataGoKrClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly detail?: unknown,
  ) {
    super(message)
    this.name = 'DataGoKrClientError'
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function getEndpointConfig(endpointKey: keyof typeof ENDPOINTS): DataGoKrEndpointConfig {
  const serviceKey = process.env.PUBLIC_DATA_API_KEY
  if (!serviceKey) {
    throw new DataGoKrClientError('MISSING_API_KEY', 'PUBLIC_DATA_API_KEY 환경변수가 설정되지 않았습니다')
  }

  const ep = ENDPOINTS[endpointKey]
  return {
    baseUrl: ep.baseUrl,
    serviceKey,
    defaultParams: {
      serviceKey,
      numOfRows: '100',
      pageNo: '1',
      resultType: 'json',
    },
  }
}

async function fetchDataGoKr<T>(
  endpointKey: keyof typeof ENDPOINTS,
  additionalParams: Record<string, string> = {},
  signal?: AbortSignal,
): Promise<DataGoKrResponse<T>> {
  const config = getEndpointConfig(endpointKey)
  const endpoint = ENDPOINTS[endpointKey]

  const params = new URLSearchParams({
    ...config.defaultParams,
    ...additionalParams,
  })

  const url = `${endpoint.baseUrl}${endpoint.endpoint}?${params.toString()}`

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT)

      const response = await fetch(url, {
        signal: signal ?? controller.signal,
        headers: { Accept: 'application/json' },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new DataGoKrClientError(
          'HTTP_ERROR',
          `HTTP ${response.status}: ${response.statusText}`,
        )
      }

      const json = await response.json() as DataGoKrResponse<T>

      const resultCode = json?.response?.header?.resultCode
      if (!resultCode) {
        throw new DataGoKrClientError('INVALID_RESPONSE', '응답에 resultCode가 없습니다')
      }

      if (resultCode !== '00') {
        throw new DataGoKrClientError(
          `API_ERROR_${resultCode}`,
          DATA_GOKR_RESULT_CODES[resultCode] ?? `알 수 없는 오류 (${resultCode})`,
          json,
        )
      }

      return json
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (err instanceof DataGoKrClientError) {
        const dge = err as DataGoKrClientError
        if (dge.code === 'API_ERROR_11' || dge.code === 'MISSING_API_KEY') {
          throw err
        }
      }
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY * (attempt + 1))
      }
    }
  }

  throw lastError ?? new DataGoKrClientError('UNKNOWN', '알 수 없는 오류')
}

export async function fetchHospitalList(
  pageNo = 1,
  numOfRows = 100,
  signal?: AbortSignal,
): Promise<DataGoKrResponse<HiraHospitalItem>> {
  return fetchDataGoKr<HiraHospitalItem>('HOSPITAL_INFO', {
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
  }, signal)
}

export async function fetchEvaluationList(
  pageNo = 1,
  numOfRows = 100,
  evlYr?: string,
  signal?: AbortSignal,
): Promise<DataGoKrResponse<HospitalEvaluationItem>> {
  const params: Record<string, string> = {
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
  }
  if (evlYr) params.evlYr = evlYr

  return fetchDataGoKr<HospitalEvaluationItem>('EVALUATION_RESULTS', params, signal)
}

export async function fetchAllHospitals(
  onProgress?: (page: number, total: number) => void,
  signal?: AbortSignal,
): Promise<{ items: HiraHospitalItem[]; errors: DataGoKrError[] }> {
  const firstPage = await fetchHospitalList(1, 100, signal)
  const totalCount = firstPage.response.body.totalCount
  const items: HiraHospitalItem[] = firstPage.response.body.items ?? []
  const errors: DataGoKrError[] = []

  onProgress?.(1, totalCount)

  const totalPages = Math.ceil(totalCount / 100)
  for (let page = 2; page <= totalPages; page++) {
    try {
      const pageData = await fetchHospitalList(page, 100, signal)
      items.push(...(pageData.response.body.items ?? []))
      onProgress?.(page, totalCount)
    } catch (err) {
      errors.push({
        code: err instanceof DataGoKrClientError ? err.code : 'UNKNOWN',
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return { items, errors }
}

export async function fetchAllEvaluations(
  evlYr?: string,
  onProgress?: (page: number, total: number) => void,
  signal?: AbortSignal,
): Promise<{ items: HospitalEvaluationItem[]; errors: DataGoKrError[] }> {
  const firstPage = await fetchEvaluationList(1, 100, evlYr, signal)
  const totalCount = firstPage.response.body.totalCount
  const items: HospitalEvaluationItem[] = firstPage.response.body.items ?? []
  const errors: DataGoKrError[] = []

  onProgress?.(1, totalCount)

  const totalPages = Math.ceil(totalCount / 100)
  for (let page = 2; page <= totalPages; page++) {
    try {
      const pageData = await fetchEvaluationList(page, 100, evlYr, signal)
      items.push(...(pageData.response.body.items ?? []))
      onProgress?.(page, totalCount)
    } catch (err) {
      errors.push({
        code: err instanceof DataGoKrClientError ? err.code : 'UNKNOWN',
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return { items, errors }
}
