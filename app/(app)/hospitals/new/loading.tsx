import { CardSkeleton } from '@/components/ui/skeleton'

export default function NewHospitalLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
      <CardSkeleton />
    </div>
  )
}
