import Link from 'next/link'
import MediLogo from '@/components/MediLogo'

const footerLinks = {
  product: {
    label: '제품',
    links: [
      { href: '#features', label: '기능' },
      { href: '#pricing', label: '가격' },
    ],
  },
  company: {
    label: '회사',
    links: [
      { href: '/help', label: '도움말' },
      { href: '/intro', label: '서비스 소개' },
    ],
  },
  legal: {
    label: '법적고지',
    links: [
      { href: '/help', label: '이용약관' },
      { href: '/help', label: '개인정보처리방침' },
    ],
  },
}

export function Footer() {
  return (
    <footer className="font-nanum bg-[#081226] text-slate-400 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <MediLogo size={30} />
              <span className="font-bold text-lg text-white tracking-tight">메디인증</span>
            </div>
            <p className="text-sm leading-relaxed">
              AI 기반 의료기관인증 갭 분석 플랫폼.
              <br />
              요양병원에서 시작해 모든 의료기관의
              <br />
              인증 준비를 돕습니다.
            </p>
          </div>

          {/* Link groups */}
          {Object.values(footerLinks).map((group) => (
            <div key={group.label}>
              <h4 className="text-sm font-semibold text-white mb-4">{group.label}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} 메디인증 (Medicerti). All rights reserved.</p>
          <p className="text-slate-500">
            의료기관평가인증원과 무관한 제3자 서비스입니다.
          </p>
        </div>
      </div>
    </footer>
  )
}
