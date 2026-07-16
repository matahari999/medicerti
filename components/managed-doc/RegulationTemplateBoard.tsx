'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ManagedDocStatusBadge } from './ManagedDocStatusBadge'
import type { RegulationTemplateStatus } from '@/lib/services/managed-doc.service'

interface RegulationTemplateBoardProps {
  hospitalId: string
  items:      RegulationTemplateStatus[]
  canWrite:   boolean
}

export function RegulationTemplateBoard({ hospitalId, items, canWrite }: RegulationTemplateBoardProps) {
  const router = useRouter()
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function generate(templateId: string) {
    setGeneratingId(templateId)
    setError(null)
    try {
      const res = await fetch('/api/managed-docs/generate-from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId, templateId }),
      })
      const json = await res.json() as { error?: string }
      if (!res.ok) throw new Error(json.error ?? '초안 생성 실패')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '초안 생성 실패')
    } finally {
      setGeneratingId(null)
    }
  }

  return (
    <Card>
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <h2 className="text-sm font-semibold text-gray-900">병원 맞춤 규정집 (파일럿)</h2>
          <span className="text-[10px] font-normal text-muted-foreground bg-gray-100 px-1.5 py-0.5 rounded">
            병원 프로필 기반 자동 초안 생성
          </span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="divide-y">
          {items.map(({ template, documentId, status }) => (
            <div key={template.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{template.title}</p>
                {template.entry_code && (
                  <p className="text-xs text-muted-foreground">인증 조사항목 {template.entry_code}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {status === 'not_generated' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-500 border-gray-200">
                    미생성
                  </span>
                ) : (
                  <ManagedDocStatusBadge status={status} />
                )}

                {status === 'not_generated' && canWrite && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={generatingId === template.id}
                    onClick={() => generate(template.id)}
                  >
                    {generatingId === template.id
                      ? <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      : null}
                    초안 생성
                  </Button>
                )}

                {documentId && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/hospitals/${hospitalId}/managed-docs/${documentId}`}>편집</Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
