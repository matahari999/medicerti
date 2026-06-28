import Link from 'next/link'
import { LayoutDashboard, Building2, Settings, Shield, Sparkles, BookOpen, GraduationCap, MessageCircle, BarChart3, FileText } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { NavItem } from './NavItem'
import { UserMenu } from './UserMenu'

const navItems = [
  { href: '/dashboard',        label: '대시보드',    icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
  { href: '/hospitals',        label: '병원 관리',   icon: <Building2 className="w-4 h-4 shrink-0" /> },
  { href: '/generate',         label: '문서 생성',   icon: <Sparkles className="w-4 h-4 shrink-0" /> },
  { href: '/standards',        label: '인증기준집',  icon: <BookOpen className="w-4 h-4 shrink-0" /> },
  { href: '/education',        label: '교육 관리',   icon: <GraduationCap className="w-4 h-4 shrink-0" /> },
  { href: '/consulting',       label: '컨설팅',      icon: <MessageCircle className="w-4 h-4 shrink-0" /> },
  { href: '/reports',          label: '보고서',      icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
  { href: '/notices',          label: '공지사항',    icon: <FileText className="w-4 h-4 shrink-0" /> },
  { href: '/settings/profile', label: '설정',        icon: <Settings className="w-4 h-4 shrink-0" /> },
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
    <aside className="w-64 bg-white border-r shrink-0 flex flex-col h-screen sticky top-0">
      {/* 로고 */}
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-none">AccrediQ</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">인증 갭 분석 플랫폼</p>
          </div>
        </Link>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        {user.isPlatformAdmin && (
          <>
            <Separator className="my-2" />
            <NavItem
              href="/admin/hospitals"
              label="플랫폼 관리"
              icon={<Shield className="w-4 h-4 shrink-0 text-red-500" />}
            />
          </>
        )}
      </nav>

      <Separator />

      {/* 사용자 메뉴 */}
      <div className="p-3">
        <UserMenu
          name={user.name}
          email={user.email}
          avatarUrl={user.avatarUrl}
        />
      </div>
    </aside>
  )
}
