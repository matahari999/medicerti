import type { Metadata } from 'next'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NotificationsList } from './NotificationsList'

export const metadata: Metadata = { title: '알림' }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const notifications = (data ?? []) as Array<{
    id: string
    hospital_id: string
    user_id: string | null
    type: string
    title: string
    message: string | null
    severity: 'info' | 'warning' | 'critical'
    link: string | null
    is_read: boolean
    created_at: string
    read_at: string | null
  }>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-brand-600" />
          알림
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          인증 일정, 라운딩 리마인더, 시스템 알림을 확인하세요
        </p>
      </div>

      <NotificationsList initialNotifications={notifications} />
    </div>
  )
}
