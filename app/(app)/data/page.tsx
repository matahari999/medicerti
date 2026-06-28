// 공공데이터 — 의료기관 코드정보 페이지
// 서버사이드 호출 원칙, 출처 + 최종 업데이트 표시, 로딩/에러/빈값 상태

import { PUBLIC_DATA_TYPE_LABELS } from '@/types';
import { formatDate } from '@/lib/utils';
import { mockPublicDataMeta } from '@/lib/mock-data';
import Link from 'next/link';
import {
  Database,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
} from 'lucide-react';

// 공공데이터 항목 목록 — 사이드바와 일치
const dataItems = [
  { type: 'hospital_codes', href: '/data/codes', desc: '의료기관 종별 코드 및 기관 코드 조회' },
  { type: 'open_close', href: '/data/status', desc: '의료기관 개업·폐업·휴업 현황' },
  { type: 'hospital_details', href: '/data/details', desc: '병원 소재지, 병상수, 전문의 등 상세 정보' },
  { type: 'evaluation_scores', href: '/data/evaluation', desc: '심평원 적정성평가 등급 및 점수' },
  { type: 'cert_status', href: '/data/cert-status', desc: '의료기관 인증 현황 및 인증 기간' },
  { type: 'drg', href: '/data/drg', desc: '포괄수가(DRG) 적용 의료기관 정보' },
  { type: 'medical_resources', href: '/data/medical-resource', desc: '인구 대비 의사/간호사/병상 수 통계' },
  { type: 'industrial_accident', href: '/data/industrial', desc: '산재보험 지정 병원 정보' },
  { type: 'benefit_criteria', href: '/data/benefit', desc: '요양급여 적용기준 및 심사지침' },
  { type: 'health_stats', href: '/data/health-stats', desc: '보건의료 이용 및 자원 통계' },
  { type: 'drug_safety', href: '/data/drug-safety', desc: '의약품 이상사례 및 안전성 정보' },
] as const;

// 데이터 상태 배지
function DataStatusBadge({ status }: { status: 'ok' | 'error' | 'empty' | 'stale' }) {
  if (status === 'ok') {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
        <CheckCircle2 size={10} />
        정상
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
        <AlertTriangle size={10} />
        수집 실패
      </span>
    );
  }
  if (status === 'stale') {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
        <Info size={10} />
        지연
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
      <Info size={10} />
      데이터 없음
    </span>
  );
}

// 공공데이터 포털 메인 페이지
export default function DataPortalPage() {
  return (
    <div className="space-y-5 fade-in">
      {/* 헤더 */}
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Database size={20} className="text-blue-600" />
          공공데이터 포털
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          의료기관 관련 공공데이터를 한곳에서 조회합니다.
          모든 데이터는 서버사이드에서 수집하며 출처와 기준일을 표시합니다.
        </p>
      </div>

      {/* 출처 안내 */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <div>
          <strong>데이터 출처 안내</strong> — 본 포털의 모든 데이터는 건강보험심사평가원(HIRA), 
          보건복지부, 공공데이터포털(data.go.kr) 등 공공기관 공식 데이터를 기반으로 합니다.
          출처가 불명확한 데이터는 표시하지 않습니다.
        </div>
      </div>

      {/* 데이터 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {dataItems.map((item) => {
          // Mock 메타 (실제 연동 시 Supabase + API에서 가져옴)
          const meta = item.type === 'hospital_codes' || item.type === 'evaluation_scores'
            ? mockPublicDataMeta[item.type as keyof typeof mockPublicDataMeta]
            : null;

          return (
            <Link
              key={item.type}
              href={item.href}
              className="card p-4 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Database size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">
                      {PUBLIC_DATA_TYPE_LABELS[item.type]}
                    </h3>
                    {meta && <DataStatusBadge status={meta.status} />}
                    {!meta && <DataStatusBadge status="empty" />}
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{item.desc}</p>

                  {/* 데이터 출처 표시 — 공공데이터 원칙 */}
                  {meta ? (
                    <div className="data-source">
                      <span>출처: {meta.source}</span>
                      <span>·</span>
                      <span>기준일: {meta.referenceDate || '확인 필요'}</span>
                      <span>·</span>
                      <span>업데이트: {formatDate(meta.lastUpdated, 'MM.dd HH:mm')}</span>
                    </div>
                  ) : (
                    <div className="data-source">
                      <span>출처: 공공데이터포털 (API 키 설정 필요)</span>
                    </div>
                  )}
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 flex-shrink-0 mt-1 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* API 키 설정 안내 */}
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
    </div>
  );
}
