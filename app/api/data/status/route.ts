import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseXmlItems } from '@/lib/publicData/xml';

// Fallback Mock 데이터
const mockStatus = [
  { id: 'oc-1', name: '미소들실버케어요양병원', type: '요양병원', address: '서울시 구로구 개봉로15길 41', openDate: '2015-03-12', closeDate: null, status: '운영중' },
  { id: 'oc-2', name: '보바스기념병원', type: '요양병원', address: '경기도 성남시 분당구 대왕판교로 155-7', openDate: '2002-05-20', closeDate: null, status: '운영중' },
  { id: 'oc-3', name: '참예원요양병원', type: '요양병원', address: '서울시 강남구 개포로 419', openDate: '2010-11-05', closeDate: null, status: '운영중' },
  { id: 'oc-4', name: '서울대학교병원', type: '급성기병원', address: '서울시 종로구 대학로 101', openDate: '1978-10-15', closeDate: null, status: '운영중' },
  { id: 'oc-5', name: '삼성서울병원', type: '급성기병원', address: '서울시 강남구 일원로 81', openDate: '1994-11-09', closeDate: null, status: '운영중' },
  { id: 'oc-6', name: '연세대학교 세브란스병원', type: '급성기병원', address: '서울시 서대문구 연세로 50-1', openDate: '1885-04-10', closeDate: null, status: '운영중' },
];

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const searchWord = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || '';
  const statusFilter = searchParams.get('status') || '';

  const apiKey = process.env.HIRA_API_KEY || process.env.DATA_GO_KR_API_KEY || process.env.PUBLIC_DATA_API_KEY;

  // 1. API 키가 없거나 플레이스홀더인 경우 Mock 데이터 필터링 후 즉시 반환
  if (!apiKey || apiKey.includes('your-hira') || apiKey.includes('placeholder')) {
    const filtered = mockStatus.filter((item) => {
      const matchSearch =
        item.name.includes(searchWord) ||
        item.address.includes(searchWord);
      
      const matchType = typeFilter ? item.type.includes(typeFilter) : true;
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      return matchSearch && matchType && matchStatus;
    });

    return NextResponse.json({
      data: filtered,
      isMock: true,
      referenceDate: '2026-05-31',
    });
  }

  // 2. 실제 HIRA 요양기관개폐업정보조회서비스 호출
  // 이 API는 병원명으로 직접 검색하지 못하고, 기준년월(crtrYm)에 개업/폐업/휴업한
  // 기관 목록을 돌려준다 — 그 목록을 받아 이름/주소로 client-side 필터링한다.
  try {
    const now = new Date();
    const crtrYm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const apiEndpoint = 'https://apis.data.go.kr/B551182/yadmOpCloInfoService2/getHospPharmacyOpCloList1';
    const queryParams = `serviceKey=${encodeURIComponent(apiKey)}&pageNo=1&numOfRows=100&crtrYm=${crtrYm}&yadmTp=1&opCloTp=0`;
    const fetchUrl = `${apiEndpoint}?${queryParams}`;

    const response = await fetch(fetchUrl, {
      next: { revalidate: 300 }, // 5분 캐싱
    });

    if (!response.ok) {
      throw new Error(`OpenAPI 응답 오류: ${response.status}`);
    }

    const xmlText = await response.text();
    const items = parseXmlItems(xmlText);

    // 필드 매핑 (estbCnclTp 개폐업휴업구분, estbDd 해당일, yadmNm 요양기관명, clCdNm 종별명, addr 주소)
    const formattedData = items.map((item, idx) => {
      const rawDate = item.estbDd || '';
      const formattedDate = rawDate.length === 8 ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}` : rawDate || null;

      let status = item.estbCnclTp || '알수없음';
      let openDate: string | null = null;
      let closeDate: string | null = null;
      let pauseStart: string | undefined;
      if (item.estbCnclTp === '개업') {
        status = '운영중';
        openDate = formattedDate;
      } else if (item.estbCnclTp === '폐업') {
        status = '폐업';
        closeDate = formattedDate;
      } else if (item.estbCnclTp === '휴업') {
        status = '휴업';
        pauseStart = formattedDate ?? undefined;
      }

      return {
        id: `oc-${item.ykiho || idx}`,
        name: item.yadmNm || '이름 없음',
        type: item.clCdNm || '기타',
        address: item.addr || '주소 정보 없음',
        openDate,
        closeDate,
        pauseStart,
        status,
      };
    });

    // 필터링 적용 (병원명/주소 검색 + 유형/상태 필터)
    const filteredData = formattedData.filter((item) => {
      const matchSearch = searchWord
        ? item.name.includes(searchWord) || item.address.includes(searchWord)
        : true;
      const matchType = typeFilter ? item.type.includes(typeFilter) : true;
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      return matchSearch && matchType && matchStatus;
    });

    return NextResponse.json({
      data: filteredData,
      isMock: false,
      referenceDate: `${crtrYm.slice(0, 4)}-${crtrYm.slice(4, 6)}`,
    });
  } catch (error: any) {
    // API 호출 에러 발생 시, 안전하게 Mock 데이터로 Fallback
    console.error('HIRA 휴폐업 API 호출 실패, Mock 모드로 대체:', error.message);
    
    const filtered = mockStatus.filter((item) => {
      const matchSearch =
        item.name.includes(searchWord) ||
        item.address.includes(searchWord);
      
      const matchType = typeFilter ? item.type.includes(typeFilter) : true;
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      return matchSearch && matchType && matchStatus;
    });

    return NextResponse.json({
      data: filtered,
      isMock: true,
      fallbackError: error.message,
      referenceDate: '2026-05-31',
    });
  }
}
