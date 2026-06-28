'use client';

import { useState } from 'react';
import {
  Stethoscope,
  Users,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Send,
  Sparkles,
  Download,
  Info,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/documentStore';
import { ProgressCharacterBar } from '@/components/ui/ProgressCharacterBar';

// 모의평가 지적사항 및 조치 권고 피드백 데이터셋
const initialDefects = [
  {
    id: 'def-01',
    area: '1장. 환자안전 (정확한 환자식별)',
    issue: '3병동 약물 투약 관찰 시, 간호사가 구두로만 환자 이름을 확인하고 손목 밴드 바코드 스캔을 누락하는 행위가 2건 발견됨.',
    consultant: '김경력 위원 (전 의료기관평가인증원 실사단 팀장)',
    feedback: '현장에서 바코드 스캔이 번거롭다는 이유로 구두 식별로 대체하는 것은 실사 지적 1순위입니다. 매 투약 카트 이동 시 의무 바코드 스캐너가 지참되도록 모니터링을 상설화하고, 수간호사 주관 무작위 투약 관찰 감사(Audit)를 주 1회 실시하여 지표를 98% 이상 확보해야 합니다.',
    status: 'pending', // pending = 미해결, resolved = 해결 완료
  },
  {
    id: 'def-02',
    area: '3장. 약물관리 (고위험약품 보관)',
    issue: '약제과 및 2병동 처치실 내 고농축 염화칼륨(KCl) 용액 보관함의 시건장치가 열려 있는 채로 방치되어 외부인 접근 위험 노출.',
    consultant: '박QPS 전문위원 (감염 및 환자안전 컨설팅 15년)',
    feedback: '보관함 열쇠 관리 책임을 듀티별 책임간호사로 한정하고 인수인계 항목에 명문화해야 합니다. 보관함에 "적색 위험" 라벨링을 대형화하고, 1일 3회 잠금 상태를 체킹하는 보존 점검 대장을 작성해 비치하도록 규정을 보완해야 합니다.',
    status: 'resolved',
  },
  {
    id: 'def-03',
    area: '1장. 환자안전 (신체억제대 적법성)',
    issue: '신체억제대가 적용된 302호 환자의 의무기록 검토 결과, 의사의 신체억제대 처방 개시 기록은 있으나 구체적인 환자 상태 대안 시도 기록이 결여됨.',
    consultant: '이감염 원장 (요양병원 전문 자문단 간사)',
    feedback: '처방 전 "침상 난간 안전 가드 증설", "병동 휠체어 산책 보호자 동행" 등 실제 억제대를 쓰기 전 어떠한 비약물적 노력을 먼저 기울였는지 상세히 의무기록에 남겨야 삭감 및 실사 위반을 예방할 수 있습니다. 억제대 설명서 보호자 서명도 생략된 경우 즉시 동의 서식을 재징구해 두어야 합니다.',
    status: 'pending',
  },
];

// 컨설팅 자문단 프로필
const consultants = [
  {
    name: '김경력 박사',
    title: '전 인증실사단 팀장 / 보건학 박사',
    specialty: '요양병원 3주기 인증기준 실사 총괄, QPS 구축',
    hospitals: '전국 요양병원 120여 개소 수검 컨설팅 이력',
    avatar: '김',
  },
  {
    name: '박QPS 전문위원',
    title: '대한환자안전학회 정회원 / QPS 전문 간사',
    specialty: '적정성 평가 1등급 등급 향상, 위해사건 분석(RCA)',
    hospitals: '전국 종합병원 및 재활병원 평가 수검 자문',
    avatar: '박',
  },
  {
    name: '이감염 원장',
    title: '감염내과 전문의 / 원내 감염 통제 자문위원',
    specialty: '손위생, 격리 병동 코호트 격리, CRE/VRE 대응',
    hospitals: '대형 요양의료재단 감염 관리 상임 컨설턴트',
    avatar: '이',
  },
];

const mockSurveyReportTemplate = `[현장 모의평가 결함 사항 개선 대책 권고안]

1. 개요
본 권고안은 외부 인증전문 자문단의 현장 모의평가(Mock Survey) 결과 지적된 3대 결함 사항(투약 시 식별 바코드 누락, 고위험약품 보관함 시건 상태 부실, 억제대 대안 시도 기록 누락)에 대한 긴급 시정 대책안임.

2. 시정 지시 조치 사항
가. 환자 식별 지표 개선 (간호부)
  - 매 투약 시 2가지 식별정보 교차 검증 및 바코드 스캔 감사 상시화.
나. 약물 안전 관리 보완 (약제부/간호부)
  - 고농축 전해질 보관함의 시건장치 열쇠 보관 책임을 듀티 간호사 인계 항목에 명문화.
  - 일 3회 시건 상태 서명식 점검대장 비치.
다. 신체억제대 처방 적법성 보완 (진료부/원무과)
  - 억제대 적용 전 비약물적 대안 시도 내용(침상 가드, 동행 산책 등)을 OCS 처방 연계 의무 입력화.

3. 행정 조치
본 개선 대책을 원내 규정집 개정안에 준수 반영하며, 차주 수요일(7월 8일) 아침 전 부서장 모의평가 시정 보고 회의 시 병원장 앞 보고 및 확정함.`;

export default function ConsultingPage() {
  const { submitForApproval } = useDocumentStore();
  const [defects, setDefects] = useState(initialDefects);
  const [activeTab, setActiveTab] = useState<'defects' | 'consultants'>('defects');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 시정 조치 기안 상신
  const handleReportDraft = () => {
    setIsSubmitting(true);
    setSuccessMsg('');

    setTimeout(() => {
      submitForApproval({
        title: '모의평가 지적 결함 사항에 대한 시정 개선 대책안',
        type: 'regulation',
        typeName: '규정집',
        dept: 'QPS/감염관리실',
        requester: '김QPS 실장',
        content: mockSurveyReportTemplate,
        steps: [
          { role: '1차 검토자', name: '최간호 부장' },
          { role: '최종 승인자', name: '병원장' },
        ],
      });
      setIsSubmitting(false);
      setSuccessMsg('모의평가 결함 시정 대책 권고안이 전산 결재함에 정상적으로 기안 등록되었습니다. (결재 관리에서 확인 가능)');
      
      // 5초 뒤 성공 메시지 삭제
      setTimeout(() => setSuccessMsg(''), 5000);
    }, 1000);
  };

  // 결함 해결 처리 토글
  const handleResolveDefect = (id: string) => {
    setDefects(
      defects.map((def) =>
        def.id === id ? { ...def, status: def.status === 'resolved' ? 'pending' : 'resolved' } : def
      )
    );
  };

  return (
    <div className="space-y-5 fade-in">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Stethoscope size={20} className="text-blue-600 animate-pulse" />
            전문가 컨설팅 협업
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            전직 인증원 실사단으로 구성된 컨설팅 위원들의 원내 현장 진단 피드백과 모의평가 결함 개선 상태를 추적합니다.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex bg-slate-100 rounded-lg p-0.5 self-start">
          <button
            onClick={() => setActiveTab('defects')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer',
              activeTab === 'defects' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            모의평가 결함 점검판
          </button>
          <button
            onClick={() => setActiveTab('consultants')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer',
              activeTab === 'consultants' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            매칭 전문 자문단
          </button>
        </div>
      </div>

      {activeTab === 'defects' && (
        <>
          {/* 현황 알림 */}
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl text-xs text-rose-800 leading-normal">
            <AlertTriangle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong>모의평가 지적사항 경고</strong>: 현재 자문단 실사 검토 결과 <strong>총 3건의 실사 결함</strong> 중 <strong>2건이 조치 대기(미해결)</strong> 상태입니다. 
              지적된 사항들은 실제 본 평가 수검 시 삭감이나 재심사 사유가 될 수 있으므로 즉시 보완 계획을 작성하십시오.
            </div>
            <button
              onClick={handleReportDraft}
              disabled={isSubmitting}
              className="text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded transition-all cursor-pointer flex-shrink-0 shadow-sm"
            >
              시정 계획 기안 상신
            </button>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 rounded-lg text-center animate-bounce">
              {successMsg}
            </div>
          )}

          {/* 지적사항 목록 */}
          <div className="space-y-4">
            {defects.map((def) => (
              <div
                key={def.id}
                className={cn(
                  'card p-5 border transition-all space-y-4',
                  def.status === 'resolved' ? 'border-emerald-100 bg-emerald-50/10' : 'border-rose-100 bg-white'
                )}
              >
                {/* 헤더 */}
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {def.area}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-800 tracking-tight leading-snug">
                      결함 항목: {def.id}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleResolveDefect(def.id)}
                    className={cn(
                      'text-[10px] font-black px-2.5 py-1 rounded-full border transition-all cursor-pointer shadow-sm',
                      def.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    )}
                  >
                    {def.status === 'resolved' ? '✓ 조치 완료됨' : '⚠ 조치 필요'}
                  </button>
                </div>

                {/* 지적내용 */}
                <div className="space-y-1.5 border-l-2 border-rose-300 pl-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">현장 지적 및 발견된 사실</div>
                  <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                    {def.issue}
                  </p>
                </div>

                {/* 피드백 */}
                <div className="space-y-2 bg-blue-50/40 p-4 rounded-xl border border-blue-100/50">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700">
                    <MessageSquare size={13} />
                    자문단 피드백 조치 권고안 — {def.consultant}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {def.feedback}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'consultants' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {consultants.map((c) => (
            <div key={c.name} className="card p-5 space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                {/* 프로필 서클 */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {c.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                      {c.name}
                      <Award size={14} className="text-amber-500" />
                    </h3>
                    <div className="text-[10px] text-slate-400 font-semibold">{c.title}</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs leading-relaxed">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">전문 지도 분야</span>
                    <p className="text-slate-700 font-semibold mt-0.5">{c.specialty}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">주요 실적</span>
                    <p className="text-slate-600 mt-0.5">{c.hospitals}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <a
                  href="mailto:consultant@medicerti.co.kr"
                  className="w-full flex items-center justify-center gap-1 py-2 border border-slate-200 hover:border-blue-200 text-[11px] font-bold text-slate-600 hover:text-blue-600 rounded-lg transition-colors cursor-pointer bg-slate-50/50"
                >
                  <MessageSquare size={12} />
                  전문가 원격 질의 메일 발송
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 모의평가 결함 조치 기안 처리 애니메이션 캐릭터 바 */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="max-w-md w-full">
            <ProgressCharacterBar 
              duration={1000}
              label="모의평가 시정 계획을 전산 결재함에 기안 상신 중입니다..." 
            />
          </div>
        </div>
      )}
    </div>
  );
}
