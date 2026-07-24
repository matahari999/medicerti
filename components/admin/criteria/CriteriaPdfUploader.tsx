'use client'

// 인증 참고자료 PDF 업로더 — 파일 여러 개 / 폴더 통째 업로드 지원.
// 파일별로 /api/admin/criteria/pdf 에 순차 POST 한다(Vercel 요청 본문 한도 때문에 한 번에 묶어 보내지 않음).
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, File, FolderOpen, Loader2, CheckCircle, XCircle, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Vercel 서버리스 함수 요청 본문 한도(약 4.5MB) — 넘으면 프로덕션에서 413이 난다.
const SIZE_WARN_BYTES = 4.5 * 1024 * 1024

// 업로드 후 CriteriaDocList가 목록을 다시 불러오게 하는 신호.
export const CRITERIA_DOCS_CHANGED = 'criteria-docs-changed'

type QueueStatus = 'pending' | 'uploading' | 'done' | 'error'

interface QueueItem {
  id: string
  file: File
  title: string
  status: QueueStatus
  message?: string
}

export function CriteriaPdfUploader() {
  const router = useRouter()
  const [dragOver, setDragOver] = useState(false)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [category, setCategory] = useState<'standard' | 'etc'>('etc')
  // 색인 시 어느 병원 종별의 근거로 쓸지. 'auto'면 본문 키워드로 추정한다.
  const [hospitalType, setHospitalType] = useState<'auto' | 'long_term_care' | 'psychiatric' | 'common'>('auto')
  const [uploading, setUploading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dirInputRef = useRef<HTMLInputElement>(null)

  const addFiles = (incoming: File[]) => {
    const pdfs = incoming.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
    const skipped = incoming.length - pdfs.length
    if (pdfs.length === 0) {
      setError(skipped > 0 ? 'PDF 파일이 없습니다 (PDF만 업로드 가능)' : '파일을 찾지 못했습니다')
      return
    }
    setError(skipped > 0 ? `PDF가 아닌 파일 ${skipped}개는 제외했습니다` : null)
    setSummary(null)
    setQueue((prev) => {
      const existing = new Set(prev.map((q) => `${q.file.name}:${q.file.size}`))
      const added = pdfs
        .filter((f) => !existing.has(`${f.name}:${f.size}`))
        .map((f) => ({
          id: `${f.name}:${f.size}:${f.lastModified}:${Math.random().toString(36).slice(2, 8)}`,
          file: f,
          title: f.name.replace(/\.pdf$/i, ''),
          status: 'pending' as QueueStatus,
        }))
      return [...prev, ...added].sort((a, b) =>
        a.file.name.localeCompare(b.file.name, 'ko', { numeric: true })
      )
    })
  }

  // 드롭된 항목이 폴더면 재귀로 안쪽 파일까지 모은다.
  const collectFromDataTransfer = async (dt: DataTransfer): Promise<File[]> => {
    const entries = Array.from(dt.items)
      .map((item) => (typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null))
      .filter(Boolean) as FileSystemEntry[]

    if (entries.length === 0) return Array.from(dt.files)

    const out: File[] = []
    const walk = async (entry: FileSystemEntry): Promise<void> => {
      if (entry.isFile) {
        const f = await new Promise<File | null>((resolve) =>
          (entry as FileSystemFileEntry).file(resolve, () => resolve(null))
        )
        if (f) out.push(f)
        return
      }
      if (entry.isDirectory) {
        const reader = (entry as FileSystemDirectoryEntry).createReader()
        // readEntries는 한 번에 최대 100개만 주므로 빌 때까지 반복해야 한다.
        for (;;) {
          const batch = await new Promise<FileSystemEntry[]>((resolve) =>
            reader.readEntries(resolve, () => resolve([]))
          )
          if (batch.length === 0) break
          for (const child of batch) await walk(child)
        }
      }
    }
    for (const entry of entries) await walk(entry)
    return out
  }

  const uploadAll = async () => {
    const pending = queue.filter((q) => q.status === 'pending' || q.status === 'error')
    if (pending.length === 0) return
    setUploading(true)
    setSummary(null)
    setError(null)

    let ok = 0
    let failed = 0
    let indexedChunks = 0

    for (const item of pending) {
      setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', message: undefined } : q)))
      try {
        const form = new FormData()
        form.append('file', item.file)
        form.append('title', item.title.trim() || item.file.name.replace(/\.pdf$/i, ''))
        form.append('category', category)
        form.append('hospitalType', hospitalType)
        const res = await fetch('/api/admin/criteria/pdf', { method: 'POST', body: form })
        if (res.ok) {
          const data = await res.clone().json().catch(() => null)
          if (data?.indexed) indexedChunks += data.indexed as number
        }
        if (!res.ok) {
          const text = await res.text()
          let msg = `HTTP ${res.status}`
          try { msg = (JSON.parse(text).error as string) ?? msg } catch { /* HTML 에러 페이지 */ }
          if (res.status === 413) msg = '파일이 너무 큽니다 (약 4.5MB 초과)'
          throw new Error(msg)
        }
        ok++
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: 'done' } : q)))
      } catch (e: any) {
        failed++
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'error', message: e.message ?? '업로드 실패' } : q))
        )
      }
    }

    setUploading(false)
    setSummary(
      `${ok}개 업로드 완료${failed > 0 ? `, ${failed}개 실패` : ''}` +
        (indexedChunks > 0 ? ` · 본문 ${indexedChunks}개 조각 색인됨(규정집 생성 근거로 사용)` : '')
    )
    if (ok > 0) {
      router.refresh()
      // 아래 "등록된 참고자료 관리" 목록은 클라이언트에서 따로 fetch하므로 router.refresh()로는 갱신되지 않는다.
      window.dispatchEvent(new CustomEvent(CRITERIA_DOCS_CHANGED))
    }
  }

  const pendingCount = queue.filter((q) => q.status === 'pending' || q.status === 'error').length
  const oversized = queue.filter((q) => q.file.size > SIZE_WARN_BYTES).length

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={async (e) => {
          e.preventDefault()
          setDragOver(false)
          addFiles(await collectFromDataTransfer(e.dataTransfer))
        }}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center transition-colors',
          dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-300 hover:border-brand-300 hover:bg-gray-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={(e) => { if (e.target.files?.length) addFiles(Array.from(e.target.files)); e.target.value = '' }}
          className="hidden"
        />
        <input
          ref={dirInputRef}
          type="file"
          multiple
          {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
          onChange={(e) => { if (e.target.files?.length) addFiles(Array.from(e.target.files)); e.target.value = '' }}
          className="hidden"
        />
        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-900">인증기준집 PDF 업로드</p>
        <p className="text-xs text-muted-foreground mt-1">
          여러 개 선택하거나 폴더를 통째로 끌어다 놓으세요 (파일당 최대 50MB)
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <File className="w-4 h-4 mr-1.5" /> 파일 선택
          </Button>
          <Button size="sm" variant="outline" onClick={() => dirInputRef.current?.click()}>
            <FolderOpen className="w-4 h-4 mr-1.5" /> 폴더 선택
          </Button>
        </div>
      </div>

      {queue.length > 0 && (
        <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-blue-900">
              {queue.length}개 선택됨{pendingCount !== queue.length && ` (대기 ${pendingCount}개)`}
            </span>
            <div className="flex-1" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'standard' | 'etc')}
              disabled={uploading}
              className="text-sm px-3 py-2 border border-blue-200 rounded-lg bg-white focus:outline-none"
            >
              <option value="etc">기타 항목</option>
              <option value="standard">인증기준집</option>
            </select>
            <select
              value={hospitalType}
              onChange={(e) => setHospitalType(e.target.value as typeof hospitalType)}
              disabled={uploading}
              title="규정집 생성 시 어느 병원 종별의 근거로 쓸지"
              className="text-sm px-3 py-2 border border-blue-200 rounded-lg bg-white focus:outline-none"
            >
              <option value="auto">종별 자동판별</option>
              <option value="long_term_care">요양병원</option>
              <option value="psychiatric">정신병원</option>
              <option value="common">종별 공통</option>
            </select>
            <Button size="sm" onClick={uploadAll} disabled={uploading || pendingCount === 0}>
              {uploading ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> 업로드 중...</> : `${pendingCount}개 업로드`}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setQueue([]); setSummary(null); setError(null) }} disabled={uploading}>
              전체 비우기
            </Button>
          </div>
          <p className="text-xs text-blue-800/80">분류는 목록 전체에 함께 적용됩니다. 제목은 파일명이 기본값이며 아래에서 수정할 수 있습니다.</p>

          {oversized > 0 && (
            <div className="flex items-start gap-2 text-xs text-amber-800 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              4.5MB가 넘는 파일 {oversized}개가 있습니다. 배포 환경(서버리스) 요청 한도 때문에 실패할 수 있습니다.
            </div>
          )}

          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-0.5">
            {queue.map((q) => (
              <div key={q.id} className="flex items-center gap-2 px-2 py-1.5 bg-white border border-blue-100 rounded-lg">
                {q.status === 'uploading' && <Loader2 className="w-4 h-4 text-brand-600 shrink-0 animate-spin" />}
                {q.status === 'done' && <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />}
                {q.status === 'error' && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                {q.status === 'pending' && <File className="w-4 h-4 text-blue-500 shrink-0" />}
                <input
                  value={q.title}
                  onChange={(e) => setQueue((prev) => prev.map((x) => (x.id === q.id ? { ...x, title: e.target.value } : x)))}
                  disabled={uploading || q.status === 'done'}
                  className="flex-1 min-w-0 text-sm px-2 py-1 border border-transparent hover:border-blue-200 focus:border-blue-300 rounded bg-transparent focus:outline-none disabled:text-gray-500"
                />
                <span className={cn('text-[11px] shrink-0', q.file.size > SIZE_WARN_BYTES ? 'text-amber-700 font-medium' : 'text-muted-foreground')}>
                  {Math.round(q.file.size / 1024).toLocaleString()}KB
                </span>
                {q.message && <span className="text-[11px] text-red-600 shrink-0 max-w-[40%] truncate" title={q.message}>{q.message}</span>}
                <button
                  onClick={() => setQueue((prev) => prev.filter((x) => x.id !== q.id))}
                  disabled={uploading}
                  className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-40 shrink-0"
                  title="목록에서 제거"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary && (
        <div className="flex items-center gap-2 text-sm text-green-700 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {summary}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
