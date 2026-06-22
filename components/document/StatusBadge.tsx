import { cn } from '@/lib/utils'
import { Loader2, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react'

const STATUS_CONFIG = {
  pending:    { label: '대기', icon: Clock, className: 'bg-gray-100 text-gray-700 border-gray-200' },
  processing: { label: '처리 중', icon: Loader2, className: 'bg-blue-50 text-blue-700 border-blue-200 animate-spin' },
  extracted:  { label: '완료', icon: CheckCircle2, className: 'bg-green-50 text-green-700 border-green-200' },
  failed:     { label: '실패', icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' },
  deleted:    { label: '삭제됨', icon: FileText, className: 'bg-gray-50 text-gray-400 border-gray-100' },
} as const

type DocStatus = keyof typeof STATUS_CONFIG

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as DocStatus] ?? STATUS_CONFIG.pending
  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', config.className)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}
