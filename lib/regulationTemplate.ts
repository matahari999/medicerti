import { REGULATION_LIBRARY, RegulationReference } from './regulationLibrary';

// ─── 제목 유사도 기반 참조 규정 검색 ─────────────────────────
const norm = (s: string) => s.replace(/[\s,·()/]/g, '');

function bigrams(s: string): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  return out;
}

export function findReferenceRegulations(title: string, limit = 2): RegulationReference[] {
  const q = norm(title);
  if (!q) return [];
  const scored = REGULATION_LIBRARY.map((r) => {
    const t = norm(r.title);
    let score = 0;
    if (t === q) score = 100;
    else if (q.includes(t) || t.includes(q)) score = 80;
    else {
      const a = bigrams(q);
      const b = bigrams(t);
      let inter = 0;
      a.forEach((g) => { if (b.has(g)) inter++; });
      score = (inter / Math.max(1, Math.min(a.size, b.size))) * 60;
    }
    return { r, score };
  })
    .filter((x) => x.score >= 30)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.r);
}

// ─── 실제 병원 규정집 표준 골격 (2021 실무 규정집 합본 기반) ──
export const REGULATION_FORMAT_GUIDE = `
[규정집 표준 서식 — 반드시 이 골격을 따를 것]
문서 최상단에 다음 항목의 규정 관리표를 마크다운 표로 작성한다:
| 규정번호 | 관련 인증기준 | 담당부서 | 검토 책임자 | 승인 책임자 |
| 제정일 | 최근개정일 | 최근시행일 | 검토주기(예: 4년) | 검토예정일 |
(날짜는 (YYYY년 M월 D일) 플레이스홀더로, 규정번호는 해당 인증기준 번호로)

이후 본문은 다음 섹션 순서를 지킨다:
▣ 목적 (Purpose) — 이 규정이 왜 필요한지 1~2문단
▣ 용어의 정의 (Definition) — 규정에 나오는 전문용어를 § 기호로 항목화
▣ 정책 (Policy) — 병원이 지켜야 할 원칙을 번호 목록으로
▣ 지침 및 절차 (Guidelines & Process) — 실제 수행 절차를 "1. 가. 1)" 체계로 상세히
▣ 부록 (Appendix) — 이 규정과 함께 쓰는 서식·별첨 목록
▣ 규정 개정일(누적) — 제정/개정 이력 표 (예: 2013.7.25 제정 → (YYYY.M.D) 개정)
`;

export function buildReferenceContext(refs: RegulationReference[]): string {
  if (refs.length === 0) return '';
  const parts = refs.map((r) => {
    const sec = (label: string, body: string, cap: number) =>
      body ? `\n[${label}]\n${body.slice(0, cap)}` : '';
    return `━━ 참조 실무 규정: ${r.stdRef3} ${r.title} (담당: ${r.department || '미상'}, 검토주기: ${r.reviewCycle || '4년'}) ━━${
      sec('목적', r.purpose, 1200)}${
      sec('용어의 정의', r.definitions, 1800)}${
      sec('정책', r.policy, 1800)}${
      sec('지침 및 절차', r.procedure, 4000)}${
      sec('부록(서식 목록)', r.appendix, 800)}`;
  });
  return `\n\n[실제 인증 통과 병원의 규정집 발췌 — 아래 내용을 구조와 표현의 기준으로 삼되, 병원명은 {{병원명}} 대신 요청된 병원명으로, 내용은 요청된 병원 유형·최신 기준에 맞게 재작성하라]\n${parts.join('\n\n')}`;
}
