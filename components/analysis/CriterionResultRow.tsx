'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, MinusCircle, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const STATUS_CONFIG = {
  compliant:     { label: '적합', icon: CheckCircle2,  className: 'text-green-600' },
  partial:       { label: '부분적합', icon: MinusCircle, className: 'text-amber-600' },
  non_compliant: { label: '부적합', icon: AlertTriangle, className: 'text-red-600' },
  not_reviewed:  { label: '미검토', icon: HelpCircle,  className: 'text-gray-400' },
} as const

const SEVERITY_BADGE = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  major:    'bg-amber-100 text-amber-700 border-amber-200',
  minor:    'bg-blue-100 text-blue-700 border-blue-200',
} as const

const SEVERITY_LABEL = {
  critical: '치명적',
  major:    '중요',
  minor:    '경미',
} as const

interface CriterionResult {
  id: string
  criterion_id: string
  compliance_status: string
  evidence_text: string | null
  evidence_document_hint: string | null
  gap_description: string | null
  recommendation: string | null
  severity: string | null
  ai_confidence: number | null
  accreditation_criteria: {
    code: string
    title: string
    description: string
    domain: string
    domain_code: string
    category: string | null
  } | null
}

interface CriterionResultRowProps {
  result: CriterionResult
}

export function CriterionResultRow({ result }: CriterionResultRowProps) {
  const [expanded, setExpanded] = useState(false)
  const criterion = result.accreditation_criteria
  const statusConfig = STATUS_CONFIG[result.compliance_status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.not_reviewed
  const StatusIcon = statusConfig.icon

  const severityKey = result.severity as keyof typeof SEVERITY_BADGE
  const severityClass = severityKey ? SEVERITY_BADGE[severityKey] : ''
  const severityLabel = severityKey ? SEVERITY_LABEL[severityKey] : ''

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        {expanded ? <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" /> : <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />}

        <StatusIcon className={cn('w-4 h-4 shrink-0', statusConfig.className)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-gray-500">{criterion?.code ?? ''}</span>
            <span className="text-sm font-medium text-gray-900 truncate">{criterion?.title ?? ''}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{criterion?.category ?? ''}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {result.severity && (
            <Badge variant="outline" className={cn('text-xs', severityClass)}>
              {severityLabel}
            </Badge>
          )}
          <span className={cn('text-xs font-medium', statusConfig.className)}>
            {statusConfig.label}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 ml-7">
          {criterion?.description && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">기준 설명</p>
              <p className="text-sm text-gray-700">{criterion.description}</p>
            </div>
          )}

          {result.evidence_text && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">증거 텍스트</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border whitespace-pre-wrap">{result.evidence_text}</p>
            </div>
          )}

          {result.gap_description && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">갭 설명</p>
              <p className="text-sm text-gray-700">{result.gap_description}</p>
            </div>
          )}

          {result.recommendation && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">권고사항</p>
              <p className="text-sm text-brand-700 bg-brand-50 rounded-lg p-3 border border-brand-200">{result.recommendation}</p>
            </div>
          )}

          {result.ai_confidence != null && (
            <p className="text-xs text-muted-foreground">
              AI 신뢰도: {(result.ai_confidence * 100).toFixed(0)}%
            </p>
          )}
        </div>
      )}
    </div>
  )
}
