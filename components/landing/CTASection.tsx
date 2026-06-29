import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d9488] via-[#0f766e] to-[#115e59]" />
      <div className="absolute inset-0 bg-grid opacity-[0.04] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight text-balance">
          지금 바로
          <br />
          인증 준비를 시작하세요
        </h2>
        <p className="mt-6 text-lg text-[#99f6e4] leading-relaxed max-w-lg mx-auto">
          14일 무료 체험 — 신용카드 필요 없음
          <br />
          기준 분석부터 갭 평가, 문서 생성까지 전 과정을 직접 경험해보세요
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-[#0d9488] bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-xl shadow-black/10"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white border-2 border-white/20 rounded-xl hover:border-white/40 transition-colors"
          >
            로그인
          </Link>
        </div>
      </div>
    </section>
  )
}
