import type { Metadata } from 'next'
import { getAllUsers } from '@/lib/services/admin.service'
import { Badge } from '@/components/ui/badge'
import { User } from 'lucide-react'

export const metadata: Metadata = { title: '사용자 관리 — 어드민' }

export default async function AdminUsersPage() {
  const users = await getAllUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          플랫폼 전체 사용자 목록 ({users.length}명)
        </p>
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {users.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">사용자가 없습니다.</div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="flex items-center gap-4 p-4">
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{u.full_name ?? '이름 없음'}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {u.is_platform_admin && (
                  <Badge variant="destructive">플랫폼 관리자</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
