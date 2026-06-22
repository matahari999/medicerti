import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getHospital } from '@/lib/services/hospital.service'
import { requireHospitalMember } from '@/lib/auth'
import { AnalysisClient } from './AnalysisClient'

type Props = { params: Promise<{ hospitalId: string }> }

export const metadata: Metadata = { title: '갭 분석' }

export default async function AnalysisPage({ params }: Props) {
  const { hospitalId } = await params
  await requireHospitalMember(hospitalId, 'viewer')

  const hospital = await getHospital(hospitalId)
  if (!hospital) notFound()

  const supabase = await createClient()

  const [runsData, docStats] = await Promise.all([
    supabase
      .from('analysis_runs')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then((r) => r.data ?? []),
    supabase
      .from('documents')
      .select('status')
      .eq('hospital_id', hospitalId)
      .eq('status', 'extracted')
      .is('deleted_at', null)
      .then((r) => r.data?.length ?? 0),
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
        <h1 className="text-2xl font-bold text-gray-900">갭 분석</h1>
        <p className="text-sm text-muted-foreground mt-1">
          업로드된 문서를 기반으로 인증 기준 대비 갭을 분석합니다
        </p>
      </div>

      <AnalysisClient
        hospitalId={hospitalId}
        runs={(runsData as unknown[]) as Record<string, unknown>[]}
        extractedDocCount={docStats}
      />
    </div>
  )
}
