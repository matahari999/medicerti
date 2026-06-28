export interface NoticeSource {
  key: string;
  name: string;
  shortName: string;
  color: string;
  noticeUrl: string;
  fetchUrl: string;
  baseUrl: string;
  category: string;
  hospitalTypes: string[]; // 해당 병원 유형 (빈 배열 = 전체)
}

export interface Notice {
  id: string;
  source: string;
  sourceName: string;
  shortName: string;
  color: string;
  category: string;
  title: string;
  link: string;
  date?: string;
  isUrgent?: boolean;
}

export interface NoticeResult {
  source: string;
  status: 'ok' | 'error';
  notices: Notice[];
  directUrl: string;
  sourceName: string;
}

const ALL_TYPES = ['nursing', 'psychiatric', 'rehabilitation', 'acute', 'dental', 'korean'];

export const NOTICE_SOURCES: NoticeSource[] = [
  {
    key: 'koiha',
    name: '의료기관평가인증원',
    shortName: 'KOIHA',
    color: 'rose',
    noticeUrl: 'https://www.koiha.or.kr/web/kr/community/notice_board.do',
    fetchUrl: 'https://www.koiha.or.kr/web/kr/community/notice_board.do',
    baseUrl: 'https://www.koiha.or.kr',
    category: '인증',
    hospitalTypes: ALL_TYPES,
  },
  {
    key: 'mohw',
    name: '보건복지부',
    shortName: '복지부',
    color: 'blue',
    noticeUrl: 'https://www.mohw.go.kr/board.es?mid=a10501010100&bid=0003',
    fetchUrl: 'https://www.mohw.go.kr/board.es?mid=a10501010100&bid=0003',
    baseUrl: 'https://www.mohw.go.kr',
    category: '정책',
    hospitalTypes: ALL_TYPES,
  },
  {
    key: 'hira',
    name: '건강보험심사평가원',
    shortName: 'HIRA',
    color: 'green',
    noticeUrl: 'https://www.hira.or.kr/bbsDummy.do?pgmid=HIRAA020002000100',
    fetchUrl: 'https://www.hira.or.kr/bbsDummy.do?pgmid=HIRAA020002000100',
    baseUrl: 'https://www.hira.or.kr',
    category: '수가',
    hospitalTypes: ALL_TYPES,
  },
  {
    key: 'kha',
    name: '대한병원협회',
    shortName: '병원협회',
    color: 'purple',
    noticeUrl: 'https://kha.or.kr/kha_home/notice_list.do?mode=list&article.offset=0',
    fetchUrl: 'https://kha.or.kr/kha_home/notice_list.do?mode=list&article.offset=0',
    baseUrl: 'https://kha.or.kr',
    category: '협회',
    hospitalTypes: ['acute', 'dental'],
  },
];

export const URGENT_KEYWORDS = [
  '긴급', '즉시', '중요', '필독', '시행예고', '개정고시',
  '[긴급]', '[중요]', '[필독]', '긴급공지', '긴급 공지',
];

export function detectUrgent(title: string): boolean {
  return URGENT_KEYWORDS.some(kw => title.includes(kw));
}
