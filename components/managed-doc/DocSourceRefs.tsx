'use client'

// 생성된 규정집이 어떤 원문을 근거로 삼았는지 보여준다.
// 플랫폼 관리자에게만 렌더링된다 — 구독자 화면에서는 서버가 아예 내려보내지 않는다.
import { useState } from 'react'
import { FileSearch, ChevronDown, ChevronUp } from 'lucide-react'

export interface DocSourceRef {
  sourceTitle: string
  sourceKind: string
  regCode: string | null
  regTitle: string | null
  pageFrom: number | null
  pageTo: number | null
  matchedBy: 'reg_code' | 'semantic' | 'chapter'
  chars: number
}

const KIND_LABELS: Record<string, string> = {
  uploaded_pdf: '업로드 자료',
  guideline: '인증기준집',
  casebook: '규정 사례집',
  regulation_book: '규정집 합본',
}

const MATCH_LABELS: Record<string, string> = {
  reg_code: '기준번호 일치',
  semantic: '의미 검색',
  chapter: '같은 장',
}

export function DocSourceRefs({ refs }: { refs: DocSourceRef[] }) {
  const [open, setOpen] = useState(false)
  if (!refs || refs.length === 0) return null

  const totalChars = refs.reduce((sum, r) => sum + (r.chars ?? 0), 0)
  const sources = new Set(refs.map((r) => r.sourceTitle))

  return (
    <div className="border border-amber-200 bg-amber-50/60 rounded-xl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left"
      >
        <FileSearch className="w-4 h-4 text-amber-700 shrink-0" />
        <span className="text-sm font-medium text-amber-900">
          근거 출처 {refs.length}건 · 자료 {sources.size}종 ({totalChars.toLocaleString()}자)
        </span>
        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold shrink-0">
          관리자 전용
        </span>
        <div className="flex-1" />
        {open ? <ChevronUp className="w-4 h-4 text-amber-700" /> : <ChevronDown className="w-4 h-4 text-amber-700" />}
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-1.5">
          {refs.map((r, i) => (
            <div key={i} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs bg-white rounded-lg px-3 py-2 border border-amber-100">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">
                {KIND_LABELS[r.sourceKind] ?? r.sourceKind}
              </span>
              <span className="font-medium text-gray-900">{r.sourceTitle}</span>
              {r.regCode && <span className="font-mono text-sky-700">{r.regCode}</span>}
              {r.regTitle && <span className="text-gray-600">{r.regTitle}</span>}
              {r.pageFrom != null && (
                <span className="text-gray-500">
                  p.{r.pageFrom}
                  {r.pageTo != null && r.pageTo !== r.pageFrom ? `-${r.pageTo}` : ''}
                </span>
              )}
              <div className="flex-1" />
              <span className="text-gray-400">{MATCH_LABELS[r.matchedBy] ?? r.matchedBy}</span>
              <span className="text-gray-400">{(r.chars ?? 0).toLocaleString()}자</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
