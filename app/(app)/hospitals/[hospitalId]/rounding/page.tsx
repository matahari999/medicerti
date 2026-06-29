import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ClipboardList, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getHospital } from '@/lib/services/hospital.service'
import { requireHospitalMember } from '@/lib/auth'
import { getRoundingCategories, getRoundingTrends, getRecentRoundingRecords, getMetricTrends } from '@/lib/services/rounding.service'
import RoundingClient from './RoundingClient'

type Props = { params: Promise<{ hospitalId: string }> }

export const metadata: Metadata = { title: '라운딩/모의조사' }

export default async function RoundingPage({ params }: Props) {
  const { hospitalId } = await params
  await requireHospitalMember(hospitalId, 'viewer')

  const hospital = await getHospital(hospitalId)
  if (!hospital) notFound()

  const [categories, trends, recent, metrics] = await Promise.all([
    getRoundingCategories(hospital.type),
    getRoundingTrends(hospitalId),
    getRecentRoundingRecords(hospitalId),
    getMetricTrends(hospitalId),
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
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-brand-600" />
          라운딩 / 모의조사
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          월 1회 정기 라운딩 결과를 기록하고 시간별 추세를 추적하세요
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

      <RoundingClient
        hospitalId={hospitalId}
        categories={categories}
        initialTrends={trends}
        initialRecent={recent}
        initialMetrics={metrics}
      />
    </div>
  )
}
