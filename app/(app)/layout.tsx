import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider } from '@/components/ui/toast'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const profileData = profile as { full_name: string | null; avatar_url: string | null } | null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex">
        <Sidebar
          user={{
            name:      profileData?.full_name ?? null,
            email:     user.email!,
            avatarUrl: profileData?.avatar_url ?? null,
          }}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 overflow-auto">
          <ToastProvider>
            {children}
          </ToastProvider>
        </main>
      </div>
    </div>
  )
}
