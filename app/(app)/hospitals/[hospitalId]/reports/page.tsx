import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, FileText, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getHospital } from '@/lib/services/hospital.service'
import { requireHospitalMember } from '@/lib/auth'
import { ReportsClient } from './ReportsClient'
import { EmptyState } from '@/components/ui/empty-state'

type Props = { params: Promise<{ hospitalId: string }> }

export const metadata: Metadata = { title: '보고서' }

export default async function ReportsPage({ params }: Props) {
  const { hospitalId } = await params
  await requireHospitalMember(hospitalId, 'viewer')

  const hospital = await getHospital(hospitalId)
  if (!hospital) notFound()

  const supabase = await createClient()

  const [reportsData, runsData] = await Promise.all([
    supabase
      .from('reports')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('generated_at', { ascending: false })
      .then((r) => r.data ?? []),
    supabase
      .from('analysis_runs')
      .select('id, overall_score, completed_at, status')
      .eq('hospital_id', hospitalId)
      .eq('status', 'complete')
      .order('completed_at', { ascending: false })
      .limit(5)
      .then((r) => r.data ?? []),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/hospitals/${hospitalId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          {hospital.name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">보고서</h1>
        <p className="text-sm text-muted-foreground mt-1">
          인증 갭 분석 결과를 PDF 보고서로 다운로드합니다
        </p>
      </div>

      {runsData.length === 0 && reportsData.length === 0 ? (
        <EmptyState
          icon={<BarChart2 className="w-7 h-7 text-brand-400" />}
          title="아직 보고서가 없습니다"
          description="분석을 완료한 후 보고서를 생성할 수 있습니다"
        />
      ) : (
        <ReportsClient
          hospitalId={hospitalId}
          reports={(reportsData as unknown[]) as Record<string, unknown>[]}
          completedRuns={(runsData as unknown[]) as Record<string, unknown>[]}
        />
      )}
    </div>
  )
}
