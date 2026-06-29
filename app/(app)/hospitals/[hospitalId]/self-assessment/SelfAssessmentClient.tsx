'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  ChevronRight,
  ChevronDown,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Circle,
  XCircle,
  GripVertical,
  RefreshCw,
  Target,
  FlaskConical,
  Beaker,
  ArrowUpDown,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AreaTree, ChapterTree, EntryTree, SurveyItemBrief } from '@/types/database.types'
import { SOP_TYPE_LABELS, SOP_TYPE_COLORS } from '@/types/database.types'
import { COMPLIANCE_STATUS_LABELS, COMPLIANCE_STATUS_COLORS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { startAssessment, fetchAssessmentDetail, updateItemStatus } from '@/app/actions/self-assessment'

type ComplianceStatus = 'compliant' | 'partial' | 'non_compliant' | 'not_reviewed'

interface ItemResult {
  survey_item_id: string
  compliance_status: ComplianceStatus
  priority_score: number | null
  notes: string | null
  id?: string
}

interface Props {
  hospitalId: string
  tree: AreaTree[]
  existingAssessment: {
    id: string
    overall_score: number | null
    total_items: number
    compliant_count: number
    partial_count: number
    non_compliant_count: number
    not_reviewed_count: number
    priority_score: number | null
  } | null
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: '최우선', color: 'text-red-600 bg-red-50 border-red-200' },
  medium: { label: '우선', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  normal: { label: '일반', color: 'text-slate-600 bg-slate-50 border-slate-200' },
}

function getPriorityLabel(score: number | null): { label: string; color: string } {
  if (score === null || score === undefined) return PRIORITY_LABELS.normal
  if (score >= 70) return PRIORITY_LABELS.high
  if (score >= 40) return PRIORITY_LABELS.medium
  return PRIORITY_LABELS.normal
}

const COMPLIANCE_OPTIONS: { value: ComplianceStatus; icon: React.ReactNode; label: string }[] = [
  { value: 'compliant', icon: <CheckCircle2 size={14} className="text-green-600" />, label: '충족' },
  { value: 'partial', icon: <AlertTriangle size={14} className="text-amber-600" />, label: '부분충족' },
  { value: 'non_compliant', icon: <XCircle size={14} className="text-red-600" />, label: '미충족' },
  { value: 'not_reviewed', icon: <Circle size={14} className="text-slate-400" />, label: '미검토' },
]

function ItemChecklistRow({
  item,
  result,
  onStatusChange,
}: {
  item: SurveyItemBrief
  result?: ItemResult
  onStatusChange: (itemId: string, status: ComplianceStatus) => void
}) {
  const status = result?.compliance_status ?? 'not_reviewed'
  const priority = getPriorityLabel(result?.priority_score ?? null)

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg border transition-all',
      status === 'compliant' ? 'bg-green-50/30 border-green-100' :
      status === 'partial' ? 'bg-amber-50/30 border-amber-100' :
      status === 'non_compliant' ? 'bg-red-50/30 border-red-100' :
      'bg-white border-slate-200 hover:border-slate-300'
    )}>
      <div className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[60px]">
        <span className="font-bold text-slate-700 text-[11px] bg-slate-100 px-2 py-1 rounded">
          {item.code}
        </span>
        <span className={cn(
          'text-[9px] font-bold px-1.5 py-0.5 rounded border',
          SOP_TYPE_COLORS[item.sop_type as keyof typeof SOP_TYPE_COLORS] ?? ''
        )}>
          {SOP_TYPE_LABELS[item.sop_type as keyof typeof SOP_TYPE_LABELS] ?? item.sop_type}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
      </div>

      <div className="flex-shrink-0 flex items-center gap-1.5">
        {COMPLIANCE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(item.id, opt.value)}
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer',
              status === opt.value
                ? 'border-current ring-1 ring-current'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            )}
            title={opt.label}
          >
            {opt.icon}
            <span className="hidden md:inline">{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-shrink-0 min-w-[52px] text-center">
        <span className={cn(
          'inline-block text-[10px] font-bold px-2 py-1 rounded-md border',
          priority.color
        )}>
          {priority.label}
        </span>
      </div>

      {item.is_pilot && (
        <span className="flex-shrink-0 text-[9px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-1 rounded">
          시범
        </span>
      )}
    </div>
  )
}

function EntryChecklistSection({
  entry,
  resultsMap,
  onStatusChange,
}: {
  entry: EntryTree
  resultsMap: Map<string, ItemResult>
  onStatusChange: (itemId: string, status: ComplianceStatus) => void
}) {
  const [open, setOpen] = useState(false)

  const allItems = [
    ...entry.items,
    ...(entry.categories ?? []).flatMap((c) => c.items ?? []),
  ]

  if (allItems.length === 0) return null

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer',
          open ? 'bg-slate-50 border-b border-slate-200' : 'bg-white hover:bg-slate-50'
        )}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={15} className="text-slate-400" /> : <ChevronRight size={15} className="text-slate-400" />}
          <span className="text-xs font-semibold text-slate-400">{entry.code}</span>
          <h3 className="font-semibold text-sm text-slate-800">{entry.title}</h3>
        </div>
        <span className="text-xs text-slate-400">{allItems.length}개 항목</span>
      </button>

      {open && (
        <div className="p-3 space-y-2 bg-white">
          {allItems.map((item) => (
            <ItemChecklistRow
              key={item.id}
              item={item}
              result={resultsMap.get(item.id)}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SelfAssessmentClient({ hospitalId, tree, existingAssessment }: Props) {
  const [assessmentId, setAssessmentId] = useState<string | null>(existingAssessment?.id ?? null)
  const [resultsMap, setResultsMap] = useState<Map<string, ItemResult>>(new Map())
  const [loading, setLoading] = useState(false)
  const [activeArea, setActiveArea] = useState(tree[0]?.code ?? '')
  const [sortByPriority, setSortByPriority] = useState(false)
  const [savingStatus, setSavingStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (existingAssessment?.id) {
      loadAssessmentResults(existingAssessment.id)
    }
  }, [existingAssessment?.id])

  const loadAssessmentResults = async (id: string) => {
    setLoading(true)
    try {
      const detail = await fetchAssessmentDetail(id)
      if (detail) {
        const map = new Map<string, ItemResult>()
        for (const r of detail.results as unknown as ItemResult[]) {
          map.set(r.survey_item_id, r)
        }
        setResultsMap(map)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStartAssessment = useCallback(async () => {
    setLoading(true)
    try {
      const assessment = await startAssessment(hospitalId)
      setAssessmentId((assessment as unknown as { id: string }).id)
      await loadAssessmentResults((assessment as unknown as { id: string }).id)
    } finally {
      setLoading(false)
    }
  }, [hospitalId])

  const handleStatusChange = useCallback(async (itemId: string, status: ComplianceStatus) => {
    const result = resultsMap.get(itemId)
    if (!result?.id) return

    setSavingStatus((prev) => ({ ...prev, [itemId]: true }))

    setResultsMap((prev) => {
      const next = new Map(prev)
      const existing = next.get(itemId)
      if (existing) {
        next.set(itemId, { ...existing, compliance_status: status })
      }
      return next
    })

    try {
      await updateItemStatus(result.id, status)
    } finally {
      setSavingStatus((prev) => ({ ...prev, [itemId]: false }))
    }
  }, [resultsMap])

  const calcSummary = () => {
    let total = 0, compliant = 0, partial = 0, nonCompliant = 0, notReviewed = 0, criticalGaps = 0
    for (const result of resultsMap.values()) {
      total++
      if (result.compliance_status === 'compliant') compliant++
      else if (result.compliance_status === 'partial') partial++
      else if (result.compliance_status === 'non_compliant') nonCompliant++
      else notReviewed++
      if (result.compliance_status === 'non_compliant' && (result.priority_score ?? 0) >= 50) criticalGaps++
    }
    const score = total > 0 ? Math.round(((compliant + partial * 0.5) / total) * 100) : 0
    return { total, compliant, partial, nonCompliant, notReviewed, criticalGaps, score }
  }

  const summary = calcSummary()
  const activeAreaData = tree.find((a) => a.code === activeArea)

  let entries = (activeAreaData?.chapters ?? []).flatMap((ch) => ch.entries ?? [])
  if (sortByPriority) {
    entries = [...entries].sort((a, b) => {
      const aMax = Math.max(...a.items.map((i) => resultsMap.get(i.id)?.priority_score ?? 0), ...(a.categories ?? []).flatMap((c) => (c.items ?? []).map((i) => resultsMap.get(i.id)?.priority_score ?? 0)))
      const bMax = Math.max(...b.items.map((i) => resultsMap.get(i.id)?.priority_score ?? 0), ...(b.categories ?? []).flatMap((c) => (c.items ?? []).map((i) => resultsMap.get(i.id)?.priority_score ?? 0)))
      return bMax - aMax
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{summary.score}%</div>
          <div className="text-[11px] text-slate-500 mt-1">전체 준비도</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{summary.compliant}</div>
          <div className="text-[11px] text-green-600 mt-1">충족</div>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{summary.partial}</div>
          <div className="text-[11px] text-amber-600 mt-1">부분충족</div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{summary.nonCompliant}</div>
          <div className="text-[11px] text-red-600 mt-1">미충족</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{summary.notReviewed}</div>
          <div className="text-[11px] text-slate-500 mt-1">미검토</div>
        </div>
      </div>

      {!assessmentId ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="font-semibold text-slate-700 mb-2">아직 평가를 시작하지 않았습니다</h3>
          <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
            모든 인증 조사항목에 대해 현재 충족 상태를 체크하고<br />
            환자안전 직결 항목을 우선으로 한 우선순위를 확인하세요
          </p>
          <Button onClick={handleStartAssessment} disabled={loading} className="bg-brand-600 hover:bg-brand-700">
            <ClipboardCheck className="w-4 h-4 mr-1.5" />
            새 갭분석 시작하기
          </Button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
          <span className="ml-2 text-sm text-slate-500">평가 결과 불러오는 중...</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {tree.map((area) => (
                <button
                  key={area.code}
                  onClick={() => setActiveArea(area.code)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap',
                    activeArea === area.code
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                  )}
                >
                  {area.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSortByPriority(!sortByPriority)}
              className={cn(
                'flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer',
                sortByPriority ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-slate-200'
              )}
            >
              <ArrowUpDown size={12} />
              우선순위 정렬
            </button>
          </div>

          <div className="space-y-3">
            {entries.map((entry) => (
              <EntryChecklistSection
                key={entry.id}
                entry={entry}
                resultsMap={resultsMap}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
