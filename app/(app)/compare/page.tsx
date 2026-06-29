import type { Metadata } from 'next'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'
import { getHospital, getLatestAnalysis } from '@/lib/services/hospital.service'
import { getUserHospitals } from '@/lib/services/hospital.service'
import { getLatestAssessment } from '@/lib/services/self-assessment.service'
import CompareClient from './CompareClient'

export const metadata: Metadata = { title: '병원간 비교' }

export default async function ComparePage() {
  const hospitals = await getUserHospitals()

  const enriched = await Promise.all(
    hospitals.map(async (h: any) => {
      const assessment = await getLatestAssessment(h.id as string).catch(() => null)
      const analysis = await getLatestAnalysis(h.id as string).catch(() => null)
      return {
        id: h.id as string,
        name: h.name as string,
        type: h.type as string,
        region: h.region as string | null,
        accreditation_cycle: h.accreditation_cycle as number | null,
        accreditation_target: h.accreditation_target as string | null,
        bed_count: h.bed_count as number | null,
        assessmentScore: assessment?.overall_score ?? null,
        analysisScore: analysis?.overall_score ?? null,
      }
    })
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 mb-4">
          <BarChart3 className="w-4 h-4" />
          대시보드
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">병원간 비교</h1>
        <p className="text-sm text-muted-foreground mt-1">
          복수 병원의 인증 준비 현황을 한눈에 비교하세요
        </p>
      </div>

      <CompareClient hospitals={enriched} />
    </div>
  )
}
