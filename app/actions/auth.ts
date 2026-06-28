'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from '@/lib/validators/auth'

export type AuthState = {
  error?: string
  success?: boolean
  emailConfirmRequired?: boolean
  fieldErrors?: Record<string, string[]>
}

function parseFieldErrors<T>(result: { success: boolean; error?: { issues: { path: (string | number)[]; message: string }[] } }): Record<string, string[]> | undefined {
  if (result.success) return undefined
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of result.error!.issues) {
    const path = issue.path.join('.')
    if (!fieldErrors[path]) fieldErrors[path] = []
    fieldErrors[path].push(issue.message)
  }
  return fieldErrors
}

export async function loginAction(
  _prev: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email:    formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message, fieldErrors: parseFieldErrors(parsed) }
  }

  const supabase = await createClient()
  const { email, password } = parsed.data
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return {
      error: error.message.includes('Invalid login credentials')
        ? '이메일 또는 비밀번호가 올바르지 않습니다'
        : error.message.includes('Email not confirmed')
        ? '이메일 인증이 완료되지 않았습니다. 받은 편지함을 확인해 주세요.'
        : error.message,
    }
  }

  return { success: true }
}

export async function registerAction(
  _prev: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    full_name: formData.get('full_name'),
    email:     formData.get('email'),
    password:  formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message, fieldErrors: parseFieldErrors(parsed) }
  }

  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3500'
  const { data, error } = await supabase.auth.signUp({
    email:    parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${appUrl}/api/auth/callback`,
    },
  })

  if (error) {
    return {
      error: error.message.includes('already registered')
        ? '이미 가입된 이메일입니다'
        : error.message,
    }
  }

  // 이메일 인증이 필요한 경우 session이 null
  if (!data.session) {
    return { success: true, emailConfirmRequired: true }
  }

  return { success: true }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function forgotPasswordAction(
  _prev: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  if (!email) return { error: '이메일을 입력해 주세요' }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) return { error: error.message }
  return { success: true }
}
