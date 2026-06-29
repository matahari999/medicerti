'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, LayoutDashboard, Building2, BarChart3, CalendarDays, Bell, BookOpen, Settings } from 'lucide-react'

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

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(true)} className="p-2 -ml-2">
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold">AccrediQ</span>
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {mobileNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
