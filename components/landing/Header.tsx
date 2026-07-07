'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import MediLogo from '@/components/MediLogo'

const NAV_ITEMS = [
  { href: '#features', label: '기능' },
  { href: '#pricing', label: '가격' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl shadow-sm border-b border-gray-200/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <MediLogo size={34} />
            <span className={`font-bold text-lg tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              메디인증
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 ml-4">
              <Link
                href="/login"
                className={`text-sm font-medium transition-colors ${
                  scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-slate-200 hover:text-white'
                }`}
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#14b8a6] to-[#0d9488] rounded-lg hover:from-[#0d9488] hover:to-[#0f766e] transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-px"
              >
                무료로 시작하기
              </Link>
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 -mr-2 transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴 열기"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-4 space-y-3 animate-fade-in">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-gray-600 py-2"
            >
              {item.label}
            </Link>
          ))}
          <hr className="border-gray-100" />
          <Link href="/login" className="block text-sm font-medium text-gray-700 py-2">로그인</Link>
          <Link
            href="/register"
            className="block text-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#14b8a6] to-[#0d9488] rounded-lg shadow-lg shadow-teal-500/25"
            onClick={() => setMenuOpen(false)}
          >
            무료로 시작하기
          </Link>
        </div>
      )}
    </header>
  )
}
