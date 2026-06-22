'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Loader2, FileText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ReportsClientProps {
  hospitalId: string
  reports: Record<string, unknown>[]
  completedRuns: Record<string, unknown>[]
}

export function ReportsClient({ hospitalId, reports, completedRuns }: ReportsClientProps) {
  const router = useRouter()
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  async function handleGenerate(runId: string) {
    setGeneratingId(runId)
    try {
      const res = await fetch(`/api/reports/${runId}`, { method: 'POST' })
      if (!res.ok) throw new Error('생성 실패')
      const data = await res.json()
      router.refresh()
    } catch {
      alert('보고서 생성에 실패했습니다')
    } finally {
      setGeneratingId(null)
    }
  }

  function formatDateTime(d: string) {
    return new Date(d).toLocaleString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* 완료된 분석 → 보고서 생성 */}
      {completedRuns.length > 0 && (
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">새 보고서 생성</h3>
          <div className="divide-y">
            {completedRuns.map((run) => (
              <div key={run.id as string} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    분석 ({formatDateTime(run.completed_at as string)})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    전체 점수: {run.overall_score != null ? String(run.overall_score) : '-'}점
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={generatingId === run.id}
                  onClick={() => handleGenerate(run.id as string)}
                >
                  {generatingId === run.id ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  보고서 생성
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 생성된 보고서 목록 */}
      {reports.length > 0 && (
        <div className="bg-white rounded-xl border divide-y">
          <div className="px-5 py-3">
            <h3 className="font-semibold text-gray-900 text-sm">생성된 보고서</h3>
          </div>
          {reports.map((report) => (
            <div key={report.id as string} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-brand-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {report.title as string}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(report.generated_at as string)}
                    {report.page_count != null && (
                      <> · {String(report.page_count)}개 기준</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {report.generated_at != null && (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    생성 완료
                  </span>
                )}
                <a
                  href={`/hospitals/${hospitalId}/reports/${report.analysis_run_id as string}/print`}
                  target="_blank"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 w-9 hover:bg-gray-100"
                  title="PDF 다운로드"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
