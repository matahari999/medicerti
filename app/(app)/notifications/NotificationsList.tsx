'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCheck, Bell, CalendarClock, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

const severityIcon = (s: string) => {
  if (s === 'critical') return <AlertCircle className="w-4 h-4 text-red-500" />
  if (s === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />
  return <Info className="w-4 h-4 text-blue-500" />
}

const typeLabel = (t: string) => {
  const map: Record<string, string> = {
    rounding_due: '라운딩 예정',
    rounding_overdue: '라운딩 미실시',
    accreditation_expiring: '인증 만료 임박',
    accreditation_expired: '인증 기한 초과',
    education_retrain: '교육 재확인',
    assessment_incomplete: '갭분석 미완료',
    acknowledgment_due: '인지 확인 필요',
    kpi_alert: 'KPI 경고',
    system: '시스템',
  }
  return map[t] ?? t
}

export function NotificationsList({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications)

  const markAllRead = async () => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('is_read', false)

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const markOneRead = async (id: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          총 {notifications.length}개 · 읽지 않음 {unreadCount}개
        </p>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 mr-1.5" />
            모두 읽음
          </Button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">알림이 없습니다</p>
        </div>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          className={cn(
            'bg-white border rounded-xl p-4 transition-colors',
            !n.is_read && 'border-brand-200 bg-brand-50/30'
          )}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{severityIcon(n.severity)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={cn('text-sm', !n.is_read && 'font-semibold')}>{n.title}</p>
                <Badge variant="outline" className="text-[10px]">{typeLabel(n.type)}</Badge>
                {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
              </div>
              {n.message && <p className="text-sm text-muted-foreground mt-1">{n.message}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  {new Date(n.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {n.link && (
                <Button asChild variant="outline" size="sm">
                  <Link href={n.link} onClick={() => markOneRead(n.id)}>보기</Link>
                </Button>
              )}
              {!n.is_read && (
                <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => markOneRead(n.id)} title="읽음 표시">
                  <CheckCheck className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
