// 인증기준 참고자료(PDF) 메타데이터 서비스.
// DB 테이블 대신 Storage의 documents/criteria/_index.json 파일을 인덱스로 사용한다
// (관리자 1인 운영이라 동시 쓰기 충돌 걱정이 없고, 마이그레이션 없이 동작).
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'documents'
const PREFIX = 'criteria'
const INDEX_PATH = `${PREFIX}/_index.json`

export type CriteriaDocCategory = 'standard' | 'etc'

export interface CriteriaDocMeta {
  path: string            // 예: criteria/uuid.pdf
  title: string
  category: CriteriaDocCategory
  originalFilename?: string
  uploadedAt?: string
}

export interface CriteriaDocListItem extends CriteriaDocMeta {
  sizeKb: number
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function readIndex(): Promise<CriteriaDocMeta[]> {
  const sb = serviceClient()
  const { data, error } = await sb.storage.from(BUCKET).download(INDEX_PATH)
  if (error || !data) return []
  try {
    return JSON.parse(await data.text()) as CriteriaDocMeta[]
  } catch {
    return []
  }
}

async function writeIndex(index: CriteriaDocMeta[]): Promise<void> {
  const sb = serviceClient()
  const blob = new Blob([JSON.stringify(index, null, 2)], { type: 'application/json' })
  const { error } = await sb.storage.from(BUCKET).upload(INDEX_PATH, blob, {
    contentType: 'application/json',
    upsert: true,
  })
  if (error) throw new Error(error.message)
}

// 인덱스 + 실제 스토리지 파일 목록을 병합해 반환.
// 인덱스에 없는 PDF는 '제목 미지정'으로라도 노출해 유실을 막는다.
export async function listCriteriaDocs(): Promise<CriteriaDocListItem[]> {
  const sb = serviceClient()
  const [index, { data: files }] = await Promise.all([
    readIndex(),
    sb.storage.from(BUCKET).list(PREFIX, { limit: 200 }),
  ])
  const metaByPath = new Map(index.map((m) => [m.path, m]))
  const result: CriteriaDocListItem[] = []
  for (const f of files ?? []) {
    if (!f.name.endsWith('.pdf')) continue
    const path = `${PREFIX}/${f.name}`
    const meta = metaByPath.get(path)
    result.push({
      path,
      title: meta?.title ?? `제목 미지정 (${f.name.slice(0, 8)})`,
      category: meta?.category ?? 'etc',
      originalFilename: meta?.originalFilename,
      uploadedAt: meta?.uploadedAt ?? f.created_at ?? undefined,
      sizeKb: Math.round(((f.metadata as { size?: number } | null)?.size ?? 0) / 1024),
    })
  }
  result.sort((a, b) => (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? ''))
  return result
}

export async function upsertCriteriaDoc(meta: CriteriaDocMeta): Promise<void> {
  const index = await readIndex()
  const i = index.findIndex((m) => m.path === meta.path)
  if (i >= 0) index[i] = { ...index[i], ...meta }
  else index.push(meta)
  await writeIndex(index)
}

export async function deleteCriteriaDoc(path: string): Promise<void> {
  if (!path.startsWith(`${PREFIX}/`) || path.includes('..')) throw new Error('잘못된 경로')
  const sb = serviceClient()
  const { error } = await sb.storage.from(BUCKET).remove([path])
  if (error) throw new Error(error.message)
  const index = await readIndex()
  await writeIndex(index.filter((m) => m.path !== path))
}

export async function signedUrlFor(path: string, expiresInSec = 3600): Promise<string | null> {
  if (!path.startsWith(`${PREFIX}/`) || path.includes('..')) return null
  const sb = serviceClient()
  const { data } = await sb.storage.from(BUCKET).createSignedUrl(path, expiresInSec)
  return data?.signedUrl ?? null
}
