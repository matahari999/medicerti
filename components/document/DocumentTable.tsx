'use client'

import { useState } from 'react'
import { FileText, Trash2, RefreshCw, Search } from 'lucide-react'
import { formatFileSize, formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'
import { Input } from '@/components/ui/input'

interface Document {
  id:                string
  original_name:     string
  file_size_bytes:   number
  category:          string
  status:            string
  error_message:     string | null
  created_at:        string
  extracted_at:      string | null
  extraction_attempts: number
}

interface DocumentTableProps {
  documents: Document[]
  onRetry?:  (docId: string) => void
  onDelete?: (docId: string) => void
}

export function DocumentTable({ documents, onRetry, onDelete }: DocumentTableProps) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? documents.filter((d) => d.original_name.toLowerCase().includes(search.toLowerCase()))
    : documents

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
          <FileText className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">업로드된 문서가 없습니다</p>
        <p className="text-xs text-muted-foreground">PDF 파일을 업로드하여 인증 분석을 시작하세요</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
        <Input
          placeholder="문서명 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9 text-sm"
        />
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="divide-y">
          {filtered.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-brand-600" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.original_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{formatFileSize(doc.file_size_bytes)}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(doc.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={doc.status} />
                {doc.status === 'failed' && onRetry && (
                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onRetry(doc.id)} title="재시도">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                )}
                {onDelete && (doc.status === 'pending' || doc.status === 'failed' || doc.status === 'extracted') && (
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(doc.id)} title="삭제">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">총 {filtered.length}개 문서</p>
    </div>
  )
}
