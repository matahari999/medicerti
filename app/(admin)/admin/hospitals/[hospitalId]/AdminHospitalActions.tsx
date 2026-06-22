'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Props {
  hospitalId: string
  currentStatus: 'active' | 'suspended' | 'archived'
}

export function AdminHospitalActions({ hospitalId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function changeStatus(status: 'active' | 'suspended' | 'archived') {
    setLoading(true)
    try {
      await fetch(`/api/admin/hospitals/${hospitalId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {currentStatus !== 'active' && (
        <Button
          size="sm"
          variant="default"
          disabled={loading}
          onClick={() => changeStatus('active')}
        >
          운영 재개
        </Button>
      )}
      {currentStatus !== 'suspended' && (
        <Button
          size="sm"
          variant="destructive"
          disabled={loading}
          onClick={() => changeStatus('suspended')}
        >
          이용 정지
        </Button>
      )}
      {currentStatus !== 'archived' && (
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => changeStatus('archived')}
        >
          보관 처리
        </Button>
      )}
    </div>
  )
}
