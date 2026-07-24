// 참고자료 PDF/텍스트를 규정번호 단위 청크로 잘라 reference_chunks에 적재하기 위한 파싱 로직.
//
// 병원 규정집(무지개요양병원 4주기)은 규정 하나가 이렇게 시작한다:
//   감염예방 · 관리 체계              ← 규정 제목(헤더표 바로 윗줄)
//   규 정 번 호 7.1제  정  일2013-07-31
//   ▣ 제 1 조 목적 (Purpose) ...
// 인증원 규정 사례집은 헤더 토큰이 다르다:
//   정확한 환자 확인 및 의사소통 규정
//   문  서  번  호기본 인증 1.1.제정일0000. 00. 00.
// 이 번호 라인을 경계로 잘라야 나중에 기준번호(7.1)로 되찾을 수 있다.
// 번호 헤더가 없는 문서(인증기준집 등)는 길이 기준으로 자른다.
import pdfParse from 'pdf-parse'

export const MAX_CHUNK_CHARS = 6000
/**
 * 임베딩 입력 상한 — 본문 전체가 아니라 앞부분 + 제목 메타로 충분하다(원문은 DB에 그대로 남는다).
 * 무료 등급 임베딩 API는 분당 토큰 할당량이 빡빡해서 길게 넣으면 429가 쏟아진다.
 */
export const EMBED_INPUT_CHARS = 1500
/** 임베딩 호출 간격(ms). 이보다 빠르게 부르면 분당 할당량에 걸린다. */
export const EMBED_DELAY_MS = 700
const FALLBACK_CHUNK_CHARS = 3500
const MAX_TITLE_CHARS = 40

export type HospitalTypeTag = 'long_term_care' | 'psychiatric' | null

export interface ParsedChunk {
  regCode: string | null
  regTitle: string | null
  chapterNo: number | null
  chapterTitle: string | null
  pageFrom: number | null
  pageTo: number | null
  content: string
}

interface Line {
  text: string
  page: number | null
}

// "규 정 번 호 7.1" / "문  서  번  호기본 인증 1.1." 처럼 자간·접두어가 섞인 형태까지 잡는다.
const REG_HEADER_RES = [
  /규\s*정\s*번\s*호\s*([0-9]{1,2}\.[0-9]{1,2}(?:\.[0-9]{1,2})?)/,
  /문\s*서\s*번\s*호\s*[^0-9\n]{0,12}([0-9]{1,2}\.[0-9]{1,2}(?:\.[0-9]{1,2})?)/,
]
const CHAPTER_TITLE_RE = /제\s*([0-9]{1,2})\s*장\s*([^_\d]*)/

function matchRegHeader(text: string): string | null {
  for (const re of REG_HEADER_RES) {
    const m = re.exec(text)
    if (m) return m[1].replace(/\.$/, '')
  }
  return null
}

/** PDF를 페이지별 텍스트 배열로 추출한다. 페이지 경계를 알아야 출처에 쪽수를 적을 수 있다. */
export async function extractPdfPages(buffer: Buffer): Promise<string[]> {
  const pages: string[] = []
  await pdfParse(buffer, {
    pagerender: (async (pageData: {
      getTextContent: (o: object) => Promise<{ items: Array<{ str: string; transform: number[] }> }>
    }) => {
      const tc = await pageData.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false })
      let lastY = -1
      let text = ''
      for (const item of tc.items) {
        if (lastY !== -1 && lastY !== item.transform[5]) text += '\n'
        text += item.str
        lastY = item.transform[5]
      }
      pages.push(text)
      return text
    }) as unknown as (pageData: unknown) => string,
  })
  return pages
}

/** 문서 제목에서 장 번호·장 제목을 뽑는다("제7장 감염관리_250810" → 7 / 감염관리). */
export function parseChapterFromTitle(title: string): { chapterNo: number | null; chapterTitle: string | null } {
  const m = CHAPTER_TITLE_RE.exec(title)
  if (!m) return { chapterNo: null, chapterTitle: null }
  const chapterTitle = m[2].replace(/[_\s]+$/, '').trim()
  return { chapterNo: Number(m[1]), chapterTitle: chapterTitle || null }
}

/**
 * 본문 키워드로 병원 종별을 추정한다. 어느 쪽도 뚜렷하지 않으면 null(종별 공통).
 * 업로드 시 관리자가 직접 지정하면 그 값이 우선한다.
 */
export function detectHospitalType(text: string): HospitalTypeTag {
  const sample = text.slice(0, 60000)
  const nursing = (sample.match(/요양병원/g) ?? []).length
  const psychiatric = (sample.match(/정신의료기관|정신병원|정신건강의학과/g) ?? []).length
  if (nursing === 0 && psychiatric === 0) return null
  if (nursing >= psychiatric * 2) return 'long_term_care'
  if (psychiatric >= nursing * 2) return 'psychiatric'
  return null
}

/** 긴 규정은 문단 경계에서 여러 청크로 나눈다(검색 정밀도 + 임베딩 입력 길이 제한). */
function splitLong(content: string, max: number): string[] {
  if (content.length <= max) return [content]
  const paragraphs = content.split(/\n(?=\s*(?:▣|제\s*[0-9]+\s*조|[0-9]+\.|가\.))/)
  const merged: string[] = []
  let current = ''
  for (const p of paragraphs) {
    if (current && current.length + p.length > max) {
      merged.push(current.trim())
      current = p
    } else {
      current += (current ? '\n' : '') + p
    }
  }
  if (current.trim()) merged.push(current.trim())
  // 문단 경계로도 안 쪼개지는 덩어리(표 등)는 강제 분할
  return merged.flatMap((c) =>
    c.length <= max * 1.5
      ? [c]
      : Array.from({ length: Math.ceil(c.length / max) }, (_, i) => c.slice(i * max, (i + 1) * max))
  )
}

// Postgres text 컬럼은 NUL(\u0000)을 저장할 수 없다 — PDF 추출본에 종종 섞여 들어온다.
function sanitize(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
}

function buildChunk(
  lines: Line[],
  meta: { regCode: string | null; regTitle: string | null; chapterNo: number | null; chapterTitle: string | null }
): ParsedChunk[] {
  const body = sanitize(lines.map((l) => l.text).join('\n')).trim()
  if (!body) return []
  const pageNums = lines.map((l) => l.page).filter((p): p is number => p != null)
  const pageFrom = pageNums.length ? Math.min(...pageNums) : null
  const pageTo = pageNums.length ? Math.max(...pageNums) : null
  return splitLong(body, MAX_CHUNK_CHARS).map((content) => ({ ...meta, pageFrom, pageTo, content }))
}

function chunkLines(lines: Line[], docTitle: string): ParsedChunk[] {
  const { chapterNo: titleChapter, chapterTitle } = parseChapterFromTitle(docTitle)

  const boundaries: Array<{ index: number; regCode: string; regTitle: string | null }> = []
  lines.forEach((line, i) => {
    const regCode = matchRegHeader(line.text)
    if (!regCode) return
    // 직전 비어있지 않은 줄이 규정 제목
    let regTitle: string | null = null
    for (let j = i - 1; j >= 0 && j >= i - 4; j--) {
      const t = lines[j].text.trim()
      if (!t) continue
      if (t.length <= MAX_TITLE_CHARS && !matchRegHeader(t)) regTitle = t
      break
    }
    boundaries.push({ index: i, regCode, regTitle })
  })

  const chunks: ParsedChunk[] = []

  if (boundaries.length > 0) {
    // 첫 규정 앞의 표지·목차도 한 청크로 남긴다(개정 이력 등이 들어있음)
    if (boundaries[0].index > 0) {
      const head = lines.slice(0, boundaries[0].index)
      const headText = head.map((l) => l.text).join('\n').trim()
      if (headText.length > 200) {
        chunks.push(
          ...buildChunk(head, {
            regCode: null,
            regTitle: '문서 앞부분(표지·목차)',
            chapterNo: titleChapter,
            chapterTitle,
          }).slice(0, 1)
        )
      }
    }

    boundaries.forEach((b, i) => {
      // 제목 줄부터 포함되도록 한 줄 앞에서 시작
      const start = b.regTitle && b.index > 0 ? b.index - 1 : b.index
      const end = i + 1 < boundaries.length ? boundaries[i + 1].index - 1 : lines.length - 1
      const chapterFromCode = Number(b.regCode.split('.')[0])
      chunks.push(
        ...buildChunk(lines.slice(start, end + 1), {
          regCode: b.regCode,
          regTitle: b.regTitle,
          chapterNo: titleChapter ?? (Number.isFinite(chapterFromCode) ? chapterFromCode : null),
          chapterTitle,
        })
      )
    })
    return chunks
  }

  // 폴백: 번호 헤더가 없는 문서는 길이 기준으로 자른다
  let bucket: Line[] = []
  let size = 0
  for (const line of lines) {
    bucket.push(line)
    size += line.text.length + 1
    if (size >= FALLBACK_CHUNK_CHARS) {
      chunks.push(...buildChunk(bucket, { regCode: null, regTitle: null, chapterNo: titleChapter, chapterTitle }))
      bucket = []
      size = 0
    }
  }
  if (bucket.length) {
    chunks.push(...buildChunk(bucket, { regCode: null, regTitle: null, chapterNo: titleChapter, chapterTitle }))
  }
  return chunks
}

/**
 * 임베딩에 넣을 문자열. 본문만 넣으면 표 형태 헤더 때문에 유사도가 흐려지므로
 * 자료명·장·규정번호·규정제목을 앞에 붙인다.
 */
export function buildEmbedInput(chunk: ParsedChunk, sourceTitle: string): string {
  const head = [
    sourceTitle,
    chunk.chapterNo != null ? `제${chunk.chapterNo}장 ${chunk.chapterTitle ?? ''}`.trim() : '',
    chunk.regCode ? `${chunk.regCode} ${chunk.regTitle ?? ''}`.trim() : (chunk.regTitle ?? ''),
  ]
    .filter(Boolean)
    .join(' | ')
  return `${head}\n${chunk.content}`.slice(0, EMBED_INPUT_CHARS)
}

/** PDF 페이지 배열 → 청크 */
export function chunkPages(pages: string[], docTitle: string): ParsedChunk[] {
  const lines: Line[] = []
  pages.forEach((page, i) => {
    for (const text of page.split('\n')) lines.push({ text, page: i + 1 })
  })
  return chunkLines(lines, docTitle)
}

/** 순수 텍스트(코퍼스 raw_text.txt) → 청크. 페이지 번호는 없다. */
export function chunkPlainText(text: string, docTitle: string): ParsedChunk[] {
  return chunkLines(
    text.split('\n').map((t) => ({ text: t, page: null })),
    docTitle
  )
}
