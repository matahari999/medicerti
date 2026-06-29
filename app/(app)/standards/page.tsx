import { getAccreditationTree } from '@/lib/services/criteria.service'
import AccreditationTreeView from '@/components/criteria/AccreditationTreeView'
import { EmptyState } from '@/components/ui/empty-state'
import { BookOpen } from 'lucide-react'

export const metadata = { title: '인증 기준집 탐색' }

export default async function StandardsPage() {
  let tree: import('@/types/database.types').AreaTree[] = []
  let error: string | null = null

  try {
    tree = await getAccreditationTree()
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

  if (!tree || tree.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="w-7 h-7 text-brand-400" />}
        title="등록된 인증 기준이 없습니다"
        description="아직 병원 종별 인증 기준 데이터가 로드되지 않았습니다. 관리자에게 문의하거나 시드 데이터를 확인해주세요."
      />
    )
  }

  return <AccreditationTreeView tree={tree} />
}
