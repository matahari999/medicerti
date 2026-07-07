'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, Building2, BarChart3, CalendarDays, Bell, BookOpen, Settings } from 'lucide-react'
import MediLogo from '@/components/MediLogo'
import { cn } from '@/lib/utils'

const mobileNav = [
  { href: '/dashboard',     label: '대시보드',   icon: LayoutDashboard },
  { href: '/hospitals',     label: '병원 관리',   icon: Building2 },
  { href: '/compare',       label: '병원간 비교',  icon: BarChart3 },
  { href: '/schedule',      label: '일정 캘린더',  icon: CalendarDays },
  { href: '/standards',     label: '인증기준집',   icon: BookOpen },
  { href: '/notifications', label: '알림',        icon: Bell },
  { href: '/settings/profile', label: '설정',     icon: Settings },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="메뉴 열기"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 bg-sidebar h-full shadow-elevated flex flex-col animate-slide-in-left">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <MediLogo size={30} />
                <div>
                  <p className="font-bold text-white text-sm leading-none">메디인증</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">의료기관 인증 문서 자동화</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.07] transition-colors"
                aria-label="메뉴 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="sidebar-scroll flex-1 p-3 space-y-0.5 overflow-y-auto">
              {mobileNav.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-white/[0.09] text-white'
                        : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-gradient-to-b from-teal-300 to-teal-500',
                        isActive ? 'h-5' : 'h-0'
                      )}
                    />
                    <item.icon className={cn('w-4 h-4', isActive ? 'text-teal-300' : 'text-slate-500')} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-1 bg-navy-950/50 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
