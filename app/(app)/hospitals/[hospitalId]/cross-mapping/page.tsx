import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, GitBranch } from 'lucide-react'
import { getHospital } from '@/lib/services/hospital.service'
import { requireHospitalMember } from '@/lib/auth'
import CrossMappingClient from './CrossMappingClient'

type Props = { params: Promise<{ hospitalId: string }> }

export const metadata: Metadata = { title: '교차 인증기준 매핑' }

export default async function CrossMappingPage({ params }: Props) {
  const { hospitalId } = await params
  await requireHospitalMember(hospitalId, 'viewer')

  const hospital = await getHospital(hospitalId)
  if (!hospital) notFound()

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
          <GitBranch className="w-6 h-6 text-brand-600" />
          종별 교차 인증기준 매핑
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          병원이 해당하는 다른 평가체계(장기요양, 정신건강 등)와 인증기준 간 중복 항목을 한눈에 확인
        </p>
      </div>

      <CrossMappingClient hospitalId={hospitalId} hospitalType={hospital.type} hospitalName={hospital.name} />
    </div>
  )
}
