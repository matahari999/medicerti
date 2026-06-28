import { CardSkeleton } from '@/components/ui/skeleton'

export default function RegulationsLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="h-8 w-40 bg-gray-100 rounded-lg animate-pulse" />
      <CardSkeleton />
      {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  )
}
