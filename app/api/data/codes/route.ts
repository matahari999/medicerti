import { NextResponse } from 'next/server';

// Fallback Mock 데이터
const mockCodes = [
  { code: 'NR001', name: '미소들실버케어요양병원', type: '요양병원', address: '서울시 구로구 개봉로15길 41', beds: 290, status: '운영중' },
  { code: 'NR002', name: '보바스기념병원', type: '요양병원', address: '경기도 성남시 분당구 대왕판교로 155-7', beds: 224, status: '운영중' },
  { code: 'NR003', name: '참예원요양병원', type: '요양병원', address: '서울시 강남구 개포로 419', beds: 160, status: '운영중' },
  { code: 'AC001', name: '서울대학교병원', type: '급성기병원', address: '서울시 종로구 대학로 101', beds: 1782, status: '운영중' },
  { code: 'AC002', name: '삼성서울병원', type: '급성기병원', address: '서울시 강남구 일원로 81', beds: 1985, status: '운영중' },
  { code: 'AC003', name: '연세대학교 세브란스병원', type: '급성기병원', address: '서울시 서대문구 연세로 50-1', beds: 2437, status: '운영중' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchWord = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || '';

  const apiKey = process.env.HIRA_API_KEY || process.env.DATA_GO_KR_API_KEY;

  // 1. API 키가 없거나 플레이스홀더인 경우 Mock 데이터 필터링 후 즉시 반환
  if (!apiKey || apiKey.includes('your-hira') || apiKey.includes('placeholder')) {
    const filtered = mockCodes.filter((item) => {
      const matchSearch =
        item.name.includes(searchWord) ||
        item.code.includes(searchWord) ||
        item.address.includes(searchWord);
      
      const matchType = typeFilter ? item.type.includes(typeFilter) : true;
      return matchSearch && matchType;
    });

    return NextResponse.json({
      data: filtered,
      isMock: true,
      referenceDate: '2026-05-31',
    });
  }

  // 2. 실제 HIRA OpenAPI 호출 시도
  try {
    const url = new URL('http://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList');
    url.searchParams.set('serviceKey', apiKey);
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('numOfRows', '20');
    url.searchParams.set('_type', 'json');
    if (searchWord) {
      url.searchParams.set('yadmNm', searchWord); // 요양기관명 검색
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // 5분 캐싱
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenAPI 응답 오류: ${response.status}`);
    }

    const json = await response.json();
    const items = json.response?.body?.items?.item;

    if (!items) {
      return NextResponse.json({
        data: [],
        isMock: false,
        referenceDate: new Date().toISOString().split('T')[0],
      });
    }

    // 배열 형태 보장
    const itemArray = Array.isArray(items) ? items : [items];

    // 필요한 스키마로 가공
    const formattedData = itemArray.map((item: any) => ({
      code: item.ykiho || 'N/A',
      name: item.yadmNm || '이름 없음',
      type: item.clCdNm || '기타',
      address: item.addr || '주소 정보 없음',
      beds: item.gdrBdsCnt ? parseInt(item.gdrBdsCnt, 10) : 0,
      status: '운영중',
    }));

    // 병원 유형별 필터가 있는 경우 적용
    const filteredData = typeFilter
      ? formattedData.filter((item: any) => item.type.includes(typeFilter))
      : formattedData;

    return NextResponse.json({
      data: filteredData,
      isMock: false,
      referenceDate: new Date().toISOString().split('T')[0],
    });
  } catch (error: any) {
    // OpenAPI 호출 에러 발생 시, 안전하게 Mock 데이터로 Fallback
    console.error('HIRA API 호출 실패, Mock 모드로 대체:', error.message);
    
    const filtered = mockCodes.filter((item) => {
      const matchSearch =
        item.name.includes(searchWord) ||
        item.code.includes(searchWord) ||
        item.address.includes(searchWord);
      
      const matchType = typeFilter ? item.type.includes(typeFilter) : true;
      return matchSearch && matchType;
    });

    return NextResponse.json({
      data: filtered,
      isMock: true,
      fallbackError: error.message,
      referenceDate: '2026-05-31',
    });
  }
}
