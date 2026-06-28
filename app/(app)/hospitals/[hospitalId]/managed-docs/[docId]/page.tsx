import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { requireHospitalMember } from '@/lib/auth'
import { getManagedDocument, getManagedDocVersions } from '@/lib/services/managed-doc.service'
import { ManagedDocEditor } from '@/components/managed-doc/ManagedDocEditor'

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

  const [doc, versions] = await Promise.all([
    getManagedDocument(docId, hospitalId),
    getManagedDocVersions(docId),
  ])

  if (!doc) notFound()

  return (
    <div className="space-y-5">
      <Link
        href={`/hospitals/${hospitalId}/managed-docs`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900"
      >
        <ChevronLeft className="w-4 h-4" />
        관리 문서 목록
      </Link>

      <ManagedDocEditor
        hospitalId={hospitalId}
        doc={doc}
        versions={versions}
        userRole={role}
      />
    </div>
  )
}
