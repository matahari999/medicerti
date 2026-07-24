'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HOSPITAL_TYPE_LABELS, DOCUMENT_TYPE_LABELS } from '@/types';
import type { HospitalType, DocumentType, AiGenerationStatus } from '@/types';
import {
  Sparkles,
  AlertCircle,
  Copy,
  Download,
  ChevronRight,
  CheckCircle2,
  Clock,
  Loader2,
  PenTool,
  Send,
  Building,
} from 'lucide-react';
import { useDocumentStore } from '@/stores/documentStore';
import { ProgressCharacterBar } from '@/components/ui/ProgressCharacterBar';

interface HistoryItem {
  id: string;
  documentTitle: string;
  hospitalName: string;
  documentType: DocumentType;
  status: AiGenerationStatus;
  createdAt: string;
  result: string;
}

function DraftDisclaimer({ variant = 'default' }: { variant?: 'default' | 'result' }) {
  if (variant === 'result') {
    return (
      <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-300 rounded-lg">
        <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <div className="font-bold mb-1">⚠️ 참고용 초안 안내</div>
          <div>
            이 문서는 <strong>지능형 시스템이 생성한 참고용 초안</strong>입니다. 법적·행정적 효력이 없으며,
            공식 제출 전 반드시 담당 실무자의 검토와 수정이 필요합니다.
            의료기관평가인증원의 공식 기준집을 함께 참고하세요.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-disclaimer">
      <Sparkles size={14} />
      <span>
        지능형 생성 결과는 <strong>참고용 초안</strong>입니다. 공식 문서로 사용하려면 반드시 실무 검토가 필요합니다.
      </span>
    </div>
  );
}

// 카탈로그 타입
interface CatalogItem { itemNumber: string; itemTitle: string; summary: string; }
interface CatalogFormRef { name: string; itemNumber: string; }
interface CatalogChapter {
  chapterNumber: string;
  chapterTitle: string;
  items: CatalogItem[];
  forms: CatalogFormRef[];
  checklists: CatalogFormRef[];
}

export interface GenerateInput {
  hospitalType: HospitalType;
  hospitalName: string;
  documentType: DocumentType;
  documentTitle: string;
  additionalContext: string;
  logoUrl?: string;
  // 카테고리 선택 시 원문 근거 검색에 쓰이는 기준 정보
  itemNumber?: string;
  itemTitle?: string;
  chapterNumber?: string;
  chapterTitle?: string;
}

// 문서유형이 규정집류인지 / 점검표인지 / 양식류인지
function docKind(t: DocumentType): 'regulation' | 'checklist' | 'form' {
  if (t === 'checklist') return 'checklist';
  if (t === 'form' || t === 'record') return 'form';
  return 'regulation'; // regulation/guideline/manual
}

// 생성 폼
function GenerateForm({
  onGenerate,
  isGenerating,
}: {
  onGenerate: (data: GenerateInput) => void;
  isGenerating: boolean;
}) {
  const [hospitalType, setHospitalType] = useState<HospitalType>('nursing');
  const [hospitalName, setHospitalName] = useState('메디요양병원');
  const [documentType, setDocumentType] = useState<DocumentType>('regulation');
  const [documentTitle, setDocumentTitle] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [hospitals, setHospitals] = useState<{ id: string; name: string; logo_url: string | null }[]>([]);
  const [hospitalId, setHospitalId] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  // 카테고리 선택 모드
  const [mode, setMode] = useState<'category' | 'manual'>('category');
  const [chapters, setChapters] = useState<CatalogChapter[]>([]);
  const [chapterNumber, setChapterNumber] = useState('');
  const [selectedRef, setSelectedRef] = useState<GenerateInput | null>(null);

  useEffect(() => {
    fetch('/api/hospitals')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setHospitals((j?.data ?? []).map((h: { id: string; name: string; logo_url: string | null }) => ({ id: h.id, name: h.name, logo_url: h.logo_url }))))
      .catch(() => {});
  }, []);

  // 병원유형이 바뀌면 카탈로그 다시 로드
  useEffect(() => {
    fetch(`/api/catalog?hospitalType=${hospitalType}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const chs: CatalogChapter[] = j?.chapters ?? [];
        setChapters(chs);
        setChapterNumber(chs[0]?.chapterNumber ?? '');
        setSelectedRef(null);
        setDocumentTitle('');
      })
      .catch(() => setChapters([]));
  }, [hospitalType]);

  const selectHospital = (id: string) => {
    setHospitalId(id);
    const h = hospitals.find((x) => x.id === id);
    if (h) {
      setHospitalName(h.name);
      setLogoUrl(h.logo_url ?? undefined);
    } else {
      setLogoUrl(undefined);
    }
  };

  const kind = docKind(documentType);
  const docTypeLabel = DOCUMENT_TYPE_LABELS[documentType];
  const chapter = chapters.find((c) => c.chapterNumber === chapterNumber);

  // 카테고리 항목 선택 → 제목·기준정보 세팅
  const pickItem = (ref: GenerateInput, title: string) => {
    setSelectedRef(ref);
    setDocumentTitle(title);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalName.trim() || !documentTitle.trim()) return;
    const base = { hospitalType, hospitalName, documentType, documentTitle, additionalContext, logoUrl };
    // 카테고리 모드에서 고른 기준정보(itemNumber 등)를 함께 넘겨 원문 근거를 검색하게 한다.
    // base를 뒤에 둬서 실제 제목·병원명이 selectedRef의 빈 값에 덮이지 않게 한다.
    onGenerate(mode === 'category' && selectedRef ? { ...selectedRef, ...base } : base);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <h2 className="font-bold text-slate-800">병원 정보 입력</h2>

      <DraftDisclaimer />

      {/* 병원 선택 (이름·로고 자동) */}
      {hospitals.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">병원 선택 (이름·로고 자동 적용)</label>
          <div className="flex items-center gap-3">
            <select
              value={hospitalId}
              onChange={(e) => selectHospital(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">직접 입력</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}{h.logo_url ? ' (로고 있음)' : ''}
                </option>
              ))}
            </select>
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="병원 로고" className="h-10 w-16 object-contain rounded border border-slate-200 bg-white shrink-0" />
            )}
          </div>
        </div>
      )}

      {/* 병원 유형 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          병원 유형 <span className="text-red-500">*</span>
        </label>
        <select
          value={hospitalType}
          onChange={(e) => setHospitalType(e.target.value as HospitalType)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {(Object.entries(HOSPITAL_TYPE_LABELS) as [HospitalType, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* 병원명 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          병원명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={hospitalName}
          onChange={(e) => setHospitalName(e.target.value)}
          placeholder="예: 한국요양병원"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          maxLength={50}
        />
      </div>

      {/* 문서 유형 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          문서 유형 <span className="text-red-500">*</span>
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {(Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][]).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* 문서 제목 — 카테고리 선택 / 직접 입력 토글 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-slate-700">
            생성할 문서 <span className="text-red-500">*</span>
          </label>
          <div className="flex text-xs rounded-lg overflow-hidden border border-slate-200">
            <button
              type="button"
              onClick={() => { setMode('category'); setDocumentTitle(''); setSelectedRef(null); }}
              className={`px-2.5 py-1 ${mode === 'category' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
            >
              카테고리 선택
            </button>
            <button
              type="button"
              onClick={() => { setMode('manual'); setSelectedRef(null); }}
              className={`px-2.5 py-1 ${mode === 'manual' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}
            >
              직접 입력
            </button>
          </div>
        </div>

        {mode === 'manual' ? (
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            placeholder="예: 감염관리 규정집, 낙상 예방 지침서"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={100}
          />
        ) : (
          <div className="space-y-2">
            {/* 장 선택 */}
            <select
              value={chapterNumber}
              onChange={(e) => { setChapterNumber(e.target.value); setSelectedRef(null); setDocumentTitle(''); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {chapters.map((c) => (
                <option key={c.chapterNumber} value={c.chapterNumber}>제{c.chapterNumber}장 {c.chapterTitle}</option>
              ))}
            </select>

            {/* 문서유형에 맞는 카테고리 목록 */}
            <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg divide-y">
              {kind === 'regulation' && chapter && (
                <>
                  <button
                    type="button"
                    onClick={() => pickItem(
                      { hospitalType, hospitalName, documentType, documentTitle: '', additionalContext, chapterNumber: chapter.chapterNumber, chapterTitle: chapter.chapterTitle },
                      `${chapter.chapterTitle} ${docTypeLabel}`,
                    )}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${documentTitle === `${chapter.chapterTitle} ${docTypeLabel}` ? 'bg-blue-100 font-semibold text-blue-800' : 'text-slate-700'}`}
                  >
                    📚 제{chapter.chapterNumber}장 전체 {docTypeLabel} (기준 {chapter.items.length}개)
                  </button>
                  {chapter.items.map((it) => {
                    const title = `${it.itemTitle} ${docTypeLabel}`;
                    return (
                      <button
                        key={it.itemNumber}
                        type="button"
                        onClick={() => pickItem(
                          { hospitalType, hospitalName, documentType, documentTitle: '', additionalContext, itemNumber: it.itemNumber, itemTitle: it.itemTitle, chapterNumber: chapter.chapterNumber, chapterTitle: chapter.chapterTitle },
                          title,
                        )}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-start gap-2 ${documentTitle === title ? 'bg-blue-100 text-blue-800' : 'text-slate-700'}`}
                      >
                        <span className="font-mono text-xs text-blue-600 shrink-0 w-10">{it.itemNumber}</span>
                        <span className="min-w-0">{it.itemTitle}</span>
                      </button>
                    );
                  })}
                </>
              )}

              {kind === 'checklist' && chapter && (
                chapter.checklists.length > 0 ? chapter.checklists.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => pickItem(
                      { hospitalType, hospitalName, documentType, documentTitle: '', additionalContext, itemNumber: c.itemNumber, chapterNumber: chapter.chapterNumber, chapterTitle: chapter.chapterTitle },
                      c.name,
                    )}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${documentTitle === c.name ? 'bg-blue-100 font-semibold text-blue-800' : 'text-slate-700'}`}
                  >
                    ☑ {c.name}
                  </button>
                )) : <div className="px-3 py-4 text-xs text-slate-400 text-center">이 장에 등록된 점검표가 없습니다</div>
              )}

              {kind === 'form' && chapter && (
                chapter.forms.length > 0 ? chapter.forms.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => pickItem(
                      { hospitalType, hospitalName, documentType, documentTitle: '', additionalContext, itemNumber: f.itemNumber, chapterNumber: chapter.chapterNumber, chapterTitle: chapter.chapterTitle },
                      f.name,
                    )}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${documentTitle === f.name ? 'bg-blue-100 font-semibold text-blue-800' : 'text-slate-700'}`}
                  >
                    📝 {f.name}
                  </button>
                )) : <div className="px-3 py-4 text-xs text-slate-400 text-center">이 장에 등록된 서식이 없습니다</div>
              )}
            </div>

            {documentTitle && (
              <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                선택됨: <span className="font-semibold">{documentTitle}</span>
                {selectedRef?.itemNumber && <span className="text-blue-500"> · 기준 {selectedRef.itemNumber} 원문 근거 반영</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 추가 컨텍스트 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          추가 요구사항 (선택)
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[
            '낙상 예방관리 규정집과 낙상위험도 평가도구(Morse Fall Scale) 서식 및 낙상 예방 체크리스트를 포함해주세요.',
            '감염관리 규정집과 손위생 수행률 관찰 기록지, 의료관련감염 발생 보고서 양식을 포함해주세요.',
            'AED(자동 제세동기) 일일 점검표, 월별 유지관리 기록지, 직원 교육 확인서를 포함해주세요.',
          ].map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAdditionalContext(ex)}
              className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              예시 {i + 1}
            </button>
          ))}
        </div>
        <textarea
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          placeholder="병상 수, 특이사항, 포함해야 할 내용 등을 입력하세요..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
          maxLength={500}
        />
        <div className="text-right text-xs text-slate-400 mt-1">
          {additionalContext.length}/500
        </div>
      </div>

      {/* 생성 버튼 */}
      <button
        type="submit"
        disabled={isGenerating || !hospitalName.trim() || !documentTitle.trim()}
        className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors"
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            초안 생성 중...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            지능형 초안 생성하기
          </>
        )}
      </button>
    </form>
  );
}

// 생성 이력
interface GenerationHistoryProps {
  histories: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

function GenerationHistory({ histories, onSelect }: GenerationHistoryProps) {
  return (
    <div className="card p-4">
      <h3 className="font-bold text-slate-800 mb-3">최근 생성 이력</h3>
      {histories.length === 0 ? (
        <div className="text-sm text-slate-400 text-center py-4">생성 이력이 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {histories.map((hist) => (
            <div
              key={hist.id}
              className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{hist.documentTitle}</div>
                <div className="text-xs text-slate-500">{hist.hospitalName} · {DOCUMENT_TYPE_LABELS[hist.documentType]}</div>
              </div>
              <button
                onClick={() => onSelect(hist)}
                className="text-xs text-blue-600 hover:text-blue-700 flex-shrink-0 flex items-center gap-0.5 cursor-pointer bg-transparent border-0 font-semibold"
              >
                보기 <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 지능형 문서 생성 페이지
export default function GeneratePage() {
  const router = useRouter();
  const { submitForApproval } = useDocumentStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isResultMock, setIsResultMock] = useState(false);
  const [error, setError] = useState('');
  // 규정 생성 시 함께 안내되는 딸린 서식 세트 (현행 인증기준 요구 서식 + 참조 규정 부록)
  const [linkedForms, setLinkedForms] = useState<string[]>([]);
  const [currentStandard, setCurrentStandard] = useState<{ number: string; title: string } | null>(null);
  // 서식류 생성 시 인쇄용 HTML (결재란·문서번호 포함)
  const [formHtml, setFormHtml] = useState<string | null>(null);
  const [regulationHtml, setRegulationHtml] = useState<string | null>(null);

  // 편집기 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editHospitalName, setEditHospitalName] = useState('');
  const [selectedReviewer, setSelectedReviewer] = useState('최간호 부장');
  const [selectedApprover, setSelectedApprover] = useState('이의사 원장');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [histories, setHistories] = useState<HistoryItem[]>([
    {
      id: 'hist-001',
      documentTitle: '소아 감염 안전 관리 규정',
      hospitalName: '메디요양병원',
      documentType: 'regulation' as DocumentType,
      status: 'completed' as AiGenerationStatus,
      createdAt: '2026-06-10T14:30:00Z',
      result: `# 메디요양병원 소아 감염 안전 관리 규정

## 제1조 (목적)
본 규정은 원내 방문 소아 및 요양 청소년의 교차 감염 예방을 목적으로 한다.

## 제2조 (보호자 의무)
방문 보호자는 면회 전 반드시 알코올 젤을 활용해 손소독을 이행하여야 한다.`,
    },
  ]);
  
  const [currentInput, setCurrentInput] = useState<GenerateInput | null>(null);

  const handleGenerate = async (data: GenerateInput) => {
    setIsGenerating(true);
    setResult(null);
    setError('');
    setCurrentInput(data);
    setIsEditing(false);

    try {
      // 캐릭터 로딩바 애니메이션(2.5초)을 충분히 보여주기 위해 Promise.all 사용
      const [response] = await Promise.all([
        fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }),
        new Promise((resolve) => setTimeout(resolve, 2500)),
      ]);

      if (!response.ok) {
        throw new Error('초안 생성 서버 통신에 실패했습니다.');
      }

      const resJson = await response.json();
      setResult(resJson.result);
      setIsResultMock(!!resJson.isMock);
      if (resJson.isMock && resJson.userMessage) {
        setError(resJson.userMessage);
      }
      // 서식 칩 클릭으로 개별 서식을 생성할 때는 기존 서식 세트 패널을 유지
      if (data.documentType !== 'form') {
        setLinkedForms(resJson.linkedForms || []);
        setCurrentStandard(resJson.currentStandard || null);
      }
      setFormHtml(resJson.formHtml || null);
      setRegulationHtml(resJson.regulationHtml || null);

      // 편집용 상태도 미리 설정
      setEditorContent(resJson.result);
      setEditedTitle(data.documentTitle);
      setEditHospitalName(data.hospitalName);

      // 성공 시 이력 목록에 추가
      const newHistory: HistoryItem = {
        id: `hist-${Date.now()}`,
        documentTitle: data.documentTitle,
        hospitalName: data.hospitalName,
        documentType: data.documentType,
        status: 'completed',
        createdAt: new Date().toISOString(),
        result: resJson.result,
      };
      setHistories((prev) => [newHistory, ...prev]);
    } catch (err: any) {
      setError(err.message || '문서 생성 중 알 수 없는 에러가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 이력 선택 이벤트
  const handleSelectHistory = (item: HistoryItem) => {
    setResult(item.result);
    setIsResultMock(false);
    setIsEditing(false);
    setEditorContent(item.result);
    setEditedTitle(item.documentTitle);
    setEditHospitalName(item.hospitalName);
    setCurrentInput({
      hospitalType: 'nursing',
      hospitalName: item.hospitalName,
      documentTitle: item.documentTitle,
      documentType: item.documentType,
      additionalContext: '',
    });
  };

  const handleSendApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput) return;

    submitForApproval({
      title: editedTitle,
      type: currentInput.documentType,
      typeName: DOCUMENT_TYPE_LABELS[currentInput.documentType],
      dept: '간호부',
      requester: '김실무자',
      content: editorContent,
      steps: [
        { role: '1차 검토자', name: selectedReviewer },
        { role: '최종 승인자', name: selectedApprover },
      ],
    });

    setToastMessage('지능형 초안 기반 맞춤 규정이 전자결재로 상신되었습니다. 이동합니다.');
    
    setTimeout(() => {
      router.push('/approvals/sent');
    }, 1500);
  };

  return (
    <div className="space-y-5 fade-in pb-10">
      {/* 헤더 */}
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Sparkles size={20} className="text-violet-600" />
          지능형 문서 생성 및 맞춤 기안
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          병원 정보 입력 후 지능형 초안을 받아 실제 실무 규정집 양식으로 직접 다듬고 결재까지 원스톱으로 처리합니다.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg">
          <AlertCircle size={16} className="text-red-600" />
          {error}
        </div>
      )}

      {/* 편집 모드가 아닐 때 일반 UI */}
      {!isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 왼쪽: 입력 폼 */}
          <div className="lg:col-span-1 space-y-4">
            <GenerateForm onGenerate={handleGenerate} isGenerating={isGenerating} />
            <GenerationHistory histories={histories} onSelect={handleSelectHistory} />
          </div>

          {/* 오른쪽: 결과 */}
          <div className="lg:col-span-2">
            {isGenerating && (
              <div className="card p-8 flex flex-col justify-center min-h-[300px]">
                <div className="text-center mb-4">
                  <div className="font-extrabold text-slate-800 text-lg mb-1">지능형 초안 생성 중</div>
                  <p className="text-xs text-slate-500">평가인증 기준집과 제출 데이터를 분석하여 맞춤 규정을 기안하고 있습니다.</p>
                </div>
                <ProgressCharacterBar
                  duration={2500}
                  label="지능형 초안 생성을 안전하게 처리하고 있습니다..."
                />
              </div>
            )}

            {result && currentInput && !isGenerating && (
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles size={16} className="text-violet-600" />
                    생성된 지능형 초안
                  </h3>
                  <div className="flex items-center gap-2">
                    {formHtml && (
                      <button
                        onClick={() => {
                          const w = window.open('', '_blank');
                          if (w) {
                            w.document.write(formHtml);
                            w.document.close();
                          }
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-2 cursor-pointer shadow-sm"
                      >
                        🖨 서식 인쇄/PDF
                      </button>
                    )}
                    {regulationHtml && (
                      <button
                        onClick={() => {
                          const w = window.open('', '_blank');
                          if (w) {
                            w.document.write(regulationHtml);
                            w.document.close();
                          }
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-2 cursor-pointer shadow-sm"
                      >
                        🖨 규정집 인쇄/PDF (로고 포함)
                      </button>
                    )}
                    {/* 편집기 연동 핵심 액션 버튼 */}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 cursor-pointer shadow-sm"
                    >
                      <PenTool size={13} />
                      이 초안으로 규정 편집/결재상신
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result);
                        alert('초안 텍스트가 복사되었습니다.');
                      }}
                      className="flex items-center gap-1.5 text-xs text-slate-655 hover:text-slate-800 border border-slate-200 rounded px-2.5 py-1.5 hover:bg-slate-50 cursor-pointer"
                    >
                      복사
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 pb-2 border-b border-slate-100">
                  <span>{HOSPITAL_TYPE_LABELS[currentInput.hospitalType]}</span>
                  <span>·</span>
                  <span>{currentInput.hospitalName}</span>
                  <span>·</span>
                  <span>{DOCUMENT_TYPE_LABELS[currentInput.documentType]}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    방금 생성됨
                  </span>
                </div>

                <DraftDisclaimer variant="result" />

                {linkedForms.length > 0 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="text-xs font-bold text-emerald-800 mb-2">
                      📎 이 규정에 딸린 서식 세트
                      {currentStandard && (
                        <span className="font-normal text-emerald-700"> — 현행 기준 {currentStandard.number} {currentStandard.title}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {linkedForms.map((f) => (
                        <button
                          key={f}
                          type="button"
                          disabled={isGenerating}
                          onClick={() =>
                            currentInput &&
                            handleGenerate({
                              hospitalType: currentInput.hospitalType,
                              hospitalName: currentInput.hospitalName,
                              documentType: 'form' as DocumentType,
                              documentTitle: f,
                              additionalContext: `"${currentInput.documentTitle}" 규정에 첨부되는 실무 서식입니다. A4 1장 분량의 표 중심 서식(기재란·서명란 포함)으로 작성해주세요.${currentStandard ? ` 관련 인증기준: ${currentStandard.number} ${currentStandard.title}` : ''}`,
                              // 규정과 같은 기준의 원문 근거를 서식에도 반영(기준번호 형태일 때만)
                              itemNumber: currentStandard && /^\d+\.\d/.test(currentStandard.number) ? currentStandard.number : currentInput.itemNumber,
                              itemTitle: currentInput.itemTitle,
                              chapterNumber: currentInput.chapterNumber,
                              chapterTitle: currentInput.chapterTitle,
                            })
                          }
                          className="text-xs px-2.5 py-1 bg-white text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 disabled:opacity-50 cursor-pointer"
                        >
                          {f} ＋생성
                        </button>
                      ))}
                    </div>
                    <div className="text-[11px] text-emerald-600 mt-2">
                      서식을 클릭하면 해당 서식 초안이 바로 생성됩니다. (규정 초안은 최근 생성 이력에서 다시 볼 수 있습니다)
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto border border-slate-200">
                  {result}
                </div>
              </div>
            )}

            {!result && !isGenerating && (
              <div className="card p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles size={28} className="text-violet-600" />
                </div>
                <div className="font-bold text-slate-800 mb-2">지능형 문서 초안 생성기</div>
                <div className="text-sm text-slate-500 max-w-sm">
                  왼쪽 폼에 병원 정보와 문서 유형을 입력하면 인증 기준에 맞는 참고용 초안이 생성됩니다.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // ==========================================
        // 지능형 초안 웹 편집 및 상신 모드
        // ==========================================
        <form onSubmit={handleSendApproval} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 왼쪽: 기안 정보 설정 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-5 space-y-4">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                <Building size={16} className="text-blue-600" />
                지능형 초안 기안 및 결재 설정
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">병원명</label>
                <input
                  type="text"
                  value={editHospitalName}
                  onChange={(e) => setEditHospitalName(e.target.value)}
                  className="w-full text-xs border border-slate-350 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">상신 문서 제목</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full text-xs border border-slate-350 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-600">전자 결재선 지정</h3>
                
                <div className="bg-slate-50 p-3 rounded-lg text-xs">
                  <span className="text-slate-400 block font-semibold">1단계: 기안</span>
                  <span className="font-bold text-slate-800">김실무자 (간호부 · 본인)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">2단계: 1차 검토자</label>
                  <select
                    value={selectedReviewer}
                    onChange={(e) => setSelectedReviewer(e.target.value)}
                    className="w-full text-xs border border-slate-350 rounded-lg px-2.5 py-2 bg-white focus:outline-none"
                  >
                    <option value="최간호 부장">최간호 부장 (간호부장)</option>
                    <option value="김QPS 실장">김QPS 실장 (QPS실장)</option>
                    <option value="박행정 부장">박행정 부장 (행정부장)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">3단계: 최종 승인자</label>
                  <select
                    value={selectedApprover}
                    onChange={(e) => setSelectedApprover(e.target.value)}
                    className="w-full text-xs border border-slate-350 rounded-lg px-2.5 py-2 bg-white focus:outline-none"
                  >
                    <option value="이의사 원장">이의사 원장 (병원장)</option>
                    <option value="김QPS 실장">김QPS 실장 (QPS실장)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-655 rounded-lg border border-slate-200"
                >
                  편집 취소
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  <Send size={12} />
                  결재 상신
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽: 편집 에디터 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5 flex flex-col h-[550px]">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100 flex-shrink-0">
                <PenTool size={16} className="text-blue-600" />
                초안 내용 다듬기
              </h2>
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="flex-1 w-full mt-4 p-4 font-mono text-sm text-slate-800 leading-relaxed border border-slate-350 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto"
                required
              />
            </div>
          </div>
        </form>
      )}

      {/* 성공 토스트 알림 */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 z-50">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
