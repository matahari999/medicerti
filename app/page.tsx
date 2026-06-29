import type { Metadata } from 'next'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { TrustSection } from '@/components/landing/TrustSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'AccrediQ — 의료기관인증 갭 분석 플랫폼',
  description:
    '요양병원 4주기 인증 준비, AI가 기준 구조를 자동 정리하고 부족한 항목을 찾아 규정집 초안까지 작성합니다. 14일 무료 체험.',
  openGraph: {
    title: 'AccrediQ — 의료기관인증 갭 분석 플랫폼',
    description: 'AI 기반 요양병원 인증 준비 솔루션. 기준 분석부터 갭 평가, 문서 생성까지 한 번에.',
  },
}

export default function LandingPage() {
  return (
    <>
      <Header />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <TrustSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </>
  )
}
