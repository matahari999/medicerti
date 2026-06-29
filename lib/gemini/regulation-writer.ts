import { getGeminiClient, GEMINI_MODEL } from './client'

export interface RegulationSection {
  heading: string
  body: string
}

export interface FullRegulation {
  title: string
  regulationNumber: string
  effectiveDate: string
  sections: RegulationSection[]
  relatedForms: string[]
  relatedRegulations: string[]
}

const SYSTEM_PROMPT = `당신은 한국 의료기관인증 전문 컨설턴트이며, 20년 경력의 요양병원 QPS실장입니다.
당신은 요양병원 4주기(2025~2028) 인증 기준을 완벽히 숙지하고 있으며,
실제 병원에서 즉시 사용할 수 있는 수준의 상세한 규정집을 작성합니다.

규정집 작성 규칙:
1. 한국어로 작성, 공식적인 병원 문서 스타일
2. 실제 요양병원에서 사용하는 용어와 형식
3. 각 조항에 번호 부여 (제1조, 제2조...)
4. 구체적인 절차, 담당 부서, 주기, 기록 방법 명시
5. 관련 법령(의료법, 감염병예방법, 시행규칙 등) 참조 포함
6. 실무자가 보고 바로 실행할 수 있는 수준의 디테일

필수 포함 섹션:
- 제1조 (목적)
- 제2조 (적용 범위)
- 제3조 (용어 정의)
- 제4조 (책임과 권한)
- 제5조~제X조 (세부 절차)
- 최종 조 (관련 양식 및 기록)
- 부칙

출력 형식 (엄격한 JSON):
{
  "title": "규정집 제목",
  "regulationNumber": "규정번호 (예: QP-001)",
  "effectiveDate": "시행일 (예: 2026. 7. 1.)",
  "sections": [
    { "heading": "제1조 (목적)", "body": "상세 내용..." },
    { "heading": "제2조 (적용 범위)", "body": "상세 내용..." }
  ],
  "relatedForms": ["관련 양식1", "관련 양식2"],
  "relatedRegulations": ["관련 규정1", "관련 규정2"]
}

JSON 외 다른 텍스트 출력 금지.`

export async function generateFullRegulation(params: {
  criterionCode: string
  criterionTitle: string
  criterionDesc: string
  requiredDocuments: string[]
  requiredForms: string[]
  requiredChecklists: string[]
  requiredEvidence: string[]
  hospitalType: string
}): Promise<FullRegulation> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
  })

  const prompt = `[인증 기준 정보]
- 기준 코드: ${params.criterionCode}
- 기준 제목: ${params.criterionTitle}
- 기준 설명: ${params.criterionDesc}
- 병원 종류: ${params.hospitalType}

[필요 문서]
${params.requiredDocuments.map((d) => `- ${d}`).join('\n')}

[필요 서식]
${params.requiredForms.map((f) => `- ${f}`).join('\n')}

[필요 점검표]
${params.requiredChecklists.map((c) => `- ${c}`).join('\n')}

[필요 근거 자료]
${params.requiredEvidence.map((e) => `- ${e}`).join('\n')}

위 인증 기준을 충족하기 위해 요양병원에서 실제 사용하는 상세한 규정집을 작성해 주세요.
4주기(2025~2028) 인증 기준에 맞추어, 실무자가 바로 사용할 수 있을 정도로 구체적으로 작성하세요.
각 조항에는 담당 부서(간호부, QPS실, 행정부, 의무기록실 등)와 수행 주기(매일, 매주, 매월, 분기별 등)를 명시하세요.`

  const result = await model.generateContent(prompt)
  const raw = result.response.text()
  return parseRegulation(raw)
}

export async function generateFullRegulationsFromCatalog(
  catalogItems: Array<{
    criterionCode: string
    criterionTitle: string
    criterionDesc: string
    requiredDocuments: string[]
    requiredForms: string[]
    requiredChecklists: string[]
    requiredEvidence: string[]
  }>,
  hospitalType: string,
  onProgress?: (done: number, total: number) => void
): Promise<FullRegulation[]> {
  const regulations: FullRegulation[] = []
  let completed = 0

  // Process in parallel with a concurrency limit of 2
  const concurrency = 2
  for (let i = 0; i < catalogItems.length; i += concurrency) {
    const batch = catalogItems.slice(i, i + concurrency)
    const results = await Promise.allSettled(
      batch.map((item) =>
        generateFullRegulation({
          ...item,
          hospitalType,
        }).catch((e) => {
          console.error(`Failed to generate regulation for ${item.criterionCode}:`, e)
          return null
        })
      )
    )
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        regulations.push(r.value)
      }
      completed++
      onProgress?.(completed, catalogItems.length)
    }
  }

  return regulations
}

function parseRegulation(raw: string): FullRegulation {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      if (parsed.title && Array.isArray(parsed.sections)) {
        return parsed as FullRegulation
      }
    }
  } catch { /* fallback */ }

  return {
    title: '규정집',
    regulationNumber: 'QP-000',
    effectiveDate: new Date().toISOString().split('T')[0].replace(/-/g, '. '),
    sections: [{ heading: '전문', body: raw }],
    relatedForms: [],
    relatedRegulations: [],
  }
}
