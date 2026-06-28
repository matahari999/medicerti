import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getHospital } from '@/lib/services/hospital.service'
import { requireHospitalMember } from '@/lib/auth'
import { CriteriaClient } from './CriteriaClient'

type Props = { params: Promise<{ hospitalId: string }> }

export const metadata: Metadata = { title: '인증 기준' }

export default async function CriteriaPage({ params }: Props) {
  const { hospitalId } = await params
  await requireHospitalMember(hospitalId, 'viewer')

  const hospital = await getHospital(hospitalId)
  if (!hospital) notFound()

  const supabase = await createClient()

  const [criteriaRaw, latestRunRaw] = await Promise.all([
    supabase
      .from('accreditation_criteria')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then((r) => r.data ?? []),
    supabase
      .from('analysis_runs')
      .select('id')
      .eq('hospital_id', hospitalId)
      .eq('status', 'complete')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then((r) => r.data as { id: string } | null),
  ])

  let resultsMap: Record<string, string> = {}

  if (latestRunRaw) {
    const { data: results } = await supabase
      .from('criterion_results')
      .select('criterion_id, compliance_status')
      .eq('analysis_run_id', latestRunRaw.id)

    if (results) {
      for (const r of results as Array<{ criterion_id: string; compliance_status: string }>) {
        resultsMap[r.criterion_id] = r.compliance_status
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href={`/hospitals/${hospitalId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          {hospital.name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">인증 기준</h1>
        <p className="text-sm text-muted-foreground mt-1">
          의료기관인증 평가 기준 {criteriaRaw.length}개
          {latestRunRaw ? ' · 최근 분석 결과 반영됨' : ' · 아직 분석 전'}
        </p>
      </div>

      <CriteriaClient
        criteria={criteriaRaw as never}
        resultsMap={resultsMap}
        hospitalId={hospitalId}
      />
    </div>
  )
}
