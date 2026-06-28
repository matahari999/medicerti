'use client';

import { useState } from 'react';
import {
  FileCheck,
  AlertCircle,
  FileText,
  User,
  Calendar,
  Check,
  X,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/documentStore';
import { AdminGate } from '@/components/features/AdminGate';

export default function PendingApprovalsPage() {
  const { pendingList, approveDocument, rejectDocument } = useDocumentStore();
  const [selectedDoc, setSelectedDoc] = useState<typeof pendingList[0] | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleApprove = (docId: string) => {
    approveDocument(docId, '김실무자');
    setSelectedDoc(null);
    showToast('문서 결재가 최종 승인 처리되었습니다.');
  };

  const handleReject = (docId: string) => {
    if (!rejectReason) {
      alert('반려 사유를 입력해주세요.');
      return;
    }
    rejectDocument(docId, rejectReason, '김실무자');
    setSelectedDoc(null);
    setRejectReason('');
    setIsRejecting(false);
    showToast('문서가 반려 처리되었습니다.');
  };

  return (
    <AdminGate>
      <div className="space-y-5 fade-in">
        {/* 헤더 */}
        <div>
          <h1 className="section-title flex items-center gap-2">
            <FileCheck size={20} className="text-rose-500" />
            결재 대기 문서함
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            실무진이 검토 요청 또는 결재 상신한 인증 증빙 문서의 최종 승인 및 반려 작업을 진행합니다.
          </p>
        </div>

        {/* 결재 대기 목록 */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-[120px]">문서 번호</th>
                  <th className="min-w-[280px]">문서 제목</th>
                  <th>구분</th>
                  <th>기안 부서</th>
                  <th>기안자</th>
                  <th>기안일</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.length > 0 ? (
                  pendingList.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <span className="font-bold text-slate-600 text-xs">
                          {doc.id}
                        </span>
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
                      <td className="text-slate-600 text-xs font-semibold">
                        {doc.dept}
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-xs text-slate-700">
                          <User size={12} className="text-slate-400" />
                          {doc.requester}
                        </span>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar size={12} className="text-slate-400" />
                          {doc.date}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 rounded px-2.5 py-1.5 hover:bg-blue-50 transition-all cursor-pointer"
                        >
                          <Eye size={12} />
                          검토 및 결재
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-semibold">
                      결재 대기 중인 문서가 없습니다. 모든 결재가 완료되었습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 결재 상세 검토 모달 */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-shrink-0">
                <div>
                  <span className="text-xs text-slate-400 font-bold">{selectedDoc.id}</span>
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1.5 mt-0.5">
                    <FileText size={18} className="text-blue-600" />
                    문서 결재 검토
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedDoc(null);
                    setIsRejecting(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50"
                >
                  닫기
                </button>
              </div>

              {/* 문서 상세 정보 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg text-xs flex-shrink-0">
                <div>
                  <span className="text-slate-400 block">기안자</span>
                  <span className="font-semibold text-slate-800">{selectedDoc.requester}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">기안 부서</span>
                  <span className="font-semibold text-slate-800">{selectedDoc.dept}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">문서 분류</span>
                  <span className="font-semibold text-slate-800">{selectedDoc.typeName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">기안일자</span>
                  <span className="font-semibold text-slate-800">{selectedDoc.date}</span>
                </div>
              </div>

              {/* 문서 타이틀 및 본문 */}
              <div className="flex-1 overflow-y-auto min-h-[150px] p-4 bg-slate-50/50 rounded-lg border border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
                  {selectedDoc.title}
                </h4>
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedDoc.content}
                </pre>
              </div>

              {/* 반려 사유 입력 영역 (토글형) */}
              {isRejecting ? (
                <div className="space-y-2 border-t border-slate-100 pt-3 flex-shrink-0">
                  <label className="block text-xs font-bold text-rose-600">반려 사유 필수 입력</label>
                  <textarea
                    placeholder="반려 사유를 자세히 기재해주세요. 기안자에게 전송됩니다."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full text-xs border border-rose-200 rounded-lg p-2.5 bg-rose-50/20 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded px-3 py-1.5"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(selectedDoc.id)}
                      className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded px-3 py-1.5"
                    >
                      반려 확정
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center border-t border-slate-100 pt-4 flex-shrink-0">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <AlertCircle size={12} className="text-amber-500" />
                    최종 승인 시 병원 지침서로 즉시 공식 효력이 발생합니다.
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-4 py-2 transition-colors cursor-pointer"
                    >
                      반려
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedDoc.id)}
                      className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors cursor-pointer"
                    >
                      최종 승인
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 성공 토스트 알림 */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 z-50">
            <Check size={14} className="text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </AdminGate>
  );
}
