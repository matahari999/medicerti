'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, File, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CriteriaPdfUploader() {
  const router = useRouter()
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<'standard' | 'etc'>('etc')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf' && !f.name.endsWith('.pdf')) {
      setError('PDF 파일만 업로드 가능합니다')
      return
    }
    setFile(f)
    setTitle(f.name.replace(/\.pdf$/i, ''))
    setResult(null)
    setError(null)
  }

  const upload = async () => {
    if (!file) return
    setUploading(true)
    setResult(null)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('title', title)
      form.append('category', category)
      const res = await fetch('/api/admin/criteria/pdf', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setResult(`"${data.title}" 업로드 완료`)
      setFile(null)
      router.refresh()
    } catch (e: any) {
      setError(e.message ?? '업로드 실패')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]) }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
          dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-300 hover:border-brand-300 hover:bg-gray-50'
        )}
      >
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={(e) => { if (e.target.files?.length) handleFile(e.target.files[0]); e.target.value = '' }} className="hidden" />
        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-900">인증기준집 PDF 업로드</p>
        <p className="text-xs text-muted-foreground mt-1">참고용 PDF 파일 (최대 50MB)</p>
      </div>

      {file && !uploading && (
        <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <File className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">{file.name}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="자료 제목"
              className="flex-1 text-sm px-3 py-2 border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'standard' | 'etc')}
              className="text-sm px-3 py-2 border border-blue-200 rounded-lg bg-white focus:outline-none"
            >
              <option value="etc">기타 항목</option>
              <option value="standard">인증기준집</option>
            </select>
            <Button size="sm" onClick={upload} disabled={!title.trim()}>업로드</Button>
          </div>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-brand-600"><Loader2 className="w-4 h-4 animate-spin" /> 업로드 중...</div>
      )}

      {result && (
        <div className="flex items-center gap-2 text-sm text-green-700 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {result}
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
