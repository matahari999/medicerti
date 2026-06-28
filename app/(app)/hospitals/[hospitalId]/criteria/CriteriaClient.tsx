'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { COMPLIANCE_STATUS_COLORS, COMPLIANCE_STATUS_LABELS, SEVERITY_COLORS, SEVERITY_LABELS } from '@/lib/constants'
import type { AccreditationCriterion } from '@/types/database.types'

const DOMAIN_COLORS: Record<string, string> = {
  PS: 'bg-red-50 text-red-700 border-red-200',
  PC: 'bg-amber-50 text-amber-700 border-amber-200',
  GL: 'bg-blue-50 text-blue-700 border-blue-200',
  QS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

interface CriteriaClientProps {
  criteria:   AccreditationCriterion[]
  resultsMap: Record<string, string>
  hospitalId: string
}

export function CriteriaClient({ criteria, resultsMap }: CriteriaClientProps) {
  const [search, setSearch]           = useState('')
  const [domainFilter, setDomainFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [expanded, setExpanded]       = useState<Set<string>>(new Set())

  const domains = [...new Set(criteria.map((c) => c.domain_code))]

  const filtered = criteria.filter((c) => {
    if (domainFilter !== 'ALL' && c.domain_code !== domainFilter) return false
    if (statusFilter !== 'ALL') {
      const status = resultsMap[c.id] ?? 'not_reviewed'
      if (status !== statusFilter) return false
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      return c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    }
    return true
  })

  const grouped = domains.reduce<Record<string, AccreditationCriterion[]>>((acc, code) => {
    acc[code] = filtered.filter((c) => c.domain_code === code)
    return acc
  }, {})

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const statusCounts = {
    compliant:     criteria.filter((c) => resultsMap[c.id] === 'compliant').length,
    partial:       criteria.filter((c) => resultsMap[c.id] === 'partial').length,
    non_compliant: criteria.filter((c) => resultsMap[c.id] === 'non_compliant').length,
    not_reviewed:  criteria.filter((c) => !resultsMap[c.id] || resultsMap[c.id] === 'not_reviewed').length,
  }

  return (
    <div className="space-y-5">
      {/* 요약 카드 */}
      {Object.values(resultsMap).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.entries(statusCounts) as [string, number][]).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'ALL' : status)}
              className={cn(
                'rounded-xl border p-3 text-left transition-all',
                statusFilter === status ? 'ring-2 ring-brand-400' : 'hover:shadow-sm',
                COMPLIANCE_STATUS_COLORS[status as keyof typeof COMPLIANCE_STATUS_COLORS]
              )}
            >
              <p className="text-xl font-bold">{count}</p>
              <p className="text-xs mt-0.5">{COMPLIANCE_STATUS_LABELS[status as keyof typeof COMPLIANCE_STATUS_LABELS]}</p>
            </button>
          ))}
        </div>
      )}

      {/* 필터 */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="코드·제목 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm w-52"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {(['ALL', ...domains] as string[]).map((code) => (
            <button
              key={code}
              onClick={() => setDomainFilter(code)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                domainFilter === code
                  ? 'bg-brand-600 text-white border-brand-600'
                  : code === 'ALL'
                  ? 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  : cn('bg-white border', DOMAIN_COLORS[code] ?? 'text-gray-600 border-gray-200')
              )}
            >
              {code === 'ALL' ? '전체' : code}
            </button>
          ))}
          {statusFilter !== 'ALL' && (
            <button
              onClick={() => setStatusFilter('ALL')}
              className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              필터 해제 ×
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length}개 기준 표시 중</p>

      {/* 도메인별 그룹 */}
      {domains.map((domainCode) => {
        const items = grouped[domainCode]
        if (items.length === 0) return null
        const domainName = items[0]?.domain ?? domainCode

        return (
          <div key={domainCode} className="space-y-2">
            <div className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border', DOMAIN_COLORS[domainCode] ?? '')}>
              {domainCode} · {domainName} ({items.length})
            </div>

            <div className="bg-white border rounded-xl divide-y overflow-hidden">
              {items.map((c) => {
                const isOpen  = expanded.has(c.id)
                const status  = resultsMap[c.id] as keyof typeof COMPLIANCE_STATUS_LABELS | undefined
                const sevKey  = c.default_severity as keyof typeof SEVERITY_LABELS

                return (
                  <div key={c.id}>
                    <button
                      onClick={() => toggle(c.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-semibold text-brand-700">{c.code}</span>
                          <span className="text-sm font-medium text-gray-900">{c.title}</span>
                          {c.is_mandatory && (
                            <span className="text-[10px] font-medium bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded">필수</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {status && (
                          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', COMPLIANCE_STATUS_COLORS[status])}>
                            {COMPLIANCE_STATUS_LABELS[status]}
                          </span>
                        )}
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', SEVERITY_COLORS[sevKey])}>
                          {SEVERITY_LABELS[sevKey]}
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 py-4 bg-gray-50 border-t space-y-3 text-sm">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">기준 설명</p>
                          <p className="text-gray-800 leading-relaxed">{c.description}</p>
                        </div>
                        {c.required_evidence && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">필요 근거 문서</p>
                            <p className="text-gray-700">{c.required_evidence}</p>
                          </div>
                        )}
                        <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                          <span>가중치 <strong>{c.weight}</strong></span>
                          <span>카테고리 <strong>{c.category ?? '—'}</strong></span>
                          <span>버전 <strong>{c.version}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">검색 결과가 없습니다</div>
      )}
    </div>
  )
}
