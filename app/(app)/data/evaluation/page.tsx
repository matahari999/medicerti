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
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';

interface EvaluationItem {
  code: string;
  name: string;
  type: string;
  address: string;
  grade: number;
  score: number;
  indicators: {
    beds: number;
    pressureUlcerPrevent: number;
    adlMaintenance: number;
    incontinenceCare: number;
    catheterRatio: number;
    cognitiveExam: number;
  };
}

export default function DataEvaluationPage() {
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
            건강보험심사평가원(HIRA) 공공데이터 OpenAPI와 실시간 연동되어 전국 요양병원 및 급성기 의료기관의 적정성 평가 등급을 조회합니다.
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
                    심평원 공공데이터를 동적으로 질의하는 중입니다...
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
                    검색 조건에 맞는 공공데이터 적정성 결과가 발견되지 않았습니다.
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
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  병상수: {selectedHospital.indicators.beds}개
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

            {/* 레이더 분석 차트 */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="text-xs font-bold text-slate-700 text-center mb-2">
                종합 평가 성적 레이더망 ({selectedHospital.score}점 · {selectedHospital.grade}등급)
              </div>
              <div className="h-[210px] w-full flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={[
                      { name: '욕창 예방', 점수: selectedHospital.indicators.pressureUlcerPrevent },
                      { name: 'ADL 유지', 점수: selectedHospital.indicators.adlMaintenance },
                      { name: '요실금 케어', 점수: selectedHospital.indicators.incontinenceCare },
                      { name: '도뇨관 비삽입', 점수: 100 - selectedHospital.indicators.catheterRatio * 5 }, // 정규화
                      { name: '인지 검사율', 점수: selectedHospital.indicators.cognitiveExam },
                    ]}
                  >
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                    <PolarRadiusAxis angle={30} domain={[60, 100]} tick={{ fontSize: 8 }} />
                    <Radar name="지표 점수" dataKey="점수" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 6대 지표 점수 리스트 */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg">
                <div className="text-[10px] text-slate-400">욕창 예방/개선율</div>
                <div className="font-bold text-slate-800 mt-0.5">
                  {selectedHospital.indicators.pressureUlcerPrevent}%
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg">
                <div className="text-[10px] text-slate-400">일상생활수행(ADL) 유지율</div>
                <div className="font-bold text-slate-800 mt-0.5">
                  {selectedHospital.indicators.adlMaintenance}%
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg">
                <div className="text-[10px] text-slate-400">요실금 예방/치료율</div>
                <div className="font-bold text-slate-800 mt-0.5">
                  {selectedHospital.indicators.incontinenceCare}%
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg">
                <div className="text-[10px] text-slate-400">유치도뇨관 삽입률 (낮을수록 우수)</div>
                <div className={cn(
                  "font-bold mt-0.5",
                  selectedHospital.indicators.catheterRatio > 5 ? "text-rose-600" : "text-slate-800"
                )}>
                  {selectedHospital.indicators.catheterRatio}%
                </div>
              </div>
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
