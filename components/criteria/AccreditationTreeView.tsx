'use client'

import { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Eye,
  FlaskConical,
  Beaker,
  Target,
  FileText,
  HelpCircle,
  Search,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AreaTree, ChapterTree, EntryTree, CategoryTree, SurveyItemBrief } from '@/types/database.types'
import { SOP_TYPE_LABELS, SOP_TYPE_COLORS } from '@/types/database.types'

interface Props {
  tree: AreaTree[]
}

const SEVERITY_CONFIG = {
  critical: { label: '치명적', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertTriangle },
  major: { label: '중요', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: AlertTriangle },
  minor: { label: '경미', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: HelpCircle },
} as const

function SurveyItemCard({ item }: { item: SurveyItemBrief }) {
  const SeverityIcon = SEVERITY_CONFIG[item.severity as keyof typeof SEVERITY_CONFIG]?.icon ?? AlertTriangle

  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-all bg-white">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5 min-w-[80px]">
          <span className="font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-xs tracking-tight">
            {item.code}
          </span>
          <span className={cn(
            'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border',
            SOP_TYPE_COLORS[item.sop_type as keyof typeof SOP_TYPE_COLORS] ?? ''
          )}>
            {item.sop_type === 'structure' && <Beaker size={10} />}
            {item.sop_type === 'process' && <FlaskConical size={10} />}
            {item.sop_type === 'outcome' && <Target size={10} />}
            {SOP_TYPE_LABELS[item.sop_type as keyof typeof SOP_TYPE_LABELS] ?? item.sop_type}
          </span>
          {item.is_pilot && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
              시범
            </span>
          )}
          <span className={cn(
            'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border',
            SEVERITY_CONFIG[item.severity as keyof typeof SEVERITY_CONFIG]?.color ?? ''
          )}>
            <SeverityIcon size={10} />
            {SEVERITY_CONFIG[item.severity as keyof typeof SEVERITY_CONFIG]?.label ?? item.severity}
          </span>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <h4 className="font-bold text-sm text-slate-800 leading-snug">
            {item.title}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {item.description}
          </p>

          {item.assessment_method && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Eye size={12} />
              <span className="font-semibold">평가 방식:</span>
              <span className="text-slate-600">{item.assessment_method}</span>
            </div>
          )}

          {item.required_evidence && (
            <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
              <FileText size={12} className="mt-0.5" />
              <span className="font-semibold">필요 근거:</span>
              <span className="text-slate-600">{item.required_evidence}</span>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 self-start">
          <span className={cn(
            'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border',
            item.is_mandatory
              ? 'text-rose-700 bg-rose-50 border-rose-200'
              : 'text-slate-400 bg-slate-50 border-slate-200'
          )}>
            {item.is_mandatory ? '필수' : '권장'}
          </span>
        </div>
      </div>
    </div>
  )
}

function CategorySection({ category }: { category: CategoryTree }) {
  const [open, setOpen] = useState(true)

  if (category.items.length === 0) return null

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {category.name}
        <span className="text-slate-400 font-normal">({category.items.length})</span>
      </button>
      {open && (
        <div className="space-y-2 pl-4">
          {category.items.map((item) => (
            <SurveyItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

function EntrySection({ entry, defaultOpen }: { entry: EntryTree; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const hasItems = entry.items.length > 0 || entry.categories.some((c) => c.items.length > 0)

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left transition-colors cursor-pointer',
          open ? 'bg-slate-50 border-b border-slate-200' : 'bg-white hover:bg-slate-50'
        )}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
          <div>
            <span className="text-xs font-semibold text-slate-400">{entry.code}</span>
            <h3 className="font-bold text-sm text-slate-800">{entry.title}</h3>
          </div>
        </div>
        {entry.description && (
          <span className="text-[11px] text-slate-400 hidden md:block max-w-[300px] truncate ml-4">
            {entry.description}
          </span>
        )}
      </button>

      {open && hasItems && (
        <div className="p-4 space-y-4 bg-white">
          {entry.items.length > 0 && (
            <div className="space-y-2">
              {entry.items.filter((i) => i.category_id === null).map((item) => (
                <SurveyItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
          {entry.categories.map((cat) => (
            <CategorySection key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  )
}

function ChapterSection({ chapter, defaultOpen: _defaultOpen }: { chapter: ChapterTree; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-base font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
      >
        {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        {chapter.title}
        <span className="text-xs font-normal text-slate-400">
          ({chapter.entries.reduce((sum, e) => sum + e.items.length + e.categories.reduce((s, c) => s + c.items.length, 0), 0)}개 항목)
        </span>
      </button>
      {open && (
        <div className="space-y-3">
          {chapter.entries.map((entry) => (
            <EntrySection key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AccreditationTreeView({ tree }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeArea, setActiveArea] = useState<string>(tree[0]?.code ?? '')

  const activeAreaData = tree.find((a) => a.code === activeArea)

  const allItems = (tree ?? []).flatMap((a) =>
    (a.chapters ?? []).flatMap((ch) =>
      (ch.entries ?? []).flatMap((e) => [
        ...(e.items ?? []),
        ...(e.categories ?? []).flatMap((cat) => cat.items ?? []),
      ])
    )
  )

  const filteredItems = searchQuery
    ? allItems.filter(
        (item) =>
          item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" />
            인증 기준집 탐색
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            영역 → 장 → 기준 → 범주 → 조사항목 5단계 트리 구조로 병원 종별 인증기준을 탐색합니다.
          </p>
        </div>

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

      {searchQuery ? (
        <>
          <div className="text-xs text-slate-500">
            &quot;{searchQuery}&quot; 검색 결과 ({filteredItems?.length ?? 0}건)
          </div>
          <div className="space-y-2">
            {filteredItems?.map((item) => (
              <SurveyItemCard key={item.id} item={item} />
            ))}
            {filteredItems?.length === 0 && (
              <div className="card p-8 text-center text-slate-400 text-xs">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
            {tree.map((area) => (
              <button
                key={area.code}
                onClick={() => setActiveArea(area.code)}
                className={cn(
                  'py-2.5 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer',
                  activeArea === area.code
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                {area.name}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {activeAreaData?.chapters.map((chapter) => (
              <ChapterSection key={chapter.id} chapter={chapter} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
