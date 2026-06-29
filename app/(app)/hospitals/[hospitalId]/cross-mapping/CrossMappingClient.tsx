'use client'

import { useState, useEffect } from 'react'
import {
  GitBranch, ChevronRight, ArrowRight, Link2, CheckCircle2,
  AlertCircle, HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CROSS_STANDARD_PRESETS } from '@/types/database.types'

interface MappingItem {
  source_standard: string
  source_name: string
  source_icon: string
  target_standard: string
  target_name: string
  target_icon: string
  source_code: string
  target_code: string
  source_title: string | null
  target_title: string | null
  mapping_type: 'equivalent' | 'related' | 'subset' | 'superset'
  confidence: 'auto' | 'manual' | 'verified'
}

interface Props {
  hospitalId: string
  hospitalType: string
  hospitalName: string
}

const MAPPING_TYPE_LABELS: Record<string, string> = {
  equivalent: '동등',
  related: '연관',
  subset: '부분',
  superset: '포괄',
}

const MAPPING_TYPE_COLORS: Record<string, string> = {
  equivalent: 'text-green-600 bg-green-50 border-green-200',
  related: 'text-blue-600 bg-blue-50 border-blue-200',
  subset: 'text-amber-600 bg-amber-50 border-amber-200',
  superset: 'text-purple-600 bg-purple-50 border-purple-200',
}

const CONFIDENCE_ICONS: Record<string, React.ReactNode> = {
  auto: <AlertCircle size={10} className="text-slate-400" />,
  manual: <CheckCircle2 size={10} className="text-blue-500" />,
  verified: <CheckCircle2 size={10} className="text-green-500" />,
}

export default function CrossMappingClient({ hospitalId, hospitalType, hospitalName }: Props) {
  const [mappings, setMappings] = useState<MappingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null)

  useEffect(() => {
    const fetchMappings = async () => {
      try {
        const res = await fetch(`/api/cross-mapping?hospital_type=${hospitalType}`)
        const data = await res.json()
        setMappings(data ?? [])
      } catch {
        setMappings([])
      } finally {
        setLoading(false)
      }
    }
    fetchMappings()
  }, [hospitalType])

  const groupedBySource: Record<string, MappingItem[]> = {}
  for (const m of mappings) {
    if (!groupedBySource[m.source_standard]) groupedBySource[m.source_standard] = []
    groupedBySource[m.source_standard].push(m)
  }

  const filteredByStandard = selectedStandard
    ? mappings.filter((m) => m.source_standard === selectedStandard || m.target_standard === selectedStandard)
    : mappings

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {CROSS_STANDARD_PRESETS.map((std) => (
          <button
            key={std.code}
            onClick={() => setSelectedStandard(selectedStandard === std.code ? null : std.code)}
            className={cn(
              'bg-white rounded-xl border p-4 text-left transition-all cursor-pointer hover:shadow-sm',
              selectedStandard === std.code ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200'
            )}
          >
            <div className="text-lg mb-1">{std.icon}</div>
            <div className="font-semibold text-sm text-slate-800">{std.name}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{std.issuing}</div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-400">불러오는 중...</div>
      ) : filteredByStandard.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <GitBranch className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="font-semibold text-slate-700 mb-2">아직 매핑 데이터가 없습니다</h3>
          <p className="text-sm text-slate-500 text-center max-w-md">
            다른 평가체계와의 인증기준 교차 매핑은 관리자가 등록해야 표시됩니다.
            샘플 데이터는 의료기관인증 ↔ 장기요양급여 제공기준 간 매핑이 포함되어 있습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedBySource).map(([source, items]) => {
            const sourceInfo = CROSS_STANDARD_PRESETS.find((s) => s.code === source)
            return (
              <div key={source} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{sourceInfo?.icon ?? '🏥'}</span>
                    <span className="font-semibold text-sm text-slate-700">{sourceInfo?.name ?? source}</span>
                    <span className="text-[10px] text-slate-400">→ {items.length}개 매핑</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {items.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 text-xs">
                      <div className="flex-shrink-0 min-w-[80px]">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {m.source_code}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-slate-600 truncate block">{m.source_title ?? m.source_code}</span>
                      </div>
                      <div className="flex-shrink-0 px-2">
                        <ArrowRight size={14} className="text-slate-300" />
                      </div>
                      <div className="flex-shrink-0 min-w-[80px]">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {m.target_code}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">{m.target_icon}</span>
                          <span className="text-slate-600 truncate block">{m.target_title ?? m.target_code}</span>
                        </div>
                        <span className="text-[9px] text-slate-400">{m.target_name}</span>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1.5">
                        <span className={cn(
                          'text-[9px] font-semibold px-1.5 py-0.5 rounded border',
                          MAPPING_TYPE_COLORS[m.mapping_type] ?? ''
                        )}>
                          {MAPPING_TYPE_LABELS[m.mapping_type] ?? m.mapping_type}
                        </span>
                        <span title={`${m.confidence === 'auto' ? '자동' : m.confidence === 'manual' ? '수동' : '확인됨'}`}>
                          {CONFIDENCE_ICONS[m.confidence]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
