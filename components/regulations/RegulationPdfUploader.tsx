'use client'

import { useState, useRef } from 'react'
import { Upload, File, Loader2, CheckCircle, XCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, formatFileSize } from '@/lib/utils'

interface RegulationDoc {
  id: string; original_name: string; file_size_bytes: number
  created_at: string; storage_path: string
}

interface Props {
  hospitalId: string
  existing: RegulationDoc[]
}

export function RegulationPdfUploader({ hospitalId, existing }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.pdf')) { setError('PDF 파일만 가능합니다'); return }
    setFile(f); setResult(null); setError(null)
  }

  const upload = async () => {
    if (!file) return
    setUploading(true); setResult(null); setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('hospitalId', hospitalId)
      const res = await fetch('/api/hospitals/regulations', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '업로드 실패')
      setResult('업로드 완료')
      setFile(null)
    } catch (e: any) {
      setError(e.message)
    } finally { setUploading(false) }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]) }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
          dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
        )}
      >
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={(e) => { if (e.target.files?.length) handleFile(e.target.files[0]); e.target.value = '' }} className="hidden" />
        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-900">규정집 PDF 업로드</p>
        <p className="text-xs text-muted-foreground mt-1">PDF 파일을 드래그하거나 클릭하여 업로드 (최대 50MB)</p>
      </div>

      {file && !uploading && !result && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <File className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-sm text-blue-800 truncate flex-1">{file.name}</span>
          <Button size="sm" onClick={upload}>업로드</Button>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-brand-600 p-3 bg-brand-50 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" /> 업로드 중...
        </div>
      )}

      {result && (
        <div className="flex items-center gap-2 text-sm text-green-700 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 shrink-0" /> {result}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-700 p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* 기존 업로드 목록 */}
      {existing.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">업로드된 규정집 ({existing.length}건)</p>
          {existing.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg text-sm">
              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate flex-1">{doc.original_name}</span>
              <span className="text-xs text-muted-foreground shrink-0">{formatFileSize(doc.file_size_bytes)}</span>
              <span className="text-xs text-muted-foreground shrink-0">{new Date(doc.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
