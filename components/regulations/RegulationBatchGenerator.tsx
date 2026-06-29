'use client'

import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle, XCircle, ExternalLink, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  hospitalId?: string
  hospitalName?: string
}

export function RegulationBatchGenerator({ hospitalId, hospitalName }: Props) {
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{
    total: number; generated: number; created: number
    createdDocs: Array<{ title: string; id: string }>
    errors: string[]; note: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setGenerating(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch('/api/generate/regulations-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId: hospitalId ?? '', catalogType: 'nursing' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setResult(data)
    } catch (e: any) {
      setError(e.message ?? '생성 실패')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl">
        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-violet-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-violet-900">규정집 상세 자동 생성</h3>
          <p className="text-xs text-violet-700 mt-0.5">
            4주기 요양병원 인증 기준({hospitalName ?? '요양병원'})을 분석하여
            실제 병원에서 즉시 사용 가능한 상세 규정집을 AI가 작성합니다.
            각 규정은 목적, 적용범위, 용어정의, 책임과 권한, 세부 절차, 관련 양식을 포함합니다.
          </p>
        </div>
      </div>

      <Button
        className="w-full gap-2 bg-violet-600 hover:bg-violet-700"
        onClick={generate}
        disabled={generating}
      >
        {generating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {generating ? 'AI가 규정집을 작성 중입니다... (약 30~60초 소요)' : '인증 기준별 상세 규정집 생성하기'}
      </Button>

      {generating && (
        <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg text-sm text-violet-700 space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-medium">규정집 생성 중...</span>
          </div>
          <p className="text-xs text-violet-600">
            Gemini AI가 4주기 요양병원 인증 기준을 분석하여 상세 규정집을 작성하고 있습니다.
            각 규정마다 제1조(목적)부터 관련 양식까지 완전한 문서 형태로 생성됩니다.
          </p>
          <div className="w-full bg-violet-200 rounded-full h-1.5">
            <div className="bg-violet-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800">규정집 생성 완료</span>
          </div>
          <p className="text-sm text-green-700">
            {result.note}
          </p>
          <div className="grid grid-cols-3 gap-2 text-sm text-center">
            <div className="bg-white rounded-lg p-2">
              <p className="font-bold text-brand-600">{result.total}</p>
              <p className="text-xs text-muted-foreground">전체 기준</p>
            </div>
            <div className="bg-white rounded-lg p-2">
              <p className="font-bold text-green-600">{result.generated}</p>
              <p className="text-xs text-muted-foreground">생성 완료</p>
            </div>
            <div className="bg-white rounded-lg p-2">
              <p className="font-bold text-blue-600">{result.created}</p>
              <p className="text-xs text-muted-foreground">DB 저장</p>
            </div>
          </div>
          {result.createdDocs.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {result.createdDocs.map((d) => (
                <div key={d.id} className="flex items-center gap-2 text-xs bg-white rounded px-2 py-1.5 text-gray-700">
                  <BookOpen className="w-3 h-3 text-violet-500 shrink-0" />
                  <span className="truncate">{d.title}</span>
                  {d.id !== 'no-db' && (
                    <span className="text-green-600 shrink-0">저장됨</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {hospitalId && (
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={`/hospitals/${hospitalId}/managed-docs`}>
                <ExternalLink className="w-3.5 h-3.5" />
                관리 문서에서 확인
              </a>
            </Button>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
