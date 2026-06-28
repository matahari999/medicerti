import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const API_KEY = process.env.PUBLIC_DATA_API_KEY!

// 지역 코드 → 시도명 매핑
const SIDO_MAP: Record<string, string> = {
  '11': '서울특별시', '26': '부산광역시', '27': '대구광역시', '28': '인천광역시',
  '29': '광주광역시', '30': '대전광역시', '31': '울산광역시', '36': '세종특별자치시',
  '41': '경기도', '42': '강원도', '43': '충청북도', '44': '충청남도',
  '45': '전라북도', '46': '전라남도', '47': '경상북도', '48': '경상남도',
  '50': '제주특별자치도',
}

// 지역명 정규화 (주소에서 시도 추출)
function extractRegion(address: string): string {
  for (const sido of Object.values(SIDO_MAP)) {
    if (address.startsWith(sido.slice(0, 2))) {
      // 약칭 처리
      if (sido.includes('특별시') || sido.includes('광역시') || sido.includes('특별자치시')) {
        return sido.replace(/(특별시|광역시|특별자치시)$/, '')
      }
      if (sido.includes('특별자치도')) return sido.replace('특별자치도', '')
      return sido.replace('도', '')
    }
  }
  return ''
}

export interface PublicHospital {
  name:           string
  licenseNumber:  string
  address:        string
  phone:          string
  bedCount:       number | null
  region:         string
  hospitalType:   string
}

/**
 * GET /api/public/hospitals?q=<병원명>&page=1&rows=10
 * 공공데이터포털 의료기관 정보 조회 (건강보험심사평가원 요양기관정보)
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const q    = searchParams.get('q')?.trim()
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const rows = Math.min(parseInt(searchParams.get('rows') ?? '10', 10), 30)

  if (!q || q.length < 2) {
    return NextResponse.json({ error: '검색어는 2자 이상 입력하세요' }, { status: 400 })
  }

  // 1차 시도: 건강보험심사평가원 요양기관 정보 서비스 (HIRA)
  try {
    const url = new URL('https://apis.data.go.kr/B551182/MdcinHospstInfoInqireService02/getMdcinHospstInfoInqire')
    url.searchParams.set('serviceKey', API_KEY)
    url.searchParams.set('QD', q)
    url.searchParams.set('clCd', '28')       // 28 = 요양병원
    url.searchParams.set('pageNo', String(page))
    url.searchParams.set('numOfRows', String(rows))
    url.searchParams.set('_type', 'json')

    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 },     // 5분 캐시
    })

    if (res.ok) {
      const json = await res.json() as {
        response?: {
          header?: { resultCode?: string; resultMsg?: string }
          body?: {
            totalCount?: number
            items?: { item?: unknown[] | unknown }
          }
        }
      }

      const header = json.response?.header
      const body   = json.response?.body

      if (header?.resultCode === '00' && body) {
        const raw = body.items?.item
        const items = Array.isArray(raw) ? raw : raw ? [raw] : []

        const hospitals: PublicHospital[] = items.map((item: Record<string, unknown>) => {
          const address = String(item.addr ?? item.hospAddr ?? '')
          return {
            name:          String(item.yadmNm ?? item.hospNm ?? ''),
            licenseNumber: String(item.ykiho ?? item.hpid ?? ''),
            address,
            phone:         String(item.telno ?? item.telno1 ?? ''),
            bedCount:      item.sickbdCnt ? parseInt(String(item.sickbdCnt), 10) : null,
            region:        extractRegion(address),
            hospitalType:  String(item.clCdNm ?? '요양병원'),
          }
        })

        return NextResponse.json({
          data:  hospitals,
          total: body.totalCount ?? hospitals.length,
          page,
        })
      }
    }
  } catch {
    // fallthrough to second attempt
  }

  // 2차 시도: 요양기관 서비스 (다른 엔드포인트)
  try {
    const url2 = new URL('https://apis.data.go.kr/B551182/MdcinHospstInfoInqireService/getHospBscInfoInqire')
    url2.searchParams.set('serviceKey', API_KEY)
    url2.searchParams.set('QD', q)
    url2.searchParams.set('pageNo', String(page))
    url2.searchParams.set('numOfRows', String(rows))
    url2.searchParams.set('_type', 'json')

    const res2 = await fetch(url2.toString(), { next: { revalidate: 300 } })

    if (res2.ok) {
      const json2 = await res2.json() as Record<string, unknown>
      const body2 = (json2 as { response?: { body?: { items?: { item?: unknown[] }; totalCount?: number } } }).response?.body

      if (body2) {
        const raw2 = body2.items?.item
        const items2 = Array.isArray(raw2) ? raw2 : raw2 ? [raw2] : []

        const hospitals2: PublicHospital[] = items2.map((raw2item) => {
          const item = raw2item as Record<string, unknown>
          const address = String(item.addr ?? '')
          return {
            name:          String(item.yadmNm ?? ''),
            licenseNumber: String(item.ykiho ?? ''),
            address,
            phone:         String(item.telno ?? ''),
            bedCount:      item.sickbdCnt ? parseInt(String(item.sickbdCnt), 10) : null,
            region:        extractRegion(address),
            hospitalType:  String(item.clCdNm ?? ''),
          }
        })

        return NextResponse.json({
          data:  hospitals2,
          total: body2.totalCount ?? hospitals2.length,
          page,
        })
      }
    }
  } catch {
    // fallthrough
  }

  // B551182 HIRA 게이트웨이 장애 (모든 경로 500 반환) — 서비스 일시 중단 안내
  return NextResponse.json(
    { error: '건강보험심사평가원 공공데이터 서비스가 일시적으로 점검 중입니다. 직접 입력해 주세요.', data: [], unavailable: true },
    { status: 503 }
  )
}
