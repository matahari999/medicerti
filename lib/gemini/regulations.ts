import { getGeminiClient, GEMINI_MODEL } from './client'

export interface RegulationInput {
  criterionCode:    string
  criterionTitle:   string
  criterionDesc:    string
  requiredEvidence: string | null
  gapDescription:   string | null
  recommendation:   string | null
  complianceStatus: string
  hospitalName:     string
  ragContext?:      string
}

export interface RegulationOutput {
  title:   string
  content: string
}

const SYSTEM_PROMPT = `당신은 한국 의료기관인증 전문 컨설턴트입니다.
제공된 인증 기준, 갭 분석 결과, 그리고 연관 인증기준 참조(RAG)를 바탕으로 병원이 즉시 사용할 수 있는 정책/절차 초안을 작성하세요.

작성 규칙:
- 한국어로 작성
- 실제 병원 문서처럼 공식적이고 구체적으로 작성
- 각 섹션에 번호와 제목 부여
- 인증 기준 충족을 위한 구체적인 절차 포함
- 담당 부서, 주기, 기록 방법 명시
- [RAG 참조] 섹션의 연관 기준 내용을 적극 반영하여 누락 없이 포괄적으로 작성
- JSON 외 다른 텍스트 없이 아래 형식으로만 출력:

{"title": "<문서 제목>", "content": "<전체 정책 내용 (줄바꿈은 \\n 사용)>"}`

export async function generatePolicyDraft(input: RegulationInput): Promise<RegulationOutput> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
  })

  const prompt = `[병원명] ${input.hospitalName}
[인증 기준 코드] ${input.criterionCode}
[기준 제목] ${input.criterionTitle}
[기준 설명] ${input.criterionDesc}
[필요 근거 문서] ${input.requiredEvidence ?? '명시 없음'}
[현재 적합도] ${input.complianceStatus === 'partial' ? '부분적합' : '부적합'}
[갭 설명] ${input.gapDescription ?? '갭 정보 없음'}
[권고사항] ${input.recommendation ?? '권고사항 없음'}
${input.ragContext ? `\n[RAG 참조 — 연관 인증기준]\n${input.ragContext}` : ''}

위 정보를 바탕으로 이 병원이 인증 기준을 충족하기 위한 정책/절차 문서 초안을 JSON으로 작성해 주세요.`

  const result = await model.generateContent(prompt)
  const raw = result.response.text()

  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { title: string; content: string }
      if (parsed.title && parsed.content) return parsed
    }
  } catch {
    // fallback
  }

  return {
    title:   `${input.criterionCode} — ${input.criterionTitle} 정책`,
    content: raw,
  }
}
