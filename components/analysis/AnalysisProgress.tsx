'use client'

import { Progress } from '@/components/ui/progress'

interface AnalysisProgressProps {
  status: string
  overallScore?: number | null
}

export function AnalysisProgress({ status, overallScore }: AnalysisProgressProps) {
  if (status === 'queued') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mb-3">
          <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">분석 대기 중...</p>
        <p className="text-xs text-muted-foreground">순서대로 처리됩니다</p>
      </div>
    )
  }

  if (status === 'running') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-900">AI 분석 진행 중...</p>
        <div className="w-full max-w-xs">
          <Progress value={45} className="h-2" />
        </div>
        <p className="text-xs text-muted-foreground">230개 인증 기준을 분석하고 있습니다</p>
      </div>
    )
  }

  if (status === 'complete' && overallScore != null) {
    const color = overallScore >= 80 ? 'text-green-600' : overallScore >= 60 ? 'text-amber-600' : 'text-red-600'
    return (
      <div className="flex items-center gap-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
        <div className={`text-2xl font-bold ${color}`}>{overallScore.toFixed(1)}%</div>
        <div>
          <p className="text-sm font-medium text-gray-900">분석 완료</p>
          <p className="text-xs text-muted-foreground">전체 인증 준비도 점수</p>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm">
        <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
        <div>
          <p className="font-medium text-red-800">분석 실패</p>
          <p className="text-xs text-red-600">다시 시도해 주세요</p>
        </div>
      </div>
    )
  }

  return null
}
