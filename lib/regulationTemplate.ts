import { REGULATION_LIBRARY, RegulationReference } from './regulationLibrary';
import { getCatalog } from './standardCatalog';
import type { StandardItem, StandardChapter, HospitalTypeKey } from './types';

// ─── 제목 유사도 기반 참조 규정 검색 ─────────────────────────
const norm = (s: string) => s.replace(/[\s,,·()/]/g, '');

function bigrams(s: string): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  return out;
}

function similarity(a: string, b: string): number {
  const qa = norm(a);
  const qb = norm(b);
  if (!qa || !qb) return 0;
  if (qa === qb) return 100;
  if (qa.includes(qb) || qb.includes(qa)) return 80;
  const ga = bigrams(qa);
  const gb = bigrams(qb);
  let inter = 0;
  ga.forEach((g) => { if (gb.has(g)) inter++; });
  return (inter / Math.max(1, Math.min(ga.size, gb.size))) * 60;
}

export function findReferenceRegulations(title: string, limit = 2): RegulationReference[] {
  return REGULATION_LIBRARY.map((r) => ({ r, score: similarity(title, r.title) }))
    .filter((x) => x.score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.r);
}

// ─── 3주기(2021 규정집) → 현행 4주기 요양병원 기준 매핑 ──────
// [3주기 번호, 제목 키워드(동일 번호 중복 구분용), 4주기 기준번호]
const STD3_TO_STD4: Array<[string, string, string]> = [
  ['1.1', '환자확인', '1.1'],
  ['1.2', '낙상', '1.2'],
  ['1.3', '손위생', '1.3'],
  ['2.1.3', '일관성', '2.1.3'],
  ['2.1.4', '퇴원', '2.1.4'],
  ['2.2', '초기평가', '2.2.2'],
  ['2.3.1', '검체', '2.3.1'],
  ['3.1.1', '치료계획', '3.1.1'],
  ['3.1.3', '통증', '3.1.3'],
  ['3.1.3', '영양', '3.1.4'],
  ['3.1.4', '욕창', '3.1.5'],
  ['3.1.5', '생애말기', '3.1.6'],
  ['3.1.6', '결핵', '3.1.7'],
  ['3.1.7', '한방', '3.1.8'],
  ['3.2.1', '심폐소생술', '3.2.1'],
  ['3.2.2', '수혈', '3.2.2'],
  ['3.2.3', '신체보호대', '3.2.3'],
  ['4.1', '보관', '4.2'],
  ['4.2', '처방', '4.3'],
  ['4.3', '투약', '4.4'],
  ['6.2', '취약환자', '5.2'],
  ['6.5', '동의서', '5.5'],
  ['6.6', '시설', '5.6'],
  ['7.1', '운영체계', '6.1'],
  ['7.2', '환자안전사건', '6.2'],
  ['7.3', '질 향상', '6.3'],
  ['7.4', '만족도', '12.1'],
  ['8.2', '의료기구', '7.2'],
  ['8.3.1', '멸균', '7.3'],
  ['8.3.2', '세탁물', '7.3'],
  ['8.4', '환경', '7.4'],
  ['8.6', '급식', '7.6'],
  ['9.1', '의사결정', '8.1'],
  ['9.1', '인사', '9.1'],
  ['10.2', '직원교육', '9.2'],
  ['10.3', '의료인력', '9.3'],
  ['10.4', '직원안전', '9.4'],
  ['10.5', '폭력', '8.3'],
  ['11.1', '시설', '10.1'],
  ['11.4', '보안', '10.4'],
  ['11.5', '의료기기', '10.5'],
  ['12.1', '의료정보', '11.1'],
  ['12.2', '완결도', '11.2'],
];

function mapRefToStd4Number(ref: RegulationReference): string | null {
  const hit = STD3_TO_STD4.find(([n, kw]) => n === ref.stdRef3 && ref.title.includes(kw));
  return hit ? hit[2] : null;
}

// ─── 장(chapter) 전체 요청 시: 그 장에 속한 기준마다 3주기 참조 규정을 모아온다 ──
// (예: 1장 요청 → 1.1/1.2/1.3에 매핑되는 2021년 실무 규정 3건을 전부 그라운딩으로 사용)
export function findReferenceRegulationsForChapter(
  hospitalType: string,
  chapter: StandardChapter,
  perItemLimit = 1,
): RegulationReference[] {
  if (hospitalType !== 'nursing') return [];
  const out: RegulationReference[] = [];
  for (const item of chapter.items) {
    const matches = REGULATION_LIBRARY.filter((r) => mapRefToStd4Number(r) === item.itemNumber).slice(0, perItemLimit);
    out.push(...matches);
  }
  return out;
}

// ─── 현행 기준(해당 병원 유형 카탈로그) 조회 ─────────────────
export function findCurrentStandardItem(
  hospitalType: string,
  documentTitle: string,
  refs: RegulationReference[],
): StandardItem | null {
  const catalog = getCatalog((hospitalType || 'other') as HospitalTypeKey);
  const items = catalog.chapters.flatMap((c) => c.items);
  if (items.length === 0) return null;

  // 요양병원: 3주기 규정 번호 → 4주기 번호 정밀 매핑 우선
  if (hospitalType === 'nursing' && refs[0]) {
    const std4 = mapRefToStd4Number(refs[0]);
    if (std4) {
      const exact = items.find((it) => it.itemNumber === std4);
      if (exact) return exact;
    }
  }

  // 그 외: 문서 제목과 기준명 유사도 매칭
  const best = items
    .map((it) => ({ it, score: similarity(documentTitle, it.itemTitle) }))
    .sort((a, b) => b.score - a.score)[0];
  return best && best.score >= 40 ? best.it : null;
}

// ─── "N장" 단위 요청 감지 — 장 전체(모든 기준)를 그라운딩 컨텍스트로 사용 ──
// "1장", "제1장", "1 장", "1장. 환자안전보장활동", "환자안전보장활동 규정집" 등을 인식한다.
export function findCurrentChapter(
  hospitalType: string,
  documentTitle: string,
): StandardChapter | null {
  const catalog = getCatalog((hospitalType || 'other') as HospitalTypeKey);
  if (catalog.chapters.length === 0) return null;

  // 1) "N장" 숫자 패턴 우선 매칭 (가장 명확한 의도)
  const numMatch = documentTitle.match(/제?\s*(\d{1,2})\s*장/);
  if (numMatch) {
    const chapter = catalog.chapters.find((c) => c.chapterNumber === numMatch[1]);
    if (chapter) return chapter;
  }

  // 2) 장 제목과의 유사도 매칭 (숫자 없이 "환자안전보장활동 규정집" 같은 요청 대응)
  const best = catalog.chapters
    .map((c) => ({ c, score: similarity(documentTitle, c.chapterTitle) }))
    .sort((a, b) => b.score - a.score)[0];
  return best && best.score >= 50 ? best.c : null;
}

function isChapter(x: StandardItem | StandardChapter): x is StandardChapter {
  return 'items' in x;
}

// ─── 규정에 딸린 서식 세트 (현행 기준의 요구 서식·점검표) ────
export function getLinkedForms(
  std: StandardItem | StandardChapter | null,
  refs: RegulationReference[],
): string[] {
  const out = new Set<string>();
  if (std) {
    const items = isChapter(std) ? std.items : [std];
    items.forEach((it) => {
      it.requiredForms.forEach((f) => out.add(f));
      it.requiredChecklists.forEach((f) => out.add(f));
    });
  }
  // 참조 규정 부록의 서식명도 후보로 추가 (별첨/서식 표기 라인)
  refs.forEach((r) => {
    for (const m of (r.appendix || '').matchAll(/(?:별첨|서식|붙임)[ \d):.-]*([가-힣A-Za-z ()·/\d]{3,30}?(?:기록지|평가지|동의서|점검표|대장|보고서|확인서|신청서|계획서|안내문|일지|서약서))/g)) {
      out.add(m[1].trim());
    }
  });
  return Array.from(out).slice(0, 12);
}

// ─── 실제 병원 규정집 표준 골격 (2021 실무 규정집 합본 기반) ──
export const REGULATION_FORMAT_GUIDE = `
[규정집 표준 서식 — 반드시 이 골격을 따를 것]
문서 최상단에 다음 항목의 규정 관리표를 마크다운 표로 작성한다:
| 규정번호 | 관련 인증기준 | 담당부서 | 검토 책임자 | 승인 책임자 |
| 제정일 | 최근개정일 | 최근시행일 | 검토주기(예: 4년) | 검토예정일 |
(날짜는 (YYYY년 M월 D일) 플레이스홀더로, 규정번호·관련 인증기준은 아래 [현행 인증기준]의 번호를 사용)

이후 본문은 다음 섹션 순서를 지킨다:
▣ 목적 (Purpose) — 이 규정이 왜 필요한지 1~2문단
▣ 용어의 정의 (Definition) — 규정에 나오는 전문용어를 § 기호로 항목화
▣ 정책 (Policy) — 병원이 지켜야 할 원칙을 번호 목록으로
▣ 지침 및 절차 (Guidelines & Process) — 실제 수행 절차를 "1. 가. 1)" 체계로 상세히
▣ 부록 (Appendix) — 이 규정과 함께 쓰는 서식·별첨 목록
▣ 규정 개정일(누적) — 제정/개정 이력 표 (예: 2013.7.25 제정 → (YYYY.M.D) 개정)
`;

export function buildReferenceContext(
  refs: RegulationReference[],
  currentStd: StandardItem | StandardChapter | null,
): string {
  const parts: string[] = [];

  if (currentStd && isChapter(currentStd)) {
    const itemBlocks = currentStd.items.map((it) => `
  ▸ 기준 ${it.itemNumber} ${it.itemTitle}
    요구사항 요약: ${it.summary}
    요구 규정·지침: ${it.requiredDocuments.join(', ') || '—'}
    요구 서식: ${it.requiredForms.join(', ') || '—'}
    요구 점검표: ${it.requiredChecklists.join(', ') || '—'}
    필요 증빙: ${it.requiredEvidence.join(', ') || '—'}`).join('\n')

    parts.push(`[현행 인증기준 — ${currentStd.chapterNumber}장 ${currentStd.chapterTitle} 전체(기준 ${currentStd.items.length}개)]
이 요청은 특정 기준 하나가 아니라 이 장(chapter) 전체에 대한 규정집 작성 요청이다.
아래 기준 ${currentStd.items.length}개를 단 하나도 빠짐없이 각각 정책/지침 및 절차 섹션의 하위 항목(예: "1.1 정확한 환자 확인 및 의사소통")으로 다뤄야 하며, 요약만 하지 말고 각 기준의 요구사항을 실제 수행 절차 수준으로 구체화하라.
${itemBlocks}`)
  } else if (currentStd) {
    parts.push(`[현행 인증기준 — 최신 기준이며 아래 참조 규정보다 항상 우선한다]
기준 ${currentStd.itemNumber} ${currentStd.itemTitle}
요구사항 요약: ${currentStd.summary}
요구 규정·지침: ${currentStd.requiredDocuments.join(', ') || '—'}
요구 서식: ${currentStd.requiredForms.join(', ') || '—'}
요구 점검표: ${currentStd.requiredChecklists.join(', ') || '—'}
필요 증빙: ${currentStd.requiredEvidence.join(', ') || '—'}`);
  }

  if (refs.length > 0) {
    const refParts = refs.map((r) => {
      const sec = (label: string, bodyText: string, cap: number) =>
        bodyText ? `\n[${label}]\n${bodyText.slice(0, cap)}` : '';
      return `━━ 참조 실무 규정(2021년 작성): ${r.stdRef3} ${r.title} (담당: ${r.department || '미상'}, 검토주기: ${r.reviewCycle || '4년'}) ━━${
        sec('목적', r.purpose, 1200)}${
        sec('용어의 정의', r.definitions, 1800)}${
        sec('정책', r.policy, 1800)}${
        sec('지침 및 절차', r.procedure, 4000)}${
        sec('본문(표 중심 규정)', r.body, 3000)}${
        sec('부록(서식 목록)', r.appendix, 800)}`;
    });
    parts.push(`[실제 인증 통과 병원의 규정집 발췌 — 문서의 구조·문체·상세함의 기준으로 삼아라.
단, 이 규정집은 2021년(구 주기) 것이므로: ① 규정 관리표의 '관련 인증기준'은 반드시 위 [현행 인증기준] 번호로 갱신 ② 구 기준 번호·용어가 본문에 남지 않게 정리 ③ [현행 인증기준]의 요구사항(요구 규정·서식·증빙)이 빠짐없이 반영되도록 내용을 보강하라. 병원명은 요청된 병원명으로 대체하라.]
${refParts.join('\n\n')}`);
  }

  return parts.length ? `\n\n${parts.join('\n\n')}` : '';
}
