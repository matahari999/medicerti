// 점검표 스케줄러 — 점검일 자동 생성 + 인쇄용 점검 일지 HTML 생성
// ─────────────────────────────────────────────────────────────────────────────
// 구독자가 기간/주기/주말·공휴일 규칙을 지정하면, 대상 기간의 점검일을 자동으로 계산해
// "날짜당 1행"의 점검 일지 HTML을 만든다. 주말·공휴일은 다음 근무일로 이동시킨다.
// 생성된 HTML은 formGenerator의 generateCustomFormHtml을 그대로 통과하므로,
// 체크박스(☐→☑) 토글·빈칸 입력·인쇄가 전체 서식과 동일하게 동작한다.

import { generateCustomFormHtml } from './formGenerator';
import { isWeekend, isHoliday, weekdayKo, toDateKey, HOLIDAY_YEAR_RANGE } from './holidays';

export type Frequency = 'daily' | 'weekly' | 'monthly';

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: '매일',
  weekly: '매주',
  monthly: '매월',
};

export interface ChecklistItem {
  category: string; // 구분 (연속되면 첫 행에만 표기)
  content: string;  // 점검 항목 및 내용
}

export interface ChecklistTemplate {
  id: string;
  name: string;             // 점검표 이름
  field: string;            // 점검 분야(헤더 표기)
  related: string;          // 관련 인증기준/법적 근거
  defaultFrequency: Frequency;
  items: ChecklistItem[];
}

export interface InspectionScheduleConfig {
  templateId: string;
  title: string;
  hospitalName: string;
  inspectorName?: string;
  startDate: string;   // YYYY-MM-DD
  months: number;      // 대상 기간(개월)
  frequency: Frequency;
  skipWeekend: boolean;
  skipHoliday: boolean;
  customItems?: ChecklistItem[];
}

export interface InspectionDate {
  seq: number;
  date: Date;
  dateKey: string;
  weekday: string;
}

// ── 기본 점검표 템플릿 ────────────────────────────────────────────────────────
export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'fire',
    name: '소방 안전 점검표',
    field: '소방 안전',
    related: '화재의 예방 및 안전관리에 관한 법률, 의료법 시행규칙 별표3',
    defaultFrequency: 'daily',
    items: [
      { category: '소방 안전', content: '소화기 비치 및 압력계 정상 여부, 사용기한 확인' },
      { category: '소방 안전', content: '소화전 주변 장애물 유무 및 사용 가능 여부' },
      { category: '소방 안전', content: '비상구 및 피난통로 장애물 유무, 유도등 정상 작동 여부' },
      { category: '소방 안전', content: '방화문 정상 작동 및 폐쇄 유지 여부' },
      { category: '소방 안전', content: '화재감지기 및 스프링클러 정상 작동 여부' },
      { category: '소방 안전', content: '자동화재속보설비·수신기 이상 신호 유무' },
    ],
  },
  {
    id: 'electric',
    name: '전기 안전 점검표',
    field: '전기 안전',
    related: '전기안전관리법, 의료법 시행규칙(예비전원설비)',
    defaultFrequency: 'daily',
    items: [
      { category: '전기 안전', content: '전기 배선 및 콘센트 손상, 과부하(문어발) 여부' },
      { category: '전기 안전', content: '누전차단기 정상 작동(테스트 버튼) 여부' },
      { category: '전기 안전', content: '분전반 주변 가연물·장애물 유무, 잠금 상태' },
      { category: '전기 안전', content: '비상(예비)발전기 연료량 및 시운전 정상 여부' },
      { category: '전기 안전', content: '중환자실·수술실 무정전전원장치(UPS) 정상 여부' },
    ],
  },
  {
    id: 'facility',
    name: '시설·환경 안전 점검표',
    field: '시설·환경 안전',
    related: '의료기관 인증기준(시설 및 환경관리), 의료법 시행규칙 별표4',
    defaultFrequency: 'weekly',
    items: [
      { category: '이동공간', content: '복도·계단 미끄럼 방지 및 장애물 유무' },
      { category: '이동공간', content: '안전 손잡이·경사로 파손 여부' },
      { category: '욕실·화장실', content: '바닥 미끄럼 방지, 비상연락장치 정상 작동 여부' },
      { category: '냉난방·환기', content: '냉난방기·환기설비 정상 작동 및 필터 상태' },
      { category: '급수·급탕', content: '온수 온도 적정(화상 예방) 여부' },
      { category: '승강기', content: '승강기 정상 운행 및 비상통화장치 작동 여부' },
    ],
  },
  {
    id: 'gas',
    name: '의료가스·산소 점검표',
    field: '의료가스 안전',
    related: '고압가스 안전관리법, 의료기관 인증기준(의료가스 관리)',
    defaultFrequency: 'daily',
    items: [
      { category: '의료가스', content: '산소·의료용 가스 압력계 정상 범위 여부' },
      { category: '의료가스', content: '가스 저장실 환기 및 화기 엄금 표시 상태' },
      { category: '의료가스', content: '가스 배관·밸브 누출 및 손상 여부' },
      { category: '의료가스', content: '예비 산소통 확보 수량 및 고정 상태' },
      { category: '의료가스', content: '가스 경보장치 정상 작동 여부' },
    ],
  },
];

export function getTemplate(id: string): ChecklistTemplate | undefined {
  return CHECKLIST_TEMPLATES.find((t) => t.id === id);
}

// ── 날짜 유틸 ────────────────────────────────────────────────────────────────
function parseDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 주말/공휴일이면 조건에 따라 다음 근무일로 이동. */
function toWorkday(d: Date, skipWeekend: boolean, skipHoliday: boolean): Date {
  const r = new Date(d);
  for (let guard = 0; guard < 30; guard++) {
    const bad = (skipWeekend && isWeekend(r)) || (skipHoliday && isHoliday(r));
    if (!bad) return r;
    r.setDate(r.getDate() + 1);
  }
  return r;
}

/**
 * 대상 기간의 점검일 목록을 생성한다.
 * - daily: 기간 내 매일(주말·공휴일 제외 시 실질적으로 근무일만 남음)
 * - weekly: 시작일과 같은 요일 기준 매주 1회
 * - monthly: 시작일과 같은 '일' 기준 매월 1회(말일 초과 시 말일로 보정)
 * 주말·공휴일에 걸린 후보는 다음 근무일로 이동하며, 겹쳐 만들어진 중복 날짜는 제거한다.
 */
export function generateInspectionDates(config: InspectionScheduleConfig): InspectionDate[] {
  const start = parseDate(config.startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + config.months); // 종료 경계(미포함)

  const candidates: Date[] = [];
  if (config.frequency === 'daily') {
    for (const d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      candidates.push(new Date(d));
    }
  } else if (config.frequency === 'weekly') {
    for (const d = new Date(start); d < end; d.setDate(d.getDate() + 7)) {
      candidates.push(new Date(d));
    }
  } else {
    // monthly
    const dayOfMonth = start.getDate();
    for (let i = 0; i < config.months; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(dayOfMonth, lastDay));
      candidates.push(d);
    }
  }

  const seen = new Set<string>();
  const result: InspectionDate[] = [];
  for (const c of candidates) {
    const workday = toWorkday(c, config.skipWeekend, config.skipHoliday);
    const key = toDateKey(workday);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ seq: 0, date: workday, dateKey: key, weekday: weekdayKo(workday) });
  }
  result.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  result.forEach((r, i) => (r.seq = i + 1));
  return result;
}

/** 시작일~종료일이 공휴일 데이터 범위를 벗어나면 경고 문구 반환(없으면 null). */
export function holidayCoverageWarning(config: InspectionScheduleConfig): string | null {
  if (!config.skipHoliday) return null;
  const start = parseDate(config.startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + config.months);
  if (start.getFullYear() < HOLIDAY_YEAR_RANGE.min || end.getFullYear() > HOLIDAY_YEAR_RANGE.max) {
    return `공휴일 데이터는 ${HOLIDAY_YEAR_RANGE.min}~${HOLIDAY_YEAR_RANGE.max}년만 내장되어 있습니다. 범위를 벗어난 기간은 공휴일이 반영되지 않을 수 있습니다.`;
  }
  return null;
}

// ── HTML 생성 ────────────────────────────────────────────────────────────────
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function itemTableHtml(items: ChecklistItem[]): string {
  const rows = items
    .map((it, i) => {
      // 같은 구분이 연속되면 첫 행에만 표기(세로 병합 효과)
      const sameAsPrev = i > 0 && items[i - 1].category === it.category;
      const catCell = sameAsPrev ? '' : esc(it.category);
      return `<tr class="data-r">
  <td class="c">${catCell}</td>
  <td>${esc(it.content)}</td>
  <td class="c">☐ 양호 &nbsp;☐ 미흡 &nbsp;☐ 해당없음</td>
  <td></td>
  <td class="c"></td>
</tr>`;
    })
    .join('\n');
  return `<div class="sec-title">■ 점검 항목 및 기준</div>
<table class="data">
  <tr>
    <th style="width:110px">구분</th>
    <th>점검 항목 및 내용</th>
    <th style="width:180px">점검 결과</th>
    <th style="width:150px">개선 필요 사항</th>
    <th style="width:80px">조치 완료일</th>
  </tr>
  ${rows}
</table>`;
}

function scheduleTableHtml(dates: InspectionDate[]): string {
  const rows = dates
    .map(
      (d) => `<tr class="data-r">
  <td class="c">${d.seq}</td>
  <td class="c">${d.dateKey.replace(/-/g, '. ')}</td>
  <td class="c">${d.weekday}</td>
  <td class="c">☐ 양호 &nbsp;☐ 미흡</td>
  <td class="c"></td>
  <td></td>
</tr>`
    )
    .join('\n');
  return `<div class="sec-title">■ 점검 일지 (자동 생성 · 날짜당 1행)</div>
<table class="data">
  <tr>
    <th style="width:45px">회차</th>
    <th style="width:110px">점검일</th>
    <th style="width:45px">요일</th>
    <th style="width:160px">점검 결과</th>
    <th style="width:110px">점검자</th>
    <th>개선·특이사항</th>
  </tr>
  ${rows}
</table>`;
}

/** 설정으로 인쇄용 점검 일지 HTML 전체를 생성한다. */
export function buildInspectionFormHtml(config: InspectionScheduleConfig): {
  html: string;
  dates: InspectionDate[];
} {
  const template = getTemplate(config.templateId);
  const items = config.templateId === 'custom' ? config.customItems ?? [] : template?.items ?? [];
  const dates = generateInspectionDates(config);

  const start = parseDate(config.startDate);
  const end = new Date(start);
  end.setMonth(end.getMonth() + config.months);
  end.setDate(end.getDate() - 1); // 표기용: 마지막 포함일
  const periodLabel = `${config.startDate.replace(/-/g, '. ')} ~ ${toDateKey(end).replace(/-/g, '. ')} (${config.months}개월)`;
  const field = config.templateId === 'custom' ? '자체 점검' : template?.field ?? '';
  const related = config.templateId === 'custom' ? '의료기관 인증기준' : template?.related ?? '의료기관 인증기준';

  const overview = `<div class="sec-title">■ 점검 개요</div>
<table class="data">
  <tr><td class="hd" style="width:90px">점검표명</td><td>${esc(config.title)}</td>
      <td class="hd" style="width:90px">점검 분야</td><td>${esc(field)}</td></tr>
  <tr><td class="hd">점검 주기</td><td>${FREQUENCY_LABELS[config.frequency]} (주말·공휴일 ${config.skipWeekend || config.skipHoliday ? '제외, 다음 근무일로 이동' : '포함'})</td>
      <td class="hd">점검자</td><td>${esc(config.inspectorName || '')}</td></tr>
  <tr><td class="hd">대상 기간</td><td colspan="3">${esc(periodLabel)} · 총 ${dates.length}회 점검</td></tr>
</table>`;

  const bodyHtml = `${overview}\n${itemTableHtml(items)}\n${scheduleTableHtml(dates)}`;

  const html = generateCustomFormHtml({
    title: config.title,
    hospitalName: config.hospitalName,
    related,
    target: field,
    bodyHtml,
  });
  return { html, dates };
}
