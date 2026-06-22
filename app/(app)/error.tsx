'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="bg-white rounded-xl border p-8 text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">페이지 오류</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {error.message || '페이지를 불러오는 중 문제가 발생했습니다.'}
        </p>
        <Button onClick={reset}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          다시 시도
        </Button>
      </div>
    </div>
  )
}
