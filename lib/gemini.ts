// =============================================
// 메디인증 문서센터 - Gemini API 클라이언트
// =============================================

import { GenerationResult } from './types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function safeParseJSON(text: string): GenerationResult {
  // 1. 순수 파싱 시도
  try {
    return JSON.parse(text) as GenerationResult;
  } catch {}

  // 2. 마크다운 코드블록 제거
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned) as GenerationResult;
  } catch {}

  // 3. JSON이 잘린 경우 복구 시도: 마지막 완전한 필드까지만 파싱
  const truncated = cleaned;
  // 중괄호 균형 맞추기
  let depth = 0;
  let lastValidEnd = 0;
  for (let i = 0; i < truncated.length; i++) {
    if (truncated[i] === '{' || truncated[i] === '[') depth++;
    if (truncated[i] === '}' || truncated[i] === ']') {
      depth--;
      if (depth === 0) lastValidEnd = i + 1;
    }
  }
  if (lastValidEnd > 0) {
    try {
      return JSON.parse(truncated.slice(0, lastValidEnd)) as GenerationResult;
    } catch {}
  }

  // 4. summaryCard만이라도 추출
  const summaryMatch = truncated.match(/"summaryCard"\s*:\s*\{[^}]+\}/);
  if (summaryMatch) {
    try {
      const partial = `{${summaryMatch[0]},"qualityScore":{"score":70,"grade":"보완 후 사용 가능","reason":["응답이 너무 길어 일부만 표시됩니다"],"improvementSuggestions":["더 간단한 요청으로 재시도해 보세요"]},"officialBasis":[],"draftDocument":{"title":"","purpose":"응답이 잘렸습니다. 더 간단한 요청으로 재시도해 보세요.","scope":"","definitions":[],"responsibilities":[],"procedure":[],"recordsAndRetention":[],"educationAndTraining":[],"monitoring":[],"revisionManagement":[]},"blankForm":{"formTitle":"","usageGuide":"","requiredFields":[],"optionalFields":[],"templateMarkdown":""},"filledExample":{"exampleTitle":"","privacyNotice":"","exampleMarkdown":""},"checklist":[],"actionTrackingTable":[],"departmentGuide":[],"hospitalCustomization":{"itemsToFillByHospital":[],"recommendedApprovalLine":[],"documentNumberExample":"","departmentWorkflow":[]},"officialCheckNeeded":[],"sourceReferences":[],"revisionHistory":[],"internalReviewPoints":["응답이 너무 길어 잘렸습니다. 요청을 더 구체적으로 나눠서 시도해 보세요."],"disclaimer":"본 문서는 메디인이 생성한 참고용 초안입니다."}`;
      return JSON.parse(partial) as GenerationResult;
    } catch {}
  }

  throw new Error(`JSON 파싱 실패\n원본 응답 앞부분: ${text.slice(0, 300)}`);
}

export async function callGeminiRaw(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<string> {
  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 65536,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API 오류: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  const finishReason = data?.candidates?.[0]?.finishReason;
  if (finishReason === 'MAX_TOKENS') throw new Error('응답이 너무 길어 잘렸습니다. 더 간단한 요청으로 재시도해주세요.');
  if (finishReason === 'SAFETY') throw new Error('안전 정책으로 응답이 차단되었습니다.');

  const blockReason = data?.promptFeedback?.blockReason;
  if (blockReason) throw new Error(`프롬프트가 차단되었습니다: ${blockReason}`);

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini API에서 빈 응답을 받았습니다.');
  }

  return text;
}

export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<GenerationResult> {
  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 65536,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API 오류: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // finishReason 확인
  const finishReason = data?.candidates?.[0]?.finishReason;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini API에서 빈 응답을 받았습니다.');
  }

  return safeParseJSON(text);
}
