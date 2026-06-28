import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FileText } from 'lucide-react'
import { requireHospitalMember } from '@/lib/auth'
import { getManagedDocuments, getManagedDocStats } from '@/lib/services/managed-doc.service'
import { ManagedDocList } from '@/components/managed-doc/ManagedDocList'
import { MANAGED_DOC_STATUS_LABELS } from '@/lib/constants'

export const metadata: Metadata = { title: '관리 문서' }

type Props = { params: Promise<{ hospitalId: string }> }

export default async function ManagedDocsPage({ params }: Props) {
  const { hospitalId } = await params

  let role = 'viewer'
  try {
    const result = await requireHospitalMember(hospitalId, 'viewer')
    role = result.role
  } catch {
    notFound()
  }

  const [docs, stats] = await Promise.all([
    getManagedDocuments(hospitalId),
    getManagedDocStats(hospitalId),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-brand-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">관리 문서</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            규정집·기준집·법정양식·점검표·교육기록·회의록·시정조치서를 작성하고 승인 워크플로우로 관리합니다.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-muted-foreground">전체 문서</p>
        </div>
      </div>

      <ManagedDocList
        hospitalId={hospitalId}
        initialDocs={docs as Parameters<typeof ManagedDocList>[0]['initialDocs']}
        userRole={role}
      />
    </div>
  )
}
