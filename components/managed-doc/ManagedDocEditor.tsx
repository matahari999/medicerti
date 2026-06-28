'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, ChevronDown, ChevronUp, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ManagedDocStatusBadge } from './ManagedDocStatusBadge'
import {
  MANAGED_DOC_TYPE_LABELS,
  MANAGED_DOC_STATUS_LABELS,
  MANAGED_DOC_STATUS_TRANSITIONS,
} from '@/lib/constants'
import type { ManagedDocStatus, ManagedDocType } from '@/types/database.types'

interface Version {
  id:             string
  version_number: number
  title:          string
  status:         ManagedDocStatus
  change_summary: string | null
  created_at:     string
}

interface ManagedDocEditorProps {
  hospitalId:   string
  doc: {
    id:             string
    doc_type:       ManagedDocType
    title:          string
    content:        string
    status:         ManagedDocStatus
    version_number: number
    approved_at:    string | null
    accreditation_criteria: { code: string; title: string; domain: string } | null
  }
  versions:     Version[]
  userRole:     string
}

export function ManagedDocEditor({ hospitalId, doc, versions, userRole }: ManagedDocEditorProps) {
  const router               = useRouter()
  const [title,   setTitle]  = useState(doc.title)
  const [content, setContent]= useState(doc.content)
  const [saving,  setSaving] = useState(false)
  const [error,   setError]  = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<ManagedDocStatus>(doc.status)
  const [currentVersion, setCurrentVersion] = useState(doc.version_number)

  const canWrite = ['admin', 'manager'].includes(userRole)
  const isDirty  = title !== doc.title || content !== doc.content
  const nextStatuses = MANAGED_DOC_STATUS_TRANSITIONS[currentStatus] ?? []

  const save = useCallback(async (overrides: Record<string, unknown> = {}) => {
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {}
      if (isDirty) { payload.title = title; payload.content = content }
      Object.assign(payload, overrides)

      const res  = await fetch(`/api/managed-docs/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json() as { data?: { status: ManagedDocStatus; version_number: number }; error?: string }
      if (!res.ok) throw new Error(json.error ?? '저장 실패')
      if (json.data) {
        setCurrentStatus(json.data.status)
        setCurrentVersion(json.data.version_number)
      }
      if (!overrides.status) return  // 저장만 한 경우
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }, [doc.id, title, content, isDirty, router])

  const handleStatusChange = (nextStatus: ManagedDocStatus) => {
    save({ status: nextStatus })
  }

  const statusButtonLabel: Record<ManagedDocStatus, string> = {
    under_review: '검토 요청',
    approved:     '승인',
    archived:     '보관 처리',
    draft:        '초안으로 되돌리기',
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* 헤더 메타 */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 bg-brand-50 text-brand-700 rounded border border-brand-100">
              {MANAGED_DOC_TYPE_LABELS[doc.doc_type]}
            </span>
            <ManagedDocStatusBadge status={currentStatus} />
            <span className="text-xs text-muted-foreground">v{currentVersion}</span>
          </div>
          {doc.accreditation_criteria && (
            <p className="text-xs text-muted-foreground">
              인증 기준 {doc.accreditation_criteria.code}: {doc.accreditation_criteria.title}
            </p>
          )}
        </div>

        {/* 액션 버튼 */}
        {canWrite && (
          <div className="flex gap-2 flex-wrap">
            {isDirty && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => save()}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                저장
              </Button>
            )}
            {nextStatuses.map((ns) => (
              <Button
                key={ns}
                size="sm"
                className={ns === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-600 hover:bg-brand-700'}
                onClick={() => handleStatusChange(ns as ManagedDocStatus)}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {statusButtonLabel[ns as ManagedDocStatus] ?? MANAGED_DOC_STATUS_LABELS[ns as ManagedDocStatus]}
              </Button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 승인 안내 */}
      {currentStatus === 'approved' && doc.approved_at && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
          ✓ 승인완료 — {new Date(doc.approved_at).toLocaleString('ko-KR')}
        </div>
      )}

      {/* 제목 편집 */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="doc-title">제목</Label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!canWrite || currentStatus === 'archived'}
              className="text-base font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-content">내용</Label>
            <textarea
              id="doc-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!canWrite || currentStatus === 'archived'}
              rows={24}
              placeholder="문서 내용을 입력하세요. Markdown을 지원합니다."
              className="w-full border rounded-xl px-4 py-3 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-gray-50 disabled:text-gray-500 font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* 버전 이력 */}
      {versions.length > 0 && (
        <Card>
          <CardHeader
            className="pb-2 cursor-pointer select-none"
            onClick={() => setShowHistory(!showHistory)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-brand-600" />
                개정 이력 ({versions.length}건)
              </CardTitle>
              {showHistory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </CardHeader>
          {showHistory && (
            <CardContent>
              <div className="space-y-2">
                {versions.map((v) => (
                  <div key={v.id} className="flex items-start gap-3 text-sm py-2 border-b last:border-b-0">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded shrink-0">v{v.version_number}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{v.title}</p>
                      {v.change_summary && (
                        <p className="text-xs text-muted-foreground mt-0.5">{v.change_summary}</p>
                      )}
                    </div>
                    <ManagedDocStatusBadge status={v.status} />
                    <span className="text-xs text-muted-foreground shrink-0 pt-0.5">
                      {new Date(v.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
