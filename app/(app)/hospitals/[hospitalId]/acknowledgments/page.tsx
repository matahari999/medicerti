import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, FileCheck } from 'lucide-react'
import { getHospital } from '@/lib/services/hospital.service'
import { requireHospitalMember } from '@/lib/auth'
import { getAcknowledgmentsByHospital, getAcknowledgmentStats, getRegulationsForAcknowledgment } from '@/lib/services/acknowledgment.service'
import AcknowledgmentClient from './AcknowledgmentClient'

type Props = { params: Promise<{ hospitalId: string }> }

export const metadata: Metadata = { title: '직원 인지 확인 로그' }

export default async function AcknowledgmentPage({ params }: Props) {
  const { hospitalId } = await params
  await requireHospitalMember(hospitalId, 'viewer')

  const hospital = await getHospital(hospitalId)
  if (!hospital) notFound()

  const [acknowledgments, stats, regulations] = await Promise.all([
    getAcknowledgmentsByHospital(hospitalId),
    getAcknowledgmentStats(hospitalId),
    getRegulationsForAcknowledgment(hospitalId),
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
          <FileCheck className="w-6 h-6 text-brand-600" />
          직원 인지 확인 로그
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          직원들이 규정/교육 문서를 읽고 확인한 로그 — 조사위원 증빙 자료
        </p>
      </div>

      <AcknowledgmentClient
        hospitalId={hospitalId}
        initialAcks={acknowledgments}
        initialStats={stats}
        regulations={regulations}
      />
    </div>
  )
}
