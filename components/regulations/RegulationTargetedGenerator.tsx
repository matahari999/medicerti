'use client'

// 장/기준을 골라 규정집을 생성한다("7장 감염관리" → 7.1~7.7 중 원하는 기준만).
// 서버는 한 번에 기준 1개만 생성하므로(Gemini 호출 시간) 선택한 기준을 순차 호출한다.
import { useState, useEffect, useCallback } from 'react'
import { Sparkles, Loader2, CheckCircle, XCircle, ExternalLink, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CatalogItem {
  itemNumber: string
  itemTitle: string
  summary: string
}

interface CatalogChapter {
  chapterNumber: string
  chapterTitle: string
  items: CatalogItem[]
}

type ItemState = { status: 'pending' | 'running' | 'done' | 'error'; message?: string; docId?: string; grounded?: number }

interface Props {
  hospitalId: string
}

export function RegulationTargetedGenerator({ hospitalId }: Props) {
  const [chapters, setChapters] = useState<CatalogChapter[]>([])
  const [chapterNumber, setChapterNumber] = useState<string>('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [states, setStates] = useState<Record<string, ItemState>>({})
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/generate/regulation-by-criterion?hospitalId=${encodeURIComponent(hospitalId)}`)
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
        if (cancelled) return
        setChapters(json.chapters ?? [])
        const first = (json.chapters ?? [])[0] as CatalogChapter | undefined
        if (first) {
          setChapterNumber(first.chapterNumber)
          setSelected(new Set(first.items.map((i) => i.itemNumber)))
        }
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [hospitalId])

  const chapter = chapters.find((c) => c.chapterNumber === chapterNumber)

  const pickChapter = useCallback((num: string) => {
    setChapterNumber(num)
    const ch = chapters.find((c) => c.chapterNumber === num)
    setSelected(new Set(ch?.items.map((i) => i.itemNumber) ?? []))
    setStates({})
  }, [chapters])

  const toggle = (itemNumber: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(itemNumber)) next.delete(itemNumber)
      else next.add(itemNumber)
      return next
    })
  }

  const generate = async () => {
    if (!chapter) return
    const targets = chapter.items.filter((i) => selected.has(i.itemNumber))
    if (targets.length === 0) return

    setRunning(true)
    setError(null)
    setStates(Object.fromEntries(targets.map((t) => [t.itemNumber, { status: 'pending' as const }])))

    for (const target of targets) {
      setStates((prev) => ({ ...prev, [target.itemNumber]: { status: 'running' } }))
      try {
        const res = await fetch('/api/generate/regulation-by-criterion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hospitalId, itemNumber: target.itemNumber }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
        setStates((prev) => ({
          ...prev,
          [target.itemNumber]: { status: 'done', docId: json.docId, grounded: json.groundedChunks ?? 0 },
        }))
      } catch (e: any) {
        setStates((prev) => ({ ...prev, [target.itemNumber]: { status: 'error', message: e.message ?? '생성 실패' } }))
      }
    }

    setRunning(false)
  }

  const doneCount = Object.values(states).filter((s) => s.status === 'done').length
  const failedCount = Object.values(states).filter((s) => s.status === 'error').length

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="w-4 h-4 animate-spin" /> 인증기준 목록을 불러오는 중...
      </div>
    )
  }

  if (error && chapters.length === 0) {
    return <p className="text-sm text-red-600">{error}</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl">
        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center shrink-0">
          <ListChecks className="w-5 h-5 text-sky-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-sky-900">필요한 장·기준만 골라서 생성</h3>
          <p className="text-xs text-sky-700 mt-0.5">
            예: &quot;7장 감염관리&quot;를 고르면 7.1~7.7 기준별 규정집을 만듭니다.
            병원에 등록된 규정집·인증기준집·규정 사례집 원문에서 해당 기준의 근거를 찾아 반영합니다.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={chapterNumber}
          onChange={(e) => pickChapter(e.target.value)}
          disabled={running}
          className="flex-1 min-w-[220px] text-sm px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-sky-400"
        >
          {chapters.map((c) => (
            <option key={c.chapterNumber} value={c.chapterNumber}>
              제{c.chapterNumber}장 {c.chapterTitle} ({c.items.length}개 기준)
            </option>
          ))}
        </select>
        <Button
          className="gap-2 bg-sky-600 hover:bg-sky-700"
          onClick={generate}
          disabled={running || selected.size === 0}
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {running ? `생성 중... (${doneCount + failedCount}/${selected.size})` : `선택한 ${selected.size}개 생성`}
        </Button>
      </div>

      {chapter && (
        <div className="border rounded-xl divide-y bg-white">
          {chapter.items.map((item) => {
            const state = states[item.itemNumber]
            return (
              <label
                key={item.itemNumber}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selected.has(item.itemNumber)}
                  onChange={() => toggle(item.itemNumber)}
                  disabled={running}
                  className="w-4 h-4 accent-sky-600 shrink-0"
                />
                <span className="text-xs font-mono text-sky-700 shrink-0 w-12">{item.itemNumber}</span>
                <span className="flex-1 min-w-0 text-sm text-gray-900 truncate">{item.itemTitle}</span>

                {state?.status === 'running' && <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0" />}
                {state?.status === 'done' && (
                  <span className="flex items-center gap-1.5 text-xs text-green-700 shrink-0">
                    <CheckCircle className="w-4 h-4" />
                    {state.grounded ? `근거 ${state.grounded}건 반영` : '생성됨'}
                  </span>
                )}
                {state?.status === 'error' && (
                  <span className="flex items-center gap-1.5 text-xs text-red-600 shrink-0 max-w-[45%] truncate" title={state.message}>
                    <XCircle className="w-4 h-4 shrink-0" />
                    {state.message}
                  </span>
                )}
              </label>
            )
          })}
        </div>
      )}

      {(doneCount > 0 || failedCount > 0) && !running && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{doneCount}개 생성 완료{failedCount > 0 ? `, ${failedCount}개 실패` : ''}</span>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <a href={`/hospitals/${hospitalId}/managed-docs`}>
              <ExternalLink className="w-3.5 h-3.5" />
              관리 문서에서 확인
            </a>
          </Button>
        </div>
      )}

      {error && chapters.length > 0 && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
