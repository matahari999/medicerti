import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = { title: '회원가입' }

export default function RegisterPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-8">
      <h2 className="text-xl font-semibold mb-1">회원가입</h2>
      <p className="text-sm text-muted-foreground mb-6">
        AccrediQ 계정을 만들어 시작하세요
      </p>
      <RegisterForm />
      <p className="text-sm text-center text-muted-foreground mt-6">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-brand-600 hover:underline font-medium">
          로그인
        </Link>
      </p>
    </div>
  )
}
