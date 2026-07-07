import Link from 'next/link'
import { LayoutDashboard, Building2, Settings, Shield, Sparkles, BookOpen, GraduationCap, MessageCircle, BarChart3, FileText, Bell, CalendarDays, RefreshCw } from 'lucide-react'
import MediLogo from '@/components/MediLogo'
import { NavItem } from './NavItem'
import { UserMenu } from './UserMenu'

const navGroups = [
  {
    label: '워크스페이스',
    items: [
      { href: '/dashboard', label: '대시보드',   icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
      { href: '/hospitals', label: '병원 관리',   icon: <Building2 className="w-4 h-4 shrink-0" /> },
      { href: '/compare',   label: '병원간 비교', icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
    ],
  },
  {
    label: '인증 준비',
    items: [
      { href: '/generate',   label: '문서 생성',  icon: <Sparkles className="w-4 h-4 shrink-0" /> },
      { href: '/standards',  label: '인증기준집', icon: <BookOpen className="w-4 h-4 shrink-0" /> },
      { href: '/updates',    label: '업데이트',   icon: <RefreshCw className="w-4 h-4 shrink-0" /> },
      { href: '/education',  label: '교육 관리',  icon: <GraduationCap className="w-4 h-4 shrink-0" /> },
      { href: '/consulting', label: '컨설팅',     icon: <MessageCircle className="w-4 h-4 shrink-0" /> },
    ],
  },
  {
    label: '인사이트',
    items: [
      { href: '/reports',  label: '보고서',      icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
      { href: '/schedule', label: '일정 캘린더', icon: <CalendarDays className="w-4 h-4 shrink-0" /> },
    ],
  },
  {
    label: '지원',
    items: [
      { href: '/notifications',    label: '알림',     icon: <Bell className="w-4 h-4 shrink-0" /> },
      { href: '/notices',          label: '공지사항', icon: <FileText className="w-4 h-4 shrink-0" /> },
      { href: '/settings/profile', label: '설정',     icon: <Settings className="w-4 h-4 shrink-0" /> },
    ],
  },
] as const

interface SidebarProps {
  user: {
    name:             string | null
    email:            string
    avatarUrl:        string | null
    isPlatformAdmin?: boolean
  }
}

export function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="w-64 bg-sidebar text-slate-300 shrink-0 flex flex-col h-screen sticky top-0 border-r border-white/[0.06]">
      {/* 로고 */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="shrink-0 drop-shadow-[0_2px_8px_rgba(20,184,166,0.35)] transition-transform group-hover:scale-105">
            <MediLogo size={36} />
          </div>
          <div>
            <p className="font-serif font-bold text-white text-[15px] leading-none tracking-tight">메디인증</p>
            <p className="text-[10px] text-slate-400 mt-1 tracking-wide">의료기관 인증 문서 자동화</p>
          </div>
        </Link>
      </div>

      {/* 인증 플랫폼 배지 */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
          </span>
          <p className="text-[11px] text-slate-300 font-medium">인증 준비 시스템 가동 중</p>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="sidebar-scroll flex-1 px-3 pb-3 space-y-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </div>
        ))}

        {user.isPlatformAdmin && (
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              관리자
            </p>
            <NavItem
              href="/admin/hospitals"
              label="플랫폼 관리"
              icon={<Shield className="w-4 h-4 shrink-0 text-rose-400" />}
            />
          </div>
        )}
      </nav>

      {/* 사용자 메뉴 */}
      <div className="p-3 border-t border-white/[0.08]">
        <UserMenu
          name={user.name}
          email={user.email}
          avatarUrl={user.avatarUrl}
        />
      </div>
    </aside>
  )
}
