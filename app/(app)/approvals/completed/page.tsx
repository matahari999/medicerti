'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Search,
  Download,
  Calendar,
  User,
  FileText,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/documentStore';

const docTypes = ['전체 구분', '규정집', '지침서', '서식', '대장'];
const departmentsList = ['전체 부서', 'QPS/감염관리실', '간호부', '행정부', '약제부'];

export default function CompletedApprovalsPage() {
  const { completedList } = useDocumentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('전체 구분');
  const [selectedDept, setSelectedDept] = useState('전체 부서');

  const handleDownload = (docTitle: string, format: string) => {
    alert(`[다운로드] ${docTitle}.${format} 파일 다운로드가 개시되었습니다.`);
  };

  // 필터링 적용
  const filteredDocs = completedList.filter((doc) => {
    const matchesSearch = doc.title.includes(searchQuery) || doc.id.includes(searchQuery);
    const matchesType = selectedType === '전체 구분' || doc.typeName === selectedType;
    const matchesDept = selectedDept === '전체 부서' || doc.dept === selectedDept;
    return matchesSearch && matchesType && matchesDept;
  });

  return (
    <div className="space-y-5 fade-in">
      {/* 헤더 */}
      <div>
        <h1 className="section-title flex items-center gap-2">
          <CheckCircle2 size={20} className="text-emerald-600" />
          종결 문서 보관함
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          전자 결재가 완전히 통과되어 최종 개정 고시 및 공식 효력이 발생한 문서들을 보관하고 배포합니다.
        </p>
      </div>

      {/* 필터 바 */}
      <div className="card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="문서명 또는 문서번호 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="flex items-center gap-1.5 w-1/2 md:w-auto">
            <Filter size={13} className="text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            >
              {docTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 w-1/2 md:w-auto">
            <Filter size={13} className="text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            >
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 종결 문서 보관 목록 */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-[120px]">문서 번호</th>
                <th className="min-w-[285px]">문서 제목</th>
                <th>구분</th>
                <th>버전</th>
                <th>발행 부서</th>
                <th>최종 승인자</th>
                <th>승인일자</th>
                <th className="w-[160px]">다운로드</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => {
                  const finalStep = doc.steps.filter((s) => s.status === 'approved').pop();
                  const approverName = finalStep ? finalStep.name : '시스템';
                  
                  return (
                    <tr key={doc.id}>
                      <td>
                        <span className="font-bold text-slate-600 text-xs">{doc.id}</span>
                      </td>
                      <td>
                        <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                          <FileText size={14} className="text-slate-400" />
                          {doc.title}
                        </div>
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
                        <span className="font-bold text-slate-600 text-xs bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                          {doc.version}
                        </span>
                      </td>
                      <td className="text-slate-600 text-xs font-semibold">
                        {doc.dept}
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-xs text-slate-700">
                          <User size={12} className="text-slate-400" />
                          {approverName}
                        </span>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar size={12} className="text-slate-400" />
                          {doc.date}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {doc.formats.map((fmt) => (
                            <button
                              key={fmt}
                              onClick={() => handleDownload(doc.title, fmt)}
                              className="flex items-center gap-0.5 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-1.5 py-1 uppercase transition-colors"
                            >
                              <Download size={10} />
                              {fmt}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 font-semibold">
                    검색 결과 또는 필터 조건에 부합하는 종결 문서가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
