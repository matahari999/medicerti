import { getGeminiClient, GEMINI_MODEL } from './client'

export interface DocPlanItem {
  docType: 'regulation' | 'criteria_book' | 'legal_form' | 'checklist' | 'education_record' | 'meeting_minutes' | 'corrective_action'
  title: string
  relatedCriterion: string
  reason: string
  priority: 'high' | 'medium' | 'low'
}

export interface DocPlan {
  hospitalId: string
  items: DocPlanItem[]
  summary: string
}

const SYSTEM_PROMPT = `당신은 한국 의료기관인증 준비 컨설턴트입니다.
제공된 인증 기준 또는 규정집 내용을 분석하여 병원이 인증 준비를 위해
반드시 작성해야 할 문서/양식/서류 목록을 도출하세요.

문서 유형:
- regulation: 규정집 (정책/절차 문서)
- criteria_book: 기준집 (인증 기준 해설/대비 자료)
- legal_form: 법정양식 (공식 서식)
- checklist: 점검표 (체크리스트)
- education_record: 교육기록
- meeting_minutes: 회의록
- corrective_action: 시정조치서

출력 형식 (엄격한 JSON, 다른 텍스트 없음):
{
  "summary": "전체 분석 요약 (한국어)",
  "items": [
    {
      "docType": "regulation",
      "title": "문서 제목",
      "relatedCriterion": "관련 기준 코드 (없으면 '일반')",
      "reason": "이 문서가 필요한 이유",
      "priority": "high|medium|low"
    }
  ]
}

규칙:
- 각 기준/규정마다 필요한 문서를 하나 이상 도출
- 실제 병원에서 사용하는 문서명 사용
- 중복되지 않도록 통합
- JSON 외 다른 텍스트 출력 금지`

export async function analyzeCriteriaForDocs(
  criteriaTree: string,
  hospitalId: string
): Promise<DocPlan> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
  })

  const prompt = `[인증 기준 전체 구조 (JSON)]
${criteriaTree.slice(0, 15000)}

위 인증 기준을 분석하여 병원이 인증을 준비하기 위해
작성해야 할 문서/양식/서류 목록을 JSON 형식으로 작성해 주세요.
각 기준별로 필요한 규정집, 법정양식, 점검표, 교육자료 등을 빠짐없이 도출하세요.`

  const result = await model.generateContent(prompt)
  const raw = result.response.text()
  return parseDocPlan(raw, hospitalId)
}

export async function analyzeRegulationForDocs(
  regulationText: string,
  regulationTitle: string,
  hospitalId: string
): Promise<DocPlan> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
  })

  const prompt = `[규정집 제목]
${regulationTitle}

[규정집 내용]
${regulationText.slice(0, 20000)}

위 규정집을 분석하여, 이 규정을 실제 의료 현장에서 실행하기 위해
추가로 필요한 문서/양식/점검표/교육자료 등을 JSON 형식으로 작성해 주세요.`

  const result = await model.generateContent(prompt)
  const raw = result.response.text()
  return parseDocPlan(raw, hospitalId)
}

function parseDocPlan(raw: string, hospitalId: string): DocPlan {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      if (parsed.items && Array.isArray(parsed.items)) {
        return {
          hospitalId,
          items: parsed.items.map((i: any) => ({
            docType: i.docType ?? 'regulation',
            title: i.title ?? '',
            relatedCriterion: i.relatedCriterion ?? '',
            reason: i.reason ?? '',
            priority: i.priority ?? 'medium',
          })),
          summary: parsed.summary ?? '',
        }
      }
    }
  } catch { /* fallback */ }

  return {
    hospitalId,
    items: [],
    summary: `분석 결과 파싱 실패. 원본: ${raw.slice(0, 200)}`,
  }
}
