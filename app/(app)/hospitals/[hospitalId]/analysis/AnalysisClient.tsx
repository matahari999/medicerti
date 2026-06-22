'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Play, History, RotateCcw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AnalysisProgress } from '@/components/analysis/AnalysisProgress'
import { CriterionResultRow } from '@/components/analysis/CriterionResultRow'
import { formatDateTime, formatScore } from '@/lib/utils'

interface AnalysisClientProps {
  hospitalId: string
  runs: Record<string, unknown>[]
  extractedDocCount: number
}

const POLL_INTERVAL = 3000
const MAX_POLL_ATTEMPTS = 60
const POLL_RETRY_DELAY = [1000, 3000, 5000]

export function AnalysisClient({ hospitalId, runs, extractedDocCount }: AnalysisClientProps) {
  const router = useRouter()
  const [status, setStatus] = useState<string>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeRunId, setActiveRunId] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null)
  const [runData, setRunData] = useState<Record<string, unknown> | null>(null)
  const pollingRef = useRef(false)

  const latestRun = runs.length > 0 ? runs[0] : null

  const handleRunAnalysis = useCallback(async () => {
    setStatus('queued')
    setErrorMessage(null)
    try {
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (res.status === 429) {
          throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.')
        }
        throw new Error((err as { error?: string }).error || '분석 실행 실패')
      }
      const json = await res.json() as { data: { runId: string; status: string } }
      setActiveRunId(json.data.runId)
      setStatus('running')
      pollAnalysis(json.data.runId)
    } catch (err) {
      setStatus('failed')
      setErrorMessage(err instanceof Error ? err.message : '분석 실행 실패')
    }
  }, [hospitalId])

  const pollAnalysis = async (runId: string) => {
    if (pollingRef.current) return
    pollingRef.current = true

    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL))

      let pollSuccess = false
      for (let retry = 0; retry < POLL_RETRY_DELAY.length; retry++) {
        try {
          const res = await fetch(`/api/analysis/${runId}`)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)

          const json = await res.json() as { data: { run: Record<string, unknown>; results: Record<string, unknown>[] } }
          const runStatus = json.data.run.status as string

          if (runStatus === 'complete' || runStatus === 'failed') {
            setRunData(json.data.run)
            setResults(json.data.results)
            setStatus(runStatus === 'complete' ? 'complete' : 'failed')
            if (runStatus === 'failed') {
              setErrorMessage((json.data.run.error_message as string) ?? '분석 중 오류가 발생했습니다')
            }
            pollingRef.current = false
            router.refresh()
            return
          }
          pollSuccess = true
          break
        } catch {
          if (retry < POLL_RETRY_DELAY.length - 1) {
            await new Promise((r) => setTimeout(r, POLL_RETRY_DELAY[retry]))
          }
        }
      }

      if (!pollSuccess && i < MAX_POLL_ATTEMPTS - 1) {
        continue
      }
    }

    setStatus('failed')
    setErrorMessage('분석 시간이 초과되었습니다. 다시 시도해주세요.')
    pollingRef.current = false
  }

  const handleViewLatest = useCallback(async () => {
    if (!latestRun) return
    setActiveRunId(latestRun.id as string)
    setErrorMessage(null)
    try {
      const res = await fetch(`/api/analysis/${latestRun.id}`)
      if (!res.ok) return
      const json = await res.json() as { data: { run: Record<string, unknown>; results: Record<string, unknown>[] } }
      setRunData(json.data.run)
      setResults(json.data.results)
    } catch {
      setErrorMessage('결과를 불러오는 데 실패했습니다')
    }
  }, [latestRun])

  const latestScore = latestRun?.overall_score != null ? latestRun.overall_score as number : null
  const scoreColor = latestScore != null ? (latestScore >= 80 ? 'text-green-600' : latestScore >= 60 ? 'text-amber-600' : 'text-red-600') : ''

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">추출된 문서 {extractedDocCount}개</p>
              {latestScore != null && (
                <p className={`text-sm font-semibold ${scoreColor}`}>
                  최근 점수: {formatScore(latestScore)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {runs.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleViewLatest}>
                  <History className="w-4 h-4 mr-1.5" />
                  최근 결과 보기
                </Button>
              )}
              <Button
                size="sm"
                className="bg-brand-600 hover:bg-brand-700"
                disabled={extractedDocCount === 0 || status === 'running' || status === 'queued'}
                onClick={handleRunAnalysis}
              >
                {status === 'running' || status === 'queued' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                    분석 중
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1.5" />
                    분석 실행
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active analysis progress */}
      {(status === 'queued' || status === 'running') && activeRunId && (
        <Card>
          <CardContent>
            <AnalysisProgress status={status} />
          </CardContent>
        </Card>
      )}

      {/* Error display */}
      {status === 'failed' && errorMessage && !results && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-800">분석 실패</p>
                <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={handleRunAnalysis}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  재시도
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && runData && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm font-semibold">분석 결과</p>
              <p className="text-xs text-muted-foreground">
                {runData.completed_at ? formatDateTime(runData.completed_at as string) : ''}
                {' · '}전체 점수: {runData.overall_score != null ? formatScore(runData.overall_score as number) : '-'}
              </p>
            </div>
            {(runData.status as string) === 'failed' && (
              <Button variant="outline" size="sm" onClick={handleRunAnalysis}>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                재분석
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {results.map((r) => (
                <CriterionResultRow
                  key={r.id as string}
                  result={r as unknown as Parameters<typeof CriterionResultRow>[0]['result']}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {runs.length > 0 && !results && status !== 'failed' && (
        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm font-semibold">분석 이력</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {runs.map((run) => (
                <button
                  key={run.id as string}
                  onClick={async () => {
                    setActiveRunId(run.id as string)
                    setErrorMessage(null)
                    try {
                      const res = await fetch(`/api/analysis/${run.id}`)
                      if (!res.ok) return
                      const json = await res.json() as { data: { run: Record<string, unknown>; results: Record<string, unknown>[] } }
                      setRunData(json.data.run)
                      setResults(json.data.results)
                    } catch {
                      setErrorMessage('결과를 불러오는 데 실패했습니다')
                    }
                  }}
                  className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {run.created_at ? formatDateTime(run.created_at as string) : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      상태: {run.status as string}
                      {run.documents_analyzed != null ? ` · 문서 ${run.documents_analyzed}개` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {run.overall_score != null && (
                      <p className="text-sm font-bold">{formatScore(run.overall_score as number)}</p>
                    )}
                    {run.status === 'complete' && (
                      <p className="text-xs text-brand-600 font-medium">결과 보기</p>
                    )}
                    {run.status === 'failed' && (
                      <p className="text-xs text-red-600 font-medium">실패</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
