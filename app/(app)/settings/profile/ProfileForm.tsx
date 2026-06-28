'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfileAction } from './actions'

interface ProfileFormProps {
  defaultValues: {
    full_name: string
    phone:     string
    job_title: string
  }
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [pending, setPending] = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setSaved(false)
    setError(null)
    const result = await updateProfileAction(formData)
    if (result.success) setSaved(true)
    if (result.error)   setError(result.error)
    setPending(false)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>
      )}
      {saved && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">저장되었습니다</p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="full_name">이름</Label>
        <Input id="full_name" name="full_name" placeholder="홍길동" defaultValue={defaultValues.full_name} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="job_title">직책</Label>
        <Input id="job_title" name="job_title" placeholder="원무팀장" defaultValue={defaultValues.job_title} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">연락처</Label>
        <Input id="phone" name="phone" type="tel" placeholder="010-0000-0000" defaultValue={defaultValues.phone} />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" className="bg-brand-600 hover:bg-brand-700" disabled={pending}>
          {pending ? '저장 중…' : '변경 사항 저장'}
        </Button>
      </div>
    </form>
  )
}
