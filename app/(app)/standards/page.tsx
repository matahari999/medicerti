import { getAccreditationTree } from '@/lib/services/criteria.service'
import AccreditationTreeView from '@/components/criteria/AccreditationTreeView'

export const metadata = { title: '인증 기준집 탐색' }

export default async function StandardsPage() {
  const tree = await getAccreditationTree()

  return <AccreditationTreeView tree={tree} />
}
