'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  severity: 'info' | 'warning' | 'critical'
  link: string | null
  is_read: boolean
  created_at: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    const fetch = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setNotifications(data as Notification[])
        setUnread(data.filter((n) => !n.is_read).length)
      }
    }
    fetch()

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const n = payload.new as Notification
        setNotifications((prev) => [n, ...prev])
        if (!n.is_read) setUnread((u) => u + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('is_read', false)

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnread(0)
  }

  const severityDot = (s: string) => {
    if (s === 'critical') return 'bg-red-500'
    if (s === 'warning') return 'bg-amber-500'
    return 'bg-blue-500'
  }

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(!open)}>
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white border rounded-xl shadow-lg z-50">
          <div className="flex items-center justify-between p-3 border-b">
            <p className="text-sm font-semibold">알림</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
                <CheckCheck className="w-3 h-3" />모두 읽음
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="text-sm text-muted-foreground p-4 text-center">알림이 없습니다</p>
            )}
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link ?? '#'}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex gap-3 p-3 border-b last:border-0 hover:bg-gray-50 transition-colors',
                  !n.is_read && 'bg-brand-50/40'
                )}
              >
                <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', severityDot(n.severity))} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', !n.is_read && 'font-semibold')}>{n.title}</p>
                  {n.message && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="p-2 border-t">
            <Link
              href="/notifications"
              className="block text-center text-xs text-brand-600 hover:text-brand-700 py-1"
              onClick={() => setOpen(false)}
            >
              모든 알림 보기
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
