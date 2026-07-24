'use client'

// 업로드된 참고자료의 본문 색인 현황과 재색인. 색인된 청크가 있어야 규정집 생성이 그 자료를 근거로 쓴다.
// 서버가 파일 1건씩 처리하므로(추출+임베딩 시간) 클라이언트가 순차 호출한다.
import { useState, useEffect, useCallback } from 'react'
import { Loader2, RefreshCw, CheckCircle, XCircle, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CRITERIA_DOCS_CHANGED } from './CriteriaPdfUploader'

interface IndexRow {
  path: string
  title: string
  chunks: number
}

export function CriteriaIndexPanel() {
  const [rows, setRows] = useState<IndexRow[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/criteria/reindex')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setRows(json.data ?? [])
      setError(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  useEffect(() => {
    const handler = () => { void load() }
    window.addEventListener(CRITERIA_DOCS_CHANGED, handler)
    return () => window.removeEventListener(CRITERIA_DOCS_CHANGED, handler)
  }, [load])

  const reindex = async (targets: IndexRow[]) => {
    setRunning(true)
    setSummary(null)
    setError(null)
    let ok = 0
    let failed = 0
    let chunks = 0

    for (const row of targets) {
      setCurrent(row.path)
      try {
        const res = await fetch('/api/admin/criteria/reindex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: row.path, title: row.title }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
        ok++
        chunks += json.chunks ?? 0
        setRows((prev) => prev.map((r) => (r.path === row.path ? { ...r, chunks: json.chunks ?? 0 } : r)))
      } catch (e: any) {
        failed++
        setError(`${row.title}: ${e.message}`)
      }
    }

    setCurrent(null)
    setRunning(false)
    setSummary(`${ok}개 문서 색인 완료 (조각 ${chunks}개)${failed > 0 ? `, ${failed}개 실패` : ''}`)
  }

  const unindexed = rows.filter((r) => r.chunks === 0)
  const totalChunks = rows.reduce((sum, r) => sum + r.chunks, 0)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Database className="w-4 h-4 text-brand-600" />
          자료 {rows.length}종 · 색인 조각 {totalChunks.toLocaleString()}개
          {unindexed.length > 0 && (
            <span className="text-amber-700">· 미색인 {unindexed.length}종</span>
          )}
        </div>
        <div className="flex-1" />
        {unindexed.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => reindex(unindexed)} disabled={running || loading}>
            미색인 {unindexed.length}종만 색인
          </Button>
        )}
        <Button size="sm" onClick={() => reindex(rows)} disabled={running || loading || rows.length === 0}>
          {running ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
          {running ? '색인 중...' : '전체 재색인'}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="w-4 h-4 animate-spin" /> 색인 현황 확인 중...
        </div>
      ) : (
        <div className="border rounded-lg divide-y max-h-72 overflow-y-auto">
          {rows.map((r) => (
            <div key={r.path} className="flex items-center gap-2 px-3 py-2 text-sm">
              {current === r.path ? (
                <Loader2 className="w-4 h-4 text-brand-600 animate-spin shrink-0" />
              ) : r.chunks > 0 ? (
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className="flex-1 min-w-0 truncate text-gray-900">{r.title}</span>
              <span className={r.chunks > 0 ? 'text-xs text-muted-foreground shrink-0' : 'text-xs text-amber-700 shrink-0'}>
                {r.chunks > 0 ? `조각 ${r.chunks}개` : '미색인'}
              </span>
            </div>
          ))}
          {rows.length === 0 && <p className="px-3 py-3 text-sm text-muted-foreground">등록된 자료가 없습니다.</p>}
        </div>
      )}

      {summary && (
        <div className="flex items-center gap-2 text-sm text-green-700 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 shrink-0" /> {summary}
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}
    </div>
  )
}
