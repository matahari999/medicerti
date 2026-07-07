export const dynamic = 'force-dynamic'

import { getAccreditationTree } from '@/lib/services/criteria.service'
import { getUserHospitals } from '@/lib/services/hospital.service'
import AccreditationTreeView from '@/components/criteria/AccreditationTreeView'
import { HospitalTypeFilter } from '@/components/features/HospitalTypeFilter'
import { EmptyState } from '@/components/ui/empty-state'
import { HOSPITAL_TYPE_LABELS } from '@/types'
import { BookOpen } from 'lucide-react'
import { Suspense } from 'react'

export const metadata = { title: '인증 기준집 탐색' }

const KNOWN_HOSPITAL_TYPES = new Set(['nursing', 'psychiatric', 'rehabilitation', 'acute', 'dental', 'korean', 'general', 'tertiary', 'hospital'])

export default async function StandardsPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string }>
}) {
  const resolvedParams = await searchParams
  let hospitalType = resolvedParams?.type

  if (!hospitalType) {
    const hospitals = await getUserHospitals()
    const myType = hospitals[0]?.type
    hospitalType = myType && KNOWN_HOSPITAL_TYPES.has(myType) ? myType : 'nursing'
  }

  let tree: import('@/types/database.types').AreaTree[] = []
  let error: string | null = null

  try {
    tree = await getAccreditationTree(hospitalType)
  } catch (e) {
    console.error('Failed to load accreditation tree:', e)
    error = '인증 기준을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }

  if (error) {
    return (
      <EmptyState
        icon={<BookOpen className="w-7 h-7 text-brand-400" />}
        title="데이터를 불러올 수 없습니다"
        description={error}
      />
    )
  }

  const typeFilter = (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs text-muted-foreground hidden sm:inline">병원 종별</span>
      <Suspense fallback={<div className="h-8 w-28 bg-gray-100 animate-pulse rounded-lg" />}>
        <HospitalTypeFilter initialType={hospitalType} />
      </Suspense>
    </div>
  )

  const hasAnyChapter = tree.some((a) => a.chapters.length > 0)

  if (!tree || tree.length === 0 || !hasAnyChapter) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">{typeFilter}</div>
        <EmptyState
          icon={<BookOpen className="w-7 h-7 text-brand-400" />}
          title="등록된 인증 기준이 없습니다"
          description={`${HOSPITAL_TYPE_LABELS[hospitalType] ?? hospitalType} 종별 인증 기준 데이터가 아직 준비되지 않았습니다. 다른 병원 종별을 선택하거나 관리자에게 문의해주세요.`}
        />
      </div>
    )
  }

  return <AccreditationTreeView tree={tree} typeFilter={typeFilter} />
}
