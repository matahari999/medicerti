'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  SlidersHorizontal,
  Building2,
  MapPin,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EvaluationItem {
  code: string;
  name: string;
  type: string;
  address: string;
  grade: number;
  score: number;
  itemGrades: { code: string; grade: number }[];
}

export default function EvaluationLookup() {
  const [data, setData] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchWord, setSearchWord] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGrade, setSelectedGrade] = useState(0);
  const [isMock, setIsMock] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<EvaluationItem | null>(null);

  // API 호출 함수
  const fetchEvaluationData = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/data/evaluation', window.location.origin);
      if (searchWord) url.searchParams.set('q', searchWord);
      if (selectedType) url.searchParams.set('type', selectedType);
      if (selectedGrade) url.searchParams.set('grade', String(selectedGrade));

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
        setIsMock(json.isMock ?? true);
      }
    } catch (err) {
      console.error('평가 데이터 패치 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 마운트 시 및 필터 값 변경 시 로드
  useEffect(() => {
    fetchEvaluationData();
  }, [selectedType, selectedGrade]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvaluationData();
  };

  return (
    <div className="space-y-5 fade-in">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            평가 적정성 점수 조회
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            건강보험심사평가원(HIRA)과 실시간 연동되어 전국 요양병원 및 급성기 의료기관의 적정성 평가 등급을 조회합니다. 병원명을 입력해 본인 병원이나 다른 병원의 평가 결과를 확인하세요.
          </p>
        </div>

        {/* API 연동 방식 상태 표시 배지 */}
        <div className="flex-shrink-0 self-start md:self-center">
          {isMock ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
              <Info size={13} className="text-slate-400" />
              데모 모드 (Mock 데이터)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm animate-pulse">
              <Zap size={13} className="text-emerald-500" />
              실시간 HIRA API 연동 활성
            </span>
          )}
        </div>
      </div>

      {/* 검색 및 필터 패널 */}
      <div className="card p-4 bg-slate-50 border-slate-100">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* 병원명 검색 */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="병원명 또는 주소 검색..."
              className="w-full text-xs pl-9 pr-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* 병원 유형 선택 */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 cursor-pointer"
          >
            <option value="">모든 병원 유형</option>
            <option value="요양병원">요양병원</option>
            <option value="정신병원">정신병원</option>
            <option value="재활병원">재활병원</option>
            <option value="급성기병원">급성기병원</option>
          </select>

          {/* 평가 등급 선택 */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(Number(e.target.value))}
            className="text-xs border border-slate-200 rounded-lg px-3 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 cursor-pointer"
          >
            <option value="0">모든 평가 등급</option>
            <option value="1">1등급 (최우수)</option>
            <option value="2">2등급</option>
            <option value="3">3등급</option>
            <option value="4">4등급</option>
            <option value="5">5등급</option>
          </select>
        </form>
      </div>

      {/* 리스트 테이블 */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-[120px]">등급</th>
                <th className="min-w-[200px]">의료기관명</th>
                <th className="w-[120px]">유형</th>
                <th className="min-w-[280px]">주소</th>
                <th className="w-[120px] text-center">종합 점수</th>
                <th className="w-[110px] text-center">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <span className="inline-block animate-spin border-2 border-blue-600 border-t-transparent rounded-full w-5 h-5 mr-2 align-middle"></span>
                    심평원 데이터를 조회하는 중입니다...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.code} className="hover:bg-slate-50/50 transition-colors">
                    <td>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-md border shadow-sm',
                          item.grade === 1
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : item.grade === 2
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        )}
                      >
                        <Award size={12} className={cn(item.grade === 1 ? 'text-amber-500' : 'text-blue-500')} />
                        {item.grade}등급
                      </span>
                    </td>
                    <td>
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Building2 size={14} className="text-slate-400" />
                        {item.name}
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[260px]" title={item.address}>
                          {item.address}
                        </span>
                      </div>
                    </td>
                    <td className="text-center font-bold text-slate-700 text-sm">
                      {item.score}점
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => setSelectedHospital(item)}
                        className="text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded transition-all cursor-pointer"
                      >
                        지표 상세
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    검색 조건에 맞는 적정성 평가 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 지표 상세 분석 모달 */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setSelectedHospital(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-655"
            >
              <X size={20} />
            </button>

            {/* 헤더 */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedHospital.type}
                </span>
              </div>
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-1.5">
                {selectedHospital.name} 평가 명세
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin size={11} />
                {selectedHospital.address}
              </p>
            </div>

            {/* 종합 등급 요약 */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
              <div className="text-xs font-bold text-slate-700">
                종합 등급 {selectedHospital.grade}등급 · 항목 평균 환산 {selectedHospital.score}점
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                점수는 심평원 평가등급(1~5등급)을 표시용으로 환산한 값입니다. 실측 비율 지표가 아닙니다.
              </p>
            </div>

            {/* 항목별 평가등급 (심평원 병원평가정보서비스 원본 항목) */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {selectedHospital.itemGrades.map((item) => (
                <div key={item.code} className="bg-slate-50 p-2.5 rounded-lg text-center">
                  <div className="text-[10px] text-slate-400">{item.code}</div>
                  <div className={cn(
                    'font-bold mt-0.5',
                    item.grade === 1 ? 'text-amber-600' : item.grade >= 4 ? 'text-rose-600' : 'text-slate-800'
                  )}>
                    {item.grade}등급
                  </div>
                </div>
              ))}
            </div>

            {/* 하단 닫기 */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedHospital(null)}
                className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                상세 창 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
