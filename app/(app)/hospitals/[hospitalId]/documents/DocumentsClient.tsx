'use client'

import { useRouter } from 'next/navigation'
import { DocumentTable } from '@/components/document/DocumentTable'

interface Document {
  id: string
  original_name: string
  file_size_bytes: number
  category: string
  status: string
  error_message: string | null
  created_at: string
  extracted_at: string | null
  extraction_attempts: number
}

interface DocumentsClientProps {
  documents: Document[]
}

export function DocumentsClient({ documents }: DocumentsClientProps) {
  const router = useRouter()

  const handleRetry = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/extract`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '추출 실패')
      }
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : '추출 실패')
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('이 문서를 삭제하시겠습니까?')) return
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('삭제 실패')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 실패')
    }
  }

  return <DocumentTable documents={documents} onRetry={handleRetry} onDelete={handleDelete} />
}
