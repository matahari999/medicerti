'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Database,
  Search,
  Building2,
  MapPin,
  Phone,
  Calendar,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Zap,
  Info,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// 공공데이터 타입 한국어 맵
const typeLabels: Record<string, string> = {
  details: '병원 상세정보',
  'cert-status': '인증현황',
  drg: '포괄수가 DRG',
  'medical-resource': '의료자원 인구기준',
  industrial: '산재병원 정보',
  benefit: '요양급여 적용기준',
  'health-stats': '보건의료 통계',
};

const typeDescriptions: Record<string, string> = {
  details: '건강보험심사평가원(HIRA)의 전국 병원 데이터베이스를 조회하여, 병상 규모, 전화번호, 의료진 인력 등의 상세 정보를 확인합니다.',
  'cert-status': '의료기관평가인증원의 공인 심사를 거쳐 정식 의료기관 인증을 획득한 전국 요양병원 및 정신병원의 유효 인증서 상태입니다.',
  drg: '백내장, 편도선, 충수돌기(맹장) 등 보건복지부가 지정한 7대 질병군 포괄수가제(DRG)가 적용되는 의료기관과 수가 정보입니다.',
  'medical-resource': '시/도 지방자치단체별 인구 대비 확보된 의료진 수 및 병상 비율 등의 공공 자원 불균형 지표 통계입니다.',
  industrial: '근로복지공단으로부터 산재보상보험법에 의해 산재 환자에 대해 원활한 요양과 장해 치료를 약속받은 지정 의료원입니다.',
  benefit: '심평원의 급여기준 심사 지침서에 의거한 요양기관 급여 적용 기준 및 억제대/치료재료 본인부담 산정률입니다.',
  'health-stats': '보건복지부 국가통계포털에 수록된 요양병원 입원 환자 평균 재원일수, 노인성 질환자 진료 건수 등의 거시 지표입니다.',
};

export default function DynamicDataPage() {
  const router = useRouter();
  const params = useParams();
  const type = (params?.type as string) || '';

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchWord, setSearchWord] = useState('');
  const [isMock, setIsMock] = useState(false);

  const fetchDynamicData = async () => {
    setLoading(true);
    try {
      const url = new URL(`/api/data/${type}`, window.location.origin);
      if (searchWord) {
        url.searchParams.set('q', searchWord);
      }
      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
        setIsMock(json.isMock ?? true);
      }
    } catch (err) {
      console.error(`${type} 데이터 로드 에러:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type) {
      fetchDynamicData();
    }
  }, [type]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDynamicData();
  };

  // 잘못된 경로 처리
  if (type && !typeLabels[type]) {
    return (
      <div className="card p-8 text-center space-y-4 max-w-md mx-auto mt-12">
        <AlertCircle size={40} className="text-rose-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-800">잘못된 공공데이터 경로</h2>
        <p className="text-xs text-slate-500">
          요청하신 공공데이터 메뉴 `{type}`는 존재하지 않거나 연동되지 않는 정보입니다.
        </p>
        <Link
          href="/data"
          className="inline-block text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          포털 홈으로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      {/* 뒤로가기 버튼 및 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <Link
            href="/data"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={12} />
            공공데이터 포털 홈
          </Link>
          <h1 className="section-title flex items-center gap-2 mt-1">
            <Database size={20} className="text-blue-600" />
            {typeLabels[type]} 조회
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl">
            {typeDescriptions[type]}
          </p>
        </div>

        {/* API 연동 뱃지 */}
        <div className="flex-shrink-0 self-start md:self-end">
          {isMock ? (
            <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
              <Info size={12} className="text-slate-400" />
              데모 모드 (Mock 데이터)
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full animate-pulse shadow-sm">
              <Zap size={12} className="text-emerald-500" />
              실시간 API 연동 활성
            </span>
          )}
        </div>
      </div>

      {/* 검색 바 */}
      <div className="card p-3.5 bg-slate-50 border-slate-100">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400" size={14} />
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="데이터 키워드 또는 명칭 검색..."
              className="w-full text-xs pl-8 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <button
            type="submit"
            className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            조회
          </button>
        </form>
      </div>

      {/* 동적 데이터 테이블 렌더링 */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[900px]">
            {/* 1. 병원 상세정보 (details) */}
            {type === 'details' && (
              <>
                <thead>
                  <tr>
                    <th className="min-w-[180px]">의료기관명</th>
                    <th className="w-[140px]">전화번호</th>
                    <th className="w-[100px] text-center">병상수</th>
                    <th className="w-[100px] text-center">의사수</th>
                    <th className="w-[100px] text-center">간호사수</th>
                    <th className="min-w-[240px]">소재지 주소</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-8 text-slate-400">데이터 로딩 중...</td></tr>
                  ) : data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.code}>
                        <td className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Building2 size={13} className="text-slate-400" />{item.name}</td>
                        <td className="text-xs text-slate-600"><span className="flex items-center gap-1"><Phone size={11} className="text-slate-400" />{item.tel}</span></td>
                        <td className="text-center font-semibold text-slate-700">{item.beds}개</td>
                        <td className="text-center text-slate-600">{item.doctors}명</td>
                        <td className="text-center text-slate-600">{item.nurses}명</td>
                        <td className="text-xs text-slate-500"><span className="flex items-center gap-1"><MapPin size={11} className="text-slate-400" />{item.address}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="text-center py-8 text-slate-400">데이터가 존재하지 않습니다.</td></tr>
                  )}
                </tbody>
              </>
            )}

            {/* 2. 인증현황 (cert-status) */}
            {type === 'cert-status' && (
              <>
                <thead>
                  <tr>
                    <th className="min-w-[180px]">의료기관명</th>
                    <th className="w-[130px]">인증 상태</th>
                    <th className="w-[160px]">인증서 번호</th>
                    <th className="min-w-[220px]">인증 유효 기간</th>
                    <th className="w-[150px]">인증 발급 기관</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">데이터 로딩 중...</td></tr>
                  ) : data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.code}>
                        <td className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Building2 size={13} className="text-slate-400" />{item.name}</td>
                        <td>
                          <span className={cn(
                            'text-[11px] font-bold px-2 py-0.5 rounded border shadow-sm',
                            item.status.includes('조건') ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          )}>
                            {item.status}
                          </span>
                        </td>
                        <td className="text-xs font-mono text-slate-600 font-semibold">{item.certNo}</td>
                        <td className="text-xs text-slate-500 font-semibold flex items-center gap-1"><Calendar size={11} className="text-slate-400" />{item.certPeriod}</td>
                        <td className="text-xs text-slate-600 font-semibold">{item.org}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">데이터가 존재하지 않습니다.</td></tr>
                  )}
                </tbody>
              </>
            )}

            {/* 3. 포괄수가 DRG (drg) */}
            {type === 'drg' && (
              <>
                <thead>
                  <tr>
                    <th className="w-[160px]">구분</th>
                    <th className="w-[110px] text-center">질병군 코드</th>
                    <th className="min-w-[200px]">포괄수가 항목명</th>
                    <th className="w-[140px] text-right">기준 수가</th>
                    <th className="min-w-[240px]">세부 설명</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">데이터 로딩 중...</td></tr>
                  ) : data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.code}>
                        <td><span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{item.type}</span></td>
                        <td className="text-center font-mono text-xs font-black text-blue-600">{item.codeName}</td>
                        <td className="font-bold text-slate-800 text-sm">{item.name}</td>
                        <td className="text-right font-black text-slate-700 text-xs">{item.price}</td>
                        <td className="text-xs text-slate-500">{item.desc}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">데이터가 존재하지 않습니다.</td></tr>
                  )}
                </tbody>
              </>
            )}

            {/* 4. 의료자원 인구기준 (medical-resource) */}
            {type === 'medical-resource' && (
              <>
                <thead>
                  <tr>
                    <th className="w-[160px]">행정 구역</th>
                    <th className="w-[160px] text-center">1,000명당 의사수</th>
                    <th className="w-[160px] text-center">1,000명당 간호사수</th>
                    <th className="w-[160px] text-center">1,000명당 병상수</th>
                    <th className="min-w-[240px]">세부 사항</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">데이터 로딩 중...</td></tr>
                  ) : data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.code}>
                        <td className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><MapPin size={13} className="text-blue-500" />{item.region}</td>
                        <td className="text-center font-semibold text-slate-700">{item.docRatio}</td>
                        <td className="text-center font-semibold text-slate-700">{item.nurseRatio}</td>
                        <td className="text-center font-semibold text-slate-700">{item.bedRatio}</td>
                        <td className="text-xs text-slate-500">{item.desc}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">데이터가 존재하지 않습니다.</td></tr>
                  )}
                </tbody>
              </>
            )}

            {/* 5. 산재병원 정보 (industrial) */}
            {type === 'industrial' && (
              <>
                <thead>
                  <tr>
                    <th className="min-w-[180px]">산재지정 기관명</th>
                    <th className="w-[140px]">지정 분류</th>
                    <th className="w-[130px]">전화번호</th>
                    <th className="min-w-[200px]">진료 제약 및 범위</th>
                    <th className="min-w-[240px]">소재지 주소</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">데이터 로딩 중...</td></tr>
                  ) : data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.code}>
                        <td className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Building2 size={13} className="text-slate-400" />{item.name}</td>
                        <td><span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{item.class}</span></td>
                        <td className="text-xs text-slate-600"><span className="flex items-center gap-1"><Phone size={11} className="text-slate-400" />{item.tel}</span></td>
                        <td className="text-xs text-slate-600 font-medium">{item.limit}</td>
                        <td className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={11} className="text-slate-400" />{item.address}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">데이터가 존재하지 않습니다.</td></tr>
                  )}
                </tbody>
              </>
            )}

            {/* 6. 요양급여 적용기준 (benefit) */}
            {type === 'benefit' && (
              <>
                <thead>
                  <tr>
                    <th className="w-[130px]">분류 카테고리</th>
                    <th className="w-[110px] text-center">심사 코드</th>
                    <th className="min-w-[200px]">요양급여 심사 기준명</th>
                    <th className="min-w-[240px]">급여 인정 범위 조건</th>
                    <th className="min-w-[200px]">관련 고시 사항</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">데이터 로딩 중...</td></tr>
                  ) : data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.code}>
                        <td><span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{item.category}</span></td>
                        <td className="text-center font-mono text-xs font-bold text-slate-600">{item.codeName}</td>
                        <td className="font-bold text-slate-800 text-sm">{item.name}</td>
                        <td className="text-xs text-slate-600 font-semibold">{item.limit}</td>
                        <td className="text-xs text-slate-500">{item.desc}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">데이터가 존재하지 않습니다.</td></tr>
                  )}
                </tbody>
              </>
            )}

            {/* 7. 보건의료 통계 (health-stats) */}
            {type === 'health-stats' && (
              <>
                <thead>
                  <tr>
                    <th className="min-w-[240px]">보건의료 지표명</th>
                    <th className="w-[120px] text-center">기준 주기</th>
                    <th className="w-[140px] text-right">통계값</th>
                    <th className="w-[150px]">제공 기관</th>
                    <th className="min-w-[240px]">세부 설명</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">데이터 로딩 중...</td></tr>
                  ) : data.length > 0 ? (
                    data.map((item) => (
                      <tr key={item.code}>
                        <td className="font-bold text-slate-800 text-sm">{item.indicator}</td>
                        <td className="text-center text-xs text-slate-500 font-semibold">{item.period}</td>
                        <td className="text-right font-black text-blue-600 text-xs">{item.value}</td>
                        <td className="text-xs text-slate-600 font-semibold">{item.source}</td>
                        <td className="text-xs text-slate-500">{item.desc}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-400">데이터가 존재하지 않습니다.</td></tr>
                  )}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
