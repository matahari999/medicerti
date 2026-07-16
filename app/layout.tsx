import type { Metadata } from 'next'
import { Inter, Gowun_Dodum, Gowun_Batang } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const gowunDodum = Gowun_Dodum({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-gowun-dodum',
  display: 'swap',
})

const gowunBatang = Gowun_Batang({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-gowun-batang',
  display: 'swap',
})

const jalnanGothic = localFont({
  src: './fonts/JalnanGothic.ttf',
  variable: '--font-jalnan',
  display: 'swap',
})

const pretendardSemiBold = localFont({
  src: './fonts/Pretendard-SemiBold.ttf',
  weight: '600',
  variable: '--font-pretendard',
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
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${inter.variable} ${gowunDodum.variable} ${gowunBatang.variable} ${jalnanGothic.variable} ${pretendardSemiBold.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
