import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getHospital } from '@/lib/services/hospital.service'
import { requireHospitalMember } from '@/lib/auth'
import { EmptyState } from '@/components/ui/empty-state'
import { RegulationsClient } from './RegulationsClient'

type Props = { params: Promise<{ hospitalId: string }> }

export const metadata: Metadata = { title: '규정집' }

export default async function RegulationsPage({ params }: Props) {
  const { hospitalId } = await params
  await requireHospitalMember(hospitalId, 'viewer')

  const hospital = await getHospital(hospitalId)
  if (!hospital) notFound()

  const supabase = await createClient()

  // 완료된 분석 목록
  const { data: runsRaw } = await supabase
    .from('analysis_runs')
    .select('id, overall_score, completed_at, total_criteria, documents_analyzed')
    .eq('hospital_id', hospitalId)
    .eq('status', 'complete')
    .order('completed_at', { ascending: false })
    .limit(5)

  const runs = (runsRaw ?? []) as Array<{
    id: string; overall_score: number | null; completed_at: string
    total_criteria: number | null; documents_analyzed: number
  }>

  // 최신 분석의 규정집 초안
  const latestRunId = runs[0]?.id ?? null
  let drafts: unknown[] = []

  if (latestRunId) {
    const { data } = await supabase
      .from('policy_drafts')
      .select('*, accreditation_criteria(code, domain, title, domain_code)')
      .eq('analysis_run_id', latestRunId)
      .order('generated_at', { ascending: true })
    drafts = data ?? []   // table might not exist yet → null → []
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
        <h1 className="text-2xl font-bold text-gray-900">규정집 자동 생성</h1>
        <p className="text-sm text-muted-foreground mt-1">
          갭 분석의 부적합·부분적합 항목에 대한 정책 초안을 AI가 작성합니다
        </p>
      </div>

      {runs.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-7 h-7 text-brand-400" />}
          title="완료된 분석이 없습니다"
          description="먼저 갭 분석을 완료한 후 규정집을 생성할 수 있습니다"
        />
      ) : (
        <RegulationsClient
          hospitalId={hospitalId}
          runs={runs as never}
          initialDrafts={drafts as never}
          initialRunId={latestRunId}
        />
      )}
    </div>
  )
}
