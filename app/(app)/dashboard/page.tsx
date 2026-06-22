import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Building2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HospitalCard } from '@/components/hospital/HospitalCard'
import { getUserHospitals, getLatestAnalysis } from '@/lib/services/hospital.service'

export const metadata: Metadata = { title: '대시보드' }

export default async function DashboardPage() {
  const hospitals = await getUserHospitals()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">담당 병원의 인증 준비 현황</p>
        </div>
        <Button asChild className="bg-brand-600 hover:bg-brand-700">
          <Link href="/hospitals/new">
            <Plus className="w-4 h-4 mr-1.5" />
            병원 추가
          </Link>
        </Button>
      </div>

      {hospitals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border">
          <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
            <Building2 className="w-7 h-7 text-brand-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">아직 등록된 병원이 없습니다</h3>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
            첫 번째 병원을 추가하고 AI 기반 인증 갭 분석을 시작해 보세요
          </p>
          <Button asChild className="bg-brand-600 hover:bg-brand-700">
            <Link href="/hospitals/new">
              <Plus className="w-4 h-4 mr-1.5" />
              병원 추가하기
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {hospitals.map((h) => (
            <HospitalCard
              key={h.id as string}
              hospital={h as Parameters<typeof HospitalCard>[0]['hospital']}
              score={null}
            />
          ))}
        </div>
      )}
    </div>
  )
}
