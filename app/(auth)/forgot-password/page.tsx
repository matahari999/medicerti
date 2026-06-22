'use client'

import { useState } from 'react'
import Link from 'next/link'
import { forgotPasswordAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await forgotPasswordAction(null, formData)
    if (result.success) setSent(true)
    if (result.error) setError(result.error)
    setPending(false)
  }

  if (sent) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center space-y-3">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-green-600 text-xl">✓</span>
        </div>
        <h2 className="text-lg font-semibold">이메일을 확인해 주세요</h2>
        <p className="text-sm text-muted-foreground">
          비밀번호 재설정 링크를 보내드렸습니다.
        </p>
        <Link href="/login" className="block text-sm text-brand-600 hover:underline">
          로그인으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-8">
      <h2 className="text-xl font-semibold mb-1">비밀번호 찾기</h2>
      <p className="text-sm text-muted-foreground mb-6">
        가입한 이메일 주소를 입력하면 재설정 링크를 보내드립니다
      </p>
      <form action={handleSubmit} className="space-y-4">
        {error != null && (
          <div className="bg-red-50 text-red-700 text-sm px-3 py-2.5 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">이메일</Label>
          <Input id="email" name="email" type="email" placeholder="hospital@example.com" required />
        </div>
        <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700" disabled={pending}>
          {pending ? '전송 중…' : '재설정 링크 보내기'}
        </Button>
      </form>
      <p className="text-sm text-center text-muted-foreground mt-6">
        <Link href="/login" className="text-brand-600 hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  )
}
