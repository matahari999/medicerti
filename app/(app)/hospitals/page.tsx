import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HospitalCard } from '@/components/hospital/HospitalCard'
import { EmptyState } from '@/components/ui/empty-state'
import { getUserHospitals } from '@/lib/services/hospital.service'

export const metadata: Metadata = { title: '병원 관리' }

export default async function HospitalsPage() {
  const hospitals = await getUserHospitals()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">병원 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            담당 병원의 인증 준비 현황을 관리합니다
          </p>
        </div>
        <Button asChild className="bg-brand-600 hover:bg-brand-700">
          <Link href="/hospitals/new">
            <Plus className="w-4 h-4 mr-1.5" />
            병원 추가
          </Link>
        </Button>
      </div>

      {hospitals.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-7 h-7 text-brand-400" />}
          title="등록된 병원이 없습니다"
          description="첫 번째 병원을 추가하고 인증 준비를 시작해 보세요"
          action={
            <Button asChild className="bg-brand-600 hover:bg-brand-700">
              <Link href="/hospitals/new">
                <Plus className="w-4 h-4 mr-1.5" />
                병원 추가하기
              </Link>
            </Button>
          }
        />
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
