import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ClipboardCheck, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getHospital } from '@/lib/services/hospital.service'
import { requireHospitalMember } from '@/lib/auth'
import { getAccreditationTree } from '@/lib/services/criteria.service'
import { getLatestAssessment } from '@/lib/services/self-assessment.service'
import SelfAssessmentClient from './SelfAssessmentClient'

type Props = { params: Promise<{ hospitalId: string }> }

export const metadata: Metadata = { title: '자가 갭분석' }

export default async function SelfAssessmentPage({ params }: Props) {
  const { hospitalId } = await params
  await requireHospitalMember(hospitalId, 'viewer')

  const hospital = await getHospital(hospitalId)
  if (!hospital) notFound()

  const tree = await getAccreditationTree(hospital.type)
  const latestAssessment = await getLatestAssessment(hospitalId)

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
          <ClipboardCheck className="w-6 h-6 text-brand-600" />
          자가 갭분석
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          각 인증 조사항목별로 현재 충족 상태를 평가하고 우선순위를 확인하세요
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

      <SelfAssessmentClient
        hospitalId={hospitalId}
        tree={tree}
        existingAssessment={latestAssessment ? { ...latestAssessment } : null}
      />
    </div>
  )
}
