import { callGeminiRaw } from '@/lib/gemini';

const REVIEWER_SYSTEM_PROMPT = `당신은 의료기관 인증 문서 검토 전문 에이전트입니다.
작성 에이전트가 생성한 문서 초안을 검토하여 규정 준수 여부, 법령 참조 정확성, 누락 항목을 체크합니다.

검토 기준:
1. 병원 유형에 맞는 용어/직종 사용 여부
2. 법령 참조(@@법령참조)의 적절성
3. 각 JSON 필드의 완전성 (summaryCard, draftDocument, checklist 등)
4. procedure 항목 수 (최소 6개)
5. checklist 항목 수 (최소 6개)
6. internalReviewPoints 적절성
7. [특수 필수 지침 준수] 요양병원(4주기 Ver 4.1), 급성기병원(자료수집기간), 심평원 전문의 구성 요건, 산재행정(14일 신고) 외에도 **PDCA 5단계(개요, 심층분석, 경영진보고, 개선활동, 평가) 구조화 여부**, 환자만족도(연 1회)/직원안전 지표, B2C 보증서/암호화 규정, 지속적 규제 준수 연동 관련 맥락이 문서에 누락 없이 정확히 반영되었는지 철저히 검토.
8. [중요] 플레이스홀더 검출: '[병원명]', '[담당자]', '[작성자]', '[ ]', '○○병원', '[내용 입력]' 등 괄호나 공란(플레이스홀더)이 포함되어 있는지 철저히 검토하여, 발견 시 critical 또는 warning 이슈로 지정하고 구체적인 대체 명칭을 제안하세요.
9. [마인드맵 검수] 규정이나 체크리스트 문서 내에 구조를 시각적으로 보여주는 Mermaid 마인드맵(Mindmap)이 최소 1개 이상 삽입되어 있는지 검토하세요. 누락 시 warning으로 지적하세요.

반드시 다음 JSON 형식으로만 출력하세요:
{
  "score": 0-100,
  "passed": true/false,
  "issues": [
    {"severity": "critical"|"warning"|"info", "field": "문제 필드", "message": "문제 설명", "suggestion": "수정 제안"}
  ],
  "summary": "종합 검토 의견 (1-2문장)"
}`;

export async function reviewerAgent(
  documentJson: string,
  hospitalType: string,
  apiKey: string,
): Promise<{ score: number; passed: boolean; issues: any[]; summary: string }> {
  const prompt = `[검토 대상 문서]
${documentJson.slice(0, 8000)}

[병원 유형] ${hospitalType}

위 문서 초안을 검토 기준에 따라 분석하고 JSON으로 결과를 출력하세요.`;

  try {
    const text = await callGeminiRaw(REVIEWER_SYSTEM_PROMPT, prompt, apiKey);
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { score: 50, passed: false, issues: [{ severity: 'critical', field: 'review', message: '검토 에이전트 응답 파싱 실패', suggestion: '재시도 필요' }], summary: '자동 검토 중 오류 발생' };
  }
}
