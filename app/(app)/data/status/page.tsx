// 공공데이터 — 의료기관 개폐업 현황 페이지 (/data/status)
// 클라이언트 사이드 fetch, 검색, 필터링, 로딩/에러/빈값 상태 처리
'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import {
  Database,
  Search,
  Info,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface OpenCloseItem {
  id: string;
  name: string;
  type: string;
  address: string;
  openDate: string;
  closeDate: string | null;
  status: string;
  pauseStart?: string;
  pauseEnd?: string;
}

const SOURCE_META = {
  source: '건강보험심사평가원 (HIRA)',
  sourceUrl: 'https://www.hira.or.kr/rd/hosp/getHospInfoByPagView.do',
  apiName: 'HIRA OpenAPI - 의료기관 개폐업 현황',
};

export default function OpenCloseStatusPage() {
  const [data, setData] = useState<OpenCloseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [referenceDate, setReferenceDate] = useState('2026-05-31');
  const [error, setError] = useState('');

  // 검색어 디바운싱
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // 데이터 로딩 함수
  const fetchStatus = async () => {
    setIsLoading(true);
    setError('');
    try {
      const url = new URL('/api/data/status', window.location.origin);
      if (debouncedQuery) url.searchParams.set('q', debouncedQuery);
      if (typeFilter) url.searchParams.set('type', typeFilter);
      if (statusFilter) url.searchParams.set('status', statusFilter);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('데이터를 가져오는 도중 문제가 발생했습니다.');

      const json = await res.json();
      setData(json.data || []);
      setIsMock(!!json.isMock);
      if (json.referenceDate) {
        setReferenceDate(json.referenceDate);
      }
    } catch (err: any) {
      setError(err.message || '데이터 로딩 실패');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [debouncedQuery, typeFilter, statusFilter]);

  return (
    <div className="space-y-5 fade-in">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/data"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-2 transition-colors"
          >
            ← 공공데이터 포털
          </Link>
          <h1 className="section-title flex items-center gap-2">
            <Database size={20} className="text-blue-600" />
            의료기관 개폐업 현황
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            전국 의료기관의 개업, 폐업 및 휴업 실시간 변동 현황을 제공합니다.
          </p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          새로고침
        </button>
      </div>

      {/* 데이터 출처 표시 — 공공데이터 필수 */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-medium mb-0.5">데이터 출처 정보</div>
          <div className="text-xs space-y-0.5">
            <div>출처: <span className="font-medium">{SOURCE_META.source}</span></div>
            <div>API: {SOURCE_META.apiName}</div>
            <div>기준일: {referenceDate}</div>
          </div>
        </div>
        <a
          href={SOURCE_META.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 flex-shrink-0"
        >
          원문 <ExternalLink size={10} />
        </a>
      </div>

      {/* API 키 미설정 경고 */}
      {isMock && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
          <div>
            <strong>현재 Mock 데이터 표시 중</strong> — 실제 데이터 조회를 위해
            <code className="bg-amber-100 px-1 mx-1 rounded">HIRA_API_KEY</code>
            환경변수를 설정하세요. 설정 후 자동으로 실시간 데이터를 표시합니다.
          </div>
        </div>
      )}

      {/* 에러 피드백 */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg">
          <AlertTriangle size={16} className="text-red-600" />
          {error}
        </div>
      )}

      {/* 검색 및 필터 */}
      <div className="card p-3 flex flex-col sm:flex-row items-center gap-2">
        <div className="flex items-center gap-2 flex-1 w-full bg-slate-50 rounded px-2.5 py-1.5 border border-slate-200">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="병원명 또는 소재지로 검색..."
            className="flex-1 text-sm outline-none placeholder-slate-400 bg-transparent text-slate-700"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-600 focus:outline-none flex-1 sm:flex-initial"
          >
            <option value="">병원 유형 전체</option>
            <option value="요양병원">요양병원</option>
            <option value="정신병원">정신병원</option>
            <option value="재활병원">재활병원</option>
            <option value="급성기병원">급성기병원</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-600 focus:outline-none flex-1 sm:flex-initial"
          >
            <option value="">전체 상태</option>
            <option value="운영중">운영중</option>
            <option value="폐업">폐업</option>
            <option value="휴업">휴업</option>
          </select>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="card overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-600">
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={13} className="animate-spin text-blue-600" />
                데이터 조회 중...
              </span>
            ) : (
              <>
                총 <strong>{data.length}</strong>건 {isMock && '(Mock 데이터)'}
              </>
            )}
          </span>
          <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold">
            엑셀 다운로드
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading && data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <div className="text-sm">데이터를 불러오는 중입니다...</div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              검색 조건에 맞는 개폐업 데이터가 없습니다.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>기관명</th>
                  <th>종별</th>
                  <th>소재지</th>
                  <th>개업일</th>
                  <th>폐업/휴업 관련일</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {data.map((h) => (
                  <tr key={h.id} className={h.status === '폐업' ? 'bg-slate-50/50 text-slate-400' : ''}>
                    <td className="font-medium text-slate-800">{h.name}</td>
                    <td>
                      <span className="badge badge-default text-xs">{h.type}</span>
                    </td>
                    <td className="text-slate-600 text-sm">{h.address}</td>
                    <td className="text-slate-600 text-sm">{h.openDate}</td>
                    <td className="text-slate-600 text-sm">
                      {h.status === '폐업' && (
                        <span className="text-red-600 font-bold">{h.closeDate} (폐업)</span>
                      )}
                      {h.status === '휴업' && (
                        <span className="text-amber-600 font-bold">
                          {h.pauseStart} ~ {h.pauseEnd} (휴업)
                        </span>
                      )}
                      {h.status === '운영중' && <span className="text-slate-400">—</span>}
                    </td>
                    <td>
                      {h.status === '운영중' && (
                        <span className="badge badge-success text-xs">운영중</span>
                      )}
                      {h.status === '폐업' && (
                        <span className="badge badge-urgent text-xs">폐업</span>
                      )}
                      {h.status === '휴업' && (
                        <span className="badge badge-info text-xs">휴업</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 데이터 출처 하단 표기 */}
      <div className="data-source justify-center">
        <span>출처: {SOURCE_META.source}</span>
        <span>·</span>
        <span>기준일: {referenceDate}</span>
        <span>·</span>
        <span>본 데이터는 공공기관 공식 데이터를 기반으로 합니다</span>
      </div>
    </div>
  );
}
