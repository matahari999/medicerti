import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { requireHospitalMember } from '@/lib/auth'
import { getManagedDocument, getManagedDocVersions } from '@/lib/services/managed-doc.service'
import { isPlatformAdmin } from '@/lib/services/admin.service'
import { ManagedDocEditor } from '@/components/managed-doc/ManagedDocEditor'
import { DocSourceRefs, type DocSourceRef } from '@/components/managed-doc/DocSourceRefs'

type Props = { params: Promise<{ hospitalId: string; docId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hospitalId, docId } = await params
  const doc = await getManagedDocument(docId, hospitalId)
  return { title: doc?.title ?? '문서 편집' }
}

export default async function ManagedDocDetailPage({ params }: Props) {
  const { hospitalId, docId } = await params

  let role = 'viewer'
  try {
    const result = await requireHospitalMember(hospitalId, 'viewer')
    role = result.role
  } catch {
    notFound()
  }

  const [doc, versions, isAdmin] = await Promise.all([
    getManagedDocument(docId, hospitalId),
    getManagedDocVersions(docId),
    isPlatformAdmin(),
  ])

  if (!doc) notFound()

  // 근거 출처는 관리자 확인용 — 구독자에게는 내려보내지 않는다
  const sourceRefs = isAdmin
    ? ((doc as { source_refs?: DocSourceRef[] | null }).source_refs ?? null)
    : null

  return (
    <div className="space-y-5">
      <Link
        href={`/hospitals/${hospitalId}/managed-docs`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900"
      >
        <ChevronLeft className="w-4 h-4" />
        관리 문서 목록
      </Link>

      {sourceRefs && sourceRefs.length > 0 && <DocSourceRefs refs={sourceRefs} />}

      <ManagedDocEditor
        hospitalId={hospitalId}
        doc={doc}
        versions={versions}
        userRole={role}
      />
    </div>
  )
}
