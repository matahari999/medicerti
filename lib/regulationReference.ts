// 규정집 자동 생성 시 마스터 원문 자료를 찾아 근거로 붙이는 헬퍼
// - 요양병원(nursing): lib/regulationLibrary.ts (2021년 실제 규정집 합본 43종, 비식별화)
// - 정신병원(psychiatric): regulation_templates 테이블 (실제 인증병원 규정집 원문 기반 15종)

import { REGULATION_LIBRARY } from '@/lib/regulationLibrary'
import type { RegulationReferenceInput } from '@/lib/gemini/regulation-writer'

const MAX_REFERENCE_CHARS = 12000

function normalizeTitle(s: string): string {
  return s.replace(/[^가-힣a-zA-Z0-9]/g, '')
}

function titleMatches(a: string, b: string): boolean {
  const na = normalizeTitle(a)
  const nb = normalizeTitle(b)
  if (!na || !nb) return false
  return na === nb || na.includes(nb) || nb.includes(na)
}

export function findNursingReference(itemTitle: string): RegulationReferenceInput | null {
  const hit = REGULATION_LIBRARY.find((r) => titleMatches(r.title, itemTitle))
  if (!hit) return null

  const content = [
    hit.purpose && `▣ 목적 (Purpose)\n${hit.purpose}`,
    hit.definitions && `▣ 용어의 정의 (Definition)\n${hit.definitions}`,
    hit.policy && `▣ 정책 (Policy)\n${hit.policy}`,
    hit.procedure && `▣ 지침 및 절차 (Guidelines & Process)\n${hit.procedure}`,
    hit.appendix && `▣ 부록 (Appendix)\n${hit.appendix}`,
    hit.body,
  ]
    .filter(Boolean)
    .join('\n\n')

  return {
    source: `2021년 요양병원 인증 규정집 합본 원문 (비식별화, 3주기 기준번호 ${hit.stdRef3})`,
    title: hit.title,
    content: content.slice(0, MAX_REFERENCE_CHARS),
  }
}

export interface PsychiatricTemplateRow {
  template_code: string
  title: string
  entry_code: string | null
  template_content: string
}

export function findPsychiatricReference(
  itemNumber: string,
  itemTitle: string,
  templates: PsychiatricTemplateRow[]
): RegulationReferenceInput | null {
  const hit =
    templates.find((t) => t.entry_code === itemNumber) ??
    templates.find((t) => titleMatches(t.title, itemTitle)) ??
    null
  if (!hit) return null

  // 병원 프로필 채움용 {{변수}} 라인과 파일럿 안내 부칙은 근거 원문에서 제외
  const content = hit.template_content
    .split('\n')
    .filter((line) => !line.includes('{{') && !line.trimStart().startsWith('부칙') && !/제\d+조\(본원 적용사항\)/.test(line))
    .join('\n')
    .trim()

  return {
    source: '정신의료기관 평가기준(표준지침서) 준수 실제 인증병원 규정집 원문 기반 마스터 템플릿',
    title: hit.title,
    content: content.slice(0, MAX_REFERENCE_CHARS),
  }
}
