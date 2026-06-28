import { callGeminiRaw } from '@/lib/gemini';

const MANAGER_SYSTEM_PROMPT = `당신은 인증 준비 상태를 관리하는 매니저 에이전트입니다.
작성 에이전트와 검토 에이전트의 결과를 종합하여:
1. 문서 품질 점수 산출 (0-100)
2. 개선 제안 도출
3. 관련 인증 항목의 진행 상태 업데이트 제안

다음 JSON 형식으로만 출력:
{
  "overallScore": 0-100,
  "grade": "실무 사용 가능 초안" | "보완 후 사용 가능" | "재생성 필요",
  "improvementSuggestions": ["제안1", "제안2"],
  "suggestedStatus": "draft" | "in_review" | "approved" | "needs_revision",
  "nextActions": ["다음 액션1", "다음 액션2"]
}`;

export async function managerAgent(
  writerOutput: string,
  reviewerOutput: string,
  apiKey: string,
): Promise<{ overallScore: number; grade: string; improvementSuggestions: string[]; suggestedStatus: string; nextActions: string[] }> {
  const prompt = `[작성 에이전트 출력 요약]
${writerOutput.slice(0, 3000)}

[검토 에이전트 출력]
${reviewerOutput.slice(0, 3000)}

두 에이전트의 결과를 종합하여 품질 점수와 다음 액션을 JSON으로 출력하세요.`;

  try {
    const text = await callGeminiRaw(MANAGER_SYSTEM_PROMPT, prompt, apiKey);
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { overallScore: 50, grade: '보완 후 사용 가능', improvementSuggestions: ['자동 관리 평가 실패'], suggestedStatus: 'needs_revision', nextActions: ['수동 검토 필요'] };
  }
}
