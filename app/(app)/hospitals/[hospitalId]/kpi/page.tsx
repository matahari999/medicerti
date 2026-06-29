import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, BarChart3, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getHospital } from '@/lib/services/hospital.service'
import { requireHospitalMember } from '@/lib/auth'
import { getAccreditationTree } from '@/lib/services/criteria.service'
import { getLatestAssessment } from '@/lib/services/self-assessment.service'
import { getRoundingTrends, getMetricTrends, getRecentRoundingRecords } from '@/lib/services/rounding.service'
import { getAcknowledgmentStats } from '@/lib/services/acknowledgment.service'
import KpiDashboardClient from './KpiDashboardClient'

type Props = { params: Promise<{ hospitalId: string }> }

export const metadata: Metadata = { title: '핵심 지표 대시보드' }

export default async function KpiPage({ params }: Props) {
  const { hospitalId } = await params
  await requireHospitalMember(hospitalId, 'viewer')

  const hospital = await getHospital(hospitalId)
  if (!hospital) notFound()

  const [latestAssessment, roundingTrends, metrics, recentRounds, ackStats] = await Promise.all([
    getLatestAssessment(hospitalId),
    getRoundingTrends(hospitalId),
    getMetricTrends(hospitalId),
    getRecentRoundingRecords(hospitalId, 3),
    getAcknowledgmentStats(hospitalId),
  ])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Link
          href={`/hospitals/${hospitalId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          {hospital.name}
        </Link>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">핵심 지표 대시보드</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          조사위원 질문에 바로 답할 수 있는 핵심 수치
        </p>
      </div>

      <style>{`
        @media print {
          body * { visibility: visible; }
          nav, .print\\:hidden, button:has(svg.lucide-printer), [class*="no-print"] { display: none !important; }
          @page { margin: 12mm; }
        }
      `}</style>
      <div className="flex justify-end print:hidden no-print">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-1.5" />
          PDF 출력
        </Button>
      </div>

      <KpiDashboardClient
        hospitalId={hospitalId}
        hospitalName={hospital.name}
        latestAssessment={latestAssessment ? {
          overall_score: latestAssessment.overall_score,
          compliant_count: latestAssessment.compliant_count,
          partial_count: latestAssessment.partial_count,
          non_compliant_count: latestAssessment.non_compliant_count,
          not_reviewed_count: latestAssessment.not_reviewed_count,
          total_items: latestAssessment.total_items,
          priority_score: latestAssessment.priority_score,
        } : null}
        roundingTrends={roundingTrends}
        metrics={metrics}
        recentRounds={recentRounds.map((r) => ({ round_date: r.round_date, overall_score: r.overall_score, title: r.title }))}
        ackStats={ackStats}
      />
    </div>
  )
}
