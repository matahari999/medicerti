import { getGeminiClient, GEMINI_MODEL } from './client'
import { NEEDS_REVIEW_MARKER } from '@/lib/constants'
import type { Hospital, RegulationTemplate } from '@/types/database.types'

const SYSTEM_PROMPT = `당신은 병원 규정집 변수 치환 보조 도구입니다.

절대 규칙:
1. [마스터 템플릿]의 문장 구조·법적 표현·조항 순서를 임의로 변경하지 마세요.
2. {{변수}} 자리만 [병원 정보]로 정확히 치환하세요.
3. 병원 정보 항목이 비어 있거나(빈 배열·빈 객체) 불명확한 경우, 절대 추측하지 말고 해당 문장에 "${NEEDS_REVIEW_MARKER}: 이유]" 표시를 남기세요. 단, 진료과·특수부서 목록이 빈 배열인 것은 "해당 사항 없음"으로 자연스럽게 표기하고 확인 표시를 남기지 마세요 — 병상 수처럼 값 자체가 없는(null) 항목만 확인 표시 대상입니다.
4. {{변수}} 슬롯 이외의 본문 내용을 새로 창작하거나 삭제하지 마세요.
5. 출력은 완성된 본문 텍스트만 반환하세요. 설명, 인사말, 코드블록 등 부가 텍스트를 포함하지 마세요.`

function formatStaffSummary(staff: Record<string, number>): string {
  const labels: Record<string, string> = {
    doctor: '의사', nurse: '간호사', nurse_aide: '간호조무사', other: '기타 인력',
  }
  const entries = Object.entries(staff).filter(([, v]) => v > 0)
  if (entries.length === 0) return ''
  return entries.map(([k, v]) => `${labels[k] ?? k} ${v}명`).join(', ')
}

function formatOperatingHours(hours: Record<string, string>): string {
  const labels: Record<string, string> = { weekday: '평일', weekend: '주말/공휴일' }
  const entries = Object.entries(hours).filter(([, v]) => v)
  if (entries.length === 0) return ''
  return entries.map(([k, v]) => `${labels[k] ?? k} ${v}`).join(', ')
}

export interface TemplateFillResult {
  content: string
  needsReviewCount: number
}

export async function fillRegulationTemplate(
  template: Pick<RegulationTemplate, 'template_content' | 'variable_schema'>,
  hospital: Pick<Hospital, 'name' | 'bed_count' | 'departments' | 'staff_composition' | 'special_units' | 'operating_hours'>,
): Promise<TemplateFillResult> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
  })

  const hospitalInfo = `[병원명] ${hospital.name}
[병상 수] ${hospital.bed_count != null ? `${hospital.bed_count}병상` : '(정보 없음)'}
[진료과] ${hospital.departments.length > 0 ? hospital.departments.join(', ') : '(해당 사항 없음)'}
[인력 구성] ${formatStaffSummary(hospital.staff_composition) || '(정보 없음)'}
[특수부서] ${hospital.special_units.length > 0 ? hospital.special_units.join(', ') : '(해당 사항 없음)'}
[운영시간] ${formatOperatingHours(hospital.operating_hours) || '(정보 없음)'}`

  const prompt = `[마스터 템플릿]
${template.template_content}

[병원 정보]
${hospitalInfo}

위 [마스터 템플릿]의 {{변수}} 자리를 [병원 정보]로 치환한 완성된 본문을 작성해 주세요.`

  const result = await model.generateContent(prompt)
  const content = result.response.text().trim()
  const needsReviewCount = (content.match(new RegExp(escapeRegExp(NEEDS_REVIEW_MARKER), 'g')) ?? []).length

  return { content, needsReviewCount }
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
