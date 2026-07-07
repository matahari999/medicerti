// 2021 규정집 합본(raw_text.txt)을 파싱해 lib/regulationLibrary.ts 생성
// 사용: node scripts/build-regulation-library.js
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'guidelines', 'hospital-regulations-2021', 'raw_text.txt');
const OUT = path.join(__dirname, '..', 'lib', 'regulationLibrary.ts');

let text = fs.readFileSync(SRC, 'utf-8');

// 병원 실명 비식별화
text = text.replace(/일산호수요양병원/g, '{{병원명}}').replace(/일산호수/g, '{{병원명}}');

// 규정 제목 라인: "1.1 정확한 환자확인" 형태 (다음 500자 내에 규정 헤더표 또는 ▣ 목적 존재)
const titleRe = /^[ \t]*(\d{1,2}\.\d{1,2}(?:\.\d{1,2})?)[ ]{0,3}([가-힣][가-힣A-Za-z ,·()/]{1,40}?)[ \t]*$/gm;
const marks = [];
let m;
while ((m = titleRe.exec(text))) {
  const ahead = text.slice(m.index, m.index + 600);
  if (/규 ?정 ?번 ?호|▣ ?목적/.test(ahead)) {
    marks.push({ index: m.index, num: m[1], title: m[2].trim() });
  }
}

// 중복 제거(같은 위치 근접) 및 블록 분할
const regs = [];
for (let i = 0; i < marks.length; i++) {
  const end = i + 1 < marks.length ? marks[i + 1].index : text.length;
  const block = text.slice(marks[i].index, end);
  if (block.length < 300) continue; // 목차 라인 등 오탐 제거
  regs.push({ ...marks[i], block });
}

function section(block, names, cap = 4500) {
  // names 중 하나로 시작하는 ▣ 섹션 추출
  const re = new RegExp(`▣ ?(?:${names.join('|')})[^\\n]*\\n([\\s\\S]*?)(?=▣ |$)`);
  const mm = block.match(re);
  if (!mm) return '';
  return mm[1].replace(/\n{3,}/g, '\n\n').trim().slice(0, cap);
}

function meta(block, label) {
  const re = new RegExp(`${label} ?([가-힣A-Za-z0-9, /·년월일]{1,30}?)(?=최 ?근|검 ?토 ?주|검 ?토 ?예|승 ?인|\\n)`);
  const mm = block.match(re);
  return mm ? mm[1].trim() : '';
}

const entries = regs.map((r) => {
  const dept = meta(r.block, '담 ?당 ?부 ?서');
  const cycle = meta(r.block, '검 ?토 ?주 ?기');
  const relatedStd = meta(r.block, '관련인증기준');
  const purpose = section(r.block, ['목적'], 1500);
  const procedure = section(r.block, ['지침 및 절차'], 6000);
  // ▣ 골격이 없는 표 중심 규정(시설 기준표·인력 기준표 등)은 본문을 통째로 보존
  const body = (!purpose && !procedure)
    ? r.block.replace(/\n{3,}/g, '\n\n').trim().slice(0, 5000)
    : '';
  return {
    stdRef3: r.num, // 3주기 요양병원 기준 번호 (2021년 규정집 기준)
    title: r.title,
    department: dept,
    reviewCycle: cycle,
    relatedStandard: relatedStd,
    purpose,
    definitions: section(r.block, ['용어의 정의', '용어정의', '정의'], 2500),
    policy: section(r.block, ['정책', '정 책'], 2500),
    procedure,
    appendix: section(r.block, ['부록'], 1200),
    body,
  };
}).filter((e) => e.purpose || e.procedure || e.body.length >= 800);

const header = `// 자동 생성 파일 — scripts/build-regulation-library.js 로 재생성
// 출처: 2021년 요양병원 규정집 합본(실무 규정 ${entries.length}종, 병원명 비식별화 완료)
// 번호(stdRef3)는 3주기 요양병원 인증기준 체계. 문서 구조(목적→용어정의→정책→지침및절차→부록)는
// 현행 인증 실무 표준과 동일하므로 병원 유형과 무관하게 골격 참조용으로 사용한다.

export interface RegulationReference {
  stdRef3: string;
  title: string;
  department: string;
  reviewCycle: string;
  relatedStandard: string;
  purpose: string;
  definitions: string;
  policy: string;
  procedure: string;
  appendix: string;
  body: string; // ▣ 골격 없는 표 중심 규정의 원문 (그 외에는 빈 문자열)
}

export const REGULATION_LIBRARY: RegulationReference[] = `;

fs.writeFileSync(OUT, header + JSON.stringify(entries, null, 2) + ';\n', 'utf-8');
console.log(`규정 ${entries.length}종 → lib/regulationLibrary.ts (${(fs.statSync(OUT).size / 1024).toFixed(0)}KB)`);
entries.forEach((e) => console.log(` ${e.stdRef3} ${e.title} [${e.department}]`));
