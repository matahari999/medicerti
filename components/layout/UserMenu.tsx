'use client'

import { useRouter } from 'next/navigation'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserMenuProps {
  name:      string | null
  email:     string
  avatarUrl: string | null
}

export function UserMenu({ name, email, avatarUrl }: UserMenuProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : email[0].toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 w-full px-2 py-2 rounded-xl hover:bg-white/[0.07] transition-colors text-left border border-transparent hover:border-white/[0.06]">
          <Avatar className="w-8 h-8 shrink-0 ring-2 ring-teal-400/30">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback className="bg-teal-500/20 text-teal-200 text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-100 truncate">{name ?? '사용자'}</p>
            <p className="text-[11px] text-slate-500 truncate">{email}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
          <User className="w-4 h-4 mr-2" />
          내 프로필
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
          <Settings className="w-4 h-4 mr-2" />
          설정
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
