import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { ToastProvider } from '@/components/ui/toast'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, is_platform_admin')
    .eq('id', user.id)
    .maybeSingle()

  const profileData = profile as { full_name: string | null; avatar_url: string | null; is_platform_admin: boolean } | null

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex">
        <Sidebar
          user={{
            name:             profileData?.full_name ?? null,
            email:            user.email!,
            avatarUrl:        profileData?.avatar_url ?? null,
            isPlatformAdmin:  profileData?.is_platform_admin ?? false,
          }}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 glass-header border-b border-gray-200/70 flex items-center justify-between px-4 lg:px-8 gap-2 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <MobileMenu />
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">홈페이지</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <ToastProvider>
            <div className="mx-auto max-w-[1600px] animate-fade-in">
              {children}
            </div>
          </ToastProvider>
        </main>
      </div>
    </div>
  )
}
