'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Wand2, ChevronDown, ChevronUp, Loader2, RefreshCw, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { COMPLIANCE_STATUS_COLORS, COMPLIANCE_STATUS_LABELS } from '@/lib/constants'

interface Run {
  id:                string
  overall_score:     number | null
  completed_at:      string
  total_criteria:    number | null
  documents_analyzed: number
}

interface Draft {
  id:                string
  criterion_id:      string
  title:             string
  content:           string
  compliance_status: string
  generated_at:      string
  accreditation_criteria: {
    code:        string
    domain:      string
    title:       string
    domain_code: string
  } | null
}

interface RegulationsClientProps {
  hospitalId:    string
  runs:          Run[]
  initialDrafts: Draft[]
  initialRunId:  string | null
}

export function RegulationsClient({
  hospitalId,
  runs,
  initialDrafts,
  initialRunId,
}: RegulationsClientProps) {
  const router                            = useRouter()
  const [selectedRunId, setSelectedRunId] = useState<string>(initialRunId ?? runs[0]?.id ?? '')
  const [drafts, setDrafts]               = useState<Draft[]>(initialDrafts)
  const [generating, setGenerating]       = useState(false)
  const [loadingDrafts, setLoadingDrafts] = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [expanded, setExpanded]           = useState<Set<string>>(new Set())
  const [genCount, setGenCount]           = useState<number | null>(null)
  const [importing, setImporting]         = useState<string | null>(null)

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const loadDrafts = useCallback(async (runId: string) => {
    setLoadingDrafts(true)
    setError(null)
    try {
      const res = await fetch(`/api/regulations?analysisRunId=${runId}`)
      const json = await res.json() as { data: Draft[] }
      setDrafts(json.data ?? [])
    } catch {
      setError('초안을 불러오는 데 실패했습니다')
    } finally {
      setLoadingDrafts(false)
    }
  }, [])

  const handleSelectRun = async (runId: string) => {
    setSelectedRunId(runId)
    setDrafts([])
    setGenCount(null)
    await loadDrafts(runId)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setGenCount(null)
    try {
      const res = await fetch('/api/regulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId, analysisRunId: selectedRunId }),
      })
      const json = await res.json() as { data?: { count: number }; error?: string }
      if (!res.ok) throw new Error(json.error ?? '생성 실패')
      setGenCount(json.data?.count ?? 0)

      // 생성 완료까지 폴링 (최대 5분)
      const startTime = Date.now()
      while (Date.now() - startTime < 300_000) {
        await new Promise((r) => setTimeout(r, 4000))
        const pollRes = await fetch(`/api/regulations?analysisRunId=${selectedRunId}`)
        const pollJson = await pollRes.json() as { data?: Draft[]; error?: string }
        if (pollJson.error) {
          // policy_drafts 테이블 미생성 등 DB 오류
          if (pollJson.error.includes('does not exist') || pollJson.error.includes('relation')) {
            throw new Error('policy_drafts 테이블이 없습니다. Supabase SQL 에디터에서 마이그레이션을 실행해주세요.')
          }
          throw new Error(pollJson.error)
        }
        const loaded = pollJson.data ?? []
        setDrafts(loaded)
        if (loaded.length >= (json.data?.count ?? 1)) break
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성 실패')
    } finally {
      setGenerating(false)
    }
  }

  const handleImportToManagedDoc = async (draft: Draft) => {
    setImporting(draft.id)
    setError(null)
    try {
      const res = await fetch('/api/managed-docs/from-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId,
          policyDraftId:  draft.id,
          analysisRunId:  selectedRunId,
        }),
      })
      const json = await res.json() as { data?: { id: string }; error?: string; existingId?: string }
      if (res.status === 409 && json.existingId) {
        router.push(`/hospitals/${hospitalId}/managed-docs/${json.existingId}`)
        return
      }
      if (!res.ok) throw new Error(json.error ?? '가져오기 실패')
      router.push(`/hospitals/${hospitalId}/managed-docs/${json.data!.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '가져오기 실패')
    } finally {
      setImporting(null)
    }
  }

  const selectedRun = runs.find((r) => r.id === selectedRunId)

  return (
    <div className="space-y-6">
      {/* 분석 선택 + 생성 버튼 */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">분석 기준 선택</p>
              <select
                value={selectedRunId}
                onChange={(e) => handleSelectRun(e.target.value)}
                className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {runs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {new Date(r.completed_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {r.overall_score != null ? ` · ${r.overall_score.toFixed(1)}점` : ''}
                  </option>
                ))}
              </select>
            </div>

            <Button
              className="bg-brand-600 hover:bg-brand-700 shrink-0"
              onClick={handleGenerate}
              disabled={generating || !selectedRunId}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  생성 중{genCount != null ? ` (${drafts.length}/${genCount})` : ''}…
                </>
              ) : drafts.length > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  재생성
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-1.5" />
                  규정집 생성
                </>
              )}
            </Button>
          </div>

          {selectedRun && (
            <p className="text-xs text-muted-foreground mt-3">
              전체 {selectedRun.total_criteria ?? '-'}개 기준 · 문서 {selectedRun.documents_analyzed}개 기반
            </p>
          )}
        </CardContent>
      </Card>

      {/* 에러 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 생성 중 안내 */}
      {generating && (
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-brand-600 animate-spin shrink-0" />
              <div>
                <p className="text-sm font-medium">Gemini가 정책 초안을 작성하고 있습니다</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  부적합·부분적합 항목{genCount != null ? ` ${genCount}개` : ''}에 대한 규정을 순차 생성 중 —
                  항목이 많으면 수 분이 소요될 수 있습니다
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 로딩 */}
      {loadingDrafts && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
          불러오는 중…
        </div>
      )}

      {/* 초안 목록 */}
      {!loadingDrafts && drafts.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-900">
            생성된 정책 초안 {drafts.length}건
          </p>

          {drafts.map((draft) => {
            const crit = draft.accreditation_criteria
            const isOpen = expanded.has(draft.id)
            const statusKey = draft.compliance_status as keyof typeof COMPLIANCE_STATUS_LABELS

            return (
              <div key={draft.id} className="bg-white border rounded-xl overflow-hidden">
                <button
                  onClick={() => toggle(draft.id)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4 text-brand-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {crit && (
                        <span className="text-xs font-mono font-semibold text-brand-700">{crit.code}</span>
                      )}
                      <span className="text-sm font-medium text-gray-900 truncate">{draft.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {crit && (
                        <span className="text-xs text-muted-foreground">{crit.domain}</span>
                      )}
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', COMPLIANCE_STATUS_COLORS[statusKey])}>
                        {COMPLIANCE_STATUS_LABELS[statusKey]}
                      </span>
                    </div>
                  </div>

                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
                </button>

                {isOpen && (
                  <div className="border-t px-5 py-4 bg-gray-50 space-y-3">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-sans">
                      {draft.content}
                    </pre>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleImportToManagedDoc(draft) }}
                        disabled={importing === draft.id}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                      >
                        {importing === draft.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <ArrowRight className="w-3 h-3" />
                        }
                        관리 문서로 가져오기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 빈 상태 */}
      {!loadingDrafts && !generating && drafts.length === 0 && selectedRunId && (
        <div className="text-center py-12 space-y-2">
          <BookOpen className="w-10 h-10 text-gray-200 mx-auto" />
          <p className="text-sm font-medium text-gray-900">아직 생성된 규정 초안이 없습니다</p>
          <p className="text-xs text-muted-foreground">"규정집 생성" 버튼을 눌러 AI 초안 작성을 시작하세요</p>
        </div>
      )}
    </div>
  )
}
