// reference_chunks 적재/삭제 — 업로드 라우트와 재색인 라우트가 함께 쓴다.
// 서비스 롤 전용(테이블에 RLS 정책이 없어 일반 사용자 키로는 접근 자체가 막혀 있음).
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  extractPdfPages,
  chunkPages,
  detectHospitalType,
  buildEmbedInput,
  EMBED_DELAY_MS,
  type ParsedChunk,
} from '@/lib/referenceIngest'
import { embedTextWithRetry } from '@/lib/rag/embedding'

// 임베딩 API는 분당 할당량이 있어 동시 호출하면 대부분 429가 난다 — 순차 + 간격이 유일하게 안정적이다
const EMBED_BATCH = 1

function serviceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export interface IndexResult {
  chunks: number
  embedded: number
  hospitalType: string | null
  pages: number
}

/**
 * 업로드된 참고자료 PDF 한 건을 청킹해 reference_chunks에 적재한다.
 * 같은 경로로 이미 색인된 청크는 지우고 새로 넣는다(재색인 = 멱등).
 */
export async function indexCriteriaPdf(params: {
  path: string
  title: string
  buffer: Buffer
  /** 관리자가 업로드 시 지정한 병원 종별. 'auto'면 본문에서 추정한다. */
  hospitalType?: string | null
}): Promise<IndexResult> {
  const supabase = serviceClient()
  const pages = await extractPdfPages(params.buffer)
  const fullText = pages.join('\n')
  const chunks = chunkPages(pages, params.title)

  // 'common' = 종별 공통(NULL) 명시, 'auto'/빈값 = 본문에서 추정
  const hospitalType =
    params.hospitalType === 'common'
      ? null
      : params.hospitalType && params.hospitalType !== 'auto'
        ? params.hospitalType
        : detectHospitalType(fullText)

  await deleteCriteriaChunks(params.path)
  if (chunks.length === 0) return { chunks: 0, embedded: 0, hospitalType, pages: pages.length }

  const embedded = await insertChunks(supabase, chunks, {
    sourceKind: 'uploaded_pdf',
    sourceId: params.path,
    sourceTitle: params.title,
    hospitalType,
  })

  return { chunks: chunks.length, embedded, hospitalType, pages: pages.length }
}

export async function deleteCriteriaChunks(path: string): Promise<void> {
  const supabase = serviceClient()
  await supabase.from('reference_chunks').delete().eq('source_kind', 'uploaded_pdf').eq('source_id', path)
}

/** 경로별 색인된 청크 수 — 어드민 화면에서 "색인됨/미색인" 표시에 쓴다. */
export async function countChunksBySource(): Promise<Record<string, number>> {
  const supabase = serviceClient()
  const { data } = await supabase
    .from('reference_chunks')
    .select('source_id')
    .eq('source_kind', 'uploaded_pdf')
    .limit(20000)
  const counts: Record<string, number> = {}
  for (const row of (data ?? []) as Array<{ source_id: string }>) {
    counts[row.source_id] = (counts[row.source_id] ?? 0) + 1
  }
  return counts
}

async function insertChunks(
  supabase: SupabaseClient,
  chunks: ParsedChunk[],
  meta: { sourceKind: string; sourceId: string; sourceTitle: string; hospitalType: string | null }
): Promise<number> {
  const apiKey = process.env.GEMINI_API_KEY
  let embedded = 0

  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const slice = chunks.slice(i, i + EMBED_BATCH)
    const rows = await Promise.all(
      slice.map(async (c) => {
        let embedding: number[] | null = null
        if (apiKey) {
          try {
            embedding = await embedTextWithRetry(buildEmbedInput(c, meta.sourceTitle), apiKey)
            embedded++
          } catch {
            // 임베딩 실패해도 청크 자체는 저장한다 — 기준번호 정확매칭으로는 계속 찾을 수 있다
          }
        }
        return {
          source_kind: meta.sourceKind,
          source_id: meta.sourceId,
          source_title: meta.sourceTitle,
          hospital_type: meta.hospitalType,
          chapter_no: c.chapterNo,
          chapter_title: c.chapterTitle,
          reg_code: c.regCode,
          reg_title: c.regTitle,
          page_from: c.pageFrom,
          page_to: c.pageTo,
          content: c.content,
          char_count: c.content.length,
          embedding,
        }
      })
    )
    const { error } = await supabase.from('reference_chunks').insert(rows)
    if (error) throw new Error(`청크 저장 실패: ${error.message}`)
    if (apiKey && i + EMBED_BATCH < chunks.length) {
      await new Promise((r) => setTimeout(r, EMBED_DELAY_MS))
    }
  }

  return embedded
}
