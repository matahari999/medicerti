import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { HospitalForm } from '@/components/hospital/HospitalForm'
import { createHospitalAction } from '@/app/actions/hospital'

export const metadata: Metadata = { title: '병원 추가' }

export default function NewHospitalPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/hospitals"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          병원 목록
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">병원 추가</h1>
        <p className="text-sm text-muted-foreground mt-1">
          새 병원을 등록하고 인증 준비를 시작합니다
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">병원 정보 입력</CardTitle>
          <CardDescription>병원의 기본 정보와 인증 일정을 입력해 주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <HospitalForm action={createHospitalAction} submitLabel="병원 등록" />
        </CardContent>
      </Card>
    </div>
  )
}
