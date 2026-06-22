import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: '로그인' }

export default function LoginPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-8">
      <h2 className="text-xl font-semibold mb-1">로그인</h2>
      <p className="text-sm text-muted-foreground mb-6">
        계정에 로그인하여 인증 준비를 시작하세요
      </p>
      <LoginForm />
      <p className="text-sm text-center text-muted-foreground mt-6">
        계정이 없으신가요?{' '}
        <Link href="/register" className="text-brand-600 hover:underline font-medium">
          회원가입
        </Link>
      </p>
    </div>
  )
}
