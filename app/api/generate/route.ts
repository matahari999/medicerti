import { NextResponse } from 'next/server';
import { retrieveRelevantChunks, formatRagContext } from '@/lib/rag';
import { GEMINI_MODEL } from '@/lib/constants';
import { findReferenceRegulations, findReferenceRegulationsForChapter, buildReferenceContext, findCurrentStandardItem, findCurrentChapter, getLinkedForms, REGULATION_FORMAT_GUIDE } from '@/lib/regulationTemplate';
import { generateCustomFormHtml, generateRegulationHtml } from '@/lib/formGenerator';
import type { StandardItem } from '@/lib/types';

// AI가 만든 서식 본문 HTML 정제: 코드펜스 제거 + 스크립트/이벤트 핸들러 차단
function sanitizeFormBody(raw: string): string {
  return raw
    .replace(/```(?:html)?/g, '')
    .replace(/<\/?(?:html|head|body|!doctype)[^>]*>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .trim();
}

const FORM_FORMAT_GUIDE = `
[실무 서식 작성 규칙 — 반드시 지킬 것]
너의 응답은 인쇄용 서식의 "본문 HTML"만이어야 한다. 마크다운·설명 문장·코드펜스 없이 HTML만 출력하라.
(문서 상단 제목/문서번호/결재란은 시스템이 자동으로 붙이므로 만들지 마라)

허용 마크업:
- 섹션 제목: <div class="sec-title">■ 1. 섹션명</div>
- 표: <table class="data"> / 헤더행 <tr><th>..</th></tr> / 데이터행 <tr class="data-r"> / 라벨셀 <td class="hd"> / 가운데정렬 <td class="c"> / colspan·rowspan 사용 가능
- 체크박스는 ☐, 서명란은 (인), 날짜는 (YYYY년  월  일), 빈 기재란은 빈 <td></td>
- 인라인 style은 width·height·text-align·vertical-align·padding만 허용

서식 구성 순서:
1) 기본정보 표 — 문서 성격에 맞는 식별 정보(예: 환자명/등록번호/병동/평가일, 또는 부서/점검일/점검자)
2) 본문 기재 표 — 평가·점검·기록 항목을 행으로, 판정/체크 열 포함. 실무에서 바로 쓸 수 있게 항목을 구체적으로 채워라 (빈 껍데기 금지)
3) 종합 의견·조치사항 기재란
4) 서명란 표 (작성자/확인자, (인) 표기)
5) 마지막에 <div class="sec-title">■ 관련 근거</div> + 근거 표: 관련 법령 조항(의료법 시행규칙·환자안전법 등 실제 조문)과 인증기준 번호를 행으로 명시
`;

export const maxDuration = 120;

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
    const { hospitalType, hospitalName, documentType, documentTitle, additionalContext, logoUrl } = await request.json();

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

    // 2. RAG: 관련 인증기준 청크 검색 (실패해도 생성 계속)
    const ragQuery = `${documentTitle} ${documentType} ${hospitalType}`;
    const ragChunks = await Promise.race([
      retrieveRelevantChunks(ragQuery, hospitalType, apiKey, 5),
      new Promise<[]>((r) => setTimeout(() => r([]), 5000)),
    ]) as Awaited<ReturnType<typeof retrieveRelevantChunks>>;
    const ragContext = formatRagContext(ragChunks);

    // 3. 규정집/지침서/매뉴얼: 실제 규정집 라이브러리에서 참조 골격 검색
    //    + 현행(최신 주기) 인증기준을 찾아 우선 기준으로 주입 (2021 참조 규정은 구 주기이므로 갱신 지시)
    //    "1장" 처럼 장(chapter) 전체를 요청한 경우, 그 장에 속한 기준 전부를 그라운딩으로 사용한다.
    const isRegulationLike = ['regulation', 'guideline', 'manual'].includes(documentType);
    const isFormLike = ['form', 'checklist', 'record'].includes(documentType);

    const matchedChapter = (isRegulationLike || isFormLike)
      ? findCurrentChapter(hospitalType, documentTitle)
      : null;

    const referenceRegs = matchedChapter
      ? findReferenceRegulationsForChapter(hospitalType, matchedChapter)
      : (isRegulationLike || isFormLike) ? findReferenceRegulations(documentTitle) : [];
    const currentStd = matchedChapter
      ?? ((isRegulationLike || isFormLike) ? findCurrentStandardItem(hospitalType, documentTitle, referenceRegs) : null);
    const referenceContext = buildReferenceContext(referenceRegs, currentStd);
    const linkedForms = isRegulationLike ? getLinkedForms(currentStd, referenceRegs) : [];
    const isFullChapterRequest = matchedChapter !== null;

    // 4. 시스템/유저 프롬프트 준비
    const systemPrompt = isFormLike
      ? `너는 대한민국 의료기관 인증 실무 서식(법정서식·평가지·점검표·기록지·대장) 설계 전문가이다.
요청받은 서식 제목에 맞는, 병원 현장에서 바로 인쇄해 쓰는 실무 서식의 본문을 작성하라.
문서 제목과 병원명은 요청받은 값을 그대로 사용하고, 병원 유형 특성을 반영하라.
${FORM_FORMAT_GUIDE}${referenceContext}`
      : `너는 대한민국 의료기관평가인증 기준 및 병원 규정 수립에 정통한 도메인 전문가이자 시니어 병원 행정 컨설턴트이다.
병원 정보와 요청받은 문서 제목에 맞는 전문성 있고 규격화된 규정집/지침서/서식 초안을 마크다운 포맷으로 작성하라.

반드시 다음 규칙을 최우선으로 지켜라:
1. 문서 최상단에 대괄호와 함께 "[참고용 초안] 이 문서는 지능형 시스템이 생성한 참고용 초안으로, 법적 효력이 없습니다. 공식 제출 전 반드시 실무 검토가 필요합니다." 라는 한글 고지 문구를 필수 기재하라.
2. 병원명, 병원 유형의 특성(예: 요양병원의 낙상, 억제대 특화 지침)에 부합하게 작성하라.
3. 문서 내에 (작성일), (서명) 등 채워 넣어야 하는 실무 플레이스홀더를 제공하라.
4. 문서 제목(H1)과 병원명은 요청받은 값을 한 글자도 바꾸지 말고 그대로 사용하라. 참조 자료의 주제가 요청 제목과 다르면 반드시 요청 제목을 따르라.${
      isFullChapterRequest ? '\n5. 이 요청은 장(chapter) 전체 규정집 작성 요청이다. 아래 [현행 인증기준]에 나열된 기준을 하나도 빠짐없이, 각 기준 번호를 소제목으로 삼아 지침 및 절차 섹션에 전부 포함하라. 일부만 다루거나 요약만 하고 끝내지 마라.' : ''}${
      isRegulationLike ? `\n${REGULATION_FORMAT_GUIDE}` : ''}${referenceContext}${
      ragContext ? `\n\n[인증기준 참조 — RAG 검색 결과]\n${ragContext}` : ''}`;

    const userPrompt = `병원명: ${hospitalName}
병원 유형: ${hospitalType}
문서 유형: ${documentType}
문서 제목: ${documentTitle}
추가 요구사항: ${additionalContext || '없음'}`;

    // 5. API 키 유형 식별 및 호출 (신형 'AQ.' 및 구형 'AIza' 접두사 대응)
    const isGemini = apiKey.startsWith('AIza') || apiKey.startsWith('AQ.') || !!process.env.GEMINI_API_KEY;
    let resultText = '';

    if (isGemini) {
      // Google Gemini API 호출 (gemini-1.5-pro는 서비스 종료 — 최신 모델 상수 사용)
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
      const callGemini = () => fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
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
            maxOutputTokens: isFullChapterRequest ? 16000 : isRegulationLike ? 8000 : isFormLike ? 5000 : 2500
          }
        }),
        signal: AbortSignal.timeout(isFullChapterRequest ? 100000 : 45000), // 장 전체 요청은 컨텍스트·출력이 커서 타임아웃을 넉넉히 잡는다
      });

      let response = await callGemini();
      if (response.status === 503) {
        // 모델 일시 과부하 — 2초 후 1회 재시도
        await new Promise((r) => setTimeout(r, 2000));
        response = await callGemini();
      }

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
          model: 'claude-sonnet-5',
          max_tokens: isFullChapterRequest ? 16000 : isRegulationLike ? 8000 : 2500,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          system: systemPrompt,
        }),
        signal: AbortSignal.timeout(isFullChapterRequest ? 100000 : 45000), // 장 전체 요청은 컨텍스트·출력이 커서 타임아웃을 넉넉히 잡는다
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

    // 서식류: AI 본문 HTML을 결재란·문서번호 헤더가 있는 인쇄용 서식으로 완성
    let formHtml: string | null = null;
    if (isFormLike) {
      const bodyHtml = sanitizeFormBody(resultText);
      if (bodyHtml.includes('<table')) {
        formHtml = generateCustomFormHtml({
          title: documentTitle,
          hospitalName,
          logoUrl: typeof logoUrl === 'string' && logoUrl.length < 400000 ? logoUrl : undefined,
          related: matchedChapter
            ? `인증기준 ${matchedChapter.chapterNumber}장 ${matchedChapter.chapterTitle}`
            : currentStd
              ? `인증기준 ${(currentStd as StandardItem).itemNumber} ${(currentStd as StandardItem).itemTitle}`
              : '의료기관 인증기준',
          target: additionalContext?.includes('부서') ? '해당 부서' : '전 부서',
          bodyHtml,
        });
        const sections = [...bodyHtml.matchAll(/■ ?[^<]{2,40}/g)].map((m) => m[0].trim());
        resultText = `✅ 인쇄용 실무 서식이 생성되었습니다.\n\n오른쪽 위 [🖨 서식 인쇄/PDF] 버튼을 누르면 결재란·문서번호가 포함된 인쇄용 양식이 열립니다.\n\n서식 구성:\n${sections.map((s) => ` ${s}`).join('\n')}\n\n※ 참고용 초안입니다. 실무 검토 후 사용하세요.`;
      }
    }

    // 규정집/지침서: 마크다운 초안을 병원 로고·결재란이 포함된 인쇄용 HTML로도 제공
    let regulationHtml: string | null = null;
    if (isRegulationLike && resultText.trim()) {
      regulationHtml = generateRegulationHtml({
        title: documentTitle,
        hospitalName,
        logoUrl: typeof logoUrl === 'string' && logoUrl.length < 400000 ? logoUrl : undefined,
        related: matchedChapter
          ? `인증기준 ${matchedChapter.chapterNumber}장 ${matchedChapter.chapterTitle}`
          : currentStd
            ? `인증기준 ${(currentStd as StandardItem).itemNumber} ${(currentStd as StandardItem).itemTitle}`
            : '의료기관 인증기준',
        target: additionalContext?.includes('부서') ? '해당 부서' : '전 부서',
        markdown: resultText,
      });
    }

    const currentStandard = matchedChapter
      ? { number: `${matchedChapter.chapterNumber}장`, title: `${matchedChapter.chapterTitle} (기준 ${matchedChapter.items.length}개 전체)` }
      : currentStd
        ? { number: (currentStd as StandardItem).itemNumber, title: (currentStd as StandardItem).itemTitle }
        : null;

    return NextResponse.json({
      result: resultText,
      isMock: false,
      formHtml,
      regulationHtml,
      linkedForms,
      currentStandard,
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
