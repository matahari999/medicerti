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
    <div className="min-h-screen bg-background flex">
      {/* 어드민 사이드바 */}
      <aside className="w-64 bg-sidebar text-slate-300 shrink-0 flex flex-col h-screen sticky top-0 border-r border-white/[0.06]">
        <div className="px-5 pt-5 pb-4">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-rose-700 rounded-xl flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(244,63,94,0.35)]">
              <Shield className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-[15px] leading-none tracking-tight">메디인증</p>
              <p className="text-[10px] text-rose-300/80 mt-1 tracking-wide">플랫폼 관리자</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 pb-3 space-y-0.5">
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            플랫폼 관리
          </p>
          <Link
            href="/admin/hospitals"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13.5px] font-medium text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 transition-colors"
          >
            전체 병원 관리
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13.5px] font-medium text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 transition-colors"
          >
            사용자 관리
          </Link>
          <Link
            href="/admin/criteria"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13.5px] font-medium text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 transition-colors"
          >
            인증기준 관리
          </Link>
          <Link
            href="/admin/tools"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13.5px] font-medium text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 transition-colors"
          >
            어드민 도구
          </Link>
          <div className="h-px bg-white/[0.08] my-3" />
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13.5px] font-medium text-slate-500 hover:bg-white/[0.05] hover:text-slate-100 transition-colors"
          >
            ← 일반 화면으로
          </Link>
        </nav>

        <div className="p-3 border-t border-white/[0.08]">
          <UserMenu
            name={p?.full_name ?? null}
            email={user.email!}
            avatarUrl={p?.avatar_url ?? null}
          />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="mx-auto max-w-[1600px] animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
