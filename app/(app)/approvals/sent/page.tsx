'use client';

import { useState } from 'react';
import {
  Clock,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/documentStore';

export default function SentApprovalsPage() {
  const { sentList } = useDocumentStore();
  const [selectedDoc, setSelectedDoc] = useState<typeof sentList[0] | null>(null);

  return (
    <div className="space-y-5 fade-in">
      {/* 헤더 */}
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Clock size={20} className="text-blue-600" />
          상신 진행 문서함
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          본인이 기안 또는 상신하여 현재 결재 단계가 진행 중이거나 반려된 문서의 실시간 경로를 확인합니다.
        </p>
      </div>

      {/* 상신 목록 테이블 */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-[120px]">문서 번호</th>
                <th className="min-w-[280px]">문서 제목</th>
                <th>구분</th>
                <th>기안일</th>
                <th>현재 결재 단계</th>
                <th>진행 상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {sentList.length > 0 ? (
                sentList.map((doc) => (
                  <tr key={doc.id} className={doc.status === 'rejected' ? 'bg-rose-50/20' : ''}>
                    <td>
                      <span className="font-bold text-slate-600 text-xs">{doc.id}</span>
                    </td>
                    <td className="font-semibold text-slate-800 text-sm">
                      {doc.title}
                    </td>
                    <td>
                      <span className={cn(
                        "badge text-xs",
                        doc.type === 'regulation' ? 'badge-urgent' :
                        doc.type === 'guideline' ? 'badge-info' : 'badge-default'
                      )}>
                        {doc.typeName}
                      </span>
                    </td>
                    <td>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar size={12} className="text-slate-400" />
                        {doc.date}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-xs text-slate-700">
                        {doc.steps.map((step, idx) => {
                          const isLast = idx === doc.steps.length - 1;
                          return (
                            <span key={step.role + idx} className="flex items-center">
                              <span className={cn(
                                "font-medium",
                                step.status === 'approved' ? 'text-blue-600 font-bold' :
                                step.status === 'rejected' ? 'text-rose-600 font-bold' : 'text-slate-400'
                              )}>
                                {step.name}
                              </span>
                              {!isLast && <ChevronRight size={10} className="text-slate-350 mx-1" />}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <span className={cn(
                        "badge text-xs",
                        doc.status === 'in_progress' ? 'badge-info' :
                        doc.status === 'completed' ? 'badge-success' : 'badge-urgent'
                      )}>
                        {doc.statusLabel}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded px-2.5 py-1.5 hover:bg-slate-50 transition-all"
                      >
                        <Info size={12} />
                        결재 경로
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-semibold">
                    상신된 문서가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 결재 정보 및 반려 의견 모달 */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Info size={18} className="text-blue-600" />
                결재 진행 경로 상세
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                닫기
              </button>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold block">{selectedDoc.id}</span>
              <h4 className="font-bold text-slate-800 text-sm mt-0.5">{selectedDoc.title}</h4>
            </div>

            {/* 반려 의견 노출 */}
            {selectedDoc.status === 'rejected' && selectedDoc.rejectReason && (
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 space-y-1">
                <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  결재 반려 사유
                </span>
                <p className="text-xs text-rose-600 leading-relaxed font-medium">
                  {selectedDoc.rejectReason}
                </p>
              </div>
            )}

            {/* 결재 단계 시각화 */}
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-bold text-slate-600">결재 히스토리</h5>
              <div className="space-y-3.5 relative pl-4 border-l border-slate-200 ml-2">
                {selectedDoc.steps.map((step, idx) => {
                  const isApproved = step.status === 'approved';
                  const isRejected = step.status === 'rejected';
                  const isPending = step.status === 'pending';

                  return (
                    <div key={idx} className="relative">
                      {/* 노드 점 */}
                      <span className={cn(
                        "absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-white",
                        isApproved ? "border-blue-600 bg-blue-600" :
                        isRejected ? "border-rose-600 bg-rose-600" : "border-slate-355 bg-white"
                      )} />
                      <div className="flex justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-700 block">
                            {step.role} · {step.name}
                          </span>
                          <span className={cn(
                            "text-[10px] font-semibold mt-0.5 inline-block",
                            isApproved ? "text-blue-600" :
                            isRejected ? "text-rose-600" : "text-slate-400"
                          )}>
                            {isApproved ? "합의/검토 승인" :
                             isRejected ? "반려 처리" : "대기 중"}
                          </span>
                        </div>
                        {step.date && (
                          <span className="text-[10px] text-slate-400 mt-0.5">{step.date}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              {selectedDoc.status === 'rejected' && (
                <button
                  onClick={() => {
                    alert('재상신 수정 화면으로 진입합니다 (시뮬레이션)');
                    setSelectedDoc(null);
                  }}
                  className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors"
                >
                  수정하여 재상신
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg px-4 py-2 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
