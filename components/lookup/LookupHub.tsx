// 기관 조회 허브 — 관리자(공공데이터 포털)와 일반 화면(병원 조회)이 공유
// 병원별 조회(코드/상세/인증/개폐업/적정성)는 통합 검색으로, 기준·통계 자료는 카테고리 브라우징으로 분리

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Database,
  Search,
  Loader2,
  Building2,
  FileBarChart,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface HospitalRecord {
  code?: string;
  id?: string;
  name: string;
  address?: string;
  [key: string]: unknown;
}

interface CategoryResult {
  items: HospitalRecord[];
  isMock: boolean;
}

// 실제 공공 API로 검증된 카테고리만 노출한다. 실연동 소스가 없어 가상(Mock)
// 수치를 정부기관 출처처럼 보여주던 산재지정/DRG/의료자원/요양급여/보건통계
// 5종은 조회 목록에서 제거함(실제 자료/API 확보 시 재추가).
const HOSPITAL_TYPES = [
  { type: 'codes',       label: '의료기관 코드',    path: '/codes',       apiPath: '/api/data/codes' },
  { type: 'details',     label: '상세 정보',        path: '/details',     apiPath: '/api/data/details' },
  { type: 'cert-status', label: '인증 현황 (급성기)', path: '/cert-status', apiPath: '/api/data/cert-status' },
  { type: 'status',      label: '개업·폐업·휴업',   path: '/status',      apiPath: '/api/data/status' },
  { type: 'evaluation',  label: '적정성 평가',      path: '/evaluation',  apiPath: '/api/data/evaluation' },
] as const;

const REFERENCE_TYPES = [
  { type: 'drug-safety',      label: '의약품 안전 정보',  path: '/drug-safety',      desc: '식약처 의약품 회수·판매중지 처분 현황' },
] as const;

interface LookupHubProps {
  basePath: string;
  title: string;
  description: string;
  showApiKeyNotice?: boolean;
}

export default function LookupHub({ basePath, title, description, showApiKeyNotice }: LookupHubProps) {
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Record<string, CategoryResult>>({});

  const search = async () => {
    if (query.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const entries = await Promise.all(
        HOSPITAL_TYPES.map(async (t) => {
          try {
            const res = await fetch(`${t.apiPath}?q=${encodeURIComponent(query.trim())}`);
            const json = await res.json();
            return [t.type, { items: (json.data ?? []) as HospitalRecord[], isMock: !!json.isMock }] as const;
          } catch {
            return [t.type, { items: [] as HospitalRecord[], isMock: false }] as const;
          }
        })
      );
      setResults(Object.fromEntries(entries));
    } finally {
      setLoading(false);
    }
  };

  const totalMatches = Object.values(results).reduce((sum, r) => sum + r.items.length, 0);

  return (
    <div className="space-y-6 fade-in">
      {/* 헤더 */}
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Database size={20} className="text-blue-600" />
          {title}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {description}
        </p>
      </div>

      {/* 통합 검색 */}
      <div className="card p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void search(); } }}
              placeholder="병원명으로 통합 검색 (예: 요양병원)"
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={() => void search()}
            disabled={loading || query.trim().length < 2}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            검색
          </button>
        </div>

        {searched && !loading && (
          <p className="text-xs text-slate-500 mt-2">
            총 <strong>{totalMatches}</strong>건 검색됨 ({HOSPITAL_TYPES.length}개 카테고리 통합)
          </p>
        )}

        {searched && !loading && totalMatches > 0 && (
          <div className="mt-3 space-y-3">
            {HOSPITAL_TYPES.map((t) => {
              const result = results[t.type];
              const items = result?.items ?? [];
              if (items.length === 0) return null;
              return (
                <div key={t.type} className="border border-slate-100 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      {t.label} ({items.length})
                      {result?.isMock && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
                          Mock 데이터
                        </span>
                      )}
                    </span>
                    <Link href={basePath + t.path} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                      전체보기 <ChevronRight size={12} />
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {items.slice(0, 5).map((item, i) => (
                      <div key={i} className="px-3 py-2 text-sm text-slate-700 flex items-center gap-2">
                        <Building2 size={13} className="text-slate-400 shrink-0" />
                        <span className="font-medium">{item.name}</span>
                        {typeof item.address === 'string' && (
                          <span className="text-xs text-slate-400 truncate">{item.address}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 병원별 조회 카테고리 */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <Building2 size={15} className="text-blue-600" />
          병원별 조회
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {HOSPITAL_TYPES.map((t) => (
            <Link
              key={t.type}
              href={basePath + t.path}
              className="card p-4 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">
                {t.label}
              </h3>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* 기준·통계 자료 카테고리 */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <FileBarChart size={15} className="text-blue-600" />
          기준·통계 자료
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REFERENCE_TYPES.map((t) => (
            <Link key={t.type} href={basePath + t.path} className="card p-4 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">
                    {t.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* API 키 설정 안내 (관리자 전용) */}
      {showApiKeyNotice && (
        <div className="card p-4 border-dashed border-2 border-slate-200">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm text-slate-800 mb-1">공공데이터 API 키 설정 필요</div>
              <div className="text-xs text-slate-500">
                실제 데이터 조회를 위해서는 data.go.kr 및 HIRA OpenAPI 키가 필요합니다.
                환경변수 <code className="bg-slate-100 px-1 rounded">HIRA_API_KEY</code>,
                <code className="bg-slate-100 px-1 rounded ml-1">DATA_GO_KR_API_KEY</code>를 설정하세요.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
