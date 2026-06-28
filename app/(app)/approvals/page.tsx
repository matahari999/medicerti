'use client';

import Link from 'next/link';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  FileText,
  User,
  ArrowRight,
} from 'lucide-react';
import { useDocumentStore } from '@/stores/documentStore';

export default function ApprovalsDashboard() {
  const { pendingList, sentList, completedList } = useDocumentStore();

  // 최근 활동 내역: 상신 진행 문서 목록에서 최대 4건 추출
  const recentActivities = sentList.slice(0, 4).map((doc) => {
    let action = '결재 상신';
    let type = 'pending';
    
    if (doc.status === 'completed') {
      action = '결재 승인 완료';
      type = 'completed';
    } else if (doc.status === 'rejected') {
      action = '결재 반려 처리';
      type = 'rejected';
    } else if (doc.steps.filter((s) => s.status === 'approved').length > 1) {
      action = '1차 검토 승인';
      type = 'sent';
    }

    return {
      id: doc.id,
      title: doc.title,
      dept: doc.dept,
      user: doc.requester,
      action,
      time: doc.date.substring(5) + ' 등록',
      type,
    };
  });

  return (
    <div className="space-y-5 fade-in">
      {/* 헤더 */}
      <div>
        <h1 className="section-title flex items-center gap-2">
          <FileCheck size={20} className="text-blue-600" />
          결재 관리 대시보드
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          인증 규정집, 지침서 및 일일 대장 등 심사 증빙 문서의 결재선 지정, 검토 및 최종 승인 상태를 총괄합니다.
        </p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 결재 대기 문서 */}
        <Link
          href="/approvals/pending"
          className="card p-5 border-l-4 border-l-rose-500 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">결재 대기 문서</span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertCircle size={18} />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-slate-800">{pendingList.length}</span>
            <span className="text-sm text-slate-500 font-semibold">건 대기 중</span>
          </div>
          <div className="text-xs text-rose-600 font-semibold mt-3 flex items-center gap-1 group-hover:underline">
            승인 처리하러 가기
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* 상신 진행 문서 */}
        <Link
          href="/approvals/sent"
          className="card p-5 border-l-4 border-l-blue-500 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">상신 진행 문서</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock size={18} />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-slate-800">
              {sentList.filter((d) => d.status === 'in_progress').length}
            </span>
            <span className="text-sm text-slate-500 font-semibold">건 검토 중</span>
          </div>
          <div className="text-xs text-blue-600 font-semibold mt-3 flex items-center gap-1 group-hover:underline">
            상신 이력 트래킹
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* 최종 종결 보관 */}
        <Link
          href="/approvals/completed"
          className="card p-5 border-l-4 border-l-emerald-500 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">종결 문서 보관</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-slate-800">{completedList.length}</span>
            <span className="text-sm text-slate-500 font-semibold">건 완료</span>
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-3 flex items-center gap-1 group-hover:underline">
            보관된 지침 열람
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* 퀵 링크 네비게이션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex flex-col justify-between h-36 bg-gradient-to-br from-slate-850 to-slate-900 text-white border-0 shadow-lg">
          <div>
            <h3 className="font-bold text-sm">결재 대기 문서함</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              귀하가 결재자로 지정되어 검토 및 최종 승인이 필요한 규정/서식을 확인합니다.
            </p>
          </div>
          <Link
            href="/approvals/pending"
            className="flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors"
          >
            <span>대기 문서 열기</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="card p-4 flex flex-col justify-between h-36 bg-gradient-to-br from-slate-850 to-slate-900 text-white border-0 shadow-lg">
          <div>
            <h3 className="font-bold text-sm">상신 진행 문서함</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              부서 관리자 혹은 실무자 본인이 상신하여 결재선상의 임직원이 검토 중인 현황을 파악합니다.
            </p>
          </div>
          <Link
            href="/approvals/sent"
            className="flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors"
          >
            <span>상신 목록 열기</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="card p-4 flex flex-col justify-between h-36 bg-gradient-to-br from-slate-850 to-slate-900 text-white border-0 shadow-lg">
          <div>
            <h3 className="font-bold text-sm">종결 문서 보관함</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              결재가 완전히 통과되어 병원 내 공표 및 즉시 실무 배포가 가능한 완성형 문서를 보관합니다.
            </p>
          </div>
          <Link
            href="/approvals/completed"
            className="flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors"
          >
            <span>보관 문서 열기</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* 최근 결재 활동 로그 */}
      <div className="card">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">최근 결재 활동 로그</h3>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <TrendingUp size={12} className="text-blue-500" />
            실시간 문서 개정 동향
          </span>
        </div>
        <div className="p-4 space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((act) => (
              <div key={act.id} className="flex items-start justify-between border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                <div className="flex gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600 flex-shrink-0 mt-0.5">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 leading-tight">{act.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5">
                      <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-600">{act.dept}</span>
                      <span className="flex items-center gap-0.5">
                        <User size={10} className="text-slate-400" />
                        {act.user}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">{act.action}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-[10px] text-slate-400 block">{act.time}</span>
                  <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1.5 ${
                    act.type === 'pending' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    act.type === 'sent' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    act.type === 'rejected' ? 'bg-red-50 text-red-655 border border-red-100' :
                    'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    {act.type === 'pending' ? '대기' : act.type === 'sent' ? '진행' : act.type === 'rejected' ? '반려' : '종결'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-slate-400 py-6">
              최근에 발생한 결재 활동이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
