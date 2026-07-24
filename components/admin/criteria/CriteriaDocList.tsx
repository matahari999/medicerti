'use client'

// 등록된 인증 참고자료(PDF) 관리 목록 — 제목 수정, 카테고리 변경, 삭제, 보기.
// 일반 구독자용 "기타 자료" 페이지와 같은 데이터를 관리자 관점에서 편집한다.
import { useState, useEffect, useCallback } from 'react'
import { FileText, Loader2, Pencil, Trash2, ExternalLink, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CRITERIA_DOCS_CHANGED } from './CriteriaPdfUploader'

interface DocItem {
  path: string
  title: string
  category: 'standard' | 'etc'
  sizeKb: number
  uploadedAt?: string
  url: string | null
}

const CATEGORY_LABELS: Record<string, string> = { standard: '인증기준집', etc: '기타 항목' }

export function CriteriaDocList() {
  const [docs, setDocs] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPath, setEditingPath] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState<'standard' | 'etc'>('etc')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/criteria-docs')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setDocs(json.data ?? [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  // 업로더가 새 파일을 올리면 목록을 다시 불러온다(별도 컴포넌트라 router.refresh()로는 갱신 안 됨).
  useEffect(() => {
    const handler = () => { void load() }
    window.addEventListener(CRITERIA_DOCS_CHANGED, handler)
    return () => window.removeEventListener(CRITERIA_DOCS_CHANGED, handler)
  }, [load])

  const startEdit = (d: DocItem) => {
    setEditingPath(d.path)
    setEditTitle(d.title)
    setEditCategory(d.category)
  }

  const saveEdit = async () => {
    if (!editingPath || !editTitle.trim()) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/criteria/pdf', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: editingPath, title: editTitle.trim(), category: editCategory }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setEditingPath(null)
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (d: DocItem) => {
    if (!window.confirm(`"${d.title}" 파일을 삭제할까요? 되돌릴 수 없습니다.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/criteria/pdf?path=${encodeURIComponent(d.path)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><Loader2 className="w-4 h-4 animate-spin" /> 자료 목록 로딩 중...</div>
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      {docs.length === 0 && <p className="text-sm text-muted-foreground py-2">등록된 자료가 없습니다.</p>}
      {docs.map((d) => (
        <div key={d.path} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50/50">
          <FileText className="w-4 h-4 text-brand-600 shrink-0" />
          {editingPath === d.path ? (
            <>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1 text-sm px-2 py-1.5 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as 'standard' | 'etc')}
                className="text-xs px-2 py-1.5 border rounded-lg bg-white"
              >
                <option value="etc">기타 항목</option>
                <option value="standard">인증기준집</option>
              </select>
              <Button size="sm" variant="ghost" onClick={saveEdit} disabled={busy}><Check className="w-4 h-4 text-green-600" /></Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingPath(null)}><X className="w-4 h-4 text-gray-400" /></Button>
            </>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{d.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {CATEGORY_LABELS[d.category]} · {d.sizeKb.toLocaleString()}KB
                  {d.uploadedAt && ` · ${d.uploadedAt.slice(0, 10)}`}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${d.category === 'standard' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {CATEGORY_LABELS[d.category]}
              </span>
              {d.url && (
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-brand-600" title="보기">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button onClick={() => startEdit(d)} className="p-1.5 text-slate-400 hover:text-brand-600" title="제목/분류 수정">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => remove(d)} disabled={busy} className="p-1.5 text-slate-400 hover:text-red-600" title="삭제">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
