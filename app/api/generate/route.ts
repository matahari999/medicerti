import { NextResponse } from 'next/server';

function getMockResponse(hospitalType: string, hospitalName: string, documentType: string, documentTitle: string) {
      const hospitalTypeLabels: Record<string, string> = {
        nursing: '요양병원',
        psychiatric: '정신병원',
        rehabilitation: '재활병원',
        acute: '급성기병원',
        dental: '치과병원',
        korean: '한방병원',
      };
      const documentTypeLabels: Record<string, string> = {
        regulation: '규정집',
        guideline: '지침서',
        checklist: '체크리스트',
        form: '서식',
        record: '대장',
        manual: '매뉴얼',
      };

      return `[참고용 초안] 이 문서는 지능형 시스템이 생성한 참고용 초안으로, 법적 효력이 없습니다. 공식 제출 전 반드시 실무 검토가 필요합니다.

# ${documentTitle}

**병원명**: ${hospitalName}
**병원 유형**: ${hospitalTypeLabels[hospitalType] || hospitalType}
**문서 유형**: ${documentTypeLabels[documentType] || documentType}
**생성일**: ${new Date().toLocaleDateString('ko-KR')}

---

## 1. 목적

본 ${documentTitle}은(는) ${hospitalTypeLabels[hospitalType] || hospitalType} 인증기준에 따른 내부 규정을 체계화하고,
의료기관의 안전하고 질 높은 의료서비스를 제공하기 위한 기반을 마련하는 것을 목적으로 합니다.

## 2. 적용 범위

본 규정은 ${hospitalName}의 모든 부서 및 직원에게 적용됩니다.

## 3. 주요 내용

### 3.1 기본 원칙
- 환자 안전 및 권리를 최우선으로 합니다.
- 의료법 및 관련 법령을 준수합니다.
- 지속적인 질 향상 활동을 수행합니다.

### 3.2 운영 체계
- 담당 부서: (실무 담당 부서 명칭 기입)
- 주기적 검토: 연 1회 이상
- 개정 절차: 위원회 검토 → 원장 승인 → 전달교육

## 4. 담당 및 책임

| 역할 | 담당자 | 책임 |
|------|--------|------|
| 총괄 | 원장 | 전체 승인 및 결재 |
| 실무 | 담당 부서장 | 운영 및 모니터링 |
| 교육 | 교육 담당자 | 직원 교육 및 평가 |

---

*이 문서는 지능형 시스템이 생성한 초안으로, 병원의 실제 상황에 맞게 수정 후 사용하세요.*
*버전: v1.0-Smart-Mock | 생성 모드: Fallback*`;
}

export async function POST(request: Request) {
  try {
    const { hospitalType, hospitalName, documentType, documentTitle, additionalContext } = await request.json();

    if (!hospitalName || !documentTitle) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }

    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY;

    // 1. API 키가 없거나 플레이스홀더인 경우 Mock Fallback 반환
    if (!apiKey || apiKey.includes('your-') || apiKey.includes('placeholder')) {
      // 인위적 로딩 지연
      await new Promise((r) => setTimeout(r, 1500));
      return NextResponse.json({
        result: getMockResponse(hospitalType, hospitalName, documentType, documentTitle),
        isMock: true,
      });
    }

    // 2. 시스템/유저 프롬프트 준비
    const systemPrompt = `너는 대한민국 의료기관평가인증 기준 및 병원 규정 수립에 정통한 도메인 전문가이자 시니어 병원 행정 컨설턴트이다.
병원 정보와 요청받은 문서 제목에 맞는 전문성 있고 규격화된 규정집/지침서/서식 초안을 마크다운 포맷으로 작성하라.

반드시 다음 규칙을 최우선으로 지켜라:
1. 문서 최상단에 대괄호와 함께 "[참고용 초안] 이 문서는 지능형 시스템이 생성한 참고용 초안으로, 법적 효력이 없습니다. 공식 제출 전 반드시 실무 검토가 필요합니다." 라는 한글 고지 문구를 필수 기재하라.
2. 병원명, 병원 유형의 특성(예: 요양병원의 낙상, 억제대 특화 지침)에 부합하게 작성하라.
3. 문서 내에 (작성일), (서명) 등 채워 넣어야 하는 실무 플레이스홀더를 제공하라.`;

    const userPrompt = `병원명: ${hospitalName}
병원 유형: ${hospitalType}
문서 유형: ${documentType}
문서 제목: ${documentTitle}
추가 요구사항: ${additionalContext || '없음'}`;

    // 3. API 키 유형 식별 및 호출 (신형 'AQ.' 및 구형 'AIza' 접두사 대응)
    const isGemini = apiKey.startsWith('AIza') || apiKey.startsWith('AQ.') || !!process.env.GEMINI_API_KEY;
    let resultText = '';

    if (isGemini) {
      // Google Gemini API 호출 (gemini-1.5-pro 모델)
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: userPrompt
                }
              ]
            }
          ],
          systemInstruction: {
            parts: [
              {
                text: systemPrompt
              }
            ]
          },
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2500
          }
        }),
        signal: AbortSignal.timeout(20000), // 20초 타임아웃
      });

      if (!response.ok) {
        const isQuotaError = response.status === 429;
        throw new Error(isQuotaError ? 'QUOTA_EXCEEDED' : `API_ERROR_${response.status}`);
      }

      const json = await response.json();
      resultText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      // Anthropic Claude API 호출
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2500,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          system: systemPrompt,
        }),
        signal: AbortSignal.timeout(20000), // 20초 타임아웃
      });

      if (!response.ok) {
        const isQuotaError = response.status === 429;
        throw new Error(isQuotaError ? 'QUOTA_EXCEEDED' : `API_ERROR_${response.status}`);
      }

      const json = await response.json();
      resultText = json.content?.[0]?.text || '';
    }

    if (!resultText) {
      throw new Error('API 응답 텍스트가 비어 있습니다.');
    }

    return NextResponse.json({
      result: resultText,
      isMock: false,
    });
  } catch (error: any) {
    console.error('문서 생성 오류:', error.message);
    const isQuota = error.message === 'QUOTA_EXCEEDED';
    return NextResponse.json({
      result: getMockResponse('', '', '', ''),
      isMock: true,
      userMessage: isQuota
        ? '현재 AI 서비스 사용량이 일시적으로 초과되어 기본 초안을 제공합니다. 잠시 후 다시 시도해주세요.'
        : '문서 생성 중 일시적인 오류가 발생하여 기본 초안을 제공합니다.',
    });
  }
}
