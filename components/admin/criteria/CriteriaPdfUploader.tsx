'use client'

import { useState, useRef } from 'react'
import { Upload, File, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CriteriaPdfUploader() {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
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
      const res = await fetch('/api/admin/criteria/pdf', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setResult(data.path ?? '업로드 완료')
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

      {file && !uploading && !result && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <File className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-sm text-blue-800 truncate flex-1">{file.name}</span>
          <Button size="sm" onClick={upload}>업로드</Button>
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
