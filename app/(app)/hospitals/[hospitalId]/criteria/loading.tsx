import { CardSkeleton } from '@/components/ui/skeleton'

export default function CriteriaLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="h-8 w-40 bg-gray-100 rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
      {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  )
}
