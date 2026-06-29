'use client'

import { useState, useRef } from 'react'
import { Upload, File, Download, Loader2, CheckCircle, XCircle, AlertTriangle, Sparkles, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UploadResult {
  areas: number; chapters: number; entries: number
  categories: number; items: number; errors: string[]
}

export function CriteriaUploader() {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeResult, setAnalyzeResult] = useState<{ summary: string; created: number; total: number; createdDocs: Array<{ title: string; docType: string; id: string }> } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
      setError('CSV 또는 Excel(.xlsx/.xls) 파일만 업로드 가능합니다')
      return
    }
    setFile(f)
    setResult(null)
    setError(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFile(e.target.files[0])
    e.target.value = ''
  }

  const upload = async () => {
    if (!file) return
    setUploading(true)
    setResult(null)
    setError(null)

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/criteria/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setResult(data)
    } catch (e: any) {
      setError(e.message ?? '업로드 실패')
    } finally {
      setUploading(false)
    }
  }

  const analyzeCriteria = async () => {
    setAnalyzing(true)
    setAnalyzeResult(null)
    try {
      const res = await fetch('/api/admin/criteria/analyze', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setAnalyzeResult(data)
    } catch (e: any) {
      setError(e.message ?? 'AI 분석 실패')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href="/api/admin/criteria/upload?template=1" download>
            <Download className="w-3.5 h-3.5 mr-1" />
            엑셀 템플릿 다운로드
          </a>
        </Button>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-300 hover:border-brand-300 hover:bg-gray-50'
        )}
      >
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleChange} className="hidden" />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-900 mb-1">엑셀/CSV 파일을 드래그하거나 클릭하여 업로드</p>
        <p className="text-xs text-muted-foreground">지원 형식: .csv, .xlsx, .xls</p>
      </div>

      {file && !uploading && !result && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <File className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-sm text-blue-800 truncate flex-1">{file.name}</span>
          <span className="text-xs text-blue-600 shrink-0">{(file.size / 1024).toFixed(1)}KB</span>
          <Button size="sm" onClick={upload}>업로드</Button>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-brand-600 p-3 bg-brand-50 border border-brand-200 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          데이터 처리 중...
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800">업로드 완료</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            <div className="bg-white rounded p-2 text-center"><span className="font-bold text-brand-600">{result.areas}</span><br /><span className="text-xs text-muted-foreground">영역</span></div>
            <div className="bg-white rounded p-2 text-center"><span className="font-bold text-brand-600">{result.chapters}</span><br /><span className="text-xs text-muted-foreground">장</span></div>
            <div className="bg-white rounded p-2 text-center"><span className="font-bold text-brand-600">{result.entries}</span><br /><span className="text-xs text-muted-foreground">기준</span></div>
            <div className="bg-white rounded p-2 text-center"><span className="font-bold text-brand-600">{result.categories}</span><br /><span className="text-xs text-muted-foreground">범주</span></div>
            <div className="bg-white rounded p-2 text-center"><span className="font-bold text-brand-600">{result.items}</span><br /><span className="text-xs text-muted-foreground">조사항목</span></div>
          </div>
          {result.errors.length > 0 && (
            <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div>{result.errors.length}개 경고: {result.errors.slice(0, 5).join(', ')}{result.errors.length > 5 ? ` 외 ${result.errors.length - 5}건` : ''}</div>
            </div>
          )}

          {/* AI 분석 버튼 */}
          <div className="pt-2 border-t border-green-200">
            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 gap-2"
              onClick={analyzeCriteria}
              disabled={analyzing}
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {analyzing ? 'AI 분석 중...' : 'AI 분석하여 필요 문서 자동 생성'}
            </Button>
          </div>

          {analyzeResult && (
            <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg text-sm space-y-2">
              <div className="flex items-center gap-2 font-medium text-violet-800">
                <Sparkles className="w-4 h-4" />
                AI 분석 완료
              </div>
              <p className="text-violet-700">{analyzeResult.summary}</p>
              <p className="text-violet-700">
                총 {analyzeResult.total}개 문서 필요 → {analyzeResult.created}개 초안 생성됨
              </p>
              {analyzeResult.createdDocs.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {analyzeResult.createdDocs.map((d) => (
                    <div key={d.id} className="flex items-center gap-2 text-xs text-violet-600 bg-white rounded px-2 py-1">
                      <span className="font-medium">{d.docType}</span>
                      <span>{d.title}</span>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <a href="/admin/hospitals">
                  <ExternalLink className="w-3.5 h-3.5" />
                  생성된 문서 확인하러 가기
                </a>
              </Button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
