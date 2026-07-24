// 규정집 생성 시 기준 하나에 대한 근거 원문을 reference_chunks에서 모아 온다.
//
// 검색 순서(정확한 것부터):
//   1) 기준번호 정확매칭 — 업로드한 병원 규정집이 "규정번호 7.1"을 그대로 달고 있으므로 가장 신뢰도가 높다
//   2) 의미검색(pgvector) — 사례집·지침처럼 번호 체계가 다른 자료를 보완
//   3) 같은 장(chapter) 내 청크 — 위 둘로 부족할 때
// 한 소스가 프롬프트를 독점하지 않도록 소스별 상한을 둔다.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { embedText } from '@/lib/rag/embedding'

const DEFAULT_MAX_CHARS = 20000
const PER_SOURCE_MAX_CHARS = 12000
const SEMANTIC_TOP_K = 6
// 정규화된 임베딩의 코사인 유사도. 이 아래는 주제가 어긋난 청크라 근거로 넣지 않는다.
// (0.6이면 감염 규정에 '만족도 조사' 청크가 0.758로 섞였다 — 문서 표지·개정이력이 서로 닮은 탓.)
const SEMANTIC_SCORE_MIN = 0.72
// 기준번호가 같아도 제목이 전혀 다르면 다른 번호 체계의 자료다(아래 TITLE_GATE 주석 참고)
const TITLE_SIMILARITY_MIN = 0.2

/**
 * TITLE_GATE — 자료마다 장·기준 번호 체계가 다르다는 점이 이 검색의 핵심 함정이다.
 *   4주기 요양병원 기준: 7장 = 감염관리
 *   2021년 규정집 합본(3주기): 7장 = 질 향상 및 환자안전
 *   기본 인증기준 사례집:      7.1 = 환자안전 및 의료 질 향상 운영체계
 * 번호만 믿고 매칭하면 "감염관리 규정"에 "질향상" 원문이 근거로 들어간다.
 * 그래서 번호가 같아도 제목이 최소한으로도 겹치지 않으면 정확매칭에서 제외하고, 의미검색에 맡긴다.
 */
function normalizeForCompare(s: string): string {
  return s.replace(/[^가-힣a-zA-Z0-9]/g, '')
}

function bigrams(s: string): Set<string> {
  const out = new Set<string>()
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2))
  return out
}

function titleSimilarity(a: string, b: string): number {
  const na = normalizeForCompare(a)
  const nb = normalizeForCompare(b)
  if (!na || !nb) return 0
  if (na.includes(nb) || nb.includes(na)) return 1
  const ga = bigrams(na)
  const gb = bigrams(nb)
  if (ga.size === 0 || gb.size === 0) return 0
  let shared = 0
  for (const g of ga) if (gb.has(g)) shared++
  // 합집합 기준(자카드). min 기준으로 하면 '체계' 같은 흔한 조각 하나로도 통과해버린다.
  return shared / (ga.size + gb.size - shared)
}

export type MatchedBy = 'reg_code' | 'semantic' | 'chapter'

export interface ReferenceHit {
  id: string
  sourceKind: string
  sourceTitle: string
  regCode: string | null
  regTitle: string | null
  chapterNo: number | null
  chapterTitle: string | null
  pageFrom: number | null
  pageTo: number | null
  content: string
  matchedBy: MatchedBy
  score: number
}

/** 관리자에게만 보여줄 출처 정보 */
export interface SourceRef {
  sourceTitle: string
  sourceKind: string
  regCode: string | null
  regTitle: string | null
  pageFrom: number | null
  pageTo: number | null
  matchedBy: MatchedBy
  chars: number
}

interface ChunkRow {
  id: string
  source_kind: string
  source_title: string
  reg_code: string | null
  reg_title: string | null
  chapter_no: number | null
  chapter_title: string | null
  page_from: number | null
  page_to: number | null
  content: string
  score?: number
}

function serviceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function toHit(row: ChunkRow, matchedBy: MatchedBy, score: number): ReferenceHit {
  return {
    id: row.id,
    sourceKind: row.source_kind,
    sourceTitle: row.source_title,
    regCode: row.reg_code,
    regTitle: row.reg_title,
    chapterNo: row.chapter_no,
    chapterTitle: row.chapter_title,
    pageFrom: row.page_from,
    pageTo: row.page_to,
    content: row.content,
    matchedBy,
    score,
  }
}

export async function findReferences(params: {
  hospitalType: string
  regCode?: string | null
  chapterNo?: number | null
  /** 기준 제목만 (예: '감염예방·관리체계') — 번호 체계 검증에 쓰므로 장 제목과 섞지 말 것 */
  itemTitle: string
  /** 장 제목만 (예: '감염관리') */
  chapterTitle?: string
  summary?: string
  maxChars?: number
}): Promise<{ hits: ReferenceHit[]; sourceRefs: SourceRef[] }> {
  const supabase = serviceClient()
  if (!supabase) return { hits: [], sourceRefs: [] }

  const maxChars = params.maxChars ?? DEFAULT_MAX_CHARS
  const collected = new Map<string, ReferenceHit>()

  // 1) 기준번호 정확매칭 (해당 종별 + 종별 공통). 단, 번호 체계가 다른 자료를 걸러내기 위해 제목 유사도로 검증한다.
  if (params.regCode) {
    const { data } = await supabase
      .from('reference_chunks')
      .select('id, source_kind, source_title, reg_code, reg_title, chapter_no, chapter_title, page_from, page_to, content')
      .eq('reg_code', params.regCode)
      .or(`hospital_type.eq.${params.hospitalType},hospital_type.is.null`)
      .limit(20)
    for (const row of (data ?? []) as ChunkRow[]) {
      const sim = Math.max(
        titleSimilarity(row.reg_title ?? '', params.itemTitle),
        params.chapterTitle && row.chapter_title ? titleSimilarity(row.chapter_title, params.chapterTitle) : 0
      )
      // 제목이 아예 겹치지 않으면 다른 주기·다른 기준집의 같은 번호다 — 근거로 쓰면 안 된다
      if (sim < TITLE_SIMILARITY_MIN) continue
      collected.set(row.id, toHit(row, 'reg_code', 1 + sim))
    }
  }

  // 2) 의미검색
  const apiKey = process.env.GEMINI_API_KEY
  if (apiKey) {
    try {
      const query = [params.chapterTitle ?? '', params.itemTitle, params.summary ?? ''].filter(Boolean).join(' ')
      const embedding = await embedText(query, apiKey)
      const { data } = await supabase.rpc('match_reference_chunks', {
        query_embedding: embedding,
        hospital_type_filter: params.hospitalType,
        source_kind_filter: '',
        match_count: SEMANTIC_TOP_K,
      })
      for (const row of (data ?? []) as ChunkRow[]) {
        if ((row.score ?? 0) < SEMANTIC_SCORE_MIN) continue
        // 표지·목차 청크는 규정 본문이 아니므로 근거에서 뺀다(문서 앞부분끼리 임베딩이 닮아 잘못 걸린다)
        if (row.reg_title?.startsWith('문서 앞부분')) continue
        if (!collected.has(row.id)) collected.set(row.id, toHit(row, 'semantic', row.score ?? 0))
      }
    } catch (e) {
      console.error('[referenceSearch] 의미검색 실패:', e)
    }
  }

  // 3) 같은 장 보완
  if (collected.size === 0 && params.chapterNo != null) {
    const { data } = await supabase
      .from('reference_chunks')
      .select('id, source_kind, source_title, reg_code, reg_title, chapter_no, chapter_title, page_from, page_to, content')
      .eq('chapter_no', params.chapterNo)
      .or(`hospital_type.eq.${params.hospitalType},hospital_type.is.null`)
      .limit(12)
    for (const row of (data ?? []) as ChunkRow[]) {
      // 장 번호도 주기마다 뜻이 다르므로 장 제목이 겹칠 때만 쓴다
      if (
        row.chapter_title &&
        params.chapterTitle &&
        titleSimilarity(row.chapter_title, params.chapterTitle) < TITLE_SIMILARITY_MIN
      ) {
        continue
      }
      collected.set(row.id, toHit(row, 'chapter', 0.5))
    }
  }

  // 정확매칭 → 의미검색 순으로 정렬하고 글자수 예산 안에서 자른다
  const rank: Record<MatchedBy, number> = { reg_code: 0, semantic: 1, chapter: 2 }
  const ordered = [...collected.values()].sort(
    (a, b) => rank[a.matchedBy] - rank[b.matchedBy] || b.score - a.score
  )

  const hits: ReferenceHit[] = []
  const perSource = new Map<string, number>()
  let total = 0
  for (const hit of ordered) {
    const used = perSource.get(hit.sourceTitle) ?? 0
    if (used >= PER_SOURCE_MAX_CHARS) continue
    if (total + hit.content.length > maxChars) continue
    hits.push(hit)
    perSource.set(hit.sourceTitle, used + hit.content.length)
    total += hit.content.length
  }

  const sourceRefs: SourceRef[] = hits.map((h) => ({
    sourceTitle: h.sourceTitle,
    sourceKind: h.sourceKind,
    regCode: h.regCode,
    regTitle: h.regTitle,
    pageFrom: h.pageFrom,
    pageTo: h.pageTo,
    matchedBy: h.matchedBy,
    chars: h.content.length,
  }))

  return { hits, sourceRefs }
}

/** 프롬프트에 넣을 근거 블록 문자열 */
export function formatReferenceBlock(hits: ReferenceHit[]): string {
  if (hits.length === 0) return ''
  return hits
    .map((h, i) => {
      const label = [
        `근거 ${i + 1}`,
        h.sourceTitle,
        h.regCode ? `${h.regCode} ${h.regTitle ?? ''}`.trim() : h.regTitle ?? '',
        h.pageFrom ? `p.${h.pageFrom}${h.pageTo && h.pageTo !== h.pageFrom ? `-${h.pageTo}` : ''}` : '',
      ]
        .filter(Boolean)
        .join(' | ')
      return `[${label}]\n${h.content}`
    })
    .join('\n\n---\n\n')
}
