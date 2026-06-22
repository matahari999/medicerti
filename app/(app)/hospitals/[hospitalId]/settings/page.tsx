import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { HospitalForm } from '@/components/hospital/HospitalForm'
import { MembersTable } from '@/components/hospital/MembersTable'
import { getHospital, getHospitalMembers } from '@/lib/services/hospital.service'
import { requireHospitalMember } from '@/lib/auth'
import { updateHospitalAction } from '@/app/actions/hospital'

type Props = { params: Promise<{ hospitalId: string }> }

export const metadata: Metadata = { title: '병원 설정' }

export default async function HospitalSettingsPage({ params }: Props) {
  const { hospitalId } = await params
  await requireHospitalMember(hospitalId, 'manager')

  const [hospital, members] = await Promise.all([
    getHospital(hospitalId),
    getHospitalMembers(hospitalId),
  ])

  if (!hospital) notFound()

  const boundAction = updateHospitalAction.bind(null, hospitalId)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={`/hospitals/${hospitalId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          {hospital.name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">병원 설정</h1>
        <p className="text-sm text-muted-foreground mt-1">병원 정보 수정 및 팀 관리</p>
      </div>

      {/* 병원 정보 수정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">병원 정보</CardTitle>
          <CardDescription>기본 정보와 인증 일정을 수정합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <HospitalForm
            action={boundAction}
            defaultValues={hospital}
            submitLabel="변경 사항 저장"
          />
        </CardContent>
      </Card>

      {/* 팀 멤버 */}
      <Card id="members">
        <CardHeader>
          <CardTitle className="text-base">팀 멤버</CardTitle>
          <CardDescription>병원에 접근 가능한 사용자 목록입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <MembersTable members={members as Parameters<typeof MembersTable>[0]['members']} />
        </CardContent>
      </Card>
    </div>
  )
}
