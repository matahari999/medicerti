import { createBrowserClient } from '@supabase/ssr'

// 제네릭 타입은 supabase gen types 후 적용
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
