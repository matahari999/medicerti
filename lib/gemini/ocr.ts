import { getGeminiClient, GEMINI_MODEL } from './client'
import { OCR_MAX_RETRIES } from '@/lib/constants'

interface PageExtractionResult {
  page: number
  text: string
  tables: Array<{ headers: string[]; rows: string[][] }>
  confidence: number
}

interface ExtractionResult {
  fullText: string
  pages: PageExtractionResult[]
  totalPages: number
  avgConfidence: number
  wordCount: number
}

const OCR_SYSTEM_PROMPT = `당신은 한국 의료기관 인증 관련 문서의 텍스트 추출 전문가입니다.
제공된 PDF 문서에서 모든 텍스트를 추출하되, 구조(제목, 표, 목록)를 최대한 보존하세요.

출력 형식 (엄격한 JSON 배열):
[{
  "page": <페이지 번호>,
  "text": "<전체 추출 텍스트>",
  "tables": [
    { "headers": ["열1", "열2"], "rows": [["값1", "값2"]] }
  ],
  "confidence": <0.0-1.0>
}]

규칙:
- 한국어 문자를 정확하게 유지하세요
- 표 구조를 tables 배열에 포함하세요
- 머리글, 바닥글, 페이지 번호도 포함하세요
- JSON 외 다른 텍스트는 절대 출력하지 마세요`

export async function extractDocumentText(
  pdfBase64: string,
  _documentId: string
): Promise<ExtractionResult> {
  const genAI  = getGeminiClient()
  const model  = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: OCR_SYSTEM_PROMPT,
  })

  let pages: PageExtractionResult[] = []
  let attempt = 0

  while (attempt < OCR_MAX_RETRIES) {
    try {
      const result = await model.generateContent([
        {
          inlineData: {
            data:     pdfBase64,
            mimeType: 'application/pdf',
          },
        },
        '이 문서의 모든 텍스트를 페이지별로 추출하여 JSON 배열 형식으로만 반환해 주세요.',
      ])

      const rawText = result.response.text()
      pages = parseOCRResponse(rawText)
      break
    } catch (error) {
      attempt++
      if (attempt >= OCR_MAX_RETRIES) {
        throw new Error(
          `OCR 추출 실패 (${OCR_MAX_RETRIES}회 시도): ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        )
      }
      await sleep(1000 * attempt)
    }
  }

  const fullText       = pages.map((p) => p.text).join('\n\n')
  const avgConfidence  = pages.length > 0
    ? pages.reduce((sum, p) => sum + p.confidence, 0) / pages.length
    : 0
  const wordCount      = fullText.split(/\s+/).filter(Boolean).length

  return { fullText, pages, totalPages: pages.length, avgConfidence, wordCount }
}

function parseOCRResponse(rawText: string): PageExtractionResult[] {
  try {
    const cleaned   = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])

    const objMatch = cleaned.match(/\{[\s\S]*\}/)
    if (objMatch) return [JSON.parse(objMatch[0])]
  } catch {
    // fallback
  }
  return [{ page: 1, text: rawText, tables: [], confidence: 0.5 }]
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
