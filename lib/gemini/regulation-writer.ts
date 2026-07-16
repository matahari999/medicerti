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

export interface RegulationReferenceInput {
  source: string
  title: string
  content: string
}

const TYPE_PROFILES: Record<string, { label: string; cycle: string; laws: string }> = {
  nursing: {
    label: '요양병원',
    cycle: '4주기(2025~2028) 요양병원 인증기준',
    laws: '의료법, 의료법 시행규칙, 감염병의 예방 및 관리에 관한 법률, 노인장기요양보험법',
  },
  psychiatric: {
    label: '정신의료기관(정신병원)',
    cycle: '정신의료기관 평가기준(정신의료기관평가 표준지침서)',
    laws: '정신건강증진 및 정신질환자 복지서비스 지원에 관한 법률(정신건강복지법) 및 동법 시행규칙, 의료법',
  },
}

function buildSystemPrompt(hospitalType: string): string {
  const profile = TYPE_PROFILES[hospitalType] ?? {
    label: '의료기관',
    cycle: '의료기관 인증기준',
    laws: '의료법 및 관련 법령',
  }

  return `당신은 한국 의료기관인증 전문 컨설턴트이며, 20년 경력의 ${profile.label} QPS실장입니다.
당신은 ${profile.cycle}을 완벽히 숙지하고 있으며,
실제 병원에서 즉시 사용할 수 있는 수준의 상세한 규정집을 작성합니다.

규정집 작성 규칙:
1. 한국어로 작성, 공식적인 병원 문서 스타일
2. 실제 ${profile.label}에서 사용하는 용어와 형식
3. 각 조항에 번호 부여 (제1조, 제2조...)
4. 구체적인 절차, 담당 부서, 주기, 기록 방법 명시
5. 관련 법령(${profile.laws} 등) 참조 시 반드시 실제 존재하는 법령명과 조문 번호를 명시
6. 실무자가 보고 바로 실행할 수 있는 수준의 디테일

[실제 규정집 원문]이 제공된 경우 (가장 중요):
- 원문의 구조(목적 → 용어의 정의 → 정책 → 지침 및 절차 → 부록)와 내용을 최우선 근거로 삼아 작성한다.
- 원문에 있는 절차·기준·수치(관찰 주기, 시간 제한, 인력 기준 등)는 그대로 유지한다.
- 원문에 없는 내용을 임의로 지어내지 않는다. 보완이 꼭 필요한 부분만 관련 법령에 근거해 추가하고, 해당 법령 조문을 명시한다.
- 원문이 다른 인증 주기 기준으로 작성된 경우 현행 기준 번호 체계에 맞게 표기만 갱신하고 실무 내용은 보존한다.

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
}

export async function generateFullRegulation(params: {
  criterionCode: string
  criterionTitle: string
  criterionDesc: string
  requiredDocuments: string[]
  requiredForms: string[]
  requiredChecklists: string[]
  requiredEvidence: string[]
  hospitalType: string
  reference?: RegulationReferenceInput
}): Promise<FullRegulation> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: buildSystemPrompt(params.hospitalType),
  })

  const profile = TYPE_PROFILES[params.hospitalType]
  const typeLabel = profile?.label ?? params.hospitalType
  const cycleLabel = profile?.cycle ?? '의료기관 인증기준'

  const referenceBlock = params.reference
    ? `
[실제 규정집 원문 — 최우선 근거]
출처: ${params.reference.source}
원문 제목: ${params.reference.title}

${params.reference.content}
`
    : ''

  const prompt = `[인증 기준 정보]
- 기준 코드: ${params.criterionCode}
- 기준 제목: ${params.criterionTitle}
- 기준 설명: ${params.criterionDesc}
- 병원 종류: ${typeLabel}

[필요 문서]
${params.requiredDocuments.map((d) => `- ${d}`).join('\n')}

[필요 서식]
${params.requiredForms.map((f) => `- ${f}`).join('\n')}

[필요 점검표]
${params.requiredChecklists.map((c) => `- ${c}`).join('\n')}

[필요 근거 자료]
${params.requiredEvidence.map((e) => `- ${e}`).join('\n')}
${referenceBlock}
위 인증 기준을 충족하기 위해 ${typeLabel}에서 실제 사용하는 상세한 규정집을 작성해 주세요.
${cycleLabel}에 맞추어, 실무자가 바로 사용할 수 있을 정도로 구체적으로 작성하세요.
각 조항에는 담당 부서(간호부, QPS실, 행정부, 의무기록실 등)와 수행 주기(매일, 매주, 매월, 분기별 등)를 명시하세요.${params.reference ? '\n반드시 위 [실제 규정집 원문]의 구조와 내용을 근거로 작성하고, 원문에 없는 내용은 관련 법령 근거가 있는 경우에만 조문을 명시하여 추가하세요.' : ''}`

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
    reference?: RegulationReferenceInput
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
