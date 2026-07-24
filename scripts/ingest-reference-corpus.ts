// repo의 guidelines/ 원문(인증기준집·규정 사례집·표준지침서·2021 규정집 합본)을
// reference_chunks 테이블에 적재한다. 업로드 PDF는 앱의 업로드 라우트가 적재하므로 여기 대상이 아니다.
//
// 사용:
//   npx jiti scripts/ingest-reference-corpus.ts --dry     # 청크 통계만 출력
//   npx jiti scripts/ingest-reference-corpus.ts           # 실제 적재(기존 동일 source_id 행은 삭제 후 재적재)
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { chunkPlainText, buildEmbedInput, EMBED_DELAY_MS, type ParsedChunk } from '../lib/referenceIngest'
import { embedTextWithRetry } from '../lib/rag/embedding'

interface CorpusEntry {
  sourceId: string
  file: string
  title: string
  hospitalType: string | null
  sourceKind: 'guideline' | 'casebook' | 'regulation_book'
}

const CORPUS: CorpusEntry[] = [
  {
    sourceId: 'nursing-4th',
    file: 'guidelines/nursing-4th/raw_text.txt',
    title: '4주기 요양병원 인증기준 (Ver. 4.1)',
    hospitalType: 'long_term_care',
    sourceKind: 'guideline',
  },
  {
    sourceId: 'hospital-regulations-2021',
    file: 'guidelines/hospital-regulations-2021/raw_text.txt',
    title: '2021년 요양병원 규정집 합본 (비식별화)',
    hospitalType: 'long_term_care',
    sourceKind: 'regulation_book',
  },
  {
    sourceId: 'basic-1st',
    file: 'guidelines/basic-1st/raw_text.txt',
    title: '기본 인증기준 (Ver. 1.0)',
    hospitalType: null,
    sourceKind: 'guideline',
  },
  {
    sourceId: 'basic-1st-casebook',
    file: 'guidelines/basic-1st/casebook_raw_text.txt',
    title: '기본 인증기준 규정 사례집 (Ver. 1.0)',
    hospitalType: null,
    sourceKind: 'casebook',
  },
  {
    sourceId: 'psychiatric-6th',
    file: 'guidelines/psychiatric-6th/raw_text.txt',
    title: '6주기 정신의료기관 평가기준',
    hospitalType: 'psychiatric',
    sourceKind: 'guideline',
  },
  {
    sourceId: 'psychiatric-5th',
    file: 'guidelines/psychiatric-5th/raw_text.txt',
    title: '5주기 정신의료기관 평가기준',
    hospitalType: 'psychiatric',
    sourceKind: 'guideline',
  },
  {
    sourceId: 'acute-5th',
    file: 'guidelines/acute-5th/raw_text.txt',
    title: '급성기병원 인증기준 (Ver. 5.0)',
    hospitalType: 'acute',
    sourceKind: 'guideline',
  },
  {
    sourceId: 'rehab-2nd',
    file: 'guidelines/rehab-2nd/raw_text.txt',
    title: '2주기 재활의료기관 인증기준 (Ver. 2.1)',
    hospitalType: 'rehabilitation',
    sourceKind: 'guideline',
  },
  {
    sourceId: 'dental-4th',
    file: 'guidelines/dental-4th/raw_text.txt',
    title: '4주기 치과병원 인증기준 (Ver. 4.1)',
    hospitalType: 'dental',
    sourceKind: 'guideline',
  },
]

function loadEnv() {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const m = /^([A-Z_]+)=(.*)$/.exec(line.trim())
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '')
  }
}

/**
 * 임베딩만 비어 있는 행을 채운다(청킹은 건드리지 않음).
 * 분당 할당량에 걸려 일부가 누락됐을 때 반복 실행하면 된다.
 */
async function fillMissingEmbeddings() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY 없음')

  const { data, error } = await supabase
    .from('reference_chunks')
    .select('id, source_title, chapter_no, chapter_title, reg_code, reg_title, content')
    .is('embedding', null)
    .limit(2000)
  if (error) throw new Error(error.message)

  const rows = (data ?? []) as Array<{
    id: string
    source_title: string
    chapter_no: number | null
    chapter_title: string | null
    reg_code: string | null
    reg_title: string | null
    content: string
  }>
  console.log(`임베딩 누락 ${rows.length}건`)

  let ok = 0
  let failed = 0
  for (const row of rows) {
    try {
      const embedding = await embedTextWithRetry(
        buildEmbedInput(
          {
            regCode: row.reg_code,
            regTitle: row.reg_title,
            chapterNo: row.chapter_no,
            chapterTitle: row.chapter_title,
            pageFrom: null,
            pageTo: null,
            content: row.content,
          },
          row.source_title
        ),
        apiKey
      )
      const { error: upErr } = await supabase.from('reference_chunks').update({ embedding }).eq('id', row.id)
      if (upErr) throw new Error(upErr.message)
      ok++
    } catch (e) {
      failed++
      if (failed <= 3) console.error(`  실패: ${String(e).slice(0, 140)}`)
    }
    if ((ok + failed) % 20 === 0) process.stdout.write(`\r  ${ok + failed}/${rows.length} (성공 ${ok})`)
    await new Promise((r) => setTimeout(r, EMBED_DELAY_MS))
  }
  console.log(`\n임베딩 완료: 성공 ${ok}, 실패 ${failed}`)
}

async function main() {
  const dry = process.argv.includes('--dry')
  loadEnv()

  if (process.argv.includes('--fill-embeddings')) {
    await fillMissingEmbeddings()
    return
  }

  const root = path.join(__dirname, '..')
  const supabase = dry
    ? null
    : createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
  const apiKey = process.env.GEMINI_API_KEY

  let grandTotal = 0

  for (const entry of CORPUS) {
    const full = path.join(root, entry.file)
    if (!fs.existsSync(full)) {
      console.log(`SKIP  ${entry.sourceId} — 파일 없음 (${entry.file})`)
      continue
    }
    const text = fs.readFileSync(full, 'utf-8')
    const chunks = chunkPlainText(text, entry.title)
    const coded = chunks.filter((c) => c.regCode).length
    console.log(
      `${entry.sourceId.padEnd(26)} ${String(text.length).padStart(7)}자 → ${String(chunks.length).padStart(4)}청크 (기준번호 매칭 ${coded}개)`
    )
    grandTotal += chunks.length

    if (dry || !supabase) continue

    await supabase.from('reference_chunks').delete().eq('source_kind', entry.sourceKind).eq('source_id', entry.sourceId)
    await insertChunks(supabase, chunks, entry, apiKey)
  }

  console.log(`\n합계 ${grandTotal}청크${dry ? ' (dry run — DB 미반영)' : ' 적재 완료'}`)
}

async function insertChunks(
  // 스크립트 전용 — 생성된 DB 타입(types/database.types.ts)에 아직 없는 테이블이라 느슨하게 받는다
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  chunks: ParsedChunk[],
  entry: CorpusEntry,
  apiKey?: string
) {
  // 임베딩 API 분당 할당량 때문에 순차 호출해야 한다
  const BATCH = 1
  let done = 0
  let failed = 0
  for (let i = 0; i < chunks.length; i += BATCH) {
    const slice = chunks.slice(i, i + BATCH)
    const rows = await Promise.all(
      slice.map(async (c) => ({
        source_kind: entry.sourceKind,
        source_id: entry.sourceId,
        source_title: entry.title,
        hospital_type: entry.hospitalType,
        chapter_no: c.chapterNo,
        chapter_title: c.chapterTitle,
        reg_code: c.regCode,
        reg_title: c.regTitle,
        page_from: c.pageFrom,
        page_to: c.pageTo,
        content: c.content,
        char_count: c.content.length,
        embedding: apiKey
          ? await embedTextWithRetry(buildEmbedInput(c, entry.title), apiKey).catch((e) => {
              failed++
              if (failed <= 3) console.error(`\n  임베딩 실패: ${String(e).slice(0, 120)}`)
              return null
            })
          : null,
      }))
    )
    const { error } = await supabase.from('reference_chunks').insert(rows)
    if (error) {
      console.error(`  insert 실패(${entry.sourceId} ${i}~): ${error.message}`)
      return
    }
    done += rows.length
    process.stdout.write(`\r  적재 ${done}/${chunks.length}${failed ? ` (임베딩 실패 ${failed})` : ''}`)
    await new Promise((r) => setTimeout(r, EMBED_DELAY_MS))
  }
  process.stdout.write('\n')
}

void main()
