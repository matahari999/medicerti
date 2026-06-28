'use client'

import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MANAGED_DOC_TYPE_LABELS } from '@/lib/constants'
import type { ManagedDocType } from '@/types/database.types'

interface CreateManagedDocDialogProps {
  hospitalId: string
  onCreated:  (doc: { id: string; doc_type: ManagedDocType; title: string; status: 'draft'; version_number: number; updated_at: string; accreditation_criteria: null }) => void
  onClose:    () => void
}

const DOC_TYPES = Object.entries(MANAGED_DOC_TYPE_LABELS) as [ManagedDocType, string][]

export function CreateManagedDocDialog({ hospitalId, onCreated, onClose }: CreateManagedDocDialogProps) {
  const [docType, setDocType] = useState<ManagedDocType>('regulation')
  const [title,   setTitle]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('제목을 입력하세요'); return }

    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/managed-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId, doc_type: docType, title: title.trim() }),
      })
      const json = await res.json() as { data?: { id: string; updated_at: string }; error?: string }
      if (!res.ok) throw new Error(json.error ?? '생성 실패')
      onCreated({
        id:         json.data!.id,
        doc_type:   docType,
        title:      title.trim(),
        status:     'draft',
        version_number: 1,
        updated_at: json.data!.updated_at,
        accreditation_criteria: null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성 실패')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">새 문서 작성</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="doc-type">문서 유형</Label>
            <select
              id="doc-type"
              value={docType}
              onChange={(e) => setDocType(e.target.value as ManagedDocType)}
              className="w-full text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {DOC_TYPES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 감염관리 규정집 2026년판"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              취소
            </Button>
            <Button type="submit" className="flex-1 bg-brand-600 hover:bg-brand-700" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              생성
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
