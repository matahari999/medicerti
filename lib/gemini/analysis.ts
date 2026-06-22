import { getGeminiClient, GEMINI_MODEL } from './client'
import { ANALYSIS_TOKEN_LIMIT } from '@/lib/constants'
import type { AccreditationCriterion } from '@/types/database.types'

export interface AnalysisInput {
  hospitalId:     string
  runId:          string
  documentsText:  string
  criteria:       AccreditationCriterion[]
}

export interface CriterionAnalysisResult {
  criterion_id:           string
  compliance_status:      'compliant' | 'partial' | 'non_compliant' | 'not_reviewed'
  evidence_text:          string | null
  evidence_document_hint: string | null
  gap_description:        string | null
  recommendation:         string | null
  severity:               'critical' | 'major' | 'minor' | null
  ai_confidence:          number
}

const ANALYSIS_SYSTEM_PROMPT = `당신은 한국 요양병원 의료기관인증 전문가입니다.
제공된 병원 문서를 아래의 인증 기준과 대조하여 적합 여부를 분석하세요.

[적합도 정의]
- compliant: 문서에 기준을 충족하는 명확한 증거가 있음
- partial: 일부 증거는 있으나 불완전하거나 불충분함
- non_compliant: 관련 증거를 찾을 수 없음
- not_reviewed: 문서 품질 문제로 평가 불가

[심각도 정의] (non_compliant, partial에만 적용)
- critical: 법적 의무 또는 환자 안전과 직결
- major: 핵심 인증 요건, 조건부 인증 가능성
- minor: 문서 미비, 인증 실패 단독 원인은 아님

출력 형식 (엄격한 JSON 배열, 다른 텍스트 없이):
[{
  "criterion_id": "<UUID>",
  "compliance_status": "compliant|partial|non_compliant|not_reviewed",
  "evidence_text": "<문서에서 직접 인용한 증거 텍스트 또는 null>",
  "evidence_document_hint": "<문서명 힌트 또는 null>",
  "gap_description": "<부족한 부분 설명 또는 null>",
  "recommendation": "<구체적인 개선 권고사항 (한국어) 또는 null>",
  "severity": "critical|major|minor|null",
  "ai_confidence": <0.0-1.0>
}]`

export async function runGapAnalysis(
  input: AnalysisInput,
  onProgress?: (progress: number) => void
): Promise<CriterionAnalysisResult[]> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: ANALYSIS_SYSTEM_PROMPT,
  })

  const truncatedText = truncateToTokenBudget(input.documentsText, ANALYSIS_TOKEN_LIMIT)
  const criteriaJson  = JSON.stringify(
    input.criteria.map((c) => ({
      id:                c.id,
      code:              c.code,
      domain:            c.domain,
      title:             c.title,
      description:       c.description,
      required_evidence: c.required_evidence,
    }))
  )

  onProgress?.(10)

  const result = await model.generateContent(
    `[병원 문서 내용]\n${truncatedText}\n\n[평가할 인증 기준]\n${criteriaJson}\n\n위 문서를 분석하여 각 기준의 적합도를 JSON 배열로만 반환해 주세요.`
  )

  onProgress?.(80)

  const rawText = result.response.text()
  const results = parseAnalysisResponse(rawText, input.criteria)

  onProgress?.(100)
  return results
}

export function calculateScores(
  results: CriterionAnalysisResult[],
  criteria: AccreditationCriterion[]
) {
  const criteriaMap = new Map(criteria.map((c) => [c.id, c]))

  let weightedSum = 0
  let totalWeight = 0
  const domainWeightedSums:  Record<string, number> = {}
  const domainTotalWeights:  Record<string, number> = {}

  for (const result of results) {
    const criterion = criteriaMap.get(result.criterion_id)
    if (!criterion) continue

    const weight     = Number(criterion.weight)
    const domainCode = criterion.domain_code

    const score =
      result.compliance_status === 'compliant' ? 1.0
      : result.compliance_status === 'partial'  ? 0.5
      : 0

    weightedSum += weight * score
    totalWeight += weight

    domainWeightedSums[domainCode] = (domainWeightedSums[domainCode] ?? 0) + weight * score
    domainTotalWeights[domainCode] = (domainTotalWeights[domainCode] ?? 0) + weight
  }

  const overallScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0

  const domainScores: Record<string, number> = {}
  for (const [code, sum] of Object.entries(domainWeightedSums)) {
    domainScores[code] = domainTotalWeights[code] > 0
      ? (sum / domainTotalWeights[code]) * 100
      : 0
  }

  return { overallScore: Math.round(overallScore * 100) / 100, domainScores }
}

function truncateToTokenBudget(text: string, maxTokens: number): string {
  const estimatedTokens = text.length / 2
  if (estimatedTokens <= maxTokens) return text
  const ratio        = maxTokens / estimatedTokens
  const targetLength = Math.floor(text.length * ratio * 0.9)
  return text.slice(0, targetLength) + '\n\n[문서 길이 초과로 일부 생략됨]'
}

function parseAnalysisResponse(
  rawText: string,
  criteria: AccreditationCriterion[]
): CriterionAnalysisResult[] {
  try {
    const cleaned   = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // fallback
  }

  return criteria.map((c) => ({
    criterion_id:           c.id,
    compliance_status:      'not_reviewed' as const,
    evidence_text:          null,
    evidence_document_hint: null,
    gap_description:        '분석 응답 파싱 실패',
    recommendation:         '문서를 다시 업로드한 후 재분석하세요',
    severity:               null,
    ai_confidence:          0,
  }))
}
