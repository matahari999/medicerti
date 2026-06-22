import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isPlatformAdmin } from '@/lib/services/admin.service'
import { Shield } from 'lucide-react'
import Link from 'next/link'
import { UserMenu } from '@/components/layout/UserMenu'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isAdmin = await isPlatformAdmin()
  if (!isAdmin) redirect('/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const p = profile as { full_name: string | null; avatar_url: string | null } | null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 어드민 사이드바 */}
      <aside className="w-64 bg-slate-900 text-white shrink-0 flex flex-col h-screen sticky top-0">
        <div className="p-4 border-b border-slate-700">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-white leading-none">AccrediQ</p>
              <p className="text-[10px] text-slate-400 mt-0.5">플랫폼 관리자</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/admin/hospitals"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            전체 병원 관리
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            사용자 관리
          </Link>
          <hr className="border-slate-700 my-2" />
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            ← 일반 화면으로
          </Link>
        </nav>

        <div className="p-3 border-t border-slate-700">
          <UserMenu
            name={p?.full_name ?? null}
            email={user.email!}
            avatarUrl={p?.avatar_url ?? null}
          />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
