import Link from 'next/link'
import { Reveal } from './Reveal'

export function CTASection() {
  return (
    <section className="font-nanum py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-sidebar" />
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[280px] bg-teal-500/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] bg-navy-500/25 rounded-full blur-3xl" />

      <Reveal className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-jalnan text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-snug text-balance">
          지금 바로
          <br />
          인증 준비를 시작하세요
        </h2>
        <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-lg mx-auto">
          14일 무료 체험 — 신용카드 필요 없음
          <br />
          기준 분석부터 갭 평가, 문서 생성까지 전 과정을 직접 경험해보세요
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="font-pretendard inline-flex items-center justify-center px-8 py-4 text-base text-white bg-gradient-to-r from-[#14b8a6] to-[#0d9488] rounded-xl hover:from-[#0d9488] hover:to-[#0f766e] transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/login"
            className="font-pretendard inline-flex items-center justify-center px-8 py-4 text-base text-slate-200 bg-white/[0.04] border border-white/15 rounded-xl hover:bg-white/[0.08] hover:border-white/25 hover:text-white transition-all backdrop-blur-sm"
          >
            로그인
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
