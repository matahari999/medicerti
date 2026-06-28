import { cn } from '@/lib/utils'
import { MANAGED_DOC_STATUS_LABELS, MANAGED_DOC_STATUS_COLORS } from '@/lib/constants'
import type { ManagedDocStatus } from '@/types/database.types'

export function ManagedDocStatusBadge({ status }: { status: ManagedDocStatus }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
      MANAGED_DOC_STATUS_COLORS[status]
    )}>
      {MANAGED_DOC_STATUS_LABELS[status]}
    </span>
  )
}
