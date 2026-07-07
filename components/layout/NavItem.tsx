'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NavItemProps {
  href:  string
  label: string
  icon:  ReactNode
}

export function NavItem({ href, label, icon }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150',
        isActive
          ? 'bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
          : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
      )}
    >
      {/* 활성 인디케이터 */}
      <span
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-gradient-to-b from-teal-300 to-teal-500 transition-all duration-200',
          isActive ? 'h-5 opacity-100' : 'h-0 opacity-0'
        )}
      />
      <span className={cn('transition-colors', isActive ? 'text-teal-300' : 'text-slate-500 group-hover:text-slate-300')}>
        {icon}
      </span>
      {label}
    </Link>
  )
}
