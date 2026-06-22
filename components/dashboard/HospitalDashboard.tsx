'use client'

import { ScoreRing } from './ScoreRing'
import { DomainRadarChart } from './DomainRadarChart'
import { ScoreTrendChart } from './ScoreTrendChart'
import { CriticalGapsPanel } from './CriticalGapsPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardData {
  domainData: { domain: string; code: string; score: number; fullMark: number }[]
  trendData: { date: string; score: number }[]
  criticalGaps: { code: string; title: string; domain: string; severity: string; recommendation: string | null }[]
  scoreHistory: Record<string, unknown>[]
}

interface HospitalDashboardProps {
  overallScore: number | null
  documentStats: { total: number; extracted: number; pending: number; failed: number }
  dashboardData: DashboardData
}

export function HospitalDashboard({ overallScore, documentStats, dashboardData }: HospitalDashboardProps) {
  const docReadiness = documentStats.total > 0 ? Math.round((documentStats.extracted / documentStats.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Score Ring + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">인증 준비도</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <ScoreRing score={overallScore} size={140} strokeWidth={12} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">도메인별 점수</CardTitle>
          </CardHeader>
          <CardContent>
            <DomainRadarChart data={dashboardData.domainData} />
          </CardContent>
        </Card>
      </div>

      {/* Trend + Critical Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">점수 추세</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart data={dashboardData.trendData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">주요 갭</CardTitle>
              {dashboardData.criticalGaps.length > 0 && (
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  {dashboardData.criticalGaps.length}개
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CriticalGapsPanel gaps={dashboardData.criticalGaps} />
          </CardContent>
        </Card>
      </div>

      {/* Document Readiness */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">문서 준비 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">추출 완료</span>
              <span className="font-medium">{documentStats.extracted} / {documentStats.total}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${docReadiness}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{docReadiness}% 준비</span>
              {documentStats.pending > 0 && <span>처리 대기 {documentStats.pending}개</span>}
              {documentStats.failed > 0 && <span className="text-red-500">실패 {documentStats.failed}개</span>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
