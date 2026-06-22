import { CardSkeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )
}
