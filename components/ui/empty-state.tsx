import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border">
      <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
        {icon ?? <Inbox className="w-7 h-7 text-brand-400" />}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  )
}
