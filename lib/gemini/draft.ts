import { getGeminiClient, GEMINI_MODEL } from './client'

// ponytail: single prompt, no config, no DI

export interface DraftInput {
  hospitalJson: string
  domainScoresJson: string
  criteriaResults: string
  summaryCounts: string
}

export interface ApplicationDraft {
  title: string
  sections: Array<{ heading: string; origin: 'hospital' | 'ai'; body: string }>
}

const SYSTEM_PROMPT = `당신은 한국 요양병원 의료기관인증 신청서류 작성 전문가입니다.
제공된 갭 분석 결과를 바탕으로 인증 신청 서류 초안을 작성하세요.

섹션 구성:
1. 병원 현황 — 병원 기본 정보 (병원입력)
2. 인증 기준별 자체평가 — 도메인별 점수, 주요 강점/약점 (AI생성)
3. 증빙자료 목록 — 기준별 필요한 증빙자료와 확보 상태 (AI생성)
4. 미흡사항 및 개선계획 — 부적합/부분적합 항목별 원인과 개선 조치 (AI생성)
5. 종합의견 — 전체 준비도, 남은 과제, 권고사항 (AI생성)

출력 형식 (엄격한 JSON):
{
  "title": "2024년 요양병원 의료기관인증 신청 서류 초안",
  "sections": [
    {
      "heading": "1. 병원 현황",
      "origin": "hospital",
      "body": "병원이 입력한 그대로의 정보..."
    },
    {
      "heading": "2. 인증 기준별 자체평가",
      "origin": "ai",
      "body": "AI가 분석하여 생성한 내용..."
    }
  ]
}
규칙:
- origin이 "hospital"인 섹션은 반드시 제공된 병원 현황 데이터만 사용
- origin이 "ai"인 섹션은 gap analysis 결과를 기반으로 AI가 생성
- body는 한국어, 실제 제출 문서 스타일로 작성
- JSON 외 다른 텍스트 출력 금지`

export async function generateApplicationDraft(
  input: DraftInput,
): Promise<ApplicationDraft> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
  })

  const prompt = `[병원 현황 데이터]\n${input.hospitalJson}

[도메인 점수]\n${input.domainScoresJson}

[기준별 분석 결과]\n${input.criteriaResults}

[요약]\n${input.summaryCounts}

위 데이터를 바탕으로 인증 신청 서류 초안을 JSON 형식으로 작성해 주세요.`

  const result = await model.generateContent(prompt)
  const raw = result.response.text()

  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as ApplicationDraft
      if (parsed.title && Array.isArray(parsed.sections)) return parsed
    }
  } catch {
    // fallback
  }

  return {
    title: '인증 신청 서류 초안',
    sections: [
      { heading: '1. 병원 현황', origin: 'hospital', body: '(데이터 로드 실패 — 병원 정보를 직접 입력하세요)' },
      { heading: '2. 인증 기준별 자체평가', origin: 'ai', body: raw },
    ],
  }
}
