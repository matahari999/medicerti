import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // env vars 미설정 또는 네트워크 오류 시 로그인으로 폴백
  }
  if (user) redirect('/dashboard')
  redirect('/login')
}
