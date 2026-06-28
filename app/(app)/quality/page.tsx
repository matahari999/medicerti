'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  Plus,
  Send,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/documentStore';
import { ProgressCharacterBar } from '@/components/ui/ProgressCharacterBar';

// 연도별 평가 점수 및 등급 추이 데이터
const yearlyTrendData = [
  { year: '2022년 (1주기)', score: 79.5, grade: 3, nationalAvg: 76.2 },
  { year: '2023년 (2주기 1차)', score: 85.2, grade: 2, nationalAvg: 78.4 },
  { year: '2024년 (2주기 2차)', score: 91.5, grade: 1, nationalAvg: 80.1 },
  { year: '2025년 (2주기 3차)', score: 95.8, grade: 1, nationalAvg: 81.5 },
];

// 6대 적정성 평가지표 상세 데이터 (원내 실적 vs 전국 요양병원 평균)
const indicatorDetails = [
  { name: '욕창 예방/개선', 원내실적: 98.2, 전국평균: 84.5, 목표: 95.0, unit: '%' },
  { name: 'ADL 유지/개선', 원내실적: 92.4, 전국평균: 79.1, 목표: 90.0, unit: '%' },
  { name: '요실금 예방/치료', 원내실적: 94.1, 전국평균: 80.6, 목표: 90.0, unit: '%' },
  { name: '유치도뇨관 비삽입', 원내실적: 97.9, 전국평균: 91.2, 목표: 96.5, unit: '%' }, // 삽입률 2.1% -> 비삽입률 97.9%로 정규화 (높을수록 우수)
  { name: '인지기능 검사율', 원내실적: 96.5, 전국평균: 86.8, 목표: 95.0, unit: '%' },
  { name: '욕창 외 특수처치', 원내실적: 90.2, 전국평균: 75.4, 목표: 85.0, unit: '%' },
];

// 개선 대책 양식 텍스트
const improvementPlanTemplate = `[요양병원 적정성 평가 지표 개선 계획서]

1. 목적
본 계획서는 2주기 4차 요양병원 적정성 평가를 대비하여, 미달 지표인 "유치도뇨관 장기삽입" 및 "ADL(일상생활수행능력) 유지관리" 항목을 개선해 평가 1등급을 수호하기 위한 조치사항을 규정함.

2. 현 지표 상태 및 개선 목표
가. 유치도뇨관 삽입률: 현재 4.8% -> 목표 2.5% 이하 (비삽입률 97.5% 이상)
나. ADL 유지율: 현재 87.2% -> 목표 92.0% 이상

3. 세부 추진 과제
가. 간호부 (도뇨관 방지 및 피부 관리)
  - 유치도뇨관 필요 환자 매일 재평가 및 조기 조치 지침 적용
  - 기저귀 습기 방지를 위한 2시간 단위 체위 변경 의무화
나. 진료부 (처방 프로세스 정비)
  - 도뇨관 삽입 사유 불분명 시 대체 방안(간헐 도뇨 등) 처방 유도
  - 장기 유치도뇨관 처방 시 주 1회 사유서 첨부 의무화
다. QPS/감염관리실 (모니터링 강화)
  - 격주 단위 ADL 기록 대장 현행화 상태 감사 및 피드백

4. 행정사항
본 개선계획서 승인 즉시 원내 각 임상과 및 간호 단위별 직무교육(7월 10일)을 실시하며, 매월 말 개선율 지표를 산출해 최고 원무단 회의에 보고함.`;

export default function QualityPage() {
  const { submitForApproval } = useDocumentStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'checklist'>('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 지능형 개선계획서 결재 상신
  const handleDraftSubmit = () => {
    setIsSubmitting(true);
    setSuccessMsg('');

    setTimeout(() => {
      submitForApproval({
        title: '2주기 적정성 평가 등급 1등급 수호를 위한 지표 개선 계획서',
        type: 'guideline',
        typeName: '지침서',
        dept: 'QPS/감염관리실',
        requester: '김QPS 실장',
        content: improvementPlanTemplate,
        steps: [
          { role: '1차 검토자', name: '최간호 부장' },
          { role: '최종 승인자', name: '병원장' },
        ],
      });
      setIsSubmitting(false);
      setSuccessMsg('적정성 평가 지표 개선 계획서가 성공적으로 결재함에 상신되었습니다! (결재 관리에서 확인 가능)');
      
      // 5초 뒤 성공 메시지 삭제
      setTimeout(() => setSuccessMsg(''), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-5 fade-in">
      {/* 헤더 */}
      <div>
        <h1 className="section-title flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-600" />
          적정성 평가 모니터링
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          건강보험심사평가원(HIRA)의 요양병원 적정성 평가 기준에 따른 실시간 원내 지표 상태와 평가 등급 관리 대시보드입니다.
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'py-2.5 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer',
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          종합 대시보드
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={cn(
            'py-2.5 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer',
            activeTab === 'charts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          지표 분석 차트
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={cn(
            'py-2.5 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer',
            activeTab === 'checklist'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          )}
        >
          평가 대비 체크리스트
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* 주요 성적 요약 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-4 flex items-center gap-4 bg-gradient-to-br from-blue-50 to-white border-blue-100">
              <div className="p-3 bg-blue-600 text-white rounded-lg">
                <Award size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">최근 공식 평가 등급</div>
                <div className="text-2xl font-black text-blue-600 mt-0.5">1등급 (95.8점)</div>
                <div className="text-[10px] text-slate-500">전국 평균 81.5점 대비 우수</div>
              </div>
            </div>

            <div className="card p-4 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">욕창 관리 준수율</div>
                <div className="text-2xl font-bold text-slate-800 mt-0.5">98.2%</div>
                <div className="text-[10px] text-emerald-600 font-medium">목표치 95% 초과 달성</div>
              </div>
            </div>

            <div className="card p-4 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">ADL 유지관리율</div>
                <div className="text-2xl font-bold text-slate-800 mt-0.5">92.4%</div>
                <div className="text-[10px] text-indigo-600 font-medium">목표치 90% 달성 완료</div>
              </div>
            </div>

            <div className="card p-4 bg-rose-50/30 border-rose-100 flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="text-xs text-rose-500 font-semibold uppercase">경고 지표 (도뇨관 삽입)</div>
                <div className="text-2xl font-bold text-rose-700 mt-0.5">2.1%</div>
                <div className="text-[10px] text-slate-500">전국 4.8% 대비 양호하나 주의</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 차트 요약 피드 */}
            <div className="card p-5 lg:col-span-2 space-y-4">
              <h3 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-blue-600" />
                연도별 적정성 평가 종합 추이
              </h3>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={yearlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="score" name="원내 종합 점수 (점)" fill="#3b82f6" barSize={35} radius={[4, 4, 0, 0]} />
                    <Line dataKey="nationalAvg" name="전국 요양병원 평균" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 지능형 지표 등급 가이드 */}
            <div className="card p-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-indigo-300 font-black text-xs uppercase tracking-wider">
                  <Sparkles size={14} className="text-indigo-400" />
                  지능형 적정성 평가 등급 가이드
                </div>
                <h3 className="font-extrabold text-base leading-snug">
                  "다음 2주기 4차 평가에서<br />안정적 1등급 유지가 확실시됩니다."
                </h3>
                <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
                  <p>
                    ✓ <strong>피드백</strong>: 현재 본원의 강점은 <strong>욕창 예방 부문(98.2%)</strong>으로 전국 상위 5% 이내에 위치합니다.
                  </p>
                  <p>
                    ⚠ <strong>보안점</strong>: 단, 장기 입원 환자의 증가로 <strong>ADL 유지율이 전분기 대비 0.5% 하락세</strong>를 보이므로 지속적인 기저 운동 중재가 필요합니다.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleDraftSubmit}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    '결재 기안 등록 중...'
                  ) : (
                    <>
                      지표 개선 지침서 즉시 상신
                      <Send size={11} />
                    </>
                  )}
                </button>
                {successMsg && (
                  <p className="text-[10px] text-emerald-400 font-semibold mt-2 text-center leading-normal">
                    {successMsg}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 레이더 차트 (6대 지표 원내 vs 전국 평균) */}
          <div className="card p-5 lg:col-span-2 space-y-4">
            <h3 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
              <BarChart3 size={16} className="text-blue-600" />
              6대 평가지표 분석 (전국 비교)
            </h3>
            <p className="text-xs text-slate-400">
              지표 점수는 높을수록 우수한 것을 의미하며, 유치도뇨관 지표는 삽입률의 반대인 비삽입률(97.9%)로 정규화했습니다.
            </p>
            <div className="h-[280px] w-full flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={indicatorDetails}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={30} domain={[60, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="우리 병원" dataKey="원내실적" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="전국 요양병원 평균" dataKey="전국평균" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 지표 수치 명세서 */}
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <FileSpreadsheet size={16} className="text-blue-600" />
              세부 지표 스펙 대장
            </h3>
            <div className="space-y-3">
              {indicatorDetails.map((ind) => (
                <div key={ind.name} className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-800">
                    <span>{ind.name}</span>
                    <span className="text-blue-600">{ind.원내실적}{ind.unit}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>목표치: {ind.목표}{ind.unit}</span>
                    <span>전국 평균: {ind.전국평균}{ind.unit}</span>
                  </div>
                  {/* 프로그레스 바 */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        ind.원내실적 >= ind.목표 ? "bg-emerald-500" : "bg-blue-500"
                      )}
                      style={{ width: `${ind.원내실적}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-800">적정성 평가 수검 준비 체크리스트</h3>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
              총 6개 중 5개 이행 완료
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800">의사 1인당 입원 환자 수 기준 준수</div>
                <div className="text-[10px] text-slate-400 mt-0.5">진료부 · 입원환자 대 의사 비율 35:1 이하 상시 유지 중</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800">간호인력 수급 관리 및 등급 준수</div>
                <div className="text-[10px] text-slate-400 mt-0.5">간호부 · 1등급 간호인력 배치 요건 유지 및 분기별 심평원 통보 마감</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800">매월 ADL 및 욕창 평가 의무 실시</div>
                <div className="text-[10px] text-slate-400 mt-0.5">간호부 · 모든 입원환자 Morse Fall Scale(낙상) 및 Braden Scale(욕창) 사정 완료</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800">소방시설 상태 및 정기 대피 훈련 기록지</div>
                <div className="text-[10px] text-slate-400 mt-0.5">원무과 · 연 2회 합동 소방 훈련 및 방화문 일제점검 이행 보고 완료</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-800">장기 입원 환자 인지 검사 (MMSE) 연간 대장</div>
                <div className="text-[10px] text-slate-400 mt-0.5">사회복지실 · 매년 1회 이상 인지 검사 미이행 대상자 필터링 후 시행 완료</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
              <Clock size={16} className="text-amber-500 mt-0.5 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-800">임상 질 지표 개선 대책 기안 결재</div>
                <div className="text-[10px] text-slate-500 mt-0.5">QPS실 · 유치도뇨관 지표 개선 지침 결재 및 원내 공유 (진행 중)</div>
              </div>
              <button 
                onClick={handleDraftSubmit}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 hover:border-blue-200 px-2 py-1 rounded transition-colors self-center cursor-pointer"
              >
                지침 기안서 제출
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 작업 처리 애니메이션 바 캐릭터 오버레이 */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="max-w-md w-full">
            <ProgressCharacterBar 
              duration={1200}
              label="지표 개선 계획서를 전산 결재함에 상신 중입니다..." 
            />
          </div>
        </div>
      )}
    </div>
  );
}
