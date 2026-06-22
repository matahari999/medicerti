import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton'

export default function DocumentsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />
      <CardSkeleton />
      <TableSkeleton rows={4} />
    </div>
  )
}
