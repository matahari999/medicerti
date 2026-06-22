'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await registerAction(null, formData)

    if (result.success) {
      if (result.emailConfirmRequired) {
        setEmailSent(true)
        setPending(false)
        return
      }
      router.push('/dashboard')
      return
    }

    if (result.error) setError(result.error)
    setPending(false)
  }

  if (emailSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-4xl">📧</div>
        <h2 className="text-lg font-semibold">이메일을 확인해 주세요</h2>
        <p className="text-sm text-muted-foreground">
          가입하신 이메일로 인증 링크를 발송했습니다.<br />
          링크를 클릭하면 로그인됩니다.
        </p>
        <p className="text-xs text-muted-foreground">
          메일이 보이지 않으면 스팸함을 확인해 주세요.
        </p>
        <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
          로그인 페이지로 이동
        </Button>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error != null && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2.5 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="full_name">이름</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          placeholder="홍길동"
          autoComplete="name"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="hospital@example.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="영문+숫자 8자 이상"
          autoComplete="new-password"
          required
        />
        <p className="text-xs text-muted-foreground">영문자와 숫자를 포함한 8자 이상</p>
      </div>

      <Button
        type="submit"
        className="w-full bg-brand-600 hover:bg-brand-700"
        disabled={pending}
      >
        {pending ? '가입 중…' : '회원가입'}
      </Button>
    </form>
  )
}
