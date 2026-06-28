import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mockNotices } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || '';
    const query = searchParams.get('q') || '';
    const typeFilter = searchParams.get('type') || ''; // 병원유형 필터

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 1. 환경변수 미설정(Mock 모드)인 경우 로컬 Mock 데이터 필터링 후 반환
    const isMockMode =
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl.includes('your-supabase-url') ||
      supabaseUrl.includes('placeholder');

    if (isMockMode) {
      const filtered = mockNotices.filter((notice) => {
        const matchSource = source ? notice.source === source : true;
        const matchQuery = query
          ? notice.title.includes(query) || notice.content.includes(query)
          : true;
        const matchType = typeFilter
          ? !notice.targetHospitalTypes || (notice.targetHospitalTypes as string[]).includes(typeFilter)
          : true;
        return matchSource && matchQuery && matchType;
      });

      return NextResponse.json({
        data: filtered,
        isMock: true,
      });
    }

    // 2. 실제 Supabase 데이터베이스 조회
    const supabase = await createClient();
    let queryBuilder = supabase.from('notices').select('*').order('published_at', { ascending: false });

    if (source) {
      queryBuilder = queryBuilder.eq('source', source);
    }
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
    }

    const { data: dbNotices, error } = await queryBuilder;

    if (error) {
      throw error;
    }

    // 데이터 가공 및 필터링 (target_hospital_types 텍스트 어레이 매칭)
    const formattedData = dbNotices.map((n: any) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      source: n.source,
      sourceUrl: n.source_url,
      urgency: n.urgency,
      targetHospitalTypes: n.target_hospital_types.length > 0 ? n.target_hospital_types : null,
      publishedAt: n.published_at,
      createdAt: n.created_at,
    }));

    const filteredData = typeFilter
      ? formattedData.filter(
          (notice: any) =>
            notice.targetHospitalTypes === null || notice.targetHospitalTypes.includes(typeFilter)
        )
      : formattedData;

    return NextResponse.json({
      data: filteredData,
      isMock: false,
    });
  } catch (error: any) {
    console.error('Supabase notices 조회 실패, Mock Fallback 적용:', error.message);
    
    // DB 조회 에러 시 안전하게 로컬 Mock으로 Fallback
    const filtered = mockNotices.filter((notice) => {
      const { searchParams } = new URL(request.url);
      const source = searchParams.get('source') || '';
      const query = searchParams.get('q') || '';
      
      const matchSource = source ? notice.source === source : true;
      const matchQuery = query
        ? notice.title.includes(query) || notice.content.includes(query)
        : true;
      return matchSource && matchQuery;
    });

    return NextResponse.json({
      data: filtered,
      isMock: true,
      fallbackError: error.message,
    });
  }
}
