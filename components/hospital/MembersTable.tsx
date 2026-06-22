import { Crown, Shield, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

const ROLE_CONFIG = {
  admin:   { label: '관리자', icon: Crown,  className: 'bg-amber-50 text-amber-700 border-amber-200' },
  manager: { label: '담당자', icon: Shield, className: 'bg-blue-50 text-blue-700 border-blue-200' },
  viewer:  { label: '뷰어',   icon: Eye,    className: 'bg-gray-50 text-gray-700 border-gray-200' },
} as const

interface Member {
  id:       string
  email:    string
  role:     string
  status:   string
  joined_at: string | null
  profiles: { full_name: string | null; avatar_url: string | null } | null
}

interface MembersTableProps {
  members: Member[]
}

export function MembersTable({ members }: MembersTableProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        팀 멤버가 없습니다
      </div>
    )
  }

  return (
    <div className="divide-y">
      {members.map((member) => {
        const name    = member.profiles?.full_name ?? null
        const avatar  = member.profiles?.avatar_url ?? null
        const initials = name
          ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
          : member.email[0].toUpperCase()
        const roleConfig = ROLE_CONFIG[member.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.viewer
        const RoleIcon   = roleConfig.icon

        return (
          <div key={member.id} className="flex items-center gap-3 py-3">
            <Avatar className="w-9 h-9">
              <AvatarImage src={avatar ?? undefined} />
              <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {name ?? member.email}
              </p>
              {name && (
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {member.status === 'invited' && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                  초대 대기
                </Badge>
              )}
              <Badge variant="outline" className={`text-xs flex items-center gap-1 ${roleConfig.className}`}>
                <RoleIcon className="w-3 h-3" />
                {roleConfig.label}
              </Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}
