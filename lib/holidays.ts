// 대한민국 관공서 공휴일 정적 데이터 (2025~2027)
// ─────────────────────────────────────────────────────────────────────────────
// 음력 명절(설날·추석·부처님오신날)과 대체공휴일은 매년 정부 지정으로 확정되므로
// 클라이언트에서 계산하지 않고 확정된 날짜를 표로 내장한다.
// data.go.kr "한국천문연구원_특일 정보"(getRestDeInfo) API를 승인받으면 서버에서
// 동적으로 받아올 수 있으나, 별도 승인/네트워크 의존이 생기므로 정적 표를 기본으로 한다.
// ※ 매년 12월 인사혁신처 관공서 공휴일 고시로 다음 연도 표를 갱신할 것.

export interface HolidayInfo {
  date: string; // YYYY-MM-DD
  name: string;
  substitute?: boolean; // 대체공휴일 여부
}

// 확정 공휴일 목록. 임시공휴일(정부 수시 지정)은 확정 시 여기에 추가한다.
const HOLIDAYS: HolidayInfo[] = [
  // ── 2025 ──
  { date: '2025-01-01', name: '신정' },
  { date: '2025-01-27', name: '임시공휴일' },
  { date: '2025-01-28', name: '설날 연휴' },
  { date: '2025-01-29', name: '설날' },
  { date: '2025-01-30', name: '설날 연휴' },
  { date: '2025-03-01', name: '삼일절' },
  { date: '2025-03-03', name: '삼일절 대체공휴일', substitute: true },
  { date: '2025-05-05', name: '어린이날·부처님오신날' },
  { date: '2025-05-06', name: '대체공휴일', substitute: true },
  { date: '2025-06-06', name: '현충일' },
  { date: '2025-08-15', name: '광복절' },
  { date: '2025-10-03', name: '개천절' },
  { date: '2025-10-05', name: '추석 연휴' },
  { date: '2025-10-06', name: '추석' },
  { date: '2025-10-07', name: '추석 연휴' },
  { date: '2025-10-08', name: '추석 대체공휴일', substitute: true },
  { date: '2025-10-09', name: '한글날' },
  { date: '2025-12-25', name: '성탄절' },

  // ── 2026 ──
  { date: '2026-01-01', name: '신정' },
  { date: '2026-02-16', name: '설날 연휴' },
  { date: '2026-02-17', name: '설날' },
  { date: '2026-02-18', name: '설날 연휴' },
  { date: '2026-03-01', name: '삼일절' },
  { date: '2026-03-02', name: '삼일절 대체공휴일', substitute: true },
  { date: '2026-05-05', name: '어린이날' },
  { date: '2026-05-24', name: '부처님오신날' },
  { date: '2026-05-25', name: '부처님오신날 대체공휴일', substitute: true },
  { date: '2026-06-06', name: '현충일' },
  { date: '2026-08-15', name: '광복절' },
  { date: '2026-08-17', name: '광복절 대체공휴일', substitute: true },
  { date: '2026-09-24', name: '추석 연휴' },
  { date: '2026-09-25', name: '추석' },
  { date: '2026-09-26', name: '추석 연휴' },
  { date: '2026-09-28', name: '추석 대체공휴일', substitute: true },
  { date: '2026-10-03', name: '개천절' },
  { date: '2026-10-05', name: '개천절 대체공휴일', substitute: true },
  { date: '2026-10-09', name: '한글날' },
  { date: '2026-12-25', name: '성탄절' },

  // ── 2027 (잠정 — 매년 관공서 공휴일 고시로 재확인 필요) ──
  { date: '2027-01-01', name: '신정' },
  { date: '2027-02-06', name: '설날 연휴' },
  { date: '2027-02-07', name: '설날' },
  { date: '2027-02-08', name: '설날 연휴' },
  { date: '2027-02-09', name: '설날 대체공휴일', substitute: true },
  { date: '2027-03-01', name: '삼일절' },
  { date: '2027-05-05', name: '어린이날' },
  { date: '2027-05-13', name: '부처님오신날' },
  { date: '2027-06-06', name: '현충일' },
  { date: '2027-08-15', name: '광복절' },
  { date: '2027-08-16', name: '광복절 대체공휴일', substitute: true },
  { date: '2027-09-14', name: '추석 연휴' },
  { date: '2027-09-15', name: '추석' },
  { date: '2027-09-16', name: '추석 연휴' },
  { date: '2027-10-03', name: '개천절' },
  { date: '2027-10-04', name: '개천절 대체공휴일', substitute: true },
  { date: '2027-10-09', name: '한글날' },
  { date: '2027-10-11', name: '한글날 대체공휴일', substitute: true },
  { date: '2027-12-25', name: '성탄절' },
  { date: '2027-12-27', name: '성탄절 대체공휴일', substitute: true },
];

const HOLIDAY_MAP: Map<string, HolidayInfo> = new Map(HOLIDAYS.map((h) => [h.date, h]));

/** 데이터가 존재하는 연도 범위(경계 밖은 공휴일 판정을 신뢰할 수 없음). */
export const HOLIDAY_YEAR_RANGE = { min: 2025, max: 2027 };

/** 로컬 타임존 기준 YYYY-MM-DD 문자열. (toISOString은 UTC라 하루 밀릴 수 있어 사용 금지) */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 해당 날짜가 공휴일이면 정보 반환, 아니면 null. */
export function getHoliday(d: Date): HolidayInfo | null {
  return HOLIDAY_MAP.get(toDateKey(d)) ?? null;
}

export function isHoliday(d: Date): boolean {
  return HOLIDAY_MAP.has(toDateKey(d));
}

/** 토(6)·일(0) 여부. */
export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];
export function weekdayKo(d: Date): string {
  return WEEKDAY_KO[d.getDay()];
}
