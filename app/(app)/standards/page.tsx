'use client';

import { useState } from 'react';
import {
  BookOpen,
  Search,
  FileText,
  HelpCircle,
  Eye,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// 3주기 요양병원 실제 평가인증 기준 데이터셋
const certificationStandards = [
  {
    chapter: '1장. 환자안전기준',
    standards: [
      {
        code: 'ME 1.1',
        title: '정확한 환자 식별 수행',
        desc: '모든 의료 행위(진료, 투약, 채혈, 검사 등) 직전에 최소 2가지 이상의 환자 식별 정보(이름, 생년월일 등)를 이용해 환자를 정확히 식별한다.',
        method: '서류 검토, 직원 면담, 병동 관찰',
        status: 'ok',
        docLink: '/documents/doc-004',
        docName: '손위생/환자식별 모니터링 월간 대장',
      },
      {
        code: 'ME 1.2',
        title: '구어적/전화 처방의 안전성 확보',
        desc: '응급 상황이나 수술/시술 중 발생하는 구어적 혹은 전화 처방 시 받아적기(Write-down) 및 복창 확인(Read-back) 절차를 확실히 수행한다.',
        method: '지침서 서류 검토, 임상간호사 면담',
        status: 'ok',
        docLink: '/documents',
        docName: '구어처방 확인용 표준 지침서',
      },
      {
        code: 'ME 2.2',
        title: '낙상 예방 및 사후 관리 프로세스',
        desc: '입원 시 낙상 위험도를 초기 사정 도구(Morse Fall Scale)로 측정하고, 위험도에 따른 낙상 예방 중재와 낙상 주의 표식 부착을 수행한다.',
        method: '의료기록 서류 검토, 환자 면담, 현장 병상 관찰',
        status: 'ok',
        docLink: '/documents/doc-009',
        docName: '낙상 위험도 평가기록지 (MFS)',
      },
      {
        code: 'ME 3.1',
        title: '신체억제대 사용 기준 및 적법성 준수',
        desc: '신체억제대 사용 시 반드시 의사의 처방과 구체적인 대안책 적용 기록이 있어야 하며, 설명서 고지 후 보호자 동의서 사본을 징구해야 한다.',
        method: '동의서 대장 서류 검토, 기록부 확인, 병동 실물 관찰',
        status: 'stale',
        docLink: '/documents/doc-007',
        docName: '신체억제대 설명서 및 보호자 동의서',
      },
    ],
  },
  {
    chapter: '2장. 진료체계 및 질 개선',
    standards: [
      {
        code: 'QPS 1.1',
        title: '의료기관 차원의 질 향상 및 환자안전 활동 계획',
        desc: '매년 병원장 승인을 거친 QPS 연간 운영 계획서를 수립하고, 이에 근거하여 부서별 질 개선(QI) 주제 선정 및 활동을 진행한다.',
        method: '연간 계획서 서류 검토, QPS 위원회 회의록 확인',
        status: 'ok',
        docLink: '/documents',
        docName: 'QPS 질 개선 활동 계획서 및 회의록 서식',
      },
      {
        code: 'QPS 2.1',
        title: '환자안전사고 보고 체계 운영 및 분석',
        desc: '원내 위해사건 보고 시스템을 갖추고, 보고된 사고의 원인 분석(RCA/FMEA)을 거쳐 개선 활동 대책을 원내 임상부서에 환류(Feedback)한다.',
        method: '위해사건 대장 검토, 보고 체계 모니터링 확인',
        status: 'ok',
        docLink: '/reports',
        docName: '환자안전위해사건 보고 페이지 바로가기',
      },
      {
        code: 'ME 5.1',
        title: '수술 및 시술 동의서 징구 표준화',
        desc: '침습적 시술, 수술, 마취 전 집도의가 환자/보호자에게 직접 수술의 필요성과 한계, 부작용을 설명하고 법적으로 명확한 연서 동의를 받는다.',
        method: '수술 동의서 의무기록 샘플링 검토',
        status: 'ok',
        docLink: '/documents',
        docName: '표준 수술 및 침습적 시술 동의서 서식',
      },
    ],
  },
  {
    chapter: '3장. 약물 및 감염 관리',
    standards: [
      {
        code: 'MMU 1.1',
        title: '고위험의약품 보관 및 보안성 유지',
        desc: '고농축 전해질, 인슐린, 헤파린 등 고위험의약품은 일반 약물과 혼동되지 않도록 경고 라벨링을 부착하고, 전용 보관 구역의 시건장치를 유지한다.',
        method: '약제실 및 병동 처치실 캐비닛 현장 실사 관찰',
        status: 'ok',
        docLink: '/documents/doc-002',
        docName: '고위험의약품 보관 및 시건장치 대장',
      },
      {
        code: 'ME 4.1',
        title: '손위생 수행 및 모니터링 관리',
        desc: '손위생 5대 시점(Five Moments)에 근거해 전 직원의 손위생 이행률을 관찰하고 피드백하여 교차 감염의 확산을 방지한다.',
        method: '현장 근무 직원 무작위 동행 관찰, 분기 보고서 검토',
        status: 'ok',
        docLink: '/documents/doc-004',
        docName: '손위생 수행 모니터링 월간 기록 대장',
      },
      {
        code: 'ME 4.3',
        title: '감염병 유행 발생 시 격리 및 통제 프로세스',
        desc: '원내 다제내성균(CRE, VRE) 및 호흡기 감염병 집단 유행 발생 시 환자 격리 지침, 코호트 격리 요건, 보호장구 탈착 프로세스를 수립한다.',
        method: '격리 구역 실사, 감염 지침서 검토, 코호트 훈련 대장',
        status: 'stale',
        docLink: '/documents',
        docName: '감염병 유행 시 격리 및 전파 차단 행동지침',
      },
    ],
  },
];

export default function StandardsPage() {
  const [activeTab, setActiveTab] = useState(certificationStandards[0].chapter);
  const [searchQuery, setSearchQuery] = useState('');

  // 탭 변경
  const activeChapterData = certificationStandards.find((c) => c.chapter === activeTab);

  // 검색 필터링
  const filteredStandards = activeChapterData
    ? activeChapterData.standards.filter(
        (s) =>
          s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-5 fade-in">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" />
            인증 기준집 탐색
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            의료기관평가인증원 요양병원 3주기 평가기준에 근거한 공식 평가 항목과 원내 충족 가이드라인 지식을 탐색합니다.
          </p>
        </div>
        
        {/* 검색창 */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-slate-400" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="기준 코드 또는 키워드 검색..."
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* 장(Chapter) 선택 탭 */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        {certificationStandards.map((c) => (
          <button
            key={c.chapter}
            onClick={() => setActiveTab(c.chapter)}
            className={cn(
              'py-2.5 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer',
              activeTab === c.chapter
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {c.chapter}
          </button>
        ))}
      </div>

      {/* 수검 정보 안내 카드 */}
      <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-normal">
        <HelpCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5 animate-pulse" />
        <div>
          <strong>인증 조사 수검 가이드</strong>: 각 인증 기준에 기입된 <strong>수검 평가 방법</strong>은 실사단이 직접 적용하는 공식 방법론입니다. 
          특히 <strong>"직원 면담"</strong>으로 설정된 기준의 경우, 병동 실무자들이 지침의 내용을 인지하고 있는지 불시에 기습 조사하므로 부서별 반복 교육이 필수적입니다.
        </div>
      </div>

      {/* 기준 목록 리스트 */}
      <div className="space-y-4">
        {filteredStandards.length > 0 ? (
          filteredStandards.map((std) => (
            <div key={std.code} className="card p-5 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-start gap-4">
              
              {/* 왼쪽: 코드 및 상태 */}
              <div className="flex-shrink-0 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2 w-full md:w-[120px]">
                <span className="font-extrabold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs tracking-tight">
                  {std.code}
                </span>
                
                {std.status === 'ok' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    <CheckCircle size={10} />
                    규정 구비
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    <AlertTriangle size={10} />
                    점검 지연
                  </span>
                )}
              </div>

              {/* 중앙: 세부 요건 설명 */}
              <div className="flex-1 space-y-2.5 min-w-0">
                <div className="space-y-1">
                  <h3 className="font-black text-sm text-slate-800 tracking-tight leading-snug">
                    {std.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {std.desc}
                  </p>
                </div>

                {/* 평가 방식 정보 */}
                <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <Eye size={12} className="text-slate-400" />
                  <span>실사단 평가 방식:</span>
                  <span className="text-slate-600">{std.method}</span>
                </div>
              </div>

              {/* 오른쪽: 문서센터 매칭 링크 */}
              <div className="flex-shrink-0 self-stretch md:self-start flex items-center justify-end md:w-[200px] border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                <div className="w-full text-right md:text-left space-y-1.5">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">관련 원내 표준 지침/서식</div>
                  <Link
                    href={std.docLink}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/50 border border-blue-100 hover:border-blue-200 px-3 py-2 rounded-lg transition-all w-full justify-between"
                  >
                    <span className="truncate max-w-[150px]">{std.docName}</span>
                    <ExternalLink size={11} className="flex-shrink-0" />
                  </Link>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="card p-8 text-center text-slate-400 text-xs">
            검색 결과에 맞는 인증기준이 없습니다. 단어나 코드를 확인해 주세요.
          </div>
        )}
      </div>
    </div>
  );
}
