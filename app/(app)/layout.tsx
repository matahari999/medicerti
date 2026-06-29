import { redirect } from 'next/navigation'
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
    <div className="min-h-screen bg-gray-50 flex">
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
        <header className="h-14 bg-white border-b flex items-center justify-between px-4 lg:px-6 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <MobileMenu />
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <ToastProvider>
            {children}
          </ToastProvider>
        </main>
      </div>
    </div>
  )
}
