import { createClient } from '@/lib/supabase/server'
import type { Notification, NotificationType } from '@/types/database.types'

export async function getNotifications(hospitalId?: string, limit = 20): Promise<Notification[]> {
  const supabase = await createClient()

  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (hospitalId) {
    query = query.eq('hospital_id', hospitalId)
  }

  const { data } = await query
  return (data ?? []) as Notification[]
}

export async function getUnreadCount(hospitalId?: string): Promise<number> {
  const supabase = await createClient()

  let query = supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)

  if (hospitalId) {
    query = query.eq('hospital_id', hospitalId)
  }

  const { count } = await query
  return count ?? 0
}

export async function markAsRead(notificationId: string): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
}

export async function markAllAsRead(hospitalId?: string): Promise<void> {
  const supabase = await createClient()

  let query = supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('is_read', false)

  if (hospitalId) {
    query = query.eq('hospital_id', hospitalId)
  }

  await query
}

export async function createNotification(input: {
  hospital_id: string
  user_id?: string
  type: NotificationType
  title: string
  message?: string
  severity?: 'info' | 'warning' | 'critical'
  link?: string
}): Promise<void> {
  const supabase = await createClient()
  await supabase.from('notifications').insert({
    hospital_id: input.hospital_id,
    user_id: input.user_id ?? null,
    type: input.type,
    title: input.title,
    message: input.message ?? null,
    severity: input.severity ?? 'info',
    link: input.link ?? null,
  })
}
