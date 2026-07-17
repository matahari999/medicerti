import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseXmlItems } from '@/lib/publicData/xml';

// 전국 병원 적정성 평가 고품질 Mock 데이터 (Fallback & 데모용)
const mockEvaluations = [
  {
    code: 'YKIHO001',
    name: '무지개요양병원 (서울)',
    type: '요양병원',
    address: '서울시 영등포구 국회대로 456',
    grade: 1,
    score: 100,
    itemGrades: [{ code: 'asmGrd01', grade: 1 }, { code: 'asmGrd04', grade: 1 }, { code: 'asmGrd07', grade: 1 }, { code: 'asmGrd12', grade: 1 }, { code: 'asmGrd19', grade: 1 }]
  },
  {
    code: 'YKIHO002',
    name: '사랑나눔요양병원',
    type: '요양병원',
    address: '인천시 부평구 경인로 789',
    grade: 2,
    score: 80,
    itemGrades: [{ code: 'asmGrd01', grade: 2 }, { code: 'asmGrd04', grade: 2 }, { code: 'asmGrd07', grade: 2 }, { code: 'asmGrd12', grade: 1 }, { code: 'asmGrd19', grade: 2 }]
  },
  {
    code: 'YKIHO003',
    name: '행복실버요양병원',
    type: '요양병원',
    address: '경기도 성남시 분당구 황새울로 45',
    grade: 1,
    score: 100,
    itemGrades: [{ code: 'asmGrd01', grade: 1 }, { code: 'asmGrd04', grade: 1 }, { code: 'asmGrd07', grade: 1 }, { code: 'asmGrd12', grade: 1 }, { code: 'asmGrd19', grade: 1 }]
  },
  {
    code: 'YKIHO004',
    name: '늘푸른재활요양병원',
    type: '요양병원',
    address: '부산시 해운대구 우동 987',
    grade: 3,
    score: 60,
    itemGrades: [{ code: 'asmGrd01', grade: 3 }, { code: 'asmGrd04', grade: 3 }, { code: 'asmGrd07', grade: 3 }, { code: 'asmGrd12', grade: 2 }, { code: 'asmGrd19', grade: 3 }]
  },
  {
    code: 'YKIHO005',
    name: '무지개요양병원 (부산)',
    type: '요양병원',
    address: '부산시 금정구 중앙대로 1004',
    grade: 1,
    score: 100,
    itemGrades: [{ code: 'asmGrd01', grade: 1 }, { code: 'asmGrd04', grade: 1 }, { code: 'asmGrd07', grade: 1 }, { code: 'asmGrd12', grade: 1 }, { code: 'asmGrd19', grade: 1 }]
  },
  {
    code: 'YKIHO006',
    name: '무지개요양병원 (대전)',
    type: '요양병원',
    address: '대전시 중구 계룡로 777',
    grade: 1,
    score: 100,
    itemGrades: [{ code: 'asmGrd01', grade: 1 }, { code: 'asmGrd04', grade: 1 }, { code: 'asmGrd07', grade: 1 }, { code: 'asmGrd12', grade: 1 }, { code: 'asmGrd19', grade: 1 }]
  },
  {
    code: 'YKIHO007',
    name: '효사랑가족요양병원',
    type: '요양병원',
    address: '전북 전주시 완산구 용머리로 12',
    grade: 1,
    score: 100,
    itemGrades: [{ code: 'asmGrd01', grade: 1 }, { code: 'asmGrd04', grade: 1 }, { code: 'asmGrd07', grade: 1 }, { code: 'asmGrd12', grade: 1 }, { code: 'asmGrd19', grade: 1 }]
  },
  {
    code: 'YKIHO008',
    name: '보람요양병원',
    type: '요양병원',
    address: '울산시 남구 번영로 15',
    grade: 2,
    score: 80,
    itemGrades: [{ code: 'asmGrd01', grade: 2 }, { code: 'asmGrd04', grade: 2 }, { code: 'asmGrd07', grade: 2 }, { code: 'asmGrd12', grade: 1 }, { code: 'asmGrd19', grade: 2 }]
  },
  {
    code: 'YKIHO009',
    name: '한마음요양병원',
    type: '요양병원',
    address: '경남 창원시 성산구 마디미로 8',
    grade: 2,
    score: 80,
    itemGrades: [{ code: 'asmGrd01', grade: 2 }, { code: 'asmGrd04', grade: 2 }, { code: 'asmGrd07', grade: 2 }, { code: 'asmGrd12', grade: 1 }, { code: 'asmGrd19', grade: 2 }]
  },
  {
    code: 'YKIHO010',
    name: '사랑채노인요양병원',
    type: '요양병원',
    address: '강원도 춘천시 영서로 302',
    grade: 3,
    score: 60,
    itemGrades: [{ code: 'asmGrd01', grade: 3 }, { code: 'asmGrd04', grade: 3 }, { code: 'asmGrd07', grade: 3 }, { code: 'asmGrd12', grade: 2 }, { code: 'asmGrd19', grade: 3 }]
  },
  {
    code: 'YKIHO011',
    name: '은혜실버요양병원',
    type: '요양병원',
    address: '부산시 동래구 충렬대로 19',
    grade: 1,
    score: 100,
    itemGrades: [{ code: 'asmGrd01', grade: 1 }, { code: 'asmGrd04', grade: 1 }, { code: 'asmGrd07', grade: 1 }, { code: 'asmGrd12', grade: 1 }, { code: 'asmGrd19', grade: 1 }]
  },
  {
    code: 'YKIHO012',
    name: '햇살재활요양병원',
    type: '요양병원',
    address: '인천시 미추홀구 경인로 222',
    grade: 2,
    score: 80,
    itemGrades: [{ code: 'asmGrd01', grade: 2 }, { code: 'asmGrd04', grade: 2 }, { code: 'asmGrd07', grade: 2 }, { code: 'asmGrd12', grade: 1 }, { code: 'asmGrd19', grade: 2 }]
  },
  {
    code: 'YKIHO013',
    name: '가람정신건강의학과병원',
    type: '정신병원',
    address: '충북 청주시 상당구 상당로 15',
    grade: 3,
    score: 60,
    itemGrades: [{ code: 'asmGrd01', grade: 3 }, { code: 'asmGrd04', grade: 3 }, { code: 'asmGrd07', grade: 3 }, { code: 'asmGrd12', grade: 2 }, { code: 'asmGrd19', grade: 3 }]
  },
  {
    code: 'YKIHO014',
    name: '푸른솔정신병원',
    type: '정신병원',
    address: '대구시 수성구 달구벌대로 55',
    grade: 2,
    score: 80,
    itemGrades: [{ code: 'asmGrd01', grade: 2 }, { code: 'asmGrd04', grade: 2 }, { code: 'asmGrd07', grade: 2 }, { code: 'asmGrd12', grade: 1 }, { code: 'asmGrd19', grade: 2 }]
  },
  {
    code: 'YKIHO015',
    name: '서울중앙급성기병원',
    type: '급성기병원',
    address: '서울시 중구 세종대로 12',
    grade: 1,
    score: 100,
    itemGrades: [{ code: 'asmGrd01', grade: 1 }, { code: 'asmGrd04', grade: 1 }, { code: 'asmGrd07', grade: 1 }, { code: 'asmGrd12', grade: 1 }, { code: 'asmGrd19', grade: 1 }]
  }
];

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const searchWord = searchParams.get('q') || '';
  const gradeFilter = searchParams.get('grade') ? parseInt(searchParams.get('grade') || '0', 10) : 0;
  const typeFilter = searchParams.get('type') || '';
  const regionFilter = searchParams.get('region') || '';

  const apiKey = process.env.DATA_GO_KR_API_KEY || process.env.HIRA_API_KEY || process.env.PUBLIC_DATA_API_KEY;

  // 1. API 키가 유효하지 않거나 플레이스홀더인 경우 Mock 데이터 처리
  if (!apiKey || apiKey.includes('your-') || apiKey.includes('placeholder')) {
    const filtered = mockEvaluations.filter((item) => {
      const matchSearch = searchWord 
        ? item.name.includes(searchWord) || item.address.includes(searchWord)
        : true;
      const matchGrade = gradeFilter ? item.grade === gradeFilter : true;
      const matchType = typeFilter ? item.type === typeFilter : true;
      const matchRegion = regionFilter ? item.address.includes(regionFilter) : true;
      return matchSearch && matchGrade && matchType && matchRegion;
    });

    return NextResponse.json({
      data: filtered,
      isMock: true,
      referenceDate: '2026-06-01',
    });
  }

  // 2. 실제 건강보험심사평가원(HIRA) 병원평가정보서비스 호출
  // 이 API는 병원명이 아니라 암호화된 요양기호(ykiho)로만 조회되므로, 먼저
  // 병원정보서비스에서 이름으로 ykiho를 찾은 뒤 그 기호로 평가등급을 조회하는
  // 2단계 체이닝이 필요하다.
  try {
    const basisUrl = new URL('http://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList');
    basisUrl.searchParams.set('serviceKey', apiKey);
    basisUrl.searchParams.set('pageNo', '1');
    basisUrl.searchParams.set('numOfRows', '8');
    basisUrl.searchParams.set('_type', 'json');
    if (searchWord) {
      basisUrl.searchParams.set('yadmNm', searchWord);
    }

    const basisRes = await fetch(basisUrl.toString(), {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });
    if (!basisRes.ok) throw new Error(`병원정보서비스 응답 오류: ${basisRes.status}`);

    const basisJson = await basisRes.json();
    const basisItems = basisJson.response?.body?.items?.item;
    const hospitals = basisItems ? (Array.isArray(basisItems) ? basisItems : [basisItems]) : [];

    // 각 병원의 ykiho로 평가등급 조회 (평가 이력이 없는 병원은 결과가 비어 자동 제외됨)
    const evaluated = await Promise.all(
      hospitals.map(async (h: any) => {
        if (!h.ykiho) return null;
        const asmUrl = `https://apis.data.go.kr/B551182/hospAsmInfoService1/getHospAsmInfo1?serviceKey=${encodeURIComponent(apiKey)}&pageNo=1&numOfRows=1&ykiho=${encodeURIComponent(h.ykiho)}`;
        const asmRes = await fetch(asmUrl, { next: { revalidate: 300 } });
        if (!asmRes.ok) return null;

        const asmItems = parseXmlItems(await asmRes.text());
        const asm = asmItems[0];
        if (!asm) return null;

        // asmGrdNN 형태의 항목별 등급 필드를 전부 모아 종합등급을 평균으로 산출
        const itemGrades = Object.entries(asm)
          .filter(([key]) => /^asmGrd\d+$/.test(key))
          .map(([key, value]) => ({ code: key, grade: parseInt(value, 10) }))
          .filter((g) => !Number.isNaN(g.grade));
        if (itemGrades.length === 0) return null;

        const grade = Math.round(itemGrades.reduce((sum, g) => sum + g.grade, 0) / itemGrades.length);
        // score는 등급(1~5)에서 결정론적으로 환산한 값 — 실측 지표가 아니라 등급의 표시용 변환임
        const score = Math.round((100 - (grade - 1) * 20) * 10) / 10;

        return {
          code: h.ykiho,
          name: h.yadmNm || asm.yadmNm || '의료기관',
          type: h.clCdNm || asm.clCdNm || '요양병원',
          address: h.addr || '주소 정보가 제공되지 않습니다.',
          grade,
          score,
          itemGrades,
        };
      })
    );

    const formattedData = evaluated.filter((item): item is NonNullable<typeof item> => item !== null);

    // 쿼리 필터 추가 적용
    const filteredData = formattedData.filter((item) => {
      const matchGrade = gradeFilter ? item.grade === gradeFilter : true;
      const matchType = typeFilter ? item.type === typeFilter : true;
      const matchRegion = regionFilter ? item.address.includes(regionFilter) : true;
      return matchGrade && matchType && matchRegion;
    });

    return NextResponse.json({
      data: filteredData,
      isMock: false,
      referenceDate: new Date().toISOString().split('T')[0],
    });
  } catch (error: any) {
    console.error('HIRA 적정성 평가 API 호출 실패, Mock 모드 대체:', error.message);
    
    // API 에러 발생 시 Mock Fallback 반환
    const filtered = mockEvaluations.filter((item) => {
      const matchSearch = searchWord 
        ? item.name.includes(searchWord) || item.address.includes(searchWord)
        : true;
      const matchGrade = gradeFilter ? item.grade === gradeFilter : true;
      const matchType = typeFilter ? item.type === typeFilter : true;
      const matchRegion = regionFilter ? item.address.includes(regionFilter) : true;
      return matchSearch && matchGrade && matchType && matchRegion;
    });

    return NextResponse.json({
      data: filtered,
      isMock: true,
      fallbackError: error.message,
      referenceDate: '2026-06-01',
    });
  }
}
