import { CardSkeleton } from '@/components/ui/skeleton'

export default function HospitalsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  )
}
