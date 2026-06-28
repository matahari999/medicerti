import { NextResponse } from 'next/server';

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
  const { searchParams } = new URL(request.url);
  const searchWord = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || '';
  const statusFilter = searchParams.get('status') || '';

  const apiKey = process.env.HIRA_API_KEY || process.env.DATA_GO_KR_API_KEY;

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

  // 안전하게 API Key 획득 및 인코딩 복원 처리 헬퍼
  const getDecodedApiKey = (key: string) => {
    try {
      let decodedKey = key;
      while (decodedKey.includes('%')) {
        const next = decodeURIComponent(decodedKey);
        if (next === decodedKey) break;
        decodedKey = next;
      }
      return decodedKey;
    } catch (e) {
      return key;
    }
  };

  // 2. 실제 HIRA 휴폐업 OpenAPI 호출 시도
  try {
    const apiEndpoint = 'http://apis.data.go.kr/B551182/hospInfoServicev2/getHospClspList';
    const decodedKey = getDecodedApiKey(apiKey);
    
    // 쿼리 스트링 수동 구성 (자동 이중인코딩 방지)
    let queryParams = `serviceKey=${encodeURIComponent(decodedKey)}&pageNo=1&numOfRows=20&_type=json`;
    if (searchWord) {
      queryParams += `&yadmNm=${encodeURIComponent(searchWord)}`;
    }

    const fetchUrl = `${apiEndpoint}?${queryParams}`;

    const response = await fetch(fetchUrl, {
      next: { revalidate: 300 }, // 5분 캐싱
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenAPI 응답 오류: ${response.status}`);
    }

    // JSON 파싱 안전장치
    const responseText = await response.text();
    let json: any;
    try {
      json = JSON.parse(responseText);
    } catch (parseErr) {
      throw new Error(`API가 유효한 JSON을 반환하지 않았습니다. XML 응답이거나 서버 점검 중일 수 있습니다.`);
    }

    const items = json.response?.body?.items?.item;

    if (!items) {
      return NextResponse.json({
        data: [],
        isMock: false,
        referenceDate: new Date().toISOString().split('T')[0],
      });
    }

    const itemArray = Array.isArray(items) ? items : [items];

    // 필요한 스키마로 가공
    // (OpenAPI 필드 매핑: clspYmd 폐업일, yadmNm 요양기관명, clCdNm 종별명, addr 주소, estbYmd 개설일 등)
    const formattedData = itemArray.map((item: any, idx: number) => {
      const closeDate = item.clspYmd || null;
      const openDate = item.estbYmd || '알수없음';
      
      let status = '운영중';
      if (closeDate) {
        status = '폐업';
      }

      return {
        id: `oc-api-${idx}`,
        name: item.yadmNm || '이름 없음',
        type: item.clCdNm || '기타',
        address: item.addr || '주소 정보 없음',
        openDate: openDate.length === 8 ? `${openDate.slice(0, 4)}-${openDate.slice(4, 6)}-${openDate.slice(6, 8)}` : openDate,
        closeDate: closeDate && closeDate.length === 8 ? `${closeDate.slice(0, 4)}-${closeDate.slice(4, 6)}-${closeDate.slice(6, 8)}` : closeDate,
        status,
      };
    });

    // 필터링 적용
    const filteredData = formattedData.filter((item: any) => {
      const matchType = typeFilter ? item.type.includes(typeFilter) : true;
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      return matchType && matchStatus;
    });

    return NextResponse.json({
      data: filteredData,
      isMock: false,
      referenceDate: new Date().toISOString().split('T')[0],
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
