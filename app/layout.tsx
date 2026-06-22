import type { Metadata } from 'next'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'AccrediQ',
    template: '%s | AccrediQ',
  },
  description: '의료기관인증 갭 분석 플랫폼 — AI 기반 요양병원 인증 준비 솔루션',
  keywords: ['의료기관인증', '요양병원', '인증준비', '갭분석', '헬스케어'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSansKR.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
