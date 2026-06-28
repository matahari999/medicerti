'use client';

import { use, useState, useEffect } from 'react';
import { DOCUMENT_TYPE_LABELS, HOSPITAL_TYPE_LABELS } from '@/types';
import type { DocumentType, HospitalType } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  FileText,
  Download,
  History,
  Sparkles,
  AlertCircle,
  Calendar,
  User,
  Tag,
  PenTool,
  Send,
  Building,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface DocumentMapItem {
  id: string;
  title: string;
  type: DocumentType;
  category: string;
  hospitalTypes: HospitalType[];
  description: string;
  version: string;
  isAiGenerated: boolean;
  downloadFormats: string[];
  createdBy: string;
  updatedAt: string;
  content: string;
  versions: { version: string; changedBy: string; changedAt: string; summary: string }[];
}

const MOCK_DOCUMENTS_MAP: Record<string, DocumentMapItem> = {
  'doc-001': {
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
    content: `# 감염관리 규정집

## 제1장 총칙

### 제1조(목적)
본 규정은 의료법 및 감염병예방법에 따라 원내 의료 관련 감염을 효과적으로 예방하고 환자와 직원의 건강을 보호하기 위한 감염관리 체계를 수립하는 것을 목적으로 합니다.

### 제2조(적용 범위)
본 규정은 병원 내 모든 부서, 전 직원, 협력업체 및 방문객에게 적용됩니다.

## 제2장 감염관리 조직

### 제3조(감염관리위원회)
- 위원회는 병원장, 감염관리의사, 감염관리간호사 등으로 구성합니다.
- 매 분기 1회 정기 회의를 개최하며 위원장은 병원장이 맡습니다.

### 제4조(감염관리실/인력)
- 감염관리 전담 또는 겸임 간호사를 지정하여 운영합니다.
- 담당 인력은 매년 감염 관련 교육을 16시간 이상 이수하여야 합니다.

## 제3장 표준예방지침
### 제5조(손위생)
- 모든 임직원은 환자 접촉 전후, 무균 처치 전, 체액 노출 위험 후 손씻기를 철저히 수행합니다.
- 분기별로 수행율 모니터링을 진행하고 피드백합니다.`,
    versions: [
      { version: 'v2.1', changedBy: '메디인증 편집팀', changedAt: '2026-05-15', summary: '2026년 인증기준 개정 반영, 손위생 조항 추가' },
      { version: 'v2.0', changedBy: '메디인증 편집팀', changedAt: '2025-12-01', summary: '3주기 기준 전면 개정' },
    ],
  },
  'doc-002': {
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
    content: `# 낙상 예방 활동 지침서

## 제1조(목적)
원내 낙상 사고 발생 위험을 체계적으로 사정하고 예방 활동을 이행함으로써 환자에게 안전한 환경을 보장하는 것을 목적으로 합니다.

## 제2조(낙상 위험도 사정)
- 입원 시 모든 환자에게 Morse Fall Scale(MFS)을 이용해 낙상 위험도를 평가합니다.
- 고위험군으로 판정된 경우 병상 명패에 낙상주의 표식을 부착합니다.`,
    versions: [
      { version: 'v1.3', changedBy: '메디인증 편집팀', changedAt: '2026-04-20', summary: '낙상 위험도 재평가 주기 구체화' },
    ],
  },
  'doc-003': {
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
    content: `# 투약 오류 보고서 (양식)

- 작성일자: 
- 보고자: (서명)
- 발생 일시 및 장소: 
- 대상 환자 정보 (등록번호/이름):

### 1. 오류 유형
- [ ] 환자 오류
- [ ] 약품 오류
- [ ] 용량 오류
- [ ] 경로 오류
- [ ] 시간 오류

### 2. 발생 경위
(자세한 상황을 기술하세요)

### 3. 환자 상태 및 후속 조치
(의사 보고 여부, 모니터링 경과 기록)`,
    versions: [
      { version: 'v1.0', changedBy: '메디인증 편집팀', changedAt: '2026-03-10', summary: '신규 표준 서식 제정' },
    ],
  },
  'doc-004': {
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
    content: `# 요양병원 자체 점검 체크리스트

1. [ ] 환자 권리 선언문이 접수처 및 병동에 게시되어 있는가?
2. [ ] 신체 억제대 사용 시 환자 보호자 동의서를 100% 획득하였는가?
3. [ ] 화재 대비 소방 대피 통로가 완전히 개방되어 있는가?
4. [ ] 의약품 보관 온도 대장이 매일 누락 없이 작성되고 있는가?`,
    versions: [
      { version: 'v1.0-스마트', changedBy: '지능형 생성 엔진', changedAt: '2026-06-01', summary: '지능형 문서 생성을 통한 최초 초안 빌드' },
    ],
  },
};

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentMapItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string; createdAt: string }>>([]);
  const [newComment, setNewComment] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    if (doc) {
      const savedComments = localStorage.getItem(`comments_${doc.id}`);
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      } else {
        const initialComments = [
          { id: 'c1', user: '이가은 간호부장', text: '부서별 상세 실행 내역을 조금 더 보완할 필요가 있어 보입니다.', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
          { id: 'c2', user: '정진료 진료과장', text: '의사 교육 관련 이수 조건 부분이 최신 지침과 매칭되어 좋습니다.', createdAt: new Date(Date.now() - 3600000).toISOString() }
        ];
        setComments(initialComments);
        localStorage.setItem(`comments_${doc.id}`, JSON.stringify(initialComments));
      }
    }
  }, [doc]);

  useEffect(() => {
    async function loadDocument() {
      setLoading(true);
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isMockMode = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-supabase-url');

      if (isMockMode) {
        setDoc(MOCK_DOCUMENTS_MAP[id] || null);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('document_templates')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          setDoc({
            id: data.id,
            title: data.title,
            type: data.type as DocumentType,
            category: data.category,
            hospitalTypes: (data.hospital_types || data.hospitalTypes) as HospitalType[],
            description: data.description,
            version: data.version,
            isAiGenerated: data.is_ai_generated || data.isAiGenerated,
            downloadFormats: data.download_formats || data.downloadFormats,
            createdBy: data.created_by || data.createdBy,
            updatedAt: data.updated_at || data.updatedAt,
            content: data.content || `# ${data.title}\n\n이 문서는 표준 인증 문서 템플릿입니다.`,
            versions: data.versions_history || [
              { version: data.version, changedBy: data.created_by || '시스템', changedAt: formatDate(data.updated_at, 'yyyy-MM-dd'), summary: '최초 규정 등록 완료' }
            ]
          });
        } else {
          setDoc(MOCK_DOCUMENTS_MAP[id] || null);
        }
      } catch (err) {
        console.error('문서 상세 로딩 에러, 데모 모드로 작동:', err);
        setDoc(MOCK_DOCUMENTS_MAP[id] || null);
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [id]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !doc) return;

    const added = {
      id: `c_${Date.now()}`,
      user: '원내 검토자',
      text: newComment.trim(),
      createdAt: new Date().toISOString()
    };

    const nextComments = [...comments, added];
    setComments(nextComments);
    localStorage.setItem(`comments_${doc.id}`, JSON.stringify(nextComments));

    setNewComment('');
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 2000);
  };

  const handleDownload = (format: string) => {
    if (!doc) return;
    const element = document.createElement("a");
    let mimeType = 'text/plain';
    let fileExtension = 'txt';
    let fileContent = doc.content;

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

    const file = new Blob([fileContent], { type: `${mimeType};charset=utf-8` });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title}.${fileExtension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm text-slate-500">문서 템플릿을 불러오는 중...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-slate-800">문서를 찾을 수 없습니다.</h2>
        <Link href="/documents" className="text-blue-600 underline text-sm mt-2 inline-block">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      <Link
        href="/documents"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={14} />
        템플릿 목록
      </Link>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 space-y-4">
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-info text-xs">{DOCUMENT_TYPE_LABELS[doc.type] || doc.type}</span>
              <span className="badge badge-default text-xs">{doc.category}</span>
              {doc.isAiGenerated && (
                <span className="badge bg-violet-100 text-violet-700 flex items-center gap-1 text-xs">
                  <Sparkles size={9} />
                  지능형 초안
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-slate-900 leading-snug">{doc.title}</h1>
            <p className="text-sm text-slate-600 leading-relaxed">{doc.description}</p>

            {doc.isAiGenerated && (
              <div className="ai-disclaimer p-3 rounded-lg text-xs border border-violet-200 bg-violet-50 text-violet-800">
                <Sparkles size={14} className="text-violet-600" />
                <span>이 문서는 <strong>지능형 초안 생성기</strong>가 작성한 참고용 초안입니다. 실제 제출 전 병원의 실정에 맞게 커스터마이징 및 검토 절차가 필수적입니다.</span>
              </div>
            )}

            <div className="border border-slate-200 rounded-xl overflow-hidden mt-6 bg-slate-50">
              <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>표준 서식 뷰어</span>
                <span className="text-blue-600">수정 불가 (읽기 전용)</span>
              </div>
              <div className="p-6 bg-white overflow-y-auto max-h-[500px]">
                <pre className="font-sans whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-normal">
                  {doc.content}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-4">
          <div className="card p-4 space-y-3.5">
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">서식 명세</h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">버전</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <History size={12} className="text-slate-400" />
                  {doc.version}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">최종 업데이트</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  {formatDate(doc.updatedAt, 'yyyy.MM.dd')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">제공/작성자</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <User size={12} className="text-slate-400" />
                  {doc.createdBy}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-500 flex-shrink-0">대상 병원</span>
                <div className="flex flex-col items-end gap-1">
                  {doc.hospitalTypes.map((t) => (
                    <span key={t} className="badge badge-default scale-90 origin-right">
                      {HOSPITAL_TYPE_LABELS[t] || t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-2 pt-2 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">포맷 선택 다운로드</div>
              <div className="grid grid-cols-2 gap-2">
                {doc.downloadFormats.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => handleDownload(fmt)}
                    className="py-1.5 border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-blue-50/20"
                  >
                    <Download size={11} />
                    <span>{fmt.toUpperCase()} 받기</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <History size={14} className="text-slate-500" />
              버전 히스토리
            </h3>
            
            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
              {doc.versions.map((ver, idx) => (
                <div key={idx} className="relative pl-6 text-xs">
                  <div className="absolute left-[5px] top-[5px] w-2 h-2 rounded-full bg-blue-500 border border-white" />
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{ver.version}</span>
                    <span className="text-[10px] text-slate-400">{ver.changedAt}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-0.5">{ver.summary}</p>
                  <p className="text-[10px] text-slate-400">작성: {ver.changedBy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">원내 검토 피드백</h3>
            
            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div key={comment.id} className="p-2 bg-slate-50 rounded-lg text-xs leading-relaxed border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-700">{comment.user}</span>
                    <span className="text-[9px] text-slate-400">{formatDate(comment.createdAt, 'MM/dd HH:mm')}</span>
                  </div>
                  <p className="text-slate-600">{comment.text}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-xs text-slate-400 italic py-2 text-center">등록된 피드백이 없습니다.</p>
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="pt-2 border-t border-slate-100 space-y-2">
              <textarea
                placeholder="검토 의견 또는 개선 사항 입력..."
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={10} />
                의견 등록
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}