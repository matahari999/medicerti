'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, FileText, Clock, CheckCircle, Archive, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ManagedDocStatusBadge } from './ManagedDocStatusBadge'
import { CreateManagedDocDialog } from './CreateManagedDocDialog'
import {
  MANAGED_DOC_TYPE_LABELS,
  MANAGED_DOC_STATUS_LABELS,
  MANAGED_DOC_STATUS_COLORS,
} from '@/lib/constants'
import type { ManagedDocType, ManagedDocStatus } from '@/types/database.types'

interface Doc {
  id:          string
  doc_type:    ManagedDocType
  title:       string
  status:      ManagedDocStatus
  version_number: number
  updated_at:  string
  accreditation_criteria: { code: string; title: string } | null
}

interface ManagedDocListProps {
  hospitalId:  string
  initialDocs: Doc[]
  userRole:    string
}

const STATUS_FILTER_OPTIONS: Array<{ value: ManagedDocStatus | 'all'; label: string }> = [
  { value: 'all',          label: '전체' },
  { value: 'draft',        label: '초안' },
  { value: 'under_review', label: '검토중' },
  { value: 'approved',     label: '승인완료' },
  { value: 'archived',     label: '보관' },
]

const TYPE_FILTER_OPTIONS: Array<{ value: ManagedDocType | 'all'; label: string }> = [
  { value: 'all',              label: '전체 유형' },
  { value: 'regulation',       label: '규정집' },
  { value: 'criteria_book',    label: '기준집' },
  { value: 'legal_form',       label: '법정양식' },
  { value: 'checklist',        label: '점검표' },
  { value: 'education_record', label: '교육기록' },
  { value: 'meeting_minutes',  label: '회의록' },
  { value: 'corrective_action','label': '시정조치서' },
]

export function ManagedDocList({ hospitalId, initialDocs, userRole }: ManagedDocListProps) {
  const router                  = useRouter()
  const [docs, setDocs]         = useState<Doc[]>(initialDocs)
  const [statusFilter, setStatusFilter] = useState<ManagedDocStatus | 'all'>('all')
  const [typeFilter, setTypeFilter]     = useState<ManagedDocType | 'all'>('all')
  const [showCreate, setShowCreate]     = useState(false)
  const [loading, setLoading]   = useState(false)

  const canWrite = ['admin', 'manager'].includes(userRole)

  const filtered = docs.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false
    if (typeFilter   !== 'all' && d.doc_type !== typeFilter) return false
    return true
  })

  // 상태별 카운트
  const counts = docs.reduce<Record<string, number>>((acc, d) => {
    acc[d.status] = (acc[d.status] ?? 0) + 1
    return acc
  }, {})

  const handleCreated = (newDoc: Doc) => {
    setDocs((prev) => [newDoc, ...prev])
    setShowCreate(false)
    router.push(`/hospitals/${hospitalId}/managed-docs/${newDoc.id}`)
  }

  const reload = async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/managed-docs?hospitalId=${hospitalId}`)
      const json = await res.json() as { data: Doc[] }
      setDocs(json.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* 상태 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { status: 'draft',        icon: FileText,    color: 'text-gray-500' },
          { status: 'under_review', icon: Clock,       color: 'text-amber-500' },
          { status: 'approved',     icon: CheckCircle, color: 'text-green-500' },
          { status: 'archived',     icon: Archive,     color: 'text-blue-500' },
        ].map(({ status, icon: Icon, color }) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status as ManagedDocStatus ? 'all' : status as ManagedDocStatus)}
            className={`bg-white border rounded-xl p-4 text-left hover:shadow-sm transition-all ${
              statusFilter === status ? 'ring-2 ring-brand-400 border-brand-300' : ''
            }`}
          >
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <p className="text-lg font-bold text-gray-900">{counts[status] ?? 0}</p>
            <p className="text-xs text-muted-foreground">
              {MANAGED_DOC_STATUS_LABELS[status as ManagedDocStatus]}
            </p>
          </button>
        ))}
      </div>

      {/* 필터 + 생성 버튼 */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ManagedDocType | 'all')}
            className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {TYPE_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ManagedDocStatus | 'all')}
            className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {canWrite && (
          <Button
            size="sm"
            className="bg-brand-600 hover:bg-brand-700 shrink-0"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            새 문서 작성
          </Button>
        )}
      </div>

      {/* 문서 목록 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white border rounded-xl">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900">문서가 없습니다</p>
          {canWrite && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              첫 문서 작성하기
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <Card key={doc.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-0">
                <button
                  onClick={() => router.push(`/hospitals/${hospitalId}/managed-docs/${doc.id}`)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-brand-50 text-brand-700 rounded border border-brand-100">
                        {MANAGED_DOC_TYPE_LABELS[doc.doc_type]}
                      </span>
                      <ManagedDocStatusBadge status={doc.status} />
                      <span className="text-xs text-muted-foreground">v{doc.version_number}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-1 truncate">{doc.title}</p>
                    {doc.accreditation_criteria && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        기준 {doc.accreditation_criteria.code}: {doc.accreditation_criteria.title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      수정: {new Date(doc.updated_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateManagedDocDialog
          hospitalId={hospitalId}
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}
