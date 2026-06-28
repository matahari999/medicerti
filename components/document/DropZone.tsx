'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, File, X, Loader2, RotateCcw } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import { MAX_FILE_SIZE_BYTES, MAX_BATCH_UPLOAD } from '@/lib/constants'
import { Button } from '@/components/ui/button'

interface DropZoneProps {
  hospitalId: string
  onUploadComplete?: () => void
}

interface UploadItem {
  id:      string
  name:    string
  size:    number
  file?:   File
  status:  'pending' | 'uploading' | 'extracting' | 'success' | 'error'
  error?:  string
}

export function DropZone({ hospitalId, onUploadComplete }: DropZoneProps) {
  const router = useRouter()
  const [items, setItems] = useState<UploadItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const addFiles = useCallback((files: FileList | File[]) => {
    const oldNames = new Set(items.map((i) => i.name))
    const fileArray = Array.from(files)
      .filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
      .slice(0, MAX_BATCH_UPLOAD)

    if (fileArray.length === 0) return

    const newItems: UploadItem[] = fileArray.map((f) => {
      if (f.size > MAX_FILE_SIZE_BYTES) {
        return { id: crypto.randomUUID(), name: f.name, size: f.size, status: 'error' as const, error: `파일 크기 초과 (최대 ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB)` }
      }
      if (oldNames.has(f.name)) {
        return { id: crypto.randomUUID(), name: f.name, size: f.size, status: 'error' as const, error: '중복 파일명' }
      }
      oldNames.add(f.name)
      return { id: crypto.randomUUID(), name: f.name, size: f.size, file: f, status: 'pending' as const }
    })

    setItems((prev) => [...prev, ...newItems])

    const totalBefore = items.length
    fileArray.forEach((file, i) => {
      const idx = totalBefore + i
      if (newItems[i].status === 'pending') uploadFile(file, newItems[i].id)
    })
  }, [hospitalId, onUploadComplete, items])

  const uploadFile = async (file: File, itemId: string) => {
    setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, status: 'uploading' } : it))

    const formData = new FormData()
    formData.append('file', file)
    formData.append('hospitalId', hospitalId)

    let docId: string | null = null

    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        const res = await fetch('/api/documents', { method: 'POST', body: formData })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          if (res.status === 409) {
            throw new Error('이미 업로드된 파일입니다')
          }
          throw new Error((err as { error?: string }).error || '업로드 실패')
        }
        const json = await res.json() as { data: { id: string } }
        docId = json.data.id
        break
      } catch (err) {
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
          continue
        }
        setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, status: 'error', error: err instanceof Error ? err.message : '업로드 실패' } : it))
        return
      }
    }

    if (!docId) return

    // 업로드 성공 후 자동으로 OCR 추출 시작
    setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, status: 'extracting' } : it))
    try {
      await fetch(`/api/documents/${docId}/extract`, { method: 'POST' })
    } catch {
      // 추출 실패는 서버에서 처리 — 상태는 DB에 기록됨
    }

    setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, status: 'success' } : it))
    onUploadComplete?.()
    router.refresh()
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files)
    e.target.value = ''
  }, [addFiles])

  const retryItem = (item: UploadItem) => {
    if (!item.file) {
      removeItem(item.id)
      return
    }
    setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, status: 'pending', error: undefined } : it))
    uploadFile(item.file, item.id)
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const uploadingCount = items.filter((it) => it.status === 'uploading' || it.status === 'extracting').length
  const successCount   = items.filter((it) => it.status === 'success').length
  const errorCount     = items.filter((it) => it.status === 'error').length

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragOver
            ? 'border-brand-400 bg-brand-50'
            : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
        )}
      >
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" multiple onChange={handleChange} className="hidden" />
        <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mx-auto mb-3">
          <Upload className="w-5 h-5 text-brand-600" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">
          PDF 파일을 드래그하거나 클릭하여 업로드
        </p>
        <p className="text-xs text-muted-foreground">
          최대 {MAX_BATCH_UPLOAD}개, 파일당 {MAX_FILE_SIZE_BYTES / 1024 / 1024}MB 제한
        </p>
      </div>

      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-3 py-2 bg-white border rounded-lg text-sm">
              <File className="w-4 h-4 shrink-0 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-gray-900">{item.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(item.size)}</p>
              </div>
              {item.status === 'uploading' && (
                <span className="flex items-center gap-1 text-xs text-brand-600 shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  업로드 중
                </span>
              )}
              {item.status === 'extracting' && (
                <span className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  OCR 추출 중
                </span>
              )}
              {item.status === 'success' && (
                <span className="text-xs text-green-600 font-medium shrink-0">완료</span>
              )}
              {item.status === 'error' && (
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-red-600 font-medium max-w-24 truncate" title={item.error}>{item.error ?? '실패'}</span>
                  <button onClick={() => retryItem(item)} className="p-0.5 hover:bg-gray-100 rounded" title="재시도">
                    <RotateCcw className="w-3 h-3 text-gray-500" />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="p-0.5 hover:bg-gray-100 rounded">
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              )}
              {item.status === 'pending' && (
                <Button variant="ghost" size="icon" className="w-5 h-5" onClick={() => removeItem(item.id)}>
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
          {uploadingCount > 0 && (
            <p className="text-xs text-muted-foreground">{uploadingCount}개 처리 중...</p>
          )}
          {successCount > 0 && (
            <p className="text-xs text-green-600">{successCount}개 업로드 완료{errorCount > 0 ? `, ${errorCount}개 실패` : ''}</p>
          )}
        </div>
      )}
    </div>
  )
}
