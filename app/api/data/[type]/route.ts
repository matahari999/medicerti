import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseXmlItems } from '@/lib/publicData/xml';

// 타입별 템플릿 Mock 데이터 셋
const mockDataMap: Record<string, any[]> = {
  codes: [
    { code: 'H01', name: '미소들실버케어요양병원', type: '요양병원', address: '서울시 구로구 개봉로15길 41', beds: 290, status: '운영중' },
    { code: 'H02', name: '보바스기념병원', type: '요양병원', address: '경기도 성남시 분당구 대왕판교로 155-7', beds: 224, status: '운영중' },
    { code: 'H03', name: '참예원요양병원', type: '요양병원', address: '서울시 강남구 개포로 419', beds: 160, status: '운영중' },
    { code: 'H04', name: '인창요양병원', type: '요양병원', address: '부산시 동구 중앙대로 365', beds: 430, status: '운영중' },
    { code: 'H05', name: '희연요양병원', type: '요양병원', address: '경남 창원시 성산구 원이대로 848', beds: 380, status: '운영중' },
    { code: 'H09', name: '서울대학교병원', type: '급성기병원', address: '서울시 종로구 대학로 101', beds: 1782, status: '운영중' },
    { code: 'H10', name: '삼성서울병원', type: '급성기병원', address: '서울시 강남구 일원로 81', beds: 1985, status: '운영중' },
  ],
  details: [
    { code: 'H01', name: '미소들실버케어요양병원', type: '요양병원', tel: '02-2613-0007', doctors: 14, beds: 290, estbDd: '2015-03-12', address: '서울시 구로구 개봉로15길 41' },
    { code: 'H02', name: '보바스기념병원', type: '요양병원', tel: '031-786-3000', doctors: 15, beds: 224, estbDd: '2002-05-20', address: '경기도 성남시 분당구 대왕판교로 155-7' },
    { code: 'H03', name: '참예원요양병원', type: '요양병원', tel: '02-3412-2252', doctors: 10, beds: 160, estbDd: '2010-11-05', address: '서울시 강남구 개포로 419' },
    { code: 'H04', name: '인창요양병원', type: '요양병원', tel: '051-464-5000', doctors: 22, beds: 430, estbDd: '2009-04-01', address: '부산시 동구 중앙대로 365' },
    { code: 'H05', name: '희연요양병원', type: '요양병원', tel: '055-270-2500', doctors: 18, beds: 380, estbDd: '2011-06-15', address: '경남 창원시 성산구 원이대로 848' },
    { code: 'H06', name: '매그너스재활요양병원', type: '재활병원', tel: '031-591-3300', doctors: 12, beds: 195, estbDd: '2013-09-10', address: '경기도 남양주시 수동면 비룡로 782' },
    { code: 'H07', name: '의정부카네이션요양병원', type: '요양병원', tel: '031-878-1004', doctors: 11, beds: 180, estbDd: '2008-02-20', address: '경기도 의정부시 평화로 312' },
    { code: 'H08', name: '효사랑가족요양병원', type: '요양병원', tel: '063-220-0114', doctors: 16, beds: 280, estbDd: '2012-07-01', address: '전북 전주시 완산구 용머리로 12' },
    { code: 'H09', name: '서울대학교병원', type: '급성기병원', tel: '02-2072-2114', doctors: 480, beds: 1656, estbDd: '1978-10-15', address: '서울시 종로구 대학로 101' },
    { code: 'H10', name: '삼성서울병원', type: '급성기병원', tel: '02-3410-2000', doctors: 510, beds: 1979, estbDd: '1994-11-09', address: '서울시 강남구 일원로 81' },
    { code: 'H11', name: '서울아산병원', type: '급성기병원', tel: '02-3010-3333', doctors: 580, beds: 2705, estbDd: '1989-06-01', address: '서울시 송파구 올림픽로43길 88' },
    { code: 'H12', name: '연세대학교 세브란스병원', type: '급성기병원', tel: '02-2228-0114', doctors: 540, beds: 2437, estbDd: '1885-04-10', address: '서울시 서대문구 연세로 50-1' },
  ],
  'cert-status': [
    { code: 'C01', name: '미소들실버케어요양병원', status: '인증 완료', certNo: 'CERT-2025-104', certPeriod: '2025-06-01 ~ 2029-05-31', org: '의료기관평가인증원' },
    { code: 'C02', name: '보바스기념병원', status: '인증 완료', certNo: 'CERT-2024-089', certPeriod: '2024-09-15 ~ 2028-09-14', org: '의료기관평가인증원' },
    { code: 'C03', name: '참예원요양병원', status: '인증 완료', certNo: 'CERT-2026-012', certPeriod: '2026-01-10 ~ 2030-01-09', org: '의료기관평가인증원' },
    { code: 'C04', name: '인창요양병원', status: '인증 완료', certNo: 'CERT-2026-118', certPeriod: '2026-04-01 ~ 2030-03-31', org: '의료기관평가인증원' },
    { code: 'C05', name: '희연요양병원', status: '인증 완료', certNo: 'CERT-2024-055', certPeriod: '2024-05-10 ~ 2028-05-09', org: '의료기관평가인증원' },
    { code: 'C06', name: '매그너스재활요양병원', status: '인증 완료', certNo: 'CERT-2025-002', certPeriod: '2025-01-15 ~ 2029-01-14', org: '의료기관평가인증원' },
    { code: 'C07', name: '의정부카네이션요양병원', status: '인증 완료', certNo: 'CERT-2024-301', certPeriod: '2024-12-01 ~ 2028-11-30', org: '의료기관평가인증원' },
    { code: 'C08', name: '효사랑가족요양병원', status: '인증 완료', certNo: 'CERT-2026-050', certPeriod: '2026-05-20 ~ 2030-05-19', org: '의료기관평가인증원' },
  ],
  // drg·medical-resource·industrial·benefit·health-stats는 실제 연동 가능한
  // 공공 API가 없어(가상 수치를 정부기관 출처처럼 보여주던 문제) 조회 목록에서
  // 제거됨. 관련 Mock 데이터도 제거한다 — 직접 URL로 와도 가짜 데이터를 주지 않는다.
  'drug-safety': [
    { code: 'M01', product: '00진통소염제정', company: '00제약', forced: true, recallDate: '2026-04-10', reason: '용출시험 부적합' },
    { code: 'M02', product: '00항생제캡슐', company: '00바이오', forced: false, recallDate: '2026-03-22', reason: '표시기재사항 위반' },
    { code: 'M03', product: '00소화제정', company: '00제약', forced: true, recallDate: '2026-02-14', reason: '이물혼입' },
  ]
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  const { type } = await params;
  const { searchParams } = new URL(request.url);
  const searchWord = searchParams.get('q') || '';

  const apiKey = process.env.DATA_GO_KR_API_KEY || process.env.HIRA_API_KEY || process.env.PUBLIC_DATA_API_KEY;
  const mockList = mockDataMap[type] || [];

  // 1. API 키가 없거나 플레이스홀더인 경우 Mock 반환
  if (!apiKey || apiKey.includes('your-') || apiKey.includes('placeholder')) {
    const filtered = mockList.filter((item) => {
      if (!searchWord) return true;
      const strRepresentation = JSON.stringify(item).toLowerCase();
      return strRepresentation.includes(searchWord.toLowerCase());
    });

    return NextResponse.json({
      data: filtered,
      isMock: true,
      referenceDate: '2026-06-01',
    });
  }

  // 'codes'·'cert-status'는 각각 app/api/data/codes, app/api/data/cert-status의
  // 정적 라우트가 우선 처리하므로 이 동적 [type] 핸들러까지 오지 않는다.
  // 'drg'·'industrial'·'medical-resource'·'benefit'·'health-stats'는 실연동
  // 가능한 공공 API가 없어 조회 목록에서 제거됨 — 요청이 와도 빈 결과를 준다
  // (가상 수치를 정부기관 데이터처럼 반환하지 않는다).
  if (['drg', 'industrial', 'medical-resource', 'benefit', 'health-stats'].includes(type)) {
    return NextResponse.json({ data: [], isMock: false, retired: true });
  }

  // 'drug-safety'는 식약처 의약품 회수·판매중지 정보서비스로 실제 연동 (XML 응답)
  if (type === 'drug-safety') {
    try {
      const drugEndpoint = 'https://apis.data.go.kr/1471000/MdcinRtrvlSleStpgeInfoService04/getMdcinRtrvlSleStpgelList03';
      const queryParams = `serviceKey=${encodeURIComponent(apiKey)}&pageNo=1&numOfRows=100`;
      const response = await fetch(`${drugEndpoint}?${queryParams}`, { next: { revalidate: 300 } });

      if (!response.ok) {
        throw new Error(`OpenAPI 응답 오류: ${response.status}`);
      }

      const xmlText = await response.text();
      const items = parseXmlItems(xmlText);

      const formattedData = items.map((item, idx) => {
        const raw = item.RTRVL_CMMND_DT || item.RECALL_COMMAND_DATE || '';
        const recallDate = raw.length >= 8 ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : raw;
        return {
          code: item.ITEM_SEQ || `M${idx}`,
          product: item.PRDUCT || '품목명 정보 없음',
          company: item.ENTRPS || '',
          forced: item.ENFRC_YN === 'Y',
          recallDate,
          reason: item.RTRVL_RESN || '',
        };
      });

      const filtered = formattedData.filter((item) => {
        if (!searchWord) return true;
        const q = searchWord.toLowerCase();
        return item.product.toLowerCase().includes(q) || item.company.toLowerCase().includes(q);
      });

      return NextResponse.json({
        data: filtered,
        isMock: false,
        referenceDate: new Date().toISOString().split('T')[0],
      });
    } catch (error: any) {
      console.error('api/data/drug-safety 호출 실패, Mock 모드 대체:', error.message);
      return NextResponse.json({
        data: mockList,
        isMock: true,
        fallbackError: error.message,
        referenceDate: '2026-06-01',
      });
    }
  }

  // 2. 그 외 타입(details 등)은 심평원 병원정보서비스로 실제 연동
  try {
    const apiEndpoint = 'http://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList';

    // 쿼리 스트링 수동 구성 (자동 이중인코딩 방지)
    let queryParams = `serviceKey=${encodeURIComponent(apiKey)}&pageNo=1&numOfRows=20&_type=json`;
    if (searchWord) {
      queryParams += `&yadmNm=${encodeURIComponent(searchWord)}`;
    }

    const fetchUrl = `${apiEndpoint}?${queryParams}`;

    const response = await fetch(fetchUrl, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
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
      throw new Error(`API가 유효한 JSON을 반환하지 않았습니다. XML 응답이거나 점검 중일 수 있습니다.`);
    }

    const items = json.response?.body?.items?.item;

    if (!items) {
      // 데이터가 없는 경우 안전하게 Mock으로 대체
      return NextResponse.json({
        data: mockList,
        isMock: true,
        referenceDate: new Date().toISOString().split('T')[0],
      });
    }

    const itemArray = Array.isArray(items) ? items : [items];

    // 병상수는 hospInfoServicev2에 없고, 별도 승인된 의료기관별상세정보서비스
    // (MadmDtlInfoService2.8/getEqpInfo2.8, 시설정보)의 permSbdCnt(허가병상수)가
    // 실제 값이다 — 병원별로 추가 조회해서 합친다.
    const bedsByYkiho = new Map<string, number>();
    await Promise.all(
      itemArray.map(async (item: any) => {
        if (!item.ykiho) return;
        try {
          const eqpUrl = `https://apis.data.go.kr/B551182/MadmDtlInfoService2.8/getEqpInfo2.8?serviceKey=${encodeURIComponent(apiKey)}&ykiho=${encodeURIComponent(item.ykiho)}&pageNo=1&numOfRows=1&_type=json`;
          const eqpRes = await fetch(eqpUrl, { next: { revalidate: 300 } });
          if (!eqpRes.ok) return;
          const eqpJson = await eqpRes.json();
          const eqpItem = eqpJson.response?.body?.items?.item;
          const permSbdCnt = Array.isArray(eqpItem) ? eqpItem[0]?.permSbdCnt : eqpItem?.permSbdCnt;
          if (permSbdCnt != null) bedsByYkiho.set(item.ykiho, parseInt(permSbdCnt, 10));
        } catch {
          // 병상수 보강 실패는 무시 — 없으면 그냥 표시하지 않는다 (가짜 값으로 채우지 않음)
        }
      })
    );

    // details 스키마 정규화 (이 지점에 도달하는 유일한 type)
    // hospInfoServicev2/getHospBasisList는 병상수 필드를 제공하지 않으므로
    // 없는 값을 임의 상수로 채우지 않고, 실제 존재하는 필드만 매핑한다.
    const formattedData = itemArray.map((item: any, idx: number) => {
      const raw = String(item.estbDd ?? '');
      const estbDd = raw.length === 8 ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : '';
      return {
        code: item.ykiho || `H${idx}`,
        name: item.yadmNm || '의료기관',
        type: item.clCdNm || '기타',
        tel: item.telno || '',
        doctors: item.drTotCnt ? parseInt(item.drTotCnt, 10) : null,
        beds: item.ykiho ? (bedsByYkiho.get(item.ykiho) ?? null) : null,
        estbDd,
        address: item.addr || '주소 정보 없음',
      };
    });

    return NextResponse.json({
      data: formattedData,
      isMock: false,
      referenceDate: new Date().toISOString().split('T')[0],
    });
  } catch (error: any) {
    console.error(`api/data/${type} 호출 실패, Mock 모드 대체:`, error.message);
    return NextResponse.json({
      data: mockList,
      isMock: true,
      fallbackError: error.message,
      referenceDate: '2026-06-01',
    });
  }
}
