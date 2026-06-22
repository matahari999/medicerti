import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getHospital } from '@/lib/services/hospital.service'
import { requireHospitalMember } from '@/lib/auth'
import { DropZone } from '@/components/document/DropZone'
import { DocumentsClient } from './DocumentsClient'

type Props = { params: Promise<{ hospitalId: string }> }

export const metadata: Metadata = { title: '문서 관리' }

export default async function DocumentsPage({ params }: Props) {
  const { hospitalId } = await params
  await requireHospitalMember(hospitalId, 'viewer')

  const hospital = await getHospital(hospitalId)
  if (!hospital) notFound()

  const supabase = await createClient()
  const { data: raw } = await supabase
    .from('documents')
    .select('*')
    .eq('hospital_id', hospitalId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const documents = (raw ?? []) as unknown as Array<{
    id: string; original_name: string; file_size_bytes: number
    category: string; status: string; error_message: string | null
    created_at: string; extracted_at: string | null; extraction_attempts: number
  }>

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
        <h1 className="text-2xl font-bold text-gray-900">문서 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          인증 관련 PDF 문서를 업로드하고 AI가 텍스트를 추출합니다
        </p>
      </div>

      <DropZone hospitalId={hospitalId} />
      <DocumentsClient documents={documents} />
    </div>
  )
}
