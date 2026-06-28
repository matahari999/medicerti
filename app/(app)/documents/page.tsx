'use client';

import { useState, useEffect } from 'react';
import { DOCUMENT_TYPE_LABELS, HOSPITAL_TYPE_LABELS } from '@/types';
import type { DocumentTemplate, DocumentType, HospitalType } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  FileText,
  Download,
  Eye,
  History,
  Filter,
  Search,
  Sparkles,
  Clock,
  Loader2,
} from 'lucide-react';

const mockDocuments: DocumentTemplate[] = [
  {
    id: 'doc-001',
    title: '감염관리 규정집 (요양병원)',
    type: 'regulation',
    category: '감염관리',
    hospitalTypes: ['nursing'],
    description: '요양병원 3주기 인증기준 ME 기준에 맞는 감염관리 규정집 템플릿. 손위생, 의료기구 관리, 격리, 의료폐기물 등 핵심 항목을 포함합니다.',
    version: 'v2.1',
    isAiGenerated: false,
    downloadFormats: ['pdf', 'docx'],
    createdBy: '메디인증 편집팀',
    updatedAt: '2026-05-15T00:00:00Z',
  },
  {
    id: 'doc-002',
    title: '낙상 예방 지침서',
    type: 'guideline',
    category: '환자안전',
    hospitalTypes: ['nursing', 'rehabilitation', 'acute'],
    description: '낙상 위험 평가 도구 및 예방 프로그램 운영 지침',
    version: 'v1.3',
    isAiGenerated: false,
    downloadFormats: ['pdf', 'docx', 'hwp'],
    createdBy: '메디인증 편집팀',
    updatedAt: '2026-04-20T00:00:00Z',
  },
  {
    id: 'doc-003',
    title: '투약 오류 보고 서식',
    type: 'form',
    category: '의약관리',
    hospitalTypes: ['nursing', 'psychiatric', 'acute'],
    description: '투약 오류 발생 시 작성하는 표준 보고서식',
    version: 'v1.0',
    isAiGenerated: false,
    downloadFormats: ['pdf', 'docx'],
    createdBy: '메디인증 편집팀',
    updatedAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'doc-004',
    title: '인증 자체점검 체크리스트 (요양병원)',
    type: 'checklist',
    category: '기본가치체계',
    hospitalTypes: ['nursing'],
    description: '시스템 생성 초안 및 인증 신청 전 자체 점검용 체크리스트',
    version: 'v1.0-스마트',
    isAiGenerated: true,
    downloadFormats: ['pdf', 'docx'],
    createdBy: '지능형 초안 생성',
    updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'doc-005',
    title: '손위생 모니터링 대장',
    type: 'record',
    category: '감염관리',
    hospitalTypes: ['nursing', 'acute', 'rehabilitation', 'psychiatric'],
    description: '월간 손위생 모니터링 결과 기록 대장',
    version: 'v2.0',
    isAiGenerated: false,
    downloadFormats: ['pdf', 'docx', 'hwp'],
    createdBy: '메디인증 편집팀',
    updatedAt: '2026-02-28T00:00:00Z',
  },
  {
    id: 'doc-006',
    title: '정신병원 인권 보호 지침서',
    type: 'guideline',
    category: '기본가치체계',
    hospitalTypes: ['psychiatric'],
    description: '정신건강복지법에 따른 입원환자 인권 보호 지침',
    version: 'v1.2',
    isAiGenerated: false,
    downloadFormats: ['pdf', 'docx'],
    createdBy: '메디인증 편집팀',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'doc-007',
    title: '신체억제대 설명서 및 보호자 동의서 (요양병원 필수)',
    type: 'form',
    category: '환자안전',
    hospitalTypes: ['nursing', 'psychiatric'],
    description: '요양병원 3주기 인증기준 준비 필수 신체억제대 사용 보호자 사전 설명 및 동의 서식',
    version: 'v1.1',
    isAiGenerated: false,
    downloadFormats: ['pdf', 'docx', 'hwp'],
    createdBy: '메디인증 편집팀',
    updatedAt: '2026-06-16T00:00:00Z',
  },
  {
    id: 'doc-008',
    title: '신체억제대 환자 관찰기록지 및 점검대장',
    type: 'record',
    category: '환자안전',
    hospitalTypes: ['nursing', 'psychiatric'],
    description: '억제대 처방에 따른 2시간 주기 상태 관찰, 욕창 예방, 사지 말단 혈류 확인 점검표',
    version: 'v2.0',
    isAiGenerated: false,
    downloadFormats: ['pdf', 'docx'],
    createdBy: '메디인증 편집팀',
    updatedAt: '2026-06-16T00:00:00Z',
  },
  {
    id: 'doc-009',
    title: '낙상 위험도 초기/재평가 기록지 (Morse Fall Scale)',
    type: 'checklist',
    category: '환자안전',
    hospitalTypes: ['nursing', 'rehabilitation', 'acute'],
    description: '요양/급성기 병동 필수 낙상사고 방지를 위한 MFS 6대 영역 채점 판정표',
    version: 'v1.5',
    isAiGenerated: false,
    downloadFormats: ['pdf', 'docx', 'hwp'],
    createdBy: '메디인증 편집팀',
    updatedAt: '2026-06-16T00:00:00Z',
  },
];

function getTypeBadgeClass(type: DocumentType): string {
  const classMap: Record<DocumentType, string> = {
    regulation: 'bg-purple-100 text-purple-700',
    guideline: 'bg-blue-100 text-blue-700',
    checklist: 'bg-emerald-100 text-emerald-700',
    form: 'bg-amber-100 text-amber-700',
    record: 'bg-slate-100 text-slate-700',
    manual: 'bg-indigo-100 text-indigo-700',
    other: 'bg-slate-100 text-slate-600',
  };
  return classMap[type] || classMap.other;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    async function loadDocuments() {
      setLoading(true);
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isMockMode = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-supabase-url');

      if (isMockMode) {
        setDocuments(mockDocuments);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('document_templates')
          .select('*')
          .order('title');
        
        if (!error && data && data.length > 0) {
          setDocuments(
            data.map((d: any) => ({
              id: d.id,
              title: d.title,
              type: d.type as DocumentType,
              category: d.category,
              hospitalTypes: (d.hospital_types || d.hospitalTypes) as HospitalType[],
              description: d.description,
              version: d.version,
              isAiGenerated: d.is_ai_generated || d.isAiGenerated,
              downloadFormats: d.download_formats || d.downloadFormats,
              createdBy: d.created_by || d.createdBy,
              updatedAt: d.updated_at || d.updatedAt,
            }))
          );
        } else {
          setDocuments(mockDocuments);
        }
      } catch (err) {
        console.error('문서 템플릿 로드 에러, 데모 모드로 작동:', err);
        setDocuments(mockDocuments);
      } finally {
        setLoading(false);
      }
    }
    loadDocuments();
  }, []);

  const handleDownload = (doc: DocumentTemplate) => {
    const content = (doc as any).content || `# ${doc.title}\n\n이 문서는 메디인증 v3.0 표준 인증 문서 템플릿입니다.\n버전: ${doc.version}\n분류: ${doc.category}\n\n[규정 상세 내용]\n여기에 병원의 실제 실정에 부합하는 임상 지침 및 행정 절차를 기술하십시오.`;
    const format = (doc.downloadFormats && doc.downloadFormats.length > 0 ? doc.downloadFormats[0] : 'docx') as string;
    
    const element = document.createElement("a");
    let mimeType = 'text/plain';
    let fileExtension = 'txt';

    if (format === 'md' || format === 'markdown') {
      mimeType = 'text/markdown';
      fileExtension = 'md';
    } else if (format === 'docx' || format === 'doc') {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileExtension = 'docx';
    } else if (format === 'pdf') {
      mimeType = 'application/pdf';
      fileExtension = 'pdf';
    } else if (format === 'hwp') {
      mimeType = 'application/x-hwp';
      fileExtension = 'hwp';
    }

    const file = new Blob([content], { type: `${mimeType};charset=utf-8` });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title}.${fileExtension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesHospital =
      !hospitalFilter || doc.hospitalTypes.includes(hospitalFilter as HospitalType);
    
    const matchesType = !typeFilter || doc.type === typeFilter;

    return matchesSearch && matchesHospital && matchesType;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm text-slate-500">문서 템플릿 데이터를 로드하는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            문서 템플릿 센터
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            인증 기준별 실제 현업 필수 규정집, 지침서, 서식, 체크리스트 표준 양식을 제공합니다.
          </p>
        </div>
        <Link
          href="/generate"
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
          <Sparkles size={13} />
          <span>지능형 초안 생성</span>
        </Link>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="문서 제목 또는 카테고리 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <Search className="absolute left-3 bottom-2.5 text-slate-400" size={14} />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400 flex-shrink-0" />
            <select
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 병원 유형</option>
              <option value="nursing">요양병원</option>
              <option value="psychiatric">정신병원</option>
              <option value="rehabilitation">재활병원</option>
              <option value="acute">급성기병원</option>
              <option value="dental">치과병원</option>
              <option value="korean">한방병원</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400 flex-shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 문서 형태</option>
              <option value="regulation">규정집</option>
              <option value="guideline">지침서</option>
              <option value="form">서식</option>
              <option value="record">기록대장</option>
              <option value="checklist">체크리스트</option>
              <option value="manual">실무매뉴얼</option>
            </select>
          </div>
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="empty-state card py-12">
          <div className="font-medium text-slate-600">검색 조건에 맞는 템플릿이 없습니다.</div>
          <div className="text-sm text-slate-400 mt-1">다른 키워드나 필터를 적용해 보세요.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="card p-4 hover:shadow-md transition-all fade-in">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`badge text-[10px] font-bold ${getTypeBadgeClass(doc.type)}`}>
                      {DOCUMENT_TYPE_LABELS[doc.type] || doc.type}
                    </span>
                    <span className="badge badge-default text-[10px]">{doc.category}</span>
                    {doc.isAiGenerated && (
                      <span className="badge bg-violet-100 text-violet-700 flex items-center gap-1 text-[10px]">
                        <Sparkles size={9} />
                        지능형 초안
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-2">{doc.title}</h3>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{doc.description}</p>

              {doc.isAiGenerated && (
                <div className="ai-disclaimer mb-3 text-[11px] leading-relaxed">
                  <Sparkles size={11} className="flex-shrink-0 text-violet-600" />
                  <span>이 문서는 <strong>참고용 지능형 초안</strong>입니다. 공식 제출 전 반드시 실무 검토가 필요합니다.</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                {doc.hospitalTypes.map((type) => (
                  <span key={type} className="text-[10px] bg-slate-50 text-slate-600 border border-slate-100 rounded px-1.5 py-0.5 font-medium">
                    {HOSPITAL_TYPE_LABELS[type] || type}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                  <History size={11} />
                  {doc.version}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {formatDate(doc.updatedAt, 'yyyy.MM.dd')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Download size={12} />
                  다운로드
                </button>
                <Link
                  href={`/documents/${doc.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors"
                >
                  <Eye size={12} />
                  상세보기
                </Link>
              </div>

              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-50 text-[10px] text-slate-400 uppercase font-bold">
                <span>포맷:</span>
                {doc.downloadFormats.map((fmt) => (
                  <span key={fmt} className="bg-slate-100 px-1.5 rounded">
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}