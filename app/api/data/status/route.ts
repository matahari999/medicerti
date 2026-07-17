import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseXmlItems } from '@/lib/publicData/xml';

// Fallback Mock 데이터 (API 키 미설정 시에만 사용) — 개폐업 이벤트 예시
const mockStatus = [
  { id: 'oc-1', name: '미소들실버케어요양병원', type: '요양병원', address: '서울시 구로구 개봉로15길 41', openDate: '2015-03-12', closeDate: null, status: '개업' },
  { id: 'oc-2', name: '보바스기념병원', type: '요양병원', address: '경기도 성남시 분당구 대왕판교로 155-7', openDate: '2002-05-20', closeDate: null, status: '개업' },
  { id: 'oc-3', name: '참예원요양병원', type: '요양병원', address: '서울시 강남구 개포로 419', openDate: '2010-11-05', closeDate: null, status: '개업' },
  { id: 'oc-4', name: '서울대학교병원', type: '급성기병원', address: '서울시 종로구 대학로 101', openDate: '1978-10-15', closeDate: null, status: '개업' },
  { id: 'oc-5', name: '삼성서울병원', type: '급성기병원', address: '서울시 강남구 일원로 81', openDate: '1994-11-09', closeDate: null, status: '개업' },
  { id: 'oc-6', name: '연세대학교 세브란스병원', type: '급성기병원', address: '서울시 서대문구 연세로 50-1', openDate: '1885-04-10', closeDate: null, status: '개업' },
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
  // 이 API는 병원명으로 직접 검색하지 못하고, 최근 몇 개월간 개업/휴업/폐업한
  // 병의원(yadmTp=1) 전국 목록(수천 건)을 돌려준다 — 병원급(요양·정신 등)은
  // 전체의 1% 미만이라, 앞쪽 일부만 받으면 병원이 안 걸린다. 그래서 전체
  // 페이지를 모두 받아 합친 뒤 이름/주소/종별로 client-side 필터링한다.
  try {
    const apiEndpoint = 'https://apis.data.go.kr/B551182/yadmOpCloInfoService2/getHospPharmacyOpCloList1';
    const numOfRows = 1000;
    // yadmTp=1(병의원), opCloTp=0(개업·휴업·폐업 전체). crtrYm은 이 API가 사실상
    // 무시하고 최근 몇 개월 롤링 데이터를 주므로 넣지 않는다(넣으면 기준일만 오도됨).
    const baseParams = `serviceKey=${encodeURIComponent(apiKey)}&numOfRows=${numOfRows}&yadmTp=1&opCloTp=0`;

    const firstRes = await fetch(`${apiEndpoint}?${baseParams}&pageNo=1`, { next: { revalidate: 300 } });
    if (!firstRes.ok) throw new Error(`OpenAPI 응답 오류: ${firstRes.status}`);
    const firstXml = await firstRes.text();

    const totalCount = parseInt((firstXml.match(/<totalCount>(\d+)<\/totalCount>/) || [])[1] || '0', 10);
    const items = parseXmlItems(firstXml);

    // 나머지 페이지 병렬 수집 (최대 6페이지 = 6,000건까지, 폭주 방지 상한)
    const totalPages = Math.min(Math.ceil(totalCount / numOfRows), 6);
    if (totalPages > 1) {
      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map(async (p) => {
          const r = await fetch(`${apiEndpoint}?${baseParams}&pageNo=${p}`, { next: { revalidate: 300 } });
          return r.ok ? parseXmlItems(await r.text()) : [];
        })
      );
      rest.forEach((arr) => items.push(...arr));
    }

    // 필드 매핑 (estbCnclTp 개폐업휴업구분, estbDd 개설일, crtrYm 변동시기(YYYYMM),
    // yadmNm 요양기관명, clCdNm 종별명, addr 주소). 이 API에는 별도 폐업일 필드가
    // 없고 변동 시기는 crtrYm(월 단위)뿐이라, 폐업/휴업일은 crtrYm으로 표시한다.
    let maxCrtrYm = '';
    const formattedData = items.map((item, idx) => {
      const rawEstb = item.estbDd || '';
      const openDate = rawEstb.length === 8 ? `${rawEstb.slice(0, 4)}-${rawEstb.slice(4, 6)}-${rawEstb.slice(6, 8)}` : rawEstb || null;
      const crtrYm = item.crtrYm || '';
      if (crtrYm > maxCrtrYm) maxCrtrYm = crtrYm;
      const eventMonth = crtrYm.length === 6 ? `${crtrYm.slice(0, 4)}-${crtrYm.slice(4, 6)}` : null;

      // estbCnclTp를 있는 그대로 상태로 쓴다(개업/휴업/폐업). 임의로 '운영중' 등으로
      // 바꾸지 않는다 — 이 레코드는 "현재 운영 상태"가 아니라 "해당 시기의 개폐업 이벤트"다.
      const status = item.estbCnclTp || '기타';
      return {
        id: `oc-${item.ykiho || idx}`,
        name: item.yadmNm || '이름 없음',
        type: item.clCdNm || '기타',
        address: item.addr || '주소 정보 없음',
        openDate,
        closeDate: status === '폐업' ? eventMonth : null,
        pauseStart: status === '휴업' ? (eventMonth ?? undefined) : undefined,
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
      totalFetched: formattedData.length,
      referenceDate: maxCrtrYm.length === 6 ? `${maxCrtrYm.slice(0, 4)}-${maxCrtrYm.slice(4, 6)} 기준 (최근 개폐업)` : '최근 개폐업',
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
