'use client'

import { useState, useCallback, useMemo, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, ChevronDown, ChevronUp, History, AlertTriangle, Eye, EyeOff, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ManagedDocStatusBadge } from './ManagedDocStatusBadge'
import {
  MANAGED_DOC_TYPE_LABELS,
  MANAGED_DOC_STATUS_LABELS,
  MANAGED_DOC_STATUS_TRANSITIONS,
  NEEDS_REVIEW_MARKER,
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
    video_url:      string | null
    accreditation_criteria: { code: string; title: string; domain: string } | null
  }
  versions:     Version[]
  userRole:     string
}

function getYoutubeEmbedUrl(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

export function ManagedDocEditor({ hospitalId, doc, versions, userRole }: ManagedDocEditorProps) {
  const router               = useRouter()
  const [title,   setTitle]  = useState(doc.title)
  const [content, setContent]= useState(doc.content)
  const [videoUrl, setVideoUrl] = useState(doc.video_url ?? '')
  const [saving,  setSaving] = useState(false)
  const [error,   setError]  = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<ManagedDocStatus>(doc.status)
  const [currentVersion, setCurrentVersion] = useState(doc.version_number)
  const [showPreview, setShowPreview] = useState(false)

  const canWrite = ['admin', 'manager'].includes(userRole)
  const isDirty  = title !== doc.title || content !== doc.content || videoUrl !== (doc.video_url ?? '')

  const needsReviewCount = useMemo(
    () => content.split(NEEDS_REVIEW_MARKER).length - 1,
    [content]
  )

  const nextStatuses = (MANAGED_DOC_STATUS_TRANSITIONS[currentStatus] ?? [])
    .filter((s) => s !== 'approved' || needsReviewCount === 0)

  const save = useCallback(async (overrides: Record<string, unknown> = {}) => {
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {}
      if (isDirty) {
        payload.title     = title
        payload.content   = content
        payload.video_url = videoUrl.trim() || null
      }
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
  }, [doc.id, title, content, videoUrl, isDirty, router])

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

      {needsReviewCount > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          담당자 확인이 필요한 항목이 {needsReviewCount}건 남아 있습니다. 모두 해소해야 승인할 수 있습니다.
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
            <div className="flex items-center justify-between">
              <Label htmlFor="doc-content">내용</Label>
              {needsReviewCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs text-brand-700 hover:text-brand-800"
                >
                  {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPreview ? '편집으로 돌아가기' : '확인 필요 항목 미리보기'}
                </button>
              )}
            </div>

            {showPreview ? (
              <div className="w-full border rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 max-h-[600px] overflow-y-auto">
                {content.split(NEEDS_REVIEW_MARKER).map((chunk, i) => (
                  <Fragment key={i}>
                    {i > 0 && (
                      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">
                        {NEEDS_REVIEW_MARKER}{chunk.slice(0, chunk.indexOf(']') + 1)}
                      </mark>
                    )}
                    {i > 0 ? chunk.slice(chunk.indexOf(']') + 1) : chunk}
                  </Fragment>
                ))}
              </div>
            ) : (
              <textarea
                id="doc-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={!canWrite || currentStatus === 'archived'}
                rows={24}
                placeholder="문서 내용을 입력하세요. Markdown을 지원합니다."
                className="w-full border rounded-xl px-4 py-3 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:bg-gray-50 disabled:text-gray-500 font-mono"
              />
            )}
          </div>

          {doc.doc_type === 'education_record' && (
            <div className="space-y-1.5">
              <Label htmlFor="doc-video-url" className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                교육 동영상 링크 (YouTube 등, 선택)
              </Label>
              <Input
                id="doc-video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={!canWrite || currentStatus === 'archived'}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {videoUrl.trim() && (
                getYoutubeEmbedUrl(videoUrl.trim()) ? (
                  <div className="aspect-video rounded-xl overflow-hidden border">
                    <iframe
                      src={getYoutubeEmbedUrl(videoUrl.trim())!}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a
                    href={videoUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-700 hover:underline break-all"
                  >
                    {videoUrl.trim()}
                  </a>
                )
              )}
            </div>
          )}
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
